// Mock data for the dashboard - ready to be replaced with Supabase queries

export interface Comprador {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  vehiculoInteres: string;
  formaPago: "Contado" | "Crédito" | "Leasing";
  estado: "Nuevo" | "Contactado" | "Esperando Pago" | "Cerrado" | "Perdido";
  fechaCreacion: string;
}

export interface Vendedor {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  autoVender: string;
  anio: number;
  precioEsperado: number;
  estado: "Recibido" | "Revisión Técnica" | "Publicado" | "Vendido";
  fechaCreacion: string;
}

export interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  imagen: string;
  estado: "Disponible" | "Reservado" | "Vendido";
  tipo: "Eléctrico" | "Híbrido" | "Combustión";
  kilometraje: number;
}

export const compradores: Comprador[] = [
  {
    id: "1",
    nombre: "Carlos Méndez",
    rut: "12.345.678-9",
    email: "carlos.mendez@email.com",
    telefono: "+56 9 1234 5678",
    vehiculoInteres: "Tesla Model 3",
    formaPago: "Crédito",
    estado: "Contactado",
    fechaCreacion: "2024-01-15",
  },
  {
    id: "2",
    nombre: "María González",
    rut: "15.678.901-2",
    email: "maria.gonzalez@email.com",
    telefono: "+56 9 8765 4321",
    vehiculoInteres: "BYD Dolphin",
    formaPago: "Contado",
    estado: "Esperando Pago",
    fechaCreacion: "2024-01-18",
  },
  {
    id: "3",
    nombre: "Roberto Silva",
    rut: "10.234.567-8",
    email: "roberto.silva@email.com",
    telefono: "+56 9 5555 1234",
    vehiculoInteres: "Nissan Leaf",
    formaPago: "Leasing",
    estado: "Nuevo",
    fechaCreacion: "2024-01-20",
  },
  {
    id: "4",
    nombre: "Ana Martínez",
    rut: "18.901.234-5",
    email: "ana.martinez@email.com",
    telefono: "+56 9 3333 7890",
    vehiculoInteres: "Tesla Model Y",
    formaPago: "Crédito",
    estado: "Cerrado",
    fechaCreacion: "2024-01-10",
  },
  {
    id: "5",
    nombre: "Diego Fernández",
    rut: "14.567.890-1",
    email: "diego.fernandez@email.com",
    telefono: "+56 9 7777 4567",
    vehiculoInteres: "BYD Atto 3",
    formaPago: "Contado",
    estado: "Contactado",
    fechaCreacion: "2024-01-22",
  },
  {
    id: "6",
    nombre: "Valentina Rojas",
    rut: "19.012.345-6",
    email: "valentina.rojas@email.com",
    telefono: "+56 9 2222 8901",
    vehiculoInteres: "Volvo XC40 Recharge",
    formaPago: "Leasing",
    estado: "Nuevo",
    fechaCreacion: "2024-01-25",
  },
  {
    id: "7",
    nombre: "Sebastián López",
    rut: "16.789.012-3",
    email: "sebastian.lopez@email.com",
    telefono: "+56 9 4444 2345",
    vehiculoInteres: "Hyundai Ioniq 5",
    formaPago: "Crédito",
    estado: "Perdido",
    fechaCreacion: "2024-01-08",
  },
  {
    id: "8",
    nombre: "Camila Torres",
    rut: "20.345.678-9",
    email: "camila.torres@email.com",
    telefono: "+56 9 6666 5678",
    vehiculoInteres: "MG ZS EV",
    formaPago: "Contado",
    estado: "Esperando Pago",
    fechaCreacion: "2024-01-28",
  },
];

export const vendedores: Vendedor[] = [
  {
    id: "1",
    nombre: "Francisco Herrera",
    rut: "11.222.333-4",
    email: "francisco.herrera@email.com",
    telefono: "+56 9 1111 2222",
    autoVender: "Tesla Model S 2022",
    anio: 2022,
    precioEsperado: 45000000,
    estado: "Publicado",
    fechaCreacion: "2024-01-12",
  },
  {
    id: "2",
    nombre: "Javiera Muñoz",
    rut: "13.444.555-6",
    email: "javiera.munoz@email.com",
    telefono: "+56 9 3333 4444",
    autoVender: "Nissan Leaf 2021",
    anio: 2021,
    precioEsperado: 18000000,
    estado: "Revisión Técnica",
    fechaCreacion: "2024-01-16",
  },
  {
    id: "3",
    nombre: "Tomás Vargas",
    rut: "17.666.777-8",
    email: "tomas.vargas@email.com",
    telefono: "+56 9 5555 6666",
    autoVender: "BYD Tang 2023",
    anio: 2023,
    precioEsperado: 32000000,
    estado: "Recibido",
    fechaCreacion: "2024-01-20",
  },
  {
    id: "4",
    nombre: "Isidora Castillo",
    rut: "15.888.999-0",
    email: "isidora.castillo@email.com",
    telefono: "+56 9 7777 8888",
    autoVender: "Hyundai Kona EV 2022",
    anio: 2022,
    precioEsperado: 22000000,
    estado: "Publicado",
    fechaCreacion: "2024-01-14",
  },
  {
    id: "5",
    nombre: "Matías Reyes",
    rut: "12.111.222-3",
    email: "matias.reyes@email.com",
    telefono: "+56 9 9999 0000",
    autoVender: "Chevrolet Bolt 2021",
    anio: 2021,
    precioEsperado: 16000000,
    estado: "Vendido",
    fechaCreacion: "2024-01-05",
  },
  {
    id: "6",
    nombre: "Catalina Díaz",
    rut: "19.333.444-5",
    email: "catalina.diaz@email.com",
    telefono: "+56 9 1234 9876",
    autoVender: "Volvo C40 Recharge 2023",
    anio: 2023,
    precioEsperado: 38000000,
    estado: "Revisión Técnica",
    fechaCreacion: "2024-01-24",
  },
];

export const vehiculos: Vehiculo[] = [
  {
    id: "1",
    marca: "Tesla",
    modelo: "Model 3",
    anio: 2023,
    precio: 35000000,
    imagen: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop",
    estado: "Disponible",
    tipo: "Eléctrico",
    kilometraje: 15000,
  },
  {
    id: "2",
    marca: "BYD",
    modelo: "Dolphin",
    anio: 2024,
    precio: 18500000,
    imagen: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=300&fit=crop",
    estado: "Disponible",
    tipo: "Eléctrico",
    kilometraje: 0,
  },
  {
    id: "3",
    marca: "Nissan",
    modelo: "Leaf",
    anio: 2022,
    precio: 16000000,
    imagen: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop",
    estado: "Reservado",
    tipo: "Eléctrico",
    kilometraje: 25000,
  },
  {
    id: "4",
    marca: "Tesla",
    modelo: "Model Y",
    anio: 2023,
    precio: 42000000,
    imagen: "https://images.unsplash.com/photo-1619317190227-6b8a8d1b1f1a?w=400&h=300&fit=crop",
    estado: "Disponible",
    tipo: "Eléctrico",
    kilometraje: 8000,
  },
  {
    id: "5",
    marca: "Hyundai",
    modelo: "Ioniq 5",
    anio: 2023,
    precio: 38000000,
    imagen: "https://images.unsplash.com/photo-1680024315041-4b1e462e3c6b?w=400&h=300&fit=crop",
    estado: "Disponible",
    tipo: "Eléctrico",
    kilometraje: 12000,
  },
  {
    id: "6",
    marca: "BYD",
    modelo: "Atto 3",
    anio: 2024,
    precio: 22000000,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
    estado: "Reservado",
    tipo: "Eléctrico",
    kilometraje: 0,
  },
  {
    id: "7",
    marca: "Volvo",
    modelo: "XC40 Recharge",
    anio: 2023,
    precio: 45000000,
    imagen: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=400&h=300&fit=crop",
    estado: "Disponible",
    tipo: "Eléctrico",
    kilometraje: 5000,
  },
  {
    id: "8",
    marca: "MG",
    modelo: "ZS EV",
    anio: 2024,
    precio: 19500000,
    imagen: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop",
    estado: "Disponible",
    tipo: "Eléctrico",
    kilometraje: 0,
  },
];

export const chartData = [
  { mes: "Ago", leads: 24, ventas: 8 },
  { mes: "Sep", leads: 32, ventas: 12 },
  { mes: "Oct", leads: 28, ventas: 10 },
  { mes: "Nov", leads: 45, ventas: 18 },
  { mes: "Dic", leads: 38, ventas: 15 },
  { mes: "Ene", leads: 52, ventas: 22 },
];

export const formatCLP = (value: number): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
};
