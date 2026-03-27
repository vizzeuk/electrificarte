"use client";

import { Search, Bell, Menu, User, Settings, LogOut } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
  activeTab: string;
  onSignOut: () => Promise<void>;
}

const tabTitles: Record<string, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard", sub: "Resumen general del negocio" },
  compradores: { title: "Compradores", sub: "Gestión de leads de compra" },
  vendedores: { title: "Vendedores", sub: "Gestión de leads de venta" },
  inventario: { title: "Inventario", sub: "Stock de vehículos disponibles" },
};

export default function Header({ onMenuClick, activeTab, onSignOut }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await onSignOut();
    setSigningOut(false);
  }

  const notifications = [
    { id: 1, text: "Nuevo lead registrado en el sistema", time: "Hace 5 min", unread: true },
    { id: 2, text: "Vendedor completó formulario de ingreso", time: "Hace 1 hora", unread: true },
    { id: 3, text: "Revisión técnica completada", time: "Hace 3 horas", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;
  const current = tabTitles[activeTab] ?? tabTitles.dashboard;

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 lg:px-6"
      style={{
        backgroundColor: "rgba(23,23,26,0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #2A2A32",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: "#64748B" }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>
            {current.title}
          </h1>
          <p className="text-xs hidden sm:block" style={{ color: "#475569" }}>
            {current.sub}
          </p>
        </div>
      </div>

      {/* Center search */}
      <div className="hidden md:flex flex-1 max-w-sm mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#475569" }} />
          <input
            type="text"
            placeholder="Buscar..."
            className="input-field pl-9 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Mobile search */}
        <button
          className="md:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: "#64748B" }}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-1.5 rounded-lg transition-colors"
            style={{ color: "#64748B" }}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "#22D3EE", color: "#111113" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-xl overflow-hidden z-50"
              style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
            >
              <div
                className="px-4 py-2.5 flex items-center justify-between"
                style={{ borderBottom: "1px solid #2A2A32" }}
              >
                <span className="text-xs font-semibold" style={{ color: "#CBD5E1" }}>
                  Notificaciones
                </span>
                <span className="badge badge-blue">{unreadCount} nuevas</span>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    borderBottom: "1px solid #2A2A32",
                    backgroundColor: n.unread ? "rgba(34,211,238,0.04)" : "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = n.unread ? "rgba(34,211,238,0.04)" : "transparent")}
                >
                  <p className="text-xs" style={{ color: "#CBD5E1" }}>{n.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{n.time}</p>
                </div>
              ))}
              <div className="px-4 py-2 text-center">
                <button className="text-xs transition-colors" style={{ color: "#22D3EE" }}>
                  Ver todas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ml-1"
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ backgroundColor: "rgba(34,211,238,0.15)", color: "#22D3EE" }}
            >
              EA
            </div>
            <span className="hidden sm:block text-xs font-medium" style={{ color: "#94A3B8" }}>
              Admin
            </span>
          </button>

          {showProfile && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-xl shadow-xl overflow-hidden z-50"
              style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
            >
              <div className="px-3 py-2.5" style={{ borderBottom: "1px solid #2A2A32" }}>
                <p className="text-xs font-medium" style={{ color: "#CBD5E1" }}>Electrificarte</p>
                <p className="text-xs" style={{ color: "#475569" }}>admin@electrificarte.cl</p>
              </div>
              <div className="p-1">
                {[
                  { icon: User, label: "Mi Perfil", danger: false },
                  { icon: Settings, label: "Configuración", danger: false },
                ].map(({ icon: Icon, label, danger }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
                    style={{ color: danger ? "#C47B7B" : "#94A3B8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
                  style={{ color: "#C47B7B", opacity: signingOut ? 0.6 : 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#25252B")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {signingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
