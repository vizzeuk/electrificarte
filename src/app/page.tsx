"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardView from "@/components/DashboardView";
import CompradoresView from "@/components/CompradoresView";
import VendedoresView from "@/components/VendedoresView";
import InventarioView from "@/components/InventarioView";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setAuthReady(true);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "compradores":
        return <CompradoresView />;
      case "vendedores":
        return <VendedoresView />;
      case "inventario":
        return <InventarioView />;
      default:
        return <DashboardView />;
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#111113" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Verificando sesión...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#111113" }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-60">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          activeTab={activeTab}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 p-4 lg:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
