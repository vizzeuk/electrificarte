import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Electrificarte - Dashboard CRM",
  description: "Dashboard CRM para compra y venta de vehículos eléctricos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}
