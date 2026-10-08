/* Navidades Selectas 2026 · Casa Westfalia
   Función de Vercel: recibe el formulario de contacto (POST /api/contacto) y lo envía
   por correo con Resend (https://resend.com). Sin dependencias.

   Variables de entorno (Vercel → Settings → Environment Variables):
     RESEND_API_KEY  Obligatoria. Clave de la API de Resend.
     FORM_FROM       Remitente, de un dominio verificado en Resend,
                     p. ej. "Navidades Selectas <web@cwestfalia.es>".
     FORM_TO         Destinatario. Por defecto marketing@cwestfalia.es. */

const CAMPOS = {
  nombre: 'Nombre y apellidos',
  empresa: 'Empresa o establecimiento',
  email: 'Email',
  telefono: 'Teléfono',
  provincia: 'Provincia',
  canal: 'Canal',
  mensaje: 'Mensaje'
};
const CANALES = ['Retail', 'Horeca', 'Canal tradicional'];
const MAX = { mensaje: 3000 };
const MAX_DEFECTO = 200;

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function limpia(valor, campo) {
  let v = typeof valor === 'string' ? valor.trim() : '';
  if (campo !== 'mensaje') v = v.replace(/\s+/g, ' '); // sin saltos de línea fuera del mensaje
  return v.slice(0, MAX[campo] || MAX_DEFECTO);
}

export async function POST(request) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'Formulario no válido.' });
  }

  // Antispam: el campo "web" está oculto, solo lo rellenan los robots.
  // Se responde "ok" para no darles pistas, pero no se envía nada.
  if (limpia(form.get('web'))) return json(200, { ok: true });

  const d = {};
  for (const campo of Object.keys(CAMPOS)) d[campo] = limpia(form.get(campo), campo);

  if (!d.nombre || !d.empresa || !d.email) {
    return json(400, { ok: false, error: 'Faltan campos obligatorios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
    return json(400, { ok: false, error: 'El email no es válido.' });
  }
  if (form.get('privacidad') !== 'on') {
    return json(400, { ok: false, error: 'Debe aceptar la política de privacidad.' });
  }
  if (!CANALES.includes(d.canal)) d.canal = 'Sin indicar';

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !process.env.FORM_FROM) {
    console.error('Faltan las variables de entorno RESEND_API_KEY o FORM_FROM.');
    return json(500, { ok: false, error: 'El envío no está configurado.' });
  }

  const texto = [
    'Nueva solicitud desde la landing Navidades Selectas 2026',
    '',
    ...['canal', 'nombre', 'empresa', 'email', 'telefono', 'provincia'].map(
      (c) => `${CAMPOS[c]}: ${d[c] || '-'}`
    ),
    '',
    'Mensaje:',
    d.mensaje || '-',
    '',
    'Acepta la política de privacidad: Sí'
  ].join('\n');

  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.FORM_FROM,
      to: [process.env.FORM_TO || 'marketing@cwestfalia.es'],
      reply_to: d.email,
      subject: `Solicitud Navidades Selectas 2026 · ${d.canal} · ${d.empresa}`,
      text: texto
    })
  });

  if (!respuesta.ok) {
    console.error('Resend respondió', respuesta.status, await respuesta.text());
    return json(502, { ok: false, error: 'No se ha podido enviar el correo.' });
  }
  return json(200, { ok: true });
}
