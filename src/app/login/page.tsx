"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (data.session) {
        router.replace("/");
        return;
      }

      setChecking(false);
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("No se pudo iniciar sesión. Revisa tus credenciales.");
      setLoading(false);
      return;
    }

    router.replace("/");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#111113" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Validando sesión...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#111113" }}>
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: "#1E1E23", border: "1px solid #2A2A32" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.24)" }}
          >
            <Zap className="w-5 h-5" style={{ color: "#22D3EE" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>Electrificarte CRM</p>
            <p className="text-xs" style={{ color: "#475569" }}>Acceso para equipo interno</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#94A3B8" }}>Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-9"
                placeholder="admin@electrificarte.cl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: "#94A3B8" }}>Contraseña</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: "rgba(196,123,123,0.08)", color: "#C47B7B", border: "1px solid rgba(196,123,123,0.24)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full gap-2 mt-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
