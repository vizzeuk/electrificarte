"use client";

import { useEffect, useState } from "react";
import { Users, Handshake, Car, TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  supabase,
  getLeads,
  getLeadVendors,
  getStock,
  normalizeLeadStatus,
  normalizeVendorStatus,
  type Lead,
  type LeadVendor,
} from "@/lib/supabase";

const LEAD_STATUS_LABELS: Record<string, string> = {
  pendiente_pago: "Pendiente pago",
  pagado: "Pagado",
  proceso_venta: "Proceso venta",
  cerrado_venta: "Cerrado venta",
  cerrado_noventa: "Cerrado no venta",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-xs shadow-xl"
        style={{ backgroundColor: "#25252B", border: "1px solid #2A2A32" }}
      >
        <p className="font-medium mb-1" style={{ color: "#CBD5E1" }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendors, setVendors] = useState<LeadVendor[]>([]);
  const [stockCount, setStockCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchCounts() {
    setLoading(true);
    const [leadsData, vendorsData, stock] = await Promise.all([
      getLeads(),
      getLeadVendors(),
      getStock(),
    ]);
    setLeads(leadsData);
    setVendors(vendorsData);
    setStockCount(stock.length);
    setLastUpdated(new Date());
    setLoading(false);
  }

  useEffect(() => {
    fetchCounts();

    const leadsChannel = supabase
      .channel("leads-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        fetchCounts();
      })
      .subscribe();

    const vendorsChannel = supabase
      .channel("vendors-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads_vendors" }, () => {
        fetchCounts();
      })
      .subscribe();

    const stockChannel = supabase
      .channel("stock-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_maestro" }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(vendorsChannel);
      supabase.removeChannel(stockChannel);
    };
  }, []);

  const leadsCount = leads.length;
  const vendorsCount = vendors.length;

  const buyersByStatus = {
    pendiente_pago: leads.filter((l) => normalizeLeadStatus(l.status) === "pendiente_pago").length,
    pagado: leads.filter((l) => normalizeLeadStatus(l.status) === "pagado").length,
    proceso_venta: leads.filter((l) => normalizeLeadStatus(l.status) === "proceso_venta").length,
    cerrado_venta: leads.filter((l) => normalizeLeadStatus(l.status) === "cerrado_venta").length,
    cerrado_noventa: leads.filter((l) => normalizeLeadStatus(l.status) === "cerrado_noventa").length,
  };

  const vendorsByStatus = {
    pendiente_pago: vendors.filter((v) => normalizeVendorStatus(v.estado) === "pendiente_pago").length,
    pagado: vendors.filter((v) => normalizeVendorStatus(v.estado) === "pagado").length,
    ingresado: vendors.filter((v) => normalizeVendorStatus(v.estado) === "ingresado").length,
  };

  const compradoresActivos = buyersByStatus.pendiente_pago + buyersByStatus.pagado + buyersByStatus.proceso_venta;
  const cierreVentaPct = leadsCount > 0 ? Math.round((buyersByStatus.cerrado_venta / leadsCount) * 100) : 0;
  const vendedoresIngresadosPct = vendorsCount > 0 ? Math.round((vendorsByStatus.ingresado / vendorsCount) * 100) : 0;
  const pendientesPagoTotal = buyersByStatus.pendiente_pago + vendorsByStatus.pendiente_pago;

  const statusComparisonData = [
    { label: "Pendiente pago", Compradores: buyersByStatus.pendiente_pago, Vendedores: vendorsByStatus.pendiente_pago },
    { label: "Pagado", Compradores: buyersByStatus.pagado, Vendedores: vendorsByStatus.pagado },
    { label: "Proceso venta", Compradores: buyersByStatus.proceso_venta, Vendedores: 0 },
    { label: "Cerrado venta", Compradores: buyersByStatus.cerrado_venta, Vendedores: 0 },
    { label: "Cerrado no venta", Compradores: buyersByStatus.cerrado_noventa, Vendedores: 0 },
    { label: "Ingresado", Compradores: 0, Vendedores: vendorsByStatus.ingresado },
  ];

  const buyersFunnelData = [
    { etapa: LEAD_STATUS_LABELS.pendiente_pago, cantidad: buyersByStatus.pendiente_pago },
    { etapa: LEAD_STATUS_LABELS.pagado, cantidad: buyersByStatus.pagado },
    { etapa: LEAD_STATUS_LABELS.proceso_venta, cantidad: buyersByStatus.proceso_venta },
    { etapa: LEAD_STATUS_LABELS.cerrado_venta, cantidad: buyersByStatus.cerrado_venta },
    { etapa: LEAD_STATUS_LABELS.cerrado_noventa, cantidad: buyersByStatus.cerrado_noventa },
  ];

  const kpis = [
    {
      title: "Compradores totales",
      sub: "Leads registrados",
      value: loading ? "—" : String(leadsCount),
      change: loading ? "—" : `${compradoresActivos} activos`,
      trend: "up",
      icon: Users,
      accent: "#22D3EE",
      accentBg: "rgba(34,211,238,0.08)",
    },
    {
      title: "Cierre compradores",
      sub: "Conversión cerrada con venta",
      value: loading ? "—" : `${cierreVentaPct}%`,
      change: loading ? "—" : `${buyersByStatus.cerrado_venta} cierres`,
      trend: "up",
      icon: TrendingUp,
      accent: "#6EBF8B",
      accentBg: "rgba(110,191,139,0.08)",
    },
    {
      title: "Vendedores totales",
      sub: "Concesionarios registrados",
      value: loading ? "—" : String(vendorsCount),
      change: loading ? "—" : `${vendorsByStatus.ingresado} ingresados`,
      trend: "up",
      icon: Handshake,
      accent: "#9B8EC4",
      accentBg: "rgba(155,142,196,0.08)",
    },
    {
      title: "Pendientes de pago",
      sub: "Compradores + vendedores",
      value: loading ? "—" : String(pendientesPagoTotal),
      change: loading ? "—" : "Requiere seguimiento",
      trend: pendientesPagoTotal > 0 ? "down" : "up",
      icon: Car,
      accent: "#C9A96E",
      accentBg: "rgba(201,169,110,0.08)",
    },
  ];

  const recentActivity = [
    { id: 1, text: "Compradores en proceso", detail: `${compradoresActivos} leads activos en flujo`, time: "En vivo", dot: "#22D3EE" },
    { id: 2, text: "Vendedores ingresados", detail: `${vendorsByStatus.ingresado} concesionarios disponibles`, time: "En vivo", dot: "#6EBF8B" },
    { id: 3, text: "Cierres con venta", detail: `${buyersByStatus.cerrado_venta} compradores cerrados con venta`, time: "En vivo", dot: "#9B8EC4" },
    { id: 4, text: "Pendientes de pago", detail: `${pendientesPagoTotal} casos por regularizar`, time: "En vivo", dot: "#C9A96E" },
    { id: 5, text: "Stock disponible", detail: `${stockCount ?? 0} vehículos en catálogo`, time: "En vivo", dot: "#8A9BB5" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#475569" }}>
          Actualizado: {lastUpdated ? lastUpdated.toLocaleTimeString("es-CL") : "—"}
          <span className="ml-2 inline-flex items-center gap-1" style={{ color: "#6EBF8B" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
            En vivo
          </span>
        </p>
        <button
          onClick={fetchCounts}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
          style={{ color: "#64748B", backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: kpi.accentBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: kpi.accent }} />
                </div>
                <div className="flex items-center gap-1">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" style={{ color: "#6EBF8B" }} />
                  ) : (
                    <TrendingDown className="w-3 h-3" style={{ color: "#C47B7B" }} />
                  )}
                  <span
                    className="text-xs font-medium"
                    style={{ color: kpi.trend === "up" ? "#6EBF8B" : "#C47B7B" }}
                  >
                    {kpi.change}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-semibold" style={{ color: "#E2E8F0" }}>
                {kpi.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                {kpi.title} · {kpi.sub}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div
          className="xl:col-span-2 rounded-xl p-5"
          style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>Estados Operativos por Tipo</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Compradores vs vendedores según estado actual</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22D3EE" }} />
                <span className="text-xs" style={{ color: "#64748B" }}>Compradores</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#6EBF8B" }} />
                <span className="text-xs" style={{ color: "#64748B" }}>Vendedores</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusComparisonData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A32" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Compradores" fill="#22D3EE" radius={[4, 4, 0, 0]} barSize={22} opacity={0.9} />
                <Bar dataKey="Vendedores" fill="#6EBF8B" radius={[4, 4, 0, 0]} barSize={22} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>Actividad</p>
            <Activity className="w-3.5 h-3.5" style={{ color: "#475569" }} />
          </div>
          <div className="space-y-1">
            {recentActivity.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 px-2 py-2.5 rounded-lg transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: a.dot }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: "#CBD5E1" }}>{a.text}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "#475569" }}>{a.detail}</p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: "#334155" }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
      >
        <div className="mb-5">
          <p className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>Pipeline de Compradores</p>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Distribución por etapas de gestión comercial</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buyersFunnelData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A32" />
              <XAxis dataKey="etapa" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cantidad" name="Compradores" fill="#22D3EE" radius={[4, 4, 0, 0]} barSize={22} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

