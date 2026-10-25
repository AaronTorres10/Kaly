# Análisis del plan de implementación de Kaly

## Resultado

El plan actualizado cubre el alcance de la especificación y conserva las separaciones solicitadas:

- correo y Google están en tareas distintas;
- esquema/RLS y datos de ejemplo están separados;
- listado y filtros están separados;
- detalle, galería, mapa y calendario tienen tareas independientes;
- el panel del anfitrión está dividido en pestaña, formulario, fotos y reservas recibidas;
- el pago está dividido en reserva pendiente, PaymentSheet y webhook;
- la preparación es la primera tarea y la instalación móvil la última;
- las tres reglas de marca, licencias y referencias visuales aparecen en las restricciones globales y en tareas concretas.

## Observaciones críticas antes de implementar

1. **Rutas existentes versus rutas del plan.** El starter actual contiene `app/(tabs)/index.tsx`, `explore.tsx`, `saved.tsx` y `profile.tsx`, mientras el plan usa `app/(tabs)/reservas.tsx`, `perfil.tsx` y `anfitrion.tsx`. La Task 6 debe decidir explícitamente si se renombran/mueven las rutas existentes o si se mantienen como redirecciones. Sin esa decisión, varios archivos de las Tasks 2, 3, 6, 7, 12, 19 y 20 no coinciden con el repositorio.

2. **Rol de `index.tsx` y `explore.tsx`.** La Task 6 convierte `index.tsx` en el listado y la Task 7 también modifica ese archivo para la búsqueda, pero no define qué ocurre con `explore.tsx`. Conviene fijar una sola ruta canónica para Explorar y eliminar o redirigir la otra, evitando dos pantallas para la misma pestaña.

3. **Scripts de pruebas.** El `package.json` actual solo tiene `start`, `android`, `ios`, `web` y `typecheck`. La Task 1 debe añadir explícitamente el script `test` de Vitest y, si se usa, una variante para pruebas de integración de Supabase; de lo contrario, los comandos `npm test ...` de todas las tareas no serán ejecutables.

4. **Migraciones con fecha inconsistente.** La especificación y el plan son del `2026-10-24`, pero las migraciones usan `202609200001`, `202609200002` y `202609200003`. No rompe Supabase, pero conviene cambiar el prefijo a una secuencia coherente con la fecha real antes de crear archivos.

5. **Pruebas RLS y Storage.** Las Tasks 4 y 14 indican pruebas contra Supabase local, pero no fijan el mecanismo de autenticación de usuarios de prueba ni el comando de arranque del stack local. Hace falta documentar fixtures de usuarios, `supabase start`/`supabase db reset` y limpieza de datos para que esas pruebas sean reproducibles.

## Observaciones importantes

6. **Dependencias de Expo SDK 57.** El repositorio parte de Expo SDK 54 y React Native 0.81, mientras el plan exige SDK 57 y RN 0.86. La Task 1 sí contempla la actualización, pero debe tratarse como una migración verificable antes de implementar APIs de mapas, OAuth y Stripe.

7. **Mapa multiplataforma.** La Task 10 deja abierto el proveedor y exige Android/iOS/web. Debe elegirse explícitamente una librería y documentar su soporte web; si no hay soporte equivalente, el fallback web debe ser parte del contrato de `ListingMap`.

8. **Stripe PaymentSheet requiere build nativo.** La Task 17 menciona `package.json` y `app.json`, pero debe dejar claro que Expo Go no basta para probar PaymentSheet y que se necesita development build/EAS. La Task 22 lo cubre al final, pero la dependencia operativa debe documentarse desde la Task 1 o 17.

9. **Contrato de precio.** La reserva pendiente muestra una estimación y la función calcula el importe final. Conviene definir si `reservations.total_amount` se completa al crear la reserva o solo al crear el PaymentIntent, para que la UI, el anfitrión y el webhook no interpreten valores distintos.

10. **Idempotencia del webhook.** El plan exige eventos procesados, pero el File Map no menciona una tabla o mecanismo persistente para guardar el identificador del evento Stripe. La Task 18 debe decidir entre una tabla `stripe_events`, una restricción única u otra estrategia transaccional.

## Conclusión

No hay omisiones funcionales importantes respecto de la especificación. El plan está listo para implementación después de resolver principalmente la normalización de rutas, los scripts/fixtures de pruebas y el mecanismo persistente de idempotencia del webhook. El documento original del plan no fue modificado.
