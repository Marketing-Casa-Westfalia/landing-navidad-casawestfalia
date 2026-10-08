# Publicar la landing en Vercel

Guía paso a paso. La web no necesita compilación: Vercel publica los archivos tal cual y la
función `api/contacto.js` envía el formulario por correo a marketing@cwestfalia.es.

## 1. Conectar el repositorio

1. Entre en [vercel.com](https://vercel.com) con **Continue with GitHub**.
2. **Add New → Project** y elija `landing-navidad-casawestfalia`.
   Si no aparece, pulse *Adjust GitHub App Permissions* y dé acceso a la organización
   *Marketing-Casa-Westfalia* (puede necesitar la aprobación de quien la administre).
3. En **Framework Preset** elija **Other**. Deje vacíos *Build Command* y *Output Directory*.
4. Pulse **Deploy**. En un minuto tendrá una dirección `….vercel.app`.

La versión publicada sale de la rama **`main`**. Compruébelo en Vercel, en
*Settings → Git → Production Branch*. Cualquier otra rama genera una dirección de prueba.

> Plan: el plan gratuito *Hobby* de Vercel es solo para uso no comercial. Para una web de
> empresa corresponde el plan *Pro*.

## 2. Configurar el envío del formulario (Resend)

1. Cree una cuenta en [resend.com](https://resend.com).
2. **Domains → Add Domain**: añada `cwestfalia.es` y pida a quien gestione el dominio que
   añada los registros DNS que indica Resend (sirven para que los correos no lleguen a spam).
   Espere a que el dominio salga como *Verified*.
3. **API Keys → Create API Key** (permiso *Sending access*). Copie la clave: solo se ve una vez.
   No la pegue nunca en el código ni la envíe por correo.
4. En Vercel: proyecto → **Settings → Environment Variables**, añada:

   | Nombre | Valor |
   |---|---|
   | `RESEND_API_KEY` | la clave copiada (`re_…`) |
   | `FORM_FROM` | `Navidades Selectas <web@cwestfalia.es>` |
   | `FORM_TO` | `marketing@cwestfalia.es` (opcional, es el valor por defecto) |

5. **Deployments → … → Redeploy** para que la web use las variables nuevas.
6. Haga un envío de prueba desde la web y compruebe que llega a marketing@cwestfalia.es.
   Al pulsar «Responder» en ese correo, la respuesta va al email del visitante.

Si algo falla, el visitante no pierde la solicitud: se le abre su programa de correo con el
mensaje preparado. El motivo del fallo aparece en Vercel, en **Logs**.

## 3. Dominio propio (opcional)

En Vercel: **Settings → Domains**, añada por ejemplo `navidad.casawestfalia.com`. Vercel indica
un registro **CNAME** que hay que crear en el DNS de casawestfalia.com. El certificado HTTPS
se genera solo.

## Antispam

El formulario lleva un campo oculto (`web`) que solo rellenan los robots. Esas solicitudes se
descartan sin enviar correo. Si aun así llega spam, se puede añadir Cloudflare Turnstile.
