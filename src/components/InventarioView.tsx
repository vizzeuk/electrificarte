"use client";

import { useEffect, useState } from "react";
import {
  Search, Filter, LayoutGrid, List, ChevronDown,
  Car, Loader2, RefreshCw, Eye, Palette, Hash,
  Calendar, DollarSign, FileText,
} from "lucide-react";
import { supabase, getStock, formatCLP, type StockMaestro } from "@/lib/supabase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<string, { label: string; cls: string }> = {
  Disponible:  { label: "Disponible",  cls: "badge-green"  },
  Reservado:   { label: "Reservado",   cls: "badge-amber"  },
  Vendido:     { label: "Vendido",     cls: "badge-slate"  },
  "En tránsito": { label: "En tránsito", cls: "badge-blue" },
  "En revisión": { label: "En revisión", cls: "badge-purple" },
};

function getEstadoConfig(estado: string | null) {
  if (!estado) return { label: "Sin estado", cls: "badge-slate" };
  return ESTADO_CONFIG[estado] ?? { label: estado, cls: "badge-slate" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Vehicle Image Placeholder ────────────────────────────────────────────────

function VehicleImage({ fotos, marca, modelo }: { fotos: string[] | null; marca: string; modelo: string }) {
  const [imgError, setImgError] = useState(false);
  const firstPhoto = fotos && fotos.length > 0 ? fotos[0] : null;

  if (firstPhoto && !imgError) {
    return (
      <img
        src={firstPhoto}
        alt={`${marca} ${modelo}`}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ backgroundColor: "#17171A" }}
    >
      <Car className="w-8 h-8" style={{ color: "#2A2A32" }} />
      <p className="text-xs font-medium" style={{ color: "#334155" }}>{marca}</p>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ vehicle, onClose }: { vehicle: StockMaestro; onClose: () => void }) {
  const cfg = getEstadoConfig(vehicle.estado_vehiculo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
      >
        {/* Image */}
        <div className="h-48 flex-shrink-0 overflow-hidden">
          <VehicleImage fotos={vehicle.link_fotos} marca={vehicle.marca} modelo={vehicle.modelo} />
        </div>

        {/* Header */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #2A2A32" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>
                {vehicle.marca} {vehicle.modelo}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Año {vehicle.anio}</p>
            </div>
            <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
          <Row icon={<DollarSign className="w-3.5 h-3.5" />} label="Precio MSRP" value={formatCLP(vehicle.precio_msrp_clp)} />
          {vehicle.color && (
            <Row icon={<Palette className="w-3.5 h-3.5" />} label="Color" value={vehicle.color} />
          )}
          {vehicle.vin_codigo && (
            <Row icon={<Hash className="w-3.5 h-3.5" />} label="VIN" value={vehicle.vin_codigo} />
          )}
          <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Ingresado" value={formatDate(vehicle.created_at)} />
          {vehicle.notas_internas && (
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: "#17171A", border: "1px solid #2A2A32" }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "#64748B" }}>Notas internas</p>
              <p className="text-xs" style={{ color: "#94A3B8" }}>{vehicle.notas_internas}</p>
            </div>
          )}
          {vehicle.link_fotos && vehicle.link_fotos.length > 1 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "#64748B" }}>
                Fotos ({vehicle.link_fotos.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {vehicle.link_fotos.slice(0, 6).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-16 object-cover rounded-lg"
                      style={{ border: "1px solid #2A2A32" }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex justify-end flex-shrink-0" style={{ borderTop: "1px solid #2A2A32" }}>
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

// ─── Grid Card ────────────────────────────────────────────────────────────────

function VehicleCard({ vehicle, onClick }: { vehicle: StockMaestro; onClick: () => void }) {
  const cfg = getEstadoConfig(vehicle.estado_vehiculo);

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group"
      style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border = "1px solid #3A3A42";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border = "1px solid #2A2A32";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <div className="h-40 overflow-hidden relative">
        <VehicleImage fotos={vehicle.link_fotos} marca={vehicle.marca} modelo={vehicle.modelo} />
        <div className="absolute top-2 right-2">
          <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
        </div>
        {vehicle.color && (
          <div className="absolute bottom-2 left-2">
            <span className="badge badge-slate text-[10px]">{vehicle.color}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>
          {vehicle.marca} {vehicle.modelo}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Año {vehicle.anio}</p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm font-semibold" style={{ color: "#22D3EE" }}>
            {formatCLP(vehicle.precio_msrp_clp)}
          </p>
          <button
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "#475569" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#22D3EE")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "rgba(155,142,196,0.08)", border: "1px solid rgba(155,142,196,0.15)" }}
      >
        <Car className="w-5 h-5" style={{ color: "#9B8EC4" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "#CBD5E1" }}>
        {hasSearch ? "Sin resultados" : "Sin vehículos en stock"}
      </p>
      <p className="text-xs mt-1" style={{ color: "#475569" }}>
        {hasSearch
          ? "Intenta con otros términos de búsqueda."
          : "Los vehículos aparecerán aquí cuando se agreguen al catálogo."}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InventarioView() {
  const [vehicles, setVehicles] = useState<StockMaestro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<StockMaestro | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  async function load() {
    setLoading(true);
    const data = await getStock();
    setVehicles(data);
    setLoading(false);
  }

  useEffect(() => {
    load();

    // Real-time: auto-refresh when stock changes
    const channel = supabase
      .channel("stock-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_maestro" }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const allEstados = Array.from(new Set(vehicles.map((v) => v.estado_vehiculo).filter((s): s is string => Boolean(s)))) as string[];

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      v.marca.toLowerCase().includes(q) ||
      v.modelo.toLowerCase().includes(q) ||
      String(v.anio).includes(q) ||
      (v.color ?? "").toLowerCase().includes(q) ||
      (v.vin_codigo ?? "").toLowerCase().includes(q);
    const matchEstado = filterEstado === "Todos" || v.estado_vehiculo === filterEstado;
    return matchSearch && matchEstado;
  });

  const estadoCounts = allEstados.reduce((acc, s) => {
    acc[s] = vehicles.filter((v) => v.estado_vehiculo === s).length;
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
            placeholder="Buscar por marca, modelo, año, color, VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2">
          {/* Estado filter */}
          <div className="relative">
            <button onClick={() => setShowFilter(!showFilter)} className="btn-secondary gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>{filterEstado === "Todos" ? "Estado" : getEstadoConfig(filterEstado).label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFilter && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-xl z-20 overflow-hidden"
                style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
              >
                {["Todos", ...allEstados].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilterEstado(s); setShowFilter(false); }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{
                      color: filterEstado === s ? "#22D3EE" : "#94A3B8",
                      backgroundColor: filterEstado === s ? "rgba(34,211,238,0.08)" : "transparent",
                    }}
                    onMouseEnter={(e2) => (e2.currentTarget.style.backgroundColor = "#25252B")}
                    onMouseLeave={(e2) => (e2.currentTarget.style.backgroundColor = filterEstado === s ? "rgba(34,211,238,0.08)" : "transparent")}
                  >
                    {s === "Todos" ? "Todos" : getEstadoConfig(s).label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: "1px solid #2A2A32" }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className="px-3 py-2 transition-colors"
              style={{
                backgroundColor: viewMode === "grid" ? "rgba(34,211,238,0.1)" : "#1E1E23",
                color: viewMode === "grid" ? "#22D3EE" : "#475569",
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="px-3 py-2 transition-colors"
              style={{
                backgroundColor: viewMode === "list" ? "rgba(34,211,238,0.1)" : "#1E1E23",
                color: viewMode === "list" ? "#22D3EE" : "#475569",
                borderLeft: "1px solid #2A2A32",
              }}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button onClick={load} className="btn-secondary" title="Actualizar">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Estado chips */}
      {allEstados.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[{ key: "Todos", label: "Todos", count: vehicles.length }, ...allEstados.map((s) => ({ key: s, label: getEstadoConfig(s).label, count: estadoCounts[s] }))].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterEstado(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                backgroundColor: filterEstado === key ? "rgba(155,142,196,0.08)" : "#1E1E23",
                border: `1px solid ${filterEstado === key ? "rgba(155,142,196,0.25)" : "#2A2A32"}`,
                color: filterEstado === key ? "#9B8EC4" : "#64748B",
              }}
            >
              <span>{label}</span>
              <span
                className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                style={{
                  backgroundColor: filterEstado === key ? "rgba(155,142,196,0.12)" : "#25252B",
                  color: filterEstado === key ? "#9B8EC4" : "#475569",
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#9B8EC4" }} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={search.length > 0} />
      ) : viewMode === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} onClick={() => setSelected(v)} />
          ))}
        </div>
      ) : (
        /* List view */
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
        >
          {/* Desktop list */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A32" }}>
                  {["Vehículo", "Año", "Precio MSRP", "Color", "VIN", "Estado", "Ingresado", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#475569" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => {
                  const cfg = getEstadoConfig(v.estado_vehiculo);
                  return (
                    <tr
                      key={v.id}
                      className="transition-colors cursor-pointer"
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid #2A2A32" : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => setSelected(v)}
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium" style={{ color: "#E2E8F0" }}>
                          {v.marca} {v.modelo}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs" style={{ color: "#94A3B8" }}>{v.anio}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium" style={{ color: "#22D3EE" }}>
                          {formatCLP(v.precio_msrp_clp)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs" style={{ color: "#94A3B8" }}>{v.color ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono" style={{ color: "#64748B" }}>
                          {v.vin_codigo ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs" style={{ color: "#475569" }}>{formatDate(v.created_at)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(v); }}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "#475569" }}
                          onMouseEnter={(e2) => (e2.currentTarget.style.color = "#9B8EC4")}
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

          {/* Mobile list */}
          <div className="md:hidden divide-y" style={{ borderColor: "#2A2A32" }}>
            {filtered.map((v) => {
              const cfg = getEstadoConfig(v.estado_vehiculo);
              return (
                <div
                  key={v.id}
                  className="p-4 flex items-center gap-3 cursor-pointer transition-colors"
                  onClick={() => setSelected(v)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div
                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ border: "1px solid #2A2A32" }}
                  >
                    <VehicleImage fotos={v.link_fotos} marca={v.marca} modelo={v.modelo} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "#E2E8F0" }}>
                      {v.marca} {v.modelo}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                      {v.anio} · {formatCLP(v.precio_msrp_clp)}
                    </p>
                  </div>
                  <span className={`badge ${cfg.cls} flex-shrink-0`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid #2A2A32" }}>
              <p className="text-xs" style={{ color: "#475569" }}>
                {filtered.length} de {vehicles.length} vehículos
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#6EBF8B" }} />
                <span className="text-xs" style={{ color: "#475569" }}>Tiempo real activo</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid footer */}
      {!loading && filtered.length > 0 && viewMode === "grid" && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#475569" }}>
            {filtered.length} de {vehicles.length} vehículos
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#6EBF8B" }} />
            <span className="text-xs" style={{ color: "#475569" }}>Tiempo real activo</span>
          </div>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <DetailModal vehicle={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
