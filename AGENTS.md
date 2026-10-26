# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Reglas del proyecto

- Usamos Expo con Expo Router para la aplicación móvil.
- Usamos `StyleSheet` de React Native para los estilos; no añadimos estilos inline salvo casos puntuales y justificados.
- Usamos Supabase como backend.
- Las rutas y pantallas de Expo Router van en `app/`.
- Los componentes reutilizables van en `components/`.
- Las imágenes, fuentes y demás recursos estáticos van en `assets/`.
- Las constantes compartidas van en `constants/`.
- El cliente de Supabase y la lógica de acceso al backend van en `lib/`.
- Las migraciones y cualquier cambio de esquema de la base de datos van en `supabase/migrations/` y deben quedar guardados dentro del repositorio.
- Nunca escribimos contraseñas, tokens ni llaves secretas directamente en el código. Usamos variables de entorno y archivos locales excluidos del repositorio.
- Cada tarea se cierra probando la aplicación en el emulador.
- No usamos logos ni colores asociados con marcas conocidas.
- Las fotografías deben tener una licencia que permita su uso.
- Las imágenes de referencia se usan únicamente como guía de estructura, nunca se copian como contenido final.
