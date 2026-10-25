# Hospedajes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el starter de Expo Router en el MVP móvil de Hospedajes para descubrir alojamientos, reservar, pagar y administrarlos como anfitrión.

**Architecture:** Expo Router mantiene las cuatro pestañas y las pantallas anidadas. Supabase proporciona Auth, PostgreSQL con RLS, Storage y dos Edge Functions de Stripe; las migraciones y funciones viven versionadas en el repositorio. La app nunca decide el importe final ni marca una reserva como pagada: PostgreSQL controla la concurrencia y el webhook confirma el pago.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router, TypeScript, Supabase Auth/PostgreSQL/Storage/Edge Functions, Stripe PaymentSheet, Vitest para lógica pura y Supabase CLI para migraciones y políticas.

**Spec:** `docs/superpowers/specs/2026-09-20-hospedajes-design.md`

## Global Constraints

- La aplicación usará Expo Router con Supabase como backend completo.
- Supabase Auth tendrá correo y Google; PostgreSQL estará protegido con Row Level Security.
- Las migraciones de Supabase CLI serán versionadas en el repositorio; no se modificará el esquema pegando SQL manualmente en el panel.
- La base de datos impedirá reservas solapadas mediante una restricción atómica de rangos de fechas; la comprobación no dependerá únicamente de React.
- El teléfono nunca enviará ni decidirá el precio; la Edge Function calculará el importe desde el alojamiento, fechas y huéspedes guardados en la base.
- El cliente no podrá marcar una reserva como pagada y el webhook será idempotente ante reintentos.
- Todas las áreas contemplarán carga, errores de red, pago rechazado, reserva pendiente y estados vacíos para búsquedas sin resultados y usuarios sin reservas.
- La interfaz usará una paleta de colores propia; no se usarán logos, marcas ni colores distintivos de ningún sitio real.
- El nombre de producto será **Hospedajes** en texto plano.
- Las fotos tendrán licencia compatible y procederán de Unsplash o Pexels; nunca se usarán imágenes de listados reales.
- Cualquier referencia visual servirá solo como guía de estructura y disposición; se usarán imágenes propias y una paleta distinta a la de la referencia.
- Antes de tocar APIs de Expo se consultará la documentación versionada de Expo SDK 57: `https://docs.expo.dev/versions/v57.0.0/`.

## File Map

- `app/`: rutas de Expo Router, layouts, autenticación, exploración, detalle, reservas, anfitrión y perfil.
- `components/`: componentes visuales reutilizables y estados de carga, error y vacío.
- `lib/`: clientes de Supabase/Stripe, consultas y reglas compartidas.
- `types/`: tipos generados o escritos para el esquema y contratos de navegación.
- `supabase/migrations/`: esquema, índices, restricciones, RLS y funciones SQL versionadas.
- `supabase/functions/`: creación de PaymentIntent y webhook de Stripe.
- `scripts/`: carga reproducible de datos de ejemplo y validaciones locales.
- `tests/`: pruebas Vitest de cálculos, filtros, estados e idempotencia simulada.
- `assets/`: iconos, fuentes e imágenes de muestra con su fuente/licencia documentada.

## Review Focus

- Usuario sin sesión que intenta reservar o abrir datos privados: debe ver autenticación, no un error de permisos.
- Fechas invertidas, huéspedes cero y rango ya ocupado: el formulario debe bloquear el envío y la base debe rechazar la carrera concurrente.
- Precio alterado desde el teléfono: la función debe ignorarlo y calcular desde PostgreSQL.
- Webhook repetido, firma inválida o evento desconocido: no debe duplicar ni cambiar incorrectamente la reserva.
- Resultado sin fotos, búsqueda sin coincidencias y usuario sin reservas: deben mostrar estados vacíos útiles, no pantallas rotas.

---

### Task 1: Preparar herramientas y claves

**Files:**
- Modify: `package.json`, `package-lock.json`, `app.json`, `.gitignore`
- Create: `.env.example`, `lib/env.ts`, `tests/setup.test.ts`, `README.md` (sección de configuración)

**Interfaces:**
- Produce `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `STRIPE_SECRET_KEY`; las dos últimas solo vivirán en secretos de Supabase, nunca en el bundle.

- [ ] Instalar las dependencias compatibles con Expo SDK 57, Supabase, Stripe y Vitest, consultando primero la documentación de `https://docs.expo.dev/versions/v57.0.0/`.
- [ ] Crear `.env.example` con nombres vacíos, validar variables públicas en `lib/env.ts` y rechazar en arranque una configuración incompleta sin imprimir secretos.
- [ ] Inicializar `supabase/`, documentar login de CLI, proyecto remoto y Stripe en `README.md`; añadir `.env` y claves privadas al `.gitignore`.
- [ ] Ejecutar `npm run typecheck` y una prueba de configuración que confirme que una clave privada no se exporta a la app.

### Task 2: Acceso con correo

**Files:**
- Create: `app/(auth)/correo.tsx`, `lib/auth/email.ts`, `tests/auth/email.test.ts`
- Modify: `app/_layout.tsx`, `app/(tabs)/perfil.tsx`

**Interfaces:**
- `signInWithEmail(email: string, password: string): Promise<AuthResult>`
- `signUpWithEmail(email: string, password: string): Promise<AuthResult>`
- `signOut(): Promise<void>`

- [ ] Probar validaciones de correo, contraseña corta, credenciales inválidas y sesión iniciada con el contrato de `AuthResult`.
- [ ] Implementar acceso y registro con `supabase.auth.signInWithPassword` y `signUp`, traduciendo errores a mensajes de interfaz en español.
- [ ] Conectar la sesión al layout raíz y mostrar carga, error y cierre de sesión desde Perfil.
- [ ] Verificar con `npm test -- tests/auth/email.test.ts` y navegación manual sin sesión y con sesión.

### Task 3: Acceso con Google

**Files:**
- Create: `app/(auth)/google.tsx`, `lib/auth/google.ts`, `tests/auth/google.test.ts`
- Modify: `app/(auth)/_layout.tsx`, `app/(tabs)/perfil.tsx`, `app.json`

**Interfaces:**
- `signInWithGoogle(): Promise<AuthResult>` usando `expo-auth-session`/`expo-web-browser` y el redirect `hospedajes://auth/callback`.

- [ ] Configurar el callback nativo y web según Expo SDK 57 y documentar las client IDs fuera del repositorio.
- [ ] Probar cancelación, callback sin código, error del proveedor y callback válido sin exponer el token en logs.
- [ ] Implementar OAuth con `signInWithOAuth`, abrir el navegador y persistir la sesión recibida por Supabase.
- [ ] Verificar Android, iOS y web con una cuenta de prueba y `npm test -- tests/auth/google.test.ts`.

### Task 4: Base de datos y seguridad RLS

**Files:**
- Create: `supabase/migrations/202609200001_schema.sql`, `supabase/migrations/202609200002_rls.sql`, `types/database.ts`, `lib/supabase.ts`, `tests/db/rls.test.ts`

**Interfaces:**
- Tablas `profiles`, `listings`, `listing_images`, `listing_availability`, `reservations`.
- Estados de reserva: `pending_payment`, `paid`, `payment_failed`.
- Cliente público en `lib/supabase.ts`; nunca un cliente con service role dentro de la app.

- [ ] Escribir pruebas de acceso anónimo a alojamientos publicados, aislamiento de perfiles/reservas y permisos del anfitrión.
- [ ] Crear las cinco tablas con claves, timestamps, dinero en enteros, rangos de fechas y claves foráneas necesarias.
- [ ] Añadir políticas RLS para lectura pública de publicados, gestión propia de perfil/reservas y gestión del anfitrión sobre sus alojamientos, imágenes, disponibilidad y reservas recibidas.
- [ ] Añadir la restricción atómica `EXCLUDE USING gist` para impedir rangos de reserva solapados y generar tipos TypeScript desde el esquema.
- [ ] Ejecutar `supabase db reset` y `npm test -- tests/db/rls.test.ts` contra la base local.

### Task 5: Datos de ejemplo con imágenes licenciadas

**Files:**
- Create: `supabase/seed.sql`, `scripts/seed-example-data.ts`, `assets/images/README.md`, `tests/data/seed.test.ts`

**Interfaces:**
- El seed crea perfiles, alojamientos publicados, imágenes con `source_url`, `license` y `attribution`, disponibilidad y ninguna reserva real.

- [ ] Elegir únicamente fotos de Unsplash o Pexels con licencia compatible, registrar URL, autoría y atribución en `assets/images/README.md`, y no copiar imágenes de listados reales.
- [ ] Crear datos reproducibles con UUIDs fijos y precios enteros, cubriendo alojamiento con varias fotos, sin fotos y sin disponibilidad.
- [ ] Hacer que `supabase db reset` cargue el seed sin depender de datos insertados manualmente en el dashboard.
- [ ] Probar conteos, URLs documentadas y ausencia de logos, marcas o colores distintivos de sitios reales con `npm test -- tests/data/seed.test.ts`.

### Task 6: Pestaña y listado de propiedades

**Files:**
- Modify: `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`
- Create: `app/(tabs)/anfitrion.tsx`, `components/listings/ListingCard.tsx`, `lib/listings/listPublished.ts`, `tests/listings/listPublished.test.ts`

**Interfaces:**
- `listPublishedListings(params: ListingQuery): Promise<ListingSummary[]>`
- `ListingSummary = { id, title, location, pricePerNight, capacity, coverImageUrl }`.

- [ ] Actualizar las cuatro pestañas `Explorar`, `Reservas`, `Anfitrión` y `Perfil` sin logos de marcas y con la paleta propia definida en `constants/Colors.ts`.
- [ ] Probar que la consulta solo devuelve `is_published = true`, ordena de forma estable y representa una tarjeta sin imagen.
- [ ] Implementar la consulta y el listado con estados de carga, error, vacío y reintento; mostrar precio y capacidad sin asumir una foto.
- [ ] Verificar la navegación desde una tarjeta al detalle y ejecutar `npm test -- tests/listings/listPublished.test.ts`.

### Task 7: Búsqueda con filtros

**Files:**
- Create: `components/search/SearchBar.tsx`, `components/search/FiltersSheet.tsx`, `lib/listings/searchListings.ts`, `tests/listings/searchListings.test.ts`
- Modify: `app/(tabs)/index.tsx`

**Interfaces:**
- `searchListings(input: SearchInput): Promise<ListingSummary[]>`
- `SearchInput = { destination?: string; checkIn?: string; checkOut?: string; guests?: number; minPrice?: number; maxPrice?: number; amenities?: string[] }`.

- [ ] Probar destino parcial, fechas válidas, huéspedes, precio, servicios, combinación de filtros y cero resultados; rechazar fechas invertidas y huéspedes menores que uno.
- [ ] Implementar el estado controlado de búsqueda y filtros, aplicándolos a Supabase sin convertir una entrada vacía en un filtro accidental.
- [ ] Mostrar chips/resumen de filtros, limpiar filtros y preservar la consulta al volver del detalle.
- [ ] Verificar `npm test -- tests/listings/searchListings.test.ts` y el estado vacío de búsqueda desde el teléfono.

### Task 8: Pantalla de detalle

**Files:**
- Create: `app/listings/[id].tsx`, `components/listings/ListingDetail.tsx`, `lib/listings/getListingDetail.ts`, `tests/listings/getListingDetail.test.ts`

**Interfaces:**
- `getListingDetail(id: string): Promise<ListingDetail>`; devuelve alojamiento, servicios, capacidad, precio, imágenes, coordenadas y disponibilidad resumida.

- [ ] Probar ID inexistente, alojamiento no publicado y detalle válido con datos completos.
- [ ] Crear la ruta dinámica y consultar solo el alojamiento solicitado, mostrando navegación atrás, carga y error.
- [ ] Renderizar descripción, precio por noche, capacidad, servicios y CTA para elegir fechas.
- [ ] Ejecutar `npm test -- tests/listings/getListingDetail.test.ts` y probar el acceso desde resultados filtrados.

### Task 9: Galería de fotos

**Files:**
- Create: `components/listings/ListingGallery.tsx`, `tests/listings/ListingGallery.test.tsx`
- Modify: `app/listings/[id].tsx`, `assets/images/README.md`

**Interfaces:**
- `ListingGallery({ images: ListingImage[] }): JSX.Element`; respeta `position` y acepta lista vacía.

- [ ] Probar orden, imagen única, lista vacía, fallo de carga y apertura de una imagen a pantalla completa.
- [ ] Implementar carrusel con contador, placeholder neutral y `accessibilityLabel` descriptivo.
- [ ] Mantener atribución y licencia de cada foto en el registro de assets, sin usar imágenes de listados reales.
- [ ] Ejecutar `npm test -- tests/listings/ListingGallery.test.tsx` y revisar tamaños pequeños y grandes.

### Task 10: Mapa del alojamiento

**Files:**
- Create: `components/listings/ListingMap.tsx`, `tests/listings/ListingMap.test.tsx`
- Modify: `app/listings/[id].tsx`, `package.json`

**Interfaces:**
- `ListingMap({ latitude: number; longitude: number; label: string }): JSX.Element`.

- [ ] Consultar la documentación de Expo SDK 57 del proveedor de mapas elegido y probar coordenadas válidas y ausentes.
- [ ] Implementar marcador y región sin mostrar la dirección privada exacta del anfitrión.
- [ ] Mostrar fallback accesible cuando mapas no estén disponibles o la coordenada sea inválida.
- [ ] Ejecutar `npm test -- tests/listings/ListingMap.test.tsx` y comprobar Android/iOS/web según soporte del proveedor.

### Task 11: Calendario de disponibilidad

**Files:**
- Create: `components/booking/AvailabilityCalendar.tsx`, `lib/availability/getAvailability.ts`, `tests/booking/AvailabilityCalendar.test.tsx`
- Modify: `app/listings/[id].tsx`

**Interfaces:**
- `getAvailability(listingId: string, month: string): Promise<AvailabilityDay[]>`
- `AvailabilityCalendar` devuelve `{ checkIn?: string; checkOut?: string }` mediante `onChange`.

- [ ] Probar fechas bloqueadas, selección de entrada/salida, rango invertido, cambio de mes y rango que cruza meses.
- [ ] Consultar `listing_availability` y marcar solo días habilitados, sin confiar en estilos del cliente para reservar.
- [ ] Integrar calendario con huéspedes y resumen, deshabilitando el CTA hasta tener un rango válido.
- [ ] Ejecutar `npm test -- tests/booking/AvailabilityCalendar.test.tsx` y verificar el estado de carga/error.

### Task 12: Pestaña del anfitrión

**Files:**
- Modify: `app/(tabs)/anfitrion.tsx`, `app/(tabs)/_layout.tsx`
- Create: `app/host/_layout.tsx`, `app/host/index.tsx`, `components/host/HostListingCard.tsx`, `tests/host/HostTab.test.tsx`

**Interfaces:**
- `listMyListings(): Promise<HostListingSummary[]>`; solo devuelve alojamientos cuyo `host_id` es la sesión actual.

- [ ] Probar anfitrión sin publicaciones, anfitrión con publicaciones y usuario sin sesión.
- [ ] Implementar la pestaña con CTA de crear, lista de publicaciones y estados de carga/error/vacío.
- [ ] Añadir navegación a formulario, fotos y reservas recibidas sin mezclar datos de otros anfitriones.
- [ ] Ejecutar `npm test -- tests/host/HostTab.test.tsx` y revisar la navegación de las cuatro pestañas.

### Task 13: Formulario para publicar

**Files:**
- Create: `app/host/listings/new.tsx`, `app/host/listings/[id]/edit.tsx`, `components/host/ListingForm.tsx`, `lib/host/saveListing.ts`, `tests/host/ListingForm.test.tsx`

**Interfaces:**
- `saveListing(input: ListingFormInput): Promise<{ id: string }>`; valida título, ubicación, precio entero positivo, capacidad y servicios antes de insertar/actualizar.

- [ ] Probar campos obligatorios, precio/capacidad inválidos, crear y editar solo una publicación propia.
- [ ] Implementar formulario con estado de edición, validación visible y control explícito de `is_published`.
- [ ] Guardar mediante Supabase y volver a la pestaña del anfitrión con confirmación; no permitir que un usuario cambie `host_id`.
- [ ] Ejecutar `npm test -- tests/host/ListingForm.test.tsx` y probar pérdida de red sin perder los valores escritos.

### Task 14: Subida de fotos

**Files:**
- Create: `components/host/ListingPhotoManager.tsx`, `lib/host/uploadListingImage.ts`, `tests/host/uploadListingImage.test.ts`
- Modify: `app/host/listings/[id]/edit.tsx`, `supabase/migrations/202609200003_storage.sql`

**Interfaces:**
- `uploadListingImage(listingId: string, asset: ImageAsset): Promise<ListingImage>`; guarda en Storage y registra orden, URL y licencia.
- `deleteListingImage(listingId: string, imageId: string): Promise<void>`.

- [ ] Probar MIME/tamaño inválido, subida fallida, eliminación, reordenamiento y publicación sin fotos.
- [ ] Crear bucket privado/público según el acceso del detalle y políticas Storage restringidas al anfitrión del alojamiento.
- [ ] Implementar selección, vista previa, progreso, reordenamiento y borrado, solicitando solo permisos necesarios.
- [ ] Registrar únicamente fotos de Unsplash/Pexels con atribución; ejecutar `npm test -- tests/host/uploadListingImage.test.ts`.

### Task 15: Reservas recibidas

**Files:**
- Create: `app/host/reservations.tsx`, `components/host/ReceivedReservationCard.tsx`, `lib/host/listReceivedReservations.ts`, `tests/host/listReceivedReservations.test.ts`

**Interfaces:**
- `listReceivedReservations(): Promise<ReceivedReservation[]>`; filtra por alojamientos del anfitrión y expone huésped, fechas, huéspedes, importe y estado.

- [ ] Probar lista vacía, reservas pendientes/pagadas/fallidas y aislamiento entre dos anfitriones.
- [ ] Consultar reservas recibidas mediante relación protegida por RLS, con orden por fecha de entrada.
- [ ] Renderizar estados sin añadir controles de cancelación, que están fuera del alcance inicial.
- [ ] Ejecutar `npm test -- tests/host/listReceivedReservations.test.ts` y verificar error/reintento.

### Task 16: Crear la reserva pendiente

**Files:**
- Create: `lib/reservations/createPendingReservation.ts`, `components/booking/BookingSummary.tsx`, `tests/reservations/createPendingReservation.test.ts`
- Modify: `app/listings/[id].tsx`, `app/(tabs)/reservas.tsx`

**Interfaces:**
- `createPendingReservation(input: CreateReservationInput): Promise<PendingReservation>`; crea estado `pending_payment` y no acepta `totalAmount` desde el teléfono.

- [ ] Probar fechas inválidas, huéspedes fuera de capacidad, alojamiento no publicado, solapamiento y reserva válida.
- [ ] Implementar resumen con noches, huéspedes y precio mostrado como estimación; insertar solo huésped, alojamiento, rango y datos permitidos.
- [ ] Mostrar la reserva pendiente en Reservas y ofrecer continuar al pago sin marcarla como pagada.
- [ ] Ejecutar `npm test -- tests/reservations/createPendingReservation.test.ts` con dos intentos concurrentes contra la restricción atómica.

### Task 17: Cobrar con la hoja de pago

**Files:**
- Create: `lib/payments/createPaymentSheet.ts`, `components/payments/PaymentSheetButton.tsx`, `tests/payments/createPaymentSheet.test.ts`
- Modify: `app/reservations/[id]/pay.tsx`, `package.json`, `app.json`

**Interfaces:**
- `createPaymentSheet(reservationId: string): Promise<{ paymentIntentClientSecret: string; customerEphemeralKeySecret?: string; customerId?: string }>`.

- [ ] Probar reserva ajena, estado no pagable, ausencia de client secret y rechazo/cancelación de PaymentSheet.
- [ ] Configurar Stripe PaymentSheet para Expo SDK 57 y llamar a la Edge Function autenticada sin enviar importe.
- [ ] Mostrar estado pendiente después de cerrar la hoja; reservar la transición a pagada para el webhook.
- [ ] Ejecutar `npm test -- tests/payments/createPaymentSheet.test.ts` y probar una tarjeta de prueba rechazada.

### Task 18: Confirmar con el webhook

**Files:**
- Create: `supabase/functions/create-payment-intent/index.ts`, `supabase/functions/stripe-webhook/index.ts`, `lib/payments/paymentStatus.ts`, `tests/payments/stripe-webhook.test.ts`

**Interfaces:**
- `create-payment-intent`: POST autenticado `{ reservationId }` y responde `{ clientSecret }`.
- `stripe-webhook`: POST firmado por Stripe y responde `2xx` solo después de procesar de forma segura.
- `applyStripeEvent(event): Promise<void>`: idempotente para `payment_intent.succeeded` y `payment_intent.payment_failed`.

- [ ] Probar firma inválida, reserva no perteneciente al usuario, importe manipulado, evento repetido y eventos desconocidos.
- [ ] Implementar la Edge Function que relee alojamiento, fechas y huéspedes desde PostgreSQL, calcula el importe y crea un PaymentIntent idempotente.
- [ ] Implementar verificación de firma y actualización transaccional a `paid` o `payment_failed`, ignorando reintentos ya aplicados.
- [ ] Ejecutar pruebas locales de funciones con secretos de prueba y confirmar que el cliente nunca puede actualizar `reservations.status`.

### Task 19: Estados de carga, error y vacío

**Files:**
- Create: `components/feedback/LoadingState.tsx`, `components/feedback/ErrorState.tsx`, `components/feedback/EmptyState.tsx`, `tests/feedback/states.test.tsx`
- Modify: `app/(tabs)/index.tsx`, `app/(tabs)/reservas.tsx`, `app/(tabs)/perfil.tsx`, `app/(tabs)/anfitrion.tsx`, `app/listings/[id].tsx`, `app/host/reservations.tsx`, `app/reservations/[id]/pay.tsx`

**Interfaces:**
- `LoadingState({ label?: string }): JSX.Element`
- `ErrorState({ message: string; onRetry?: () => void }): JSX.Element`
- `EmptyState({ title: string; description: string; action?: { label: string; onPress: () => void } }): JSX.Element`

- [ ] Probar cada componente con accesibilidad, mensaje personalizado, reintento y acción opcional.
- [ ] Implementar componentes visuales propios, sin logos, colores de marcas ni texto técnico expuesto al usuario.
- [ ] Reemplazar estados incompletos de Explorar, Reservas, Perfil, Anfitrión, detalle, reservas recibidas y pago.
- [ ] Verificar carga, error y vacío en cada pantalla, incluyendo búsqueda sin resultados, usuario sin reservas y publicación sin fotos.
- [ ] Ejecutar `npm test -- tests/feedback/states.test.tsx` y comprobar que cada reintento vuelve a disparar su consulta.

### Task 20: Pestaña Reservas del huésped

**Files:**
- Modify: `app/(tabs)/reservas.tsx`, `app/(tabs)/_layout.tsx`
- Create: `components/reservations/GuestReservationCard.tsx`, `lib/reservations/listMyReservations.ts`, `tests/reservations/listMyReservations.test.ts`

**Interfaces:**
- `listMyReservations(): Promise<GuestReservation[]>`; solo devuelve reservas cuyo `guest_id` coincide con la sesión actual.
- `GuestReservation` agrupa reservas en `pending_payment`, `paid`, `payment_failed` y pasadas según sus fechas.

- [ ] Probar aislamiento por usuario, lista vacía, reserva pendiente, pagada, fallida y pasada.
- [ ] Consultar las reservas del huésped ordenadas por fecha de entrada y agruparlas en próximas, pendientes de pago, pagadas y pasadas.
- [ ] Renderizar tarjetas con alojamiento, fechas, huéspedes, importe calculado y CTA de pago solo para `pending_payment`.
- [ ] Mantener la navegación al detalle y a la hoja de pago sin permitir modificar estado desde el cliente.
- [ ] Ejecutar `npm test -- tests/reservations/listMyReservations.test.ts` y verificar carga, error y vacío.

### Task 21: Pulido móvil y gestos

**Files:**
- Create: `components/layout/Screen.tsx`, `components/layout/RefreshableScrollView.tsx`, `tests/layout/mobile-polish.test.tsx`
- Modify: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/reservas.tsx`, `app/(tabs)/perfil.tsx`, `app/(tabs)/anfitrion.tsx`, `app/host/listings/new.tsx`, `app/host/listings/[id]/edit.tsx`, `app/listings/[id].tsx`, `app/reservations/[id]/pay.tsx`

**Interfaces:**
- `Screen({ children, scrollable?: boolean, refreshing?: boolean, onRefresh?: () => Promise<void> }): JSX.Element` añade safe areas y comportamiento común de teclado.

- [ ] Probar formulario con teclado abierto, campos inferiores, orientación vertical, notch y barra de navegación del teléfono.
- [ ] Implementar `KeyboardAvoidingView`, `ScrollView` con `keyboardShouldPersistTaps`, `Keyboard.dismiss` al enviar y márgenes de `SafeAreaView` sin duplicarlos.
- [ ] Añadir deslizar para refrescar a Explorar, Reservas y Anfitrión, preservando scroll y mostrando indicador mientras se consulta.
- [ ] Ajustar tamaños táctiles, márgenes, textos largos y botones para pantallas pequeñas sin cambiar la paleta propia.
- [ ] Ejecutar `npm test -- tests/layout/mobile-polish.test.tsx` y hacer una revisión manual en Android y iOS.

### Task 22: Dejar la app instalable en el teléfono

**Files:**
- Modify: `app.json`, `eas.json`, `README.md`, `assets/images/icon.png`, `assets/images/splash-icon.png`
- Create: `docs/superpowers/release-checklist.md`

**Interfaces:**
- Build de desarrollo y producción reproducible con Expo Application Services; esquema `hospedajes` y nombre visible `Hospedajes`.

- [ ] Generar icono, splash y adaptive icon propios, sin logos, marcas ni colores distintivos de ningún sitio real.
- [ ] Configurar identificadores Android/iOS, permisos mínimos, variables de entorno de build y perfiles `development`/`preview`/`production`.
- [ ] Documentar `eas build --platform android --profile preview` y la instalación del APK en un teléfono; incluir también la ruta iOS de TestFlight.
- [ ] Ejecutar `npx expo-doctor`, `npx expo export`, pruebas manuales de las cuatro pestañas y checklist de autenticación, búsqueda, reserva y pago.

## Self-Review

- [ ] Cobertura: las cuatro pestañas aparecen en las Tasks 6, 12, 20 y 22; autenticación está separada en Tasks 2 y 3; esquema/RLS y seed están separados en Tasks 4 y 5; resultados y filtros están separados en Tasks 6 y 7; detalle, galería, mapa y calendario están separados en Tasks 8 a 11; anfitrión está separado en Tasks 12 a 15; pago está separado en Tasks 16 a 18; estados y pulido móvil están separados en Tasks 19 y 21.
- [ ] Seguridad: el plan cubre RLS, Storage, restricción de rangos, cálculo de servidor, secreto privado, firma e idempotencia del webhook.
- [ ] Visuales y contenido: las tres reglas solicitadas aparecen en Global Constraints y se verifican en Tasks 5, 9, 12, 14 y 19.
- [ ] Estados: carga, error, vacío, pago rechazado y reserva pendiente tienen componentes y pruebas dedicadas en Task 19, además de verificaciones específicas en Tasks 6, 7, 9, 11, 15, 16, 17 y 20.
- [ ] No quedan placeholders de implementación: cada tarea define archivos, interfaces, pruebas y un resultado verificable.
