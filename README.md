# 🚀 ElectrifiCARte Dashboard CRM

## 🎯 Frontend Completo Listo

**✅ Estado actual:**
- Next.js 14 + TypeScript + Tailwind CSS + Supabase
- **4 vistas completas**: Dashboard, Compradores, Vendedores (Concesionarios), Inventario
- **Tiempo real**: Suscripciones PostgreSQL activas (nuevos datos aparecen automáticamente)
- **Responsive**: Mobile-first (drawer, grid/tabla auto-cambian)
- **Paleta pastel minimalista**: Diseño profesional, sin neón

## 📊 Vistas & Funcionalidades

| Vista | Tabla Supabase | Funciones |
|-------|----------------|-----------|
| **Dashboard** | leads, leads_vendors, stock_maestro | KPIs reales, gráficos, actividad |
| **Compradores** | `leads` | Búsqueda, filtros, modal detallado, cambio de `status` |
| **Vendedores** | `leads_vendors` | Búsqueda, filtros por `estado`/`marcas`, modal concesionario |
| **Inventario** | `stock_maestro` | Grid/List toggle, modal con fotos, precios MSRP |

## 🚀 Comandos

```bash
# Desarrollo
npm run dev
# Abre http://localhost:3000

# Build producción
npm run build

# Preview producción
npm run start
```

## 🔗 Supabase

**URL**: `https://rrdznswrlmxdxgrafpbt.supabase.co`  
**Anon Key**: Configurada en `.env.local` ✅  
**RLS Políticas**: Lectura pública habilitada ✅

## 📈 Próximos pasos recomendados

1. **Autenticación** - Clerk/Supabase Auth
2. **Formularios** - CRUD completo (leads, vendors, stock)
3. **Upload fotos** - Para stock_maestro.link_fotos
4. **Matching automático** - leads.matched_stock_id + matching_score
5. **Export CSV/PDF** - Tablas
6. **PWA** - Offline + notificaciones

## 🧪 Pruebas recomendadas

1. `npm run dev` → verificar que carga datos de las 3 tablas
2. Agregar/eliminar fila en Supabase → debe aparecer en ~1 segundo
3. Mobile: F12 → Responsive → probar drawer y grid
4. `npm run build && npm run start` → producción OK

**¡Dashboard 100% funcional y listo para usar!** 🎉
