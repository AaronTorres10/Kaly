# Hospedajes: especificacion de producto y arquitectura

## Estado

Diseño aprobado por el usuario. La implementación queda pendiente de un plan.

## Objetivo

Construir una aplicación móvil tipo marketplace de alojamientos llamada
Hospedajes. Una misma cuenta puede actuar como huésped y anfitrión. El MVP
permitirá descubrir alojamientos, consultar su detalle, reservar y pagar en
línea, además de publicar y administrar alojamientos propios.

## Alcance funcional

La aplicación tendrá cuatro pestañas:

- **Explorar**: búsqueda por destino, fechas y huéspedes; filtros; resultados;
  detalle con galería de fotos, mapa y calendario de disponibilidad.
- **Reservas**: reservas pendientes de pago, próximas, pagadas y pasadas.
- **Anfitrión**: crear y editar publicaciones, cargar fotos, administrar
  precio, capacidad, servicios, disponibilidad y reservas recibidas.
- **Perfil**: datos personales, autenticación, preferencias y cierre de sesión.

El flujo principal es explorar, abrir el detalle, elegir fechas, revisar el
resumen, crear una reserva pendiente, pagar con Stripe PaymentSheet y mostrar
la reserva como pagada solo después del webhook confirmado.

No forman parte del alcance inicial los favoritos ni las cancelaciones.

## Identidad y backend

La aplicación usará Expo Router con Supabase como backend completo:

- Supabase Auth con correo y Google.
- PostgreSQL protegido con Row Level Security.
- Supabase Storage para imágenes.
- Edge Functions solo para crear el pago y recibir el webhook de Stripe.
- Migraciones de Supabase CLI versionadas en el repositorio; no se modificará
  el esquema pegando SQL manualmente en el panel.

## Modelo de datos

- `profiles`: identidad y datos públicos del usuario.
- `listings`: alojamiento, ubicación, precio, capacidad, servicios y estado de
  publicación.
- `listing_images`: imágenes ordenadas por alojamiento.
- `listing_availability`: disponibilidad bloqueada o habilitada gestionada por
  el anfitrión.
- `reservations`: huésped, alojamiento, rango de fechas, número de huéspedes,
  importe calculado y estado.

Los estados iniciales de una reserva serán `pending_payment`, `paid` y
`payment_failed`. RLS permitirá consultar alojamientos publicados; cada
usuario administrará su perfil y sus reservas; cada anfitrión administrará sus
alojamientos, imágenes, disponibilidad y reservas recibidas.

La base de datos impedirá reservas solapadas mediante una restricción atómica
de rangos de fechas. La comprobación no dependerá únicamente de React.

## Pago

1. La app crea una reserva `pending_payment` directamente en PostgreSQL.
2. La Edge Function valida el usuario y la reserva.
3. La Edge Function consulta el alojamiento, fechas y huéspedes desde la base
   y calcula el importe. El teléfono nunca envía ni decide el precio.
4. La función crea un PaymentIntent idempotente y devuelve su `client_secret`.
5. La app abre Stripe PaymentSheet.
6. El webhook verifica la firma de Stripe y cambia la reserva a `paid` o
   `payment_failed`.

El webhook será idempotente ante reintentos. El cliente no podrá marcar una
reserva como pagada.

## Estados de interfaz

Todas las áreas contemplarán carga, errores de red, pago rechazado y reserva
pendiente. También existirán estados vacíos para búsquedas sin resultados y
para usuarios sin reservas.

## Restricciones visuales y de contenido

- La interfaz usará una paleta de colores propia.
- No se usarán logos, marcas ni colores distintivos de ningún sitio real.
- El nombre de producto será **Hospedajes** en texto plano.
- Las fotos tendrán licencia compatible y procederán de Unsplash o Pexels;
  nunca se usarán imágenes de listados reales.
- Cualquier referencia visual servirá solo como guía de estructura y
  disposición. Se usarán imágenes propias y una paleta distinta a la de la
  referencia.

## Verificación

Se probarán las políticas RLS, el bloqueo de dobles reservas, el cálculo de
importes en servidor, la idempotencia del webhook, los estados de pago, los
estados vacíos y la navegación principal de las cuatro pestañas.
