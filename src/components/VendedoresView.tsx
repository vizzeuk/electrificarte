"use client";

import { useEffect, useState } from "react";
import {
  Search, Filter, Plus, Eye, ChevronDown,
  Phone, Mail, MapPin, Building2, Tag,
  Loader2, Handshake, RefreshCw,
} from "lucide-react";
import {
  supabase, getLeadVendors, updateVendorEstado,
  type LeadVendor, getVendorFullName,
} from "@/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pendiente_pago: { label: "Pendiente pago", cls: "badge-amber" },
  pagado:         { label: "Pagado",         cls: "badge-green" },
  ingresado:      { label: "Ingresado",      cls: "badge-blue"  },
};

const ALL_STATUSES = ["pendiente_pago", "pagado", "ingresado"];
const DEFAULT_STATUS = "ingresado";

function getStatusConfig(estado: string | null) {
  if (!estado) return { label: "Sin estado", cls: "badge-slate" };
  return STATUS_CONFIG[estado] ?? { label: estado, cls: "badge-slate" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  vendor,
  onClose,
  onStatusChange,
}: {
  vendor: LeadVendor;
  onClose: () => void;
  onStatusChange: (id: string, estado: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [estado, setEstado] = useState<string>(vendor.estado ?? DEFAULT_STATUS);

  async function handleEstado(s: string) {
    setSaving(true);
    const ok = await updateVendorEstado(vendor.id, s);
    if (ok) { setEstado(s); onStatusChange(vendor.id, s); }
    setSaving(false);
  }

  const cfg = getStatusConfig(estado);
  const fullName = getVendorFullName(vendor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #2A2A32" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>{fullName}</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                {vendor.nombre_concesionario ?? "Concesionario"}
              </p>
            </div>
            <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
          <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={vendor.email} />
          <Row icon={<Phone className="w-3.5 h-3.5" />} label="Teléfono" value={vendor.telefono} />
          {vendor.nombre_concesionario && (
            <Row icon={<Building2 className="w-3.5 h-3.5" />} label="Concesionario" value={vendor.nombre_concesionario} />
          )}
          {vendor.comuna && (
            <Row icon={<MapPin className="w-3.5 h-3.5" />} label="Comuna" value={vendor.comuna} />
          )}
          {vendor.marcas && (
            <div className="flex items-start gap-3">
              <div className="w-5 flex-shrink-0 mt-0.5" style={{ color: "#475569" }}>
                <Tag className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs w-28 flex-shrink-0" style={{ color: "#475569" }}>Marcas</span>
              <div className="flex flex-wrap gap-1.5">
                {vendor.marcas.split(",").map((m) => (
                  <span key={m} className="badge badge-blue">{m.trim()}</span>
                ))}
              </div>
            </div>
          )}
          <Row icon={null} label="Registrado" value={formatDate(vendor.created_at)} />
          {vendor.tally_id && (
            <Row icon={null} label="Tally ID" value={vendor.tally_id} />
          )}
        </div>

        {/* Estado selector */}
        <div className="px-5 pb-4 flex-shrink-0" style={{ borderTop: "1px solid #2A2A32" }}>
          <p className="text-xs font-medium mt-4 mb-2" style={{ color: "#64748B" }}>Cambiar estado</p>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((s) => {
              const c = getStatusConfig(s);
              return (
                <button
                  key={s}
                  onClick={() => handleEstado(s)}
                  disabled={saving}
                  className={`badge cursor-pointer transition-all ${c.cls} ${estado === s ? "ring-1 ring-offset-1 ring-offset-[#1E1E23] ring-[#22D3EE]" : "opacity-60 hover:opacity-100"}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex justify-end gap-2 flex-shrink-0" style={{ borderTop: "1px solid #2A2A32" }}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#22D3EE" }} />}
          <button className="btn-secondary text-xs px-3 py-1.5" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 flex-shrink-0 mt-0.5" style={{ color: "#475569" }}>{icon}</div>
      <span className="text-xs w-28 flex-shrink-0" style={{ color: "#475569" }}>{label}</span>
      <span className="text-xs font-medium break-all" style={{ color: "#CBD5E1" }}>{value}</span>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "rgba(110,191,139,0.08)", border: "1px solid rgba(110,191,139,0.15)" }}
      >
        <Handshake className="w-5 h-5" style={{ color: "#6EBF8B" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "#CBD5E1" }}>
        {hasSearch ? "Sin resultados" : "Sin concesionarios aún"}
      </p>
      <p className="text-xs mt-1" style={{ color: "#475569" }}>
        {hasSearch
          ? "Intenta con otros términos de búsqueda."
          : "Los concesionarios aparecerán aquí cuando se registren."}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VendedoresView() {
  const [vendors, setVendors] = useState<LeadVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [selected, setSelected] = useState<LeadVendor | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  async function load() {
    setLoading(true);
    const data = await getLeadVendors();
    setVendors(data);
    setLoading(false);
  }

  useEffect(() => {
    load();

    // Real-time: auto-refresh when new vendors arrive
    const channel = supabase
      .channel("vendedores-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads_vendors" }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const fullName = getVendorFullName(v).toLowerCase();
    const matchSearch =
      fullName.includes(q) ||
      v.email.toLowerCase().includes(q) ||
      (v.nombre_concesionario ?? "").toLowerCase().includes(q) ||
      (v.marcas ?? "").toLowerCase().includes(q) ||
      (v.comuna ?? "").toLowerCase().includes(q) ||
      (v.telefono ?? "").includes(q);
    const matchStatus = filterStatus === "Todos" || (v.estado ?? DEFAULT_STATUS) === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleStatusChange(id: string, estado: string) {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, estado } : v)));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, estado } : null);
  }

  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = vendors.filter((v) => (v.estado ?? DEFAULT_STATUS) === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#475569" }} />
          <input
            type="text"
            placeholder="Buscar por nombre, concesionario, marca, comuna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button onClick={() => setShowFilter(!showFilter)} className="btn-secondary gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>{filterStatus === "Todos" ? "Estado" : getStatusConfig(filterStatus).label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFilter && (
              <div
                className="absolute right-0 top-full mt-1 w-40 rounded-xl shadow-xl z-20 overflow-hidden"
                style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
              >
                {["Todos", ...ALL_STATUSES].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s); setShowFilter(false); }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{
                      color: filterStatus === s ? "#22D3EE" : "#94A3B8",
                      backgroundColor: filterStatus === s ? "rgba(34,211,238,0.08)" : "transparent",
                    }}
                    onMouseEnter={(e2) => (e2.currentTarget.style.backgroundColor = "#25252B")}
                    onMouseLeave={(e2) => (e2.currentTarget.style.backgroundColor = filterStatus === s ? "rgba(34,211,238,0.08)" : "transparent")}
                  >
                    {s === "Todos" ? "Todos" : getStatusConfig(s).label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={load} className="btn-secondary" title="Actualizar">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="btn-primary gap-2">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 flex-wrap">
        {[{ key: "Todos", label: "Todos", count: vendors.length }, ...ALL_STATUSES.map((s) => ({ key: s, label: getStatusConfig(s).label, count: statusCounts[s] }))].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              backgroundColor: filterStatus === key ? "rgba(110,191,139,0.08)" : "#1E1E23",
              border: `1px solid ${filterStatus === key ? "rgba(110,191,139,0.25)" : "#2A2A32"}`,
              color: filterStatus === key ? "#6EBF8B" : "#64748B",
            }}
          >
            <span>{label}</span>
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
              style={{
                backgroundColor: filterStatus === key ? "rgba(110,191,139,0.12)" : "#25252B",
                color: filterStatus === key ? "#6EBF8B" : "#475569",
              }}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#6EBF8B" }} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasSearch={search.length > 0} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #2A2A32" }}>
                    {["Nombre", "Contacto", "Concesionario", "Marcas", "Comuna", "Estado", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#475569" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((vendor, i) => {
                    const cfg = getStatusConfig(vendor.estado);
                    return (
                      <tr
                        key={vendor.id}
                        className="transition-colors cursor-pointer"
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid #2A2A32" : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        onClick={() => setSelected(vendor)}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium" style={{ color: "#E2E8F0" }}>{getVendorFullName(vendor)}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                            {formatDate(vendor.created_at)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs" style={{ color: "#94A3B8" }}>{vendor.email}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{vendor.telefono}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs" style={{ color: "#94A3B8" }}>
                            {vendor.nombre_concesionario ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {vendor.marcas ? (
                            <div className="flex flex-wrap gap-1">
                              {vendor.marcas.split(",").slice(0, 2).map((m) => (
                                <span key={m} className="badge badge-blue">{m.trim()}</span>
                              ))}
                              {vendor.marcas.split(",").length > 2 && (
                                <span className="badge badge-slate">+{vendor.marcas.split(",").length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: "#334155" }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs" style={{ color: "#94A3B8" }}>{vendor.comuna ?? "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelected(vendor); }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "#475569" }}
                            onMouseEnter={(e2) => (e2.currentTarget.style.color = "#6EBF8B")}
                            onMouseLeave={(e2) => (e2.currentTarget.style.color = "#475569")}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: "#2A2A32" }}>
              {filtered.map((vendor) => {
                const cfg = getStatusConfig(vendor.estado);
                return (
                  <div
                    key={vendor.id}
                    className="p-4 transition-colors cursor-pointer"
                    onClick={() => setSelected(vendor)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#E2E8F0" }}>{getVendorFullName(vendor)}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                          {vendor.nombre_concesionario ?? vendor.email}
                        </p>
                      </div>
                      <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <div className="space-y-1">
                      {vendor.marcas && (
                        <div className="flex flex-wrap gap-1">
                          {vendor.marcas.split(",").slice(0, 3).map((m) => (
                            <span key={m} className="badge badge-blue">{m.trim()}</span>
                          ))}
                        </div>
                      )}
                      {vendor.comuna && (
                        <p className="text-xs" style={{ color: "#475569" }}>
                          <MapPin className="w-3 h-3 inline mr-1" />{vendor.comuna}
                        </p>
                      )}
                      <p className="text-xs" style={{ color: "#475569" }}>{vendor.telefono}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid #2A2A32" }}>
            <p className="text-xs" style={{ color: "#475569" }}>
              {filtered.length} de {vendors.length} registros
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#6EBF8B" }} />
              <span className="text-xs" style={{ color: "#475569" }}>Tiempo real activo</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <DetailModal
          vendor={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
