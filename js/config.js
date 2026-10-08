/* Configuración del formulario de contacto.
   - FORM_ENDPOINT con URL -> se envía por POST (FormData) y el visitante ve la confirmación.
     '/api/contacto' es la función de Vercel (api/contacto.js), que lo manda por correo con Resend.
   - FORM_ENDPOINT vacío, página abierta desde el disco o envío fallido -> se abre el programa
     de correo del visitante (mailto) con la solicitud preparada. */
window.WESTFALIA_CONFIG = {
  FORM_EMAIL: 'marketing@cwestfalia.es',
  FORM_ENDPOINT: '/api/contacto',
  AUTOPLAY_MS: 2000,
  PAUSE_AFTER_CLICK_MS: 6000
};
