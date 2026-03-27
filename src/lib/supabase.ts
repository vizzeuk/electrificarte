import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente solo-lectura usando clave anon sin sesión de usuario.
// Evita que las consultas queden sujetas al token `authenticated` del login.
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// ─── Types matching REAL Supabase schema ──────────────────────────────────────

// Table: leads (compradores / buyers)
export interface Lead {
  id: number;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  telefono: string;
  target_model: string;           // vehículo de interés
  financing: string | null;       // forma de pago
  status: string | null;          // estado del lead
  descripcion_interes: string | null;
  matched_stock_id: string | null;
  matching_score: number | null;
  observaciones_internas: string | null;
  parte_pago_marca: string | null;
  parte_pago_modelo: string | null;
  parte_pago_ano: string | null;
  parte_pago_km: string | null;
  parte_pago_deuda: string | null;
  parte_pago_patente: string | null;
  tally_id: string | null;
}

// Table: leads_vendors (concesionarios / dealers)
export interface LeadVendor {
  id: string;
  created_at: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  nombre_concesionario: string | null;
  comuna: string | null;
  marcas: string | null;          // marcas que vende
  estado: string | null;
  tally_id: string | null;
}

// Table: stock_maestro (inventario)
export interface StockMaestro {
  id: string;
  created_at: string;
  provider_id: string | null;
  marca: string;
  modelo: string;
  anio: number;
  precio_msrp_clp: number;
  color: string | null;
  vin_codigo: string | null;
  estado_vehiculo: string | null;
  link_fotos: string[] | null;
  notas_internas: string | null;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export const LEAD_STATUSES = ["pendiente_pago", "pagado", "proceso_venta", "cerrado_venta", "cerrado_noventa"] as const;
export type EstadoLead = typeof LEAD_STATUSES[number];

export const VENDOR_STATUSES = ["pendiente_pago", "pagado", "ingresado"] as const;
export type EstadoVendedor = typeof VENDOR_STATUSES[number];

type GenericRow = Record<string, unknown>;

const LEAD_STATUS_ALIASES: Record<string, EstadoLead> = {
  pendiente_pago: "pendiente_pago",
  pagado: "pagado",
  proceso_venta: "proceso_venta",
  cerrado_venta: "cerrado_venta",
  cerrado_noventa: "cerrado_noventa",
  sin_match: "pendiente_pago",
  en_gestion: "proceso_venta",
  Nuevo: "pendiente_pago",
  Contactado: "proceso_venta",
  "Esperando Pago": "pendiente_pago",
  Cerrado: "cerrado_venta",
  Perdido: "cerrado_noventa",
};

const VENDOR_STATUS_ALIASES: Record<string, EstadoVendedor> = {
  pendiente_pago: "pendiente_pago",
  pagado: "pagado",
  ingresado: "ingresado",
  Activo: "ingresado",
  "En revisión": "pendiente_pago",
  Pausado: "pendiente_pago",
  Inactivo: "pagado",
};

export function normalizeLeadStatus(status: string | null): EstadoLead | null {
  if (!status) return null;
  return LEAD_STATUS_ALIASES[status] ?? null;
}

export function normalizeVendorStatus(estado: string | null): EstadoVendedor | null {
  if (!estado) return null;
  return VENDOR_STATUS_ALIASES[estado] ?? null;
}

function mapVendorRow(row: any, index: number): LeadVendor {
  const rawEstado = (row?.estado ?? row?.status ?? null) as string | null;
  return {
    id: String(row?.id ?? row?.uuid ?? row?.vendor_id ?? row?.email ?? `vendor-${index}`),
    created_at: row?.created_at ?? new Date().toISOString(),
    nombre: row?.nombre ?? row?.first_name ?? row?.name ?? "",
    apellido: row?.apellido ?? row?.last_name ?? row?.surname ?? "",
    email: row?.email ?? "",
    telefono: row?.telefono ?? row?.phone ?? "",
    nombre_concesionario: row?.nombre_concesionario ?? row?.concesionario ?? row?.dealer_name ?? null,
    comuna: row?.comuna ?? row?.city ?? null,
    marcas: row?.marcas ?? row?.brands ?? null,
    estado: normalizeVendorStatus(rawEstado) ?? rawEstado,
    tally_id: row?.tally_id ?? null,
  };
}

function sortByDateDesc<T extends { created_at?: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

async function selectWithBestEffort(table: string, orderFields: string[]): Promise<{ data: GenericRow[] | null; error: string | null }> {
  for (const field of orderFields) {
    const { data, error } = await supabasePublic
      .from(table)
      .select("*")
      .order(field, { ascending: false });

    if (!error) {
      return { data: data as GenericRow[], error: null };
    }
  }

  const { data, error } = await supabasePublic
    .from(table)
    .select("*");

  if (!error) {
    return { data: data as GenericRow[], error: null };
  }

  return { data: null, error: error.message };
}

function mapLeadRow(row: any, index: number): Lead {
  const rawStatus = (row?.status ?? row?.estado ?? null) as string | null;
  return {
    id: Number(row?.id ?? index + 1),
    created_at: (row?.created_at ?? row?.fecha_creacion ?? new Date().toISOString()) as string,
    first_name: (row?.first_name ?? row?.nombre ?? row?.name ?? "") as string,
    last_name: (row?.last_name ?? row?.apellido ?? row?.surname ?? "") as string,
    email: (row?.email ?? "") as string,
    telefono: (row?.telefono ?? row?.phone ?? "") as string,
    target_model: (row?.target_model ?? row?.vehiculo_interes ?? row?.modelo_interes ?? "") as string,
    financing: (row?.financing ?? row?.forma_pago ?? null) as string | null,
    status: normalizeLeadStatus(rawStatus) ?? rawStatus,
    descripcion_interes: (row?.descripcion_interes ?? null) as string | null,
    matched_stock_id: (row?.matched_stock_id ?? null) as string | null,
    matching_score: (row?.matching_score ?? null) as number | null,
    observaciones_internas: (row?.observaciones_internas ?? null) as string | null,
    parte_pago_marca: (row?.parte_pago_marca ?? null) as string | null,
    parte_pago_modelo: (row?.parte_pago_modelo ?? null) as string | null,
    parte_pago_ano: (row?.parte_pago_ano ?? null) as string | null,
    parte_pago_km: (row?.parte_pago_km ?? null) as string | null,
    parte_pago_deuda: (row?.parte_pago_deuda ?? null) as string | null,
    parte_pago_patente: (row?.parte_pago_patente ?? null) as string | null,
    tally_id: (row?.tally_id ?? null) as string | null,
  };
}

function mapStockRow(row: any, index: number): StockMaestro {
  return {
    id: String(row?.id ?? row?.uuid ?? `stock-${index}`),
    created_at: (row?.created_at ?? row?.fecha_creacion ?? new Date().toISOString()) as string,
    provider_id: (row?.provider_id ?? row?.proveedor_id ?? null) as string | null,
    marca: (row?.marca ?? row?.brand ?? "") as string,
    modelo: (row?.modelo ?? row?.model ?? "") as string,
    anio: Number(row?.anio ?? row?.year ?? 0),
    precio_msrp_clp: Number(row?.precio_msrp_clp ?? row?.precio ?? 0),
    color: (row?.color ?? null) as string | null,
    vin_codigo: (row?.vin_codigo ?? row?.vin ?? null) as string | null,
    estado_vehiculo: (row?.estado_vehiculo ?? row?.estado ?? null) as string | null,
    link_fotos: (row?.link_fotos ?? row?.fotos ?? null) as string[] | null,
    notas_internas: (row?.notas_internas ?? row?.notas ?? null) as string | null,
  };
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
  const candidateTables = ["leads", "buyers", "lead_buyers"];
  let bestResult: Lead[] | null = null;
  let lastError: string | null = null;

  for (const table of candidateTables) {
    const { data, error } = await selectWithBestEffort(table, ["created_at", "fecha_creacion", "id"]);

    if (error) {
      lastError = `${table}: ${error}`;
      continue;
    }

    const mapped = sortByDateDesc((data ?? []).map((row, index) => mapLeadRow(row, index)));
    if (!bestResult || mapped.length > bestResult.length) {
      bestResult = mapped;
    }

    if (mapped.length > 0) {
      return mapped;
    }
  }

  if (lastError) {
    console.error("Error fetching leads:", lastError);
  }

  if (bestResult) {
    return bestResult;
  }

  return [];
}

export async function getLeadVendors(): Promise<LeadVendor[]> {
  const candidateTables = ["leads_vendors", "lead_vendors", "vendors", "dealers"];
  let bestResult: LeadVendor[] | null = null;
  let lastError: string | null = null;

  for (const table of candidateTables) {
    const { data, error } = await selectWithBestEffort(table, ["created_at", "fecha_creacion", "id"]);

    if (error) {
      lastError = `${table}: ${error}`;
      continue;
    }

    const mapped = sortByDateDesc((data ?? []).map((row, index) => mapVendorRow(row, index)));
    if (!bestResult || mapped.length > bestResult.length) {
      bestResult = mapped;
    }

    if (mapped.length > 0) {
      return mapped;
    }
  }

  if (lastError) {
    console.error("Error fetching vendors:", lastError);
  }

  return bestResult ?? [];
}

export async function getStock(): Promise<StockMaestro[]> {
  const candidateTables = ["stock_maestro", "stock", "inventario"];
  let bestResult: StockMaestro[] | null = null;
  let lastError: string | null = null;

  for (const table of candidateTables) {
    const { data, error } = await selectWithBestEffort(table, ["created_at", "fecha_creacion", "id"]);

    if (error) {
      lastError = `${table}: ${error}`;
      continue;
    }

    const mapped = sortByDateDesc((data ?? []).map((row, index) => mapStockRow(row, index)));
    if (!bestResult || mapped.length > bestResult.length) {
      bestResult = mapped;
    }

    if (mapped.length > 0) {
      return mapped;
    }
  }

  if (lastError) {
    console.error("Error fetching stock:", lastError);
  }

  return bestResult ?? [];
}

export async function updateLeadStatus(id: number, status: string): Promise<boolean> {
  const candidateTables = ["leads", "buyers", "lead_buyers"];

  for (const table of candidateTables) {
    const { error } = await supabase
      .from(table)
      .update({ status })
      .eq("id", id);

    if (!error) return true;
  }

  console.error("Error updating lead status: no se pudo actualizar en ninguna tabla candidata");
  return false;
}

export async function updateVendorEstado(id: string, estado: string): Promise<boolean> {
  const candidateTables = ["leads_vendors", "lead_vendors", "vendors", "dealers"];

  for (const table of candidateTables) {
    const { error } = await supabase
      .from(table)
      .update({ estado })
      .eq("id", id);

    if (!error) return true;
  }

  console.error("Error updating vendor estado: no se pudo actualizar en ninguna tabla candidata");
  return false;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatCLP = (value: number): string =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);

export const getLeadFullName = (lead: Lead): string =>
  `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim();

export const getVendorFullName = (v: LeadVendor): string =>
  `${v.nombre ?? ""} ${v.apellido ?? ""}`.trim();
