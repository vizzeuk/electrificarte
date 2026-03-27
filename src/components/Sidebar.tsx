"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Handshake,
  Car,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "compradores", label: "Compradores", icon: ShoppingCart },
  { id: "vendedores", label: "Vendedores", icon: Handshake },
  { id: "inventario", label: "Inventario", icon: Car },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          transition-all duration-300 ease-in-out
          ${collapsed ? "lg:w-16" : "lg:w-60"}
          ${isOpen ? "w-60 translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          backgroundColor: "#17171A",
          borderRight: "1px solid #2A2A32",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between h-14 px-4"
          style={{ borderBottom: "1px solid #2A2A32" }}
        >
          <div className={`flex items-center gap-2.5 ${collapsed ? "lg:justify-center lg:w-full" : ""}`}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.25)" }}
            >
              <Zap className="w-4 h-4" style={{ color: "#22D3EE" }} />
            </div>
            {!collapsed && (
              <span className="font-semibold text-sm tracking-tight" style={{ color: "#E2E8F0" }}>
                Electrific<span style={{ color: "#22D3EE" }}>arte</span>
              </span>
            )}
          </div>

          {/* Close — mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md transition-colors"
            style={{ color: "#64748B" }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Collapse — desktop */}
          {!isOpen && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1 rounded-md transition-colors"
              style={{ color: "#64748B" }}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="p-2 mt-1 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-150 text-left group relative
                  ${collapsed ? "lg:justify-center lg:px-0" : ""}
                `}
                style={{
                  backgroundColor: isActive ? "rgba(34,211,238,0.1)" : "transparent",
                  color: isActive ? "#22D3EE" : "#64748B",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#25252B";
                    (e.currentTarget as HTMLButtonElement).style.color = "#CBD5E1";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#64748B";
                  }
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div
                    className="hidden lg:block absolute left-full ml-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                    style={{
                      backgroundColor: "#25252B",
                      border: "1px solid #2A2A32",
                      color: "#E2E8F0",
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom user */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 ${collapsed ? "lg:flex lg:justify-center" : ""}`}
          style={{ borderTop: "1px solid #2A2A32" }}
        >
          <div className={`flex items-center gap-2.5 ${collapsed ? "lg:justify-center" : ""}`}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ backgroundColor: "rgba(34,211,238,0.15)", color: "#22D3EE" }}
            >
              EA
            </div>
            {!collapsed && (
              <div>
                <p className="text-xs font-medium" style={{ color: "#CBD5E1" }}>Admin</p>
                <p className="text-xs" style={{ color: "#475569" }}>Electrificarte</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
