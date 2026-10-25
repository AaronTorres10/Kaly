# Kaly

Kaly es una aplicación móvil para buscar y reservar alojamientos.
Las reservas se pagan en línea.

## Configuración local

Requisitos: Node.js 22.13 o posterior y Expo SDK 57.

1. Copia `.env.example` como `.env`.
2. Completa `EXPO_PUBLIC_SUPABASE_URL` con la URL del proyecto Supabase y
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` con su clave pública (anon).
3. La clave `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` puede quedar vacía hasta
   implementar pagos. La aplicación arranca únicamente con las dos variables
   públicas de Supabase.
4. No pongas `SUPABASE_SERVICE_ROLE_KEY` ni `STRIPE_SECRET_KEY` en `.env` ni
   en el bundle de Expo. Esas claves se configuran únicamente como secretos de
   las Edge Functions de Supabase.

Inicia la aplicación con:

```sh
npm install
npm start
```

## Supabase y Stripe

Instala e inicia sesión en Supabase CLI, crea o vincula el proyecto remoto y
guarda su referencia en el entorno local:

```sh
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

Configura los secretos privados solo en Supabase:

```sh
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key> STRIPE_SECRET_KEY=<stripe-secret-key>
```

La clave publicable de Stripe, cuando llegue la sección de pagos, se añadirá
como `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` en el `.env` local. Nunca se registran
claves ni tokens en logs o en el repositorio.
