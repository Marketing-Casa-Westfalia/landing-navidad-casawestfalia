# Publicar la landing en WordPress (plugin)

La landing se instala como plugin y queda en:
**https://www.casawestfalia.com/navidad/CW_Navidades-Selectas-2026.html**

Se ve a pantalla completa, sin la cabecera, el pie ni los estilos del tema. El formulario envía
las solicitudes directamente a **marketing@cwestfalia.es** con el correo del propio WordPress.

## Instalar

1. wp-admin → **Plugins → Añadir nuevo → Subir plugin**.
2. Elija `casa-westfalia-navidad.zip` → **Instalar ahora** → **Activar**.
3. En la lista de plugins, pulse **Ver landing** para abrir la página.
4. Haga un envío de prueba con el formulario y compruebe que llega (mire también en spam).

## Si algo no va

- **La página da error 404:** vaya a **Ajustes → Enlaces permanentes** y pulse **Guardar
  cambios** sin tocar nada. Así WordPress vuelve a leer las direcciones.
- **El zip no se sube («supera el tamaño máximo»):** el hosting limita el tamaño de subida.
  Hay que pedir que lo amplíen o que suban el plugin por FTP a `wp-content/plugins/`.
- **El correo no llega o llega a spam:** instale y configure el plugin **WP Mail SMTP** con la
  cuenta de correo de la empresa. Afecta a todos los correos de WordPress, no solo a este.
- **Se ve una versión antigua tras actualizar:** vacíe la caché del plugin de caché (WP Rocket,
  LiteSpeed, etc.) si lo tienen.

## Actualizar

Para cambiar textos o fotos se genera un zip nuevo y se sube igual: WordPress pregunta si quiere
**reemplazar** el plugin actual. Diga que sí.

## Quitar

**Plugins → Desactivar**. La página deja de existir y no queda nada más en la web.

## Antispam

Campo oculto que solo rellenan los robots y máximo 5 envíos cada 10 minutos desde la misma conexión.

## Para quien mantenga el código

El zip se genera con `python3 herramientas/plugin_wordpress.py . casa-westfalia-navidad.zip`
(necesita Pillow). El código del plugin está en `wordpress/casa-westfalia-navidad.php`.
