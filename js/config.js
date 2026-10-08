/* Configuración del formulario de contacto.
   - FORM_ENDPOINT vacío  -> se abre el programa de correo del visitante (mailto) con la solicitud preparada.
   - FORM_ENDPOINT con URL -> se envía por POST (FormData) a ese servicio (Formspree, FormSubmit, backend propio...)
     y el visitante ve directamente el mensaje de confirmación. */
window.WESTFALIA_CONFIG = {
  FORM_EMAIL: 'marketing@cwestfalia.es',
  FORM_ENDPOINT: '',
  AUTOPLAY_MS: 2000,
  PAUSE_AFTER_CLICK_MS: 6000
};
