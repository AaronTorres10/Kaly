# Kaly

Kaly es una aplicación móvil para buscar y reservar
alojamientos. Las reservas se pagan en línea.

## Configuración local

Requiere Node.js 22.13 o superior, compatible con Expo SDK 57.

1. Copia `.env.example` a `.env`.
2. Completa `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` con
   los valores públicos del proyecto de Supabase.
3. `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` puede quedar vacío hasta implementar
   la sección de pagos. La app no arranca si falta alguna variable pública de
   Supabase.
4. Instala la CLI de Supabase y autentícate con `supabase login`.
5. Vincula el proyecto remoto con `supabase link --project-ref <project-ref>`.
6. Las claves `SUPABASE_SERVICE_ROLE_KEY` y `STRIPE_SECRET_KEY` se configuran
   únicamente como secretos de las Edge Functions, nunca en `.env` de la app.

Para preparar Stripe cuando llegue la sección de pagos, instala su CLI,
autentícate con `stripe login` y configura sus secretos en Supabase con
`supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... STRIPE_SECRET_KEY=...`.
No se necesita una clave de Stripe para arrancar esta versión.

Para ejecutar las comprobaciones:

```bash
npm install
npm run typecheck
npm test
```
