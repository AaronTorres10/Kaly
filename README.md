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

### Cargar datos de ejemplo en Supabase Cloud

Configura `DEMO_EMAIL` y `DEMO_PASSWORD` en el entorno local con una cuenta ya
existente del proyecto remoto. El cargador usa `EXPO_PUBLIC_SUPABASE_ANON_KEY`,
inicia sesión con esa cuenta y respeta RLS; no requiere ni acepta una service
role key.

```bash
npm run seed:example
```

El seed SQL queda configurado para `supabase db reset` cuando haya Supabase
local disponible. El cargador remoto crea los mismos tres alojamientos, sus
imágenes y disponibilidad, pero asocia el anfitrión al usuario demo porque una
clave pública no puede insertar perfiles de otros usuarios.

## Acceso con Google

En el panel de Supabase, habilita el proveedor Google y configura sus client
IDs y secretos directamente en la configuración del proveedor. No guardes
client IDs, client secrets ni tokens en este repositorio ni en el bundle de la
app. Añade `kaly://auth/callback` a los redirects permitidos para Android/iOS
y la URL HTTPS de tu despliegue web con `/auth/callback` para web.
