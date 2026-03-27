"use client";

import { useEffect, useState } from "react";
import {
  Search, Filter, Plus, Eye, ChevronDown,
  Phone, Mail, Car, CreditCard, Loader2, Users, RefreshCw,
  MessageSquare, Star,
} from "lucide-react";
import {
  supabase, getLeads, updateLeadStatus,
  type Lead, getLeadFullName,
} from "@/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pendiente_pago:  { label: "Pendiente pago", cls: "badge-amber"  },
  pagado:          { label: "Pagado",         cls: "badge-green"  },
  proceso_venta:   { label: "Proceso venta",  cls: "badge-blue"   },
  cerrado_venta:   { label: "Cerrado venta",  cls: "badge-purple" },
  cerrado_noventa: { label: "Cerrado no venta", cls: "badge-red"  },
};

const ALL_STATUSES = ["pendiente_pago", "pagado", "proceso_venta", "cerrado_venta", "cerrado_noventa"];
const DEFAULT_STATUS = "pendiente_pago";

const FINANCING_CONFIG: Record<string, string> = {
  Contado: "badge-green",
  Crédito: "badge-blue",
  Leasing: "badge-purple",
};

function getStatusConfig(status: string | null) {
  if (!status) return { label: "Sin estado", cls: "badge-slate" };
  return STATUS_CONFIG[status] ?? { label: status, cls: "badge-slate" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  lead,
  onClose,
  onStatusChange,
}: {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>(lead.status ?? DEFAULT_STATUS);

  async function handleStatus(s: string) {
    setSaving(true);
    const ok = await updateLeadStatus(lead.id, s);
    if (ok) { setStatus(s); onStatusChange(lead.id, s); }
    setSaving(false);
  }

  const cfg = getStatusConfig(status);
  const fullName = getLeadFullName(lead);
  const hasPartePago = lead.parte_pago_marca || lead.parte_pago_modelo;

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
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Lead #{lead.id}</p>
            </div>
            <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
          <Row icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={lead.email} />
          <Row icon={<Phone className="w-3.5 h-3.5" />} label="Teléfono" value={lead.telefono} />
          <Row icon={<Car className="w-3.5 h-3.5" />} label="Modelo interés" value={lead.target_model ?? "—"} />
          <Row icon={<CreditCard className="w-3.5 h-3.5" />} label="Financiamiento" value={lead.financing ?? "—"} />
          {lead.descripcion_interes && (
            <Row icon={<MessageSquare className="w-3.5 h-3.5" />} label="Descripción" value={lead.descripcion_interes} />
          )}
          {lead.matching_score != null && (
            <Row icon={<Star className="w-3.5 h-3.5" />} label="Match score" value={String(lead.matching_score)} />
          )}
          {lead.observaciones_internas && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: "#17171A", border: "1px solid #2A2A32" }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "#64748B" }}>Observaciones internas</p>
              <p className="text-xs" style={{ color: "#94A3B8" }}>{lead.observaciones_internas}</p>
            </div>
          )}

          {/* Parte de pago */}
          {hasPartePago && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: "#17171A", border: "1px solid #2A2A32" }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: "#64748B" }}>Parte de pago</p>
              <div className="grid grid-cols-2 gap-2">
                {lead.parte_pago_marca && <MiniRow label="Marca" value={lead.parte_pago_marca} />}
                {lead.parte_pago_modelo && <MiniRow label="Modelo" value={lead.parte_pago_modelo} />}
                {lead.parte_pago_ano && <MiniRow label="Año" value={lead.parte_pago_ano} />}
                {lead.parte_pago_km && <MiniRow label="KM" value={lead.parte_pago_km} />}
                {lead.parte_pago_deuda && <MiniRow label="Deuda" value={lead.parte_pago_deuda} />}
                {lead.parte_pago_patente && <MiniRow label="Patente" value={lead.parte_pago_patente} />}
              </div>
            </div>
          )}

          <Row icon={null} label="Registrado" value={formatDate(lead.created_at)} />
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
                  onClick={() => handleStatus(s)}
                  disabled={saving}
                  className={`badge cursor-pointer transition-all ${c.cls} ${status === s ? "ring-1 ring-offset-1 ring-offset-[#1E1E23] ring-[#22D3EE]" : "opacity-60 hover:opacity-100"}`}
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

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px]" style={{ color: "#475569" }}>{label}</p>
      <p className="text-xs font-medium" style={{ color: "#CBD5E1" }}>{value}</p>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.15)" }}
      >
        <Users className="w-5 h-5" style={{ color: "#22D3EE" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "#CBD5E1" }}>
        {hasSearch ? "Sin resultados" : "Sin compradores aún"}
      </p>
      <p className="text-xs mt-1" style={{ color: "#475569" }}>
        {hasSearch
          ? "Intenta con otros términos de búsqueda."
          : "Los leads aparecerán aquí cuando se registren en el formulario."}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompradoresView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  async function load() {
    setLoading(true);
    const data = await getLeads();
    setLeads(data);
    setLoading(false);
  }

  useEffect(() => {
    load();

    // Real-time: auto-refresh when new leads arrive
    const channel = supabase
      .channel("compradores-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const fullName = getLeadFullName(l).toLowerCase();
    const matchSearch =
      fullName.includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.target_model ?? "").toLowerCase().includes(q) ||
      (l.telefono ?? "").includes(q);
    const matchStatus = filterStatus === "Todos" || (l.status ?? DEFAULT_STATUS) === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleStatusChange(id: number, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  }

  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter((l) => (l.status ?? DEFAULT_STATUS) === s).length;
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
            placeholder="Buscar por nombre, email, teléfono o modelo..."
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
                className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-xl z-20 overflow-hidden"
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
        {[{ key: "Todos", label: "Todos", count: leads.length }, ...ALL_STATUSES.map((s) => ({ key: s, label: getStatusConfig(s).label, count: statusCounts[s] }))].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              backgroundColor: filterStatus === key ? "rgba(34,211,238,0.1)" : "#1E1E23",
              border: `1px solid ${filterStatus === key ? "rgba(34,211,238,0.25)" : "#2A2A32"}`,
              color: filterStatus === key ? "#22D3EE" : "#64748B",
            }}
          >
            <span>{label}</span>
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
              style={{
                backgroundColor: filterStatus === key ? "rgba(34,211,238,0.15)" : "#25252B",
                color: filterStatus === key ? "#22D3EE" : "#475569",
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
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#22D3EE" }} />
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
                    {["Nombre", "Contacto", "Modelo Interés", "Financiamiento", "Estado", "Fecha", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#475569" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => {
                    const cfg = getStatusConfig(lead.status);
                    return (
                      <tr
                        key={lead.id}
                        className="transition-colors cursor-pointer"
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid #2A2A32" : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        onClick={() => setSelected(lead)}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium" style={{ color: "#E2E8F0" }}>{getLeadFullName(lead)}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Lead #{lead.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs" style={{ color: "#94A3B8" }}>{lead.email}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{lead.telefono}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs" style={{ color: "#94A3B8" }}>{lead.target_model ?? "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          {lead.financing ? (
                            <span className={`badge ${FINANCING_CONFIG[lead.financing] ?? "badge-slate"}`}>
                              {lead.financing}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "#334155" }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs" style={{ color: "#475569" }}>{formatDate(lead.created_at)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelected(lead); }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "#475569" }}
                            onMouseEnter={(e2) => (e2.currentTarget.style.color = "#22D3EE")}
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
              {filtered.map((lead) => {
                const cfg = getStatusConfig(lead.status);
                return (
                  <div
                    key={lead.id}
                    className="p-4 transition-colors cursor-pointer"
                    onClick={() => setSelected(lead)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#E2E8F0" }}>{getLeadFullName(lead)}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{lead.email}</p>
                      </div>
                      <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs" style={{ color: "#64748B" }}>
                        <span style={{ color: "#475569" }}>Modelo: </span>{lead.target_model ?? "—"}
                      </p>
                      {lead.financing && (
                        <span className={`badge ${FINANCING_CONFIG[lead.financing] ?? "badge-slate"}`}>
                          {lead.financing}
                        </span>
                      )}
                      <p className="text-xs" style={{ color: "#475569" }}>{lead.telefono}</p>
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
              {filtered.length} de {leads.length} registros
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
          lead={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
