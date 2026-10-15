/* Configuración del formulario de contacto.
   FORM_ENDPOINT: dirección de la función api/contacto.js (Vercel), que envía la solicitud por
   correo a marketing@cwestfalia.es. En la web publicada basta con '/api/contacto'; la versión
   en un solo archivo HTML usa la dirección completa de Vercel. */
window.WESTFALIA_CONFIG = {
  FORM_EMAIL: 'marketing@cwestfalia.es',
  FORM_ENDPOINT: '/api/contacto',
  AUTOPLAY_MS: 2000,
  PAUSE_AFTER_CLICK_MS: 6000
};
