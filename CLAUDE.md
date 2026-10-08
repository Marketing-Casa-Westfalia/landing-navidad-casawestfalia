# Landing "Navidades Selectas 2026" · Casa Westfalia

Landing comercial del Catálogo de Navidad 2026 de Casa Westfalia (distribuidor de alimentación gourmet, Vulpellac, Girona). Se diseñó en Claude (lienzo de diseño) y se ha exportado a HTML, CSS y JavaScript estándar, sin dependencias ni paso de compilación. El diseño, los textos y las fotos están **aprobados por el cliente**: el trabajo pendiente es técnico, no de rediseño.

## Cómo verla

Abrir `index.html` en el navegador, o servir la carpeta: `npx serve .` / `python3 -m http.server`. Así el formulario usa el plan B (mailto); el envío automático solo funciona publicado en Vercel o con `vercel dev`.

Se publica en **Vercel** desde la rama `main`. Pasos en `DESPLIEGUE.md`.

## Estructura

```
index.html            Marcado de la página (secciones y plantillas <template data-for>)
css/styles.css        Animaciones, hover, carrusel, botón volver arriba
js/config.js          Destino del formulario y tiempos del carrusel
js/data.js            Contenido: colecciones, ventajas retail, productos retail y Horeca, recetas, frases de la cinta
js/main.js            Pinta las listas, nieve, carruseles, volver arriba y formulario
api/contacto.js       Función de Vercel: valida el formulario y lo envía por correo con Resend
package.json          Solo marca el proyecto como módulo ES para la función (no hay dependencias)
.vercelignore         Archivos que no se publican (referencia/, CLAUDE.md, DESPLIEGUE.md)
DESPLIEGUE.md         Guía para publicar en Vercel y configurar Resend
assets/img/           Logo, hero, foto del caviar
assets/img/productos  Una foto por referencia, nombrada por REF (p. ej. 32847.jpg)
assets/img/colecciones, assets/img/recetas
referencia/Main.dc.html   Fuente original del diseño (solo consulta, no se usa en la web)
```

La mayor parte del estilo está en atributos `style` en línea, heredados del editor de diseño. En `css/styles.css` solo están las animaciones y los estados.

## Secciones (en orden)

1. Cabecera fija con navegación y botón "Solicitar catálogo".
2. Hero centrado con nieve dorada y dos botones: "Soy retail" (#retail) y "Soy Horeca o canal tradicional" (#horeca).
3. Cinta animada de frases.
4. Compartir: texto emocional.
5. La colección: 7 familias con foto.
6. Retail: texto, 4 recuadros de ventajas (solo título) y carrusel "Referencias pensadas para tu cliente" (25 referencias).
7. Banda de fondo "Pescado y caviar".
8. Horeca y canal tradicional: dos recuadros y carrusel "Referencias pensadas específicamente para ti" (21 referencias).
9. Menú de Navidad: 3 recetas.
10. Contacto: formulario y datos de la empresa.
11. Footer y botón flotante de volver arriba.

## Comportamiento que hay que mantener

- **Carruseles:** avanzan solos una tarjeta cada 2 s y vuelven al principio al llegar al final. Se pausan con el ratón encima, el foco o el dedo. Tras usar una flecha esperan 6 s. Las flechas responden al instante y van en bucle. En móvil se puede deslizar con el dedo. El contador muestra "01 / 25". Con `prefers-reduced-motion` no hay avance automático ni nieve.
- **Tarjetas de producto:** foto (en Retail se muestra entera; en Horeca ocupa todo el recuadro), "REF. xxx · Categoría", nombre (máximo 2 líneas), descripción (máximo 3 líneas) y una etiqueta de formato. La etiqueta "¡Nuevo!" sale cuando `nuevo: true`. **La caducidad NO se muestra**, aunque el dato `cad` se conserva en `data.js`.
- **Volver arriba:** aparece al bajar más de 500 px.

## Reglas de contenido

- Tratamiento de **usted/su**: el público son profesionales de Retail, Horeca y canal tradicional. Los dos títulos de los carruseles usan "tu/ti" por decisión expresa del cliente: no cambiarlos.
- No modificar nombres, REF, formatos ni descripciones de producto sin pedirlo. Algunos nombres están acortados a propósito para que quepan en dos líneas.
- La Galantina de Pato (REF 32333) está disponible a partir del 02/12/26.
- Paleta: verde #233523 / #1B2A1B, crema #F4F2EC, dorado #C9A96A (texto dorado sobre crema: #7A5C26), burdeos #8E2A2E solo para "¡Nuevo!" y la etiqueta Retail.
- Tipografías: Cormorant Garamond (titulares) y Jost (texto), ambas de Google Fonts.

## Tareas pendientes

1. **Formulario → marketing@cwestfalia.es (prioritario).** Hecho en código: `FORM_ENDPOINT` apunta a `/api/contacto` (función de Vercel con Resend) y hay un campo trampa antispam (`web`). Si el envío falla, se abre el mailto como plan B. **Falta:** crear la cuenta de Resend, verificar `cwestfalia.es`, poner `RESEND_API_KEY` y `FORM_FROM` en Vercel y probar un envío real (ver `DESPLIEGUE.md`).
2. **Política de privacidad:** la casilla del formulario no enlaza a ningún sitio. Falta la URL de la política (pedirla al cliente) y revisar la normativa RGPD/LSSI: aviso de cookies si se añade analítica.
3. **Logo:** `logo-casa-westfalia.jpg` es un recorte del PDF del catálogo. Sustituirlo por el logo oficial en SVG o PNG con transparencia.
4. **Imágenes:** convertir a WebP/AVIF, añadir `width`/`height` y `loading="lazy"` a las que quedan por debajo del primer pantallazo. Las fotos de las colecciones también son recortes del PDF.
5. **SEO y redes sociales:** convertir `og:image` en URL absoluta y añadir `canonical`, favicon en varios tamaños y analítica si el cliente la pide.
6. **Publicación:** en Vercel (ver `DESPLIEGUE.md`). Falta conectar el proyecto y, si se quiere, el subdominio de casawestfalia.com (a confirmar con el cliente).
7. **Mejora opcional:** en el último paso del carrusel puede quedar hueco a la derecha si no caben tarjetas exactas. Se puede ajustar sin cambiar el aspecto.

## Contacto que aparece en la web

Pol. Ind. V-2 · 17111 Vulpellac · T. 972 645 525 · central@cwestfalia.es · www.casawestfalia.com.
Los formularios llegan a **marketing@cwestfalia.es**.
