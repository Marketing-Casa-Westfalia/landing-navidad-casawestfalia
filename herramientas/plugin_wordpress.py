"""Genera el plugin de WordPress con la landing: casa-westfalia-navidad.zip

Uso: python3 herramientas/plugin_wordpress.py <carpeta del proyecto> <zip de salida>

- Copia wordpress/casa-westfalia-navidad.php como archivo principal del plugin.
- Mete estilos y código dentro de landing/index.html y marca las rutas con %%CW_BASE%%
  (dirección del plugin) y %%CW_ENDPOINT%% (envío del formulario), que el plugin rellena.
- Pasa las fotos a WebP para que el zip pese poco (los hostings suelen limitar la subida).
Requiere Pillow (pip install pillow).
"""
import io, re, sys, pathlib, zipfile
from PIL import Image

SLUG = 'casa-westfalia-navidad'
root = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
fotos = {}

def webp(rel):
    nuevo = re.sub(r'\.(jpg|jpeg|png|webp)$', '.webp', rel)
    if nuevo not in fotos:
        im = Image.open(root / rel)
        maxw = 1920 if ('hero' in rel or 'caviar' in rel) else 1200
        if 'logo' in rel: maxw = 256
        if im.width > maxw: im = im.resize((maxw, round(maxw * im.height / im.width)), Image.LANCZOS)
        buf = io.BytesIO(); im.convert('RGB').save(buf, 'WEBP', quality=80, method=6)
        fotos[nuevo] = buf.getvalue()
    return '%%CW_BASE%%' + nuevo

sub = lambda s: re.sub(r'(?<!%%)assets/img/[\w./-]+\.(?:jpg|jpeg|png|webp)', lambda m: webp(m.group(0)), s)

html = (root / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="css/styles.css">', '<style>\n' + sub((root / 'css/styles.css').read_text()) + '\n</style>')
for js in ['config', 'data', 'main']:
    code = sub((root / f'js/{js}.js').read_text())
    if js == 'config':
        assert "FORM_ENDPOINT: '/api/contacto'" in code
        code = code.replace("FORM_ENDPOINT: '/api/contacto'", 'FORM_ENDPOINT: %%CW_ENDPOINT%%')
    html = html.replace(f'<script src="js/{js}.js"></script>', '<script>\n' + code.replace('</script', '<\\/script') + '\n</script>')
html = sub(html)
assert 'src="js/' not in html and 'href="css/' not in html and not re.search(r'["\'(]assets/', html)

out.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(root / 'wordpress/casa-westfalia-navidad.php', f'{SLUG}/{SLUG}.php')
    z.writestr(f'{SLUG}/index.php', '<?php // Silence is golden.\n')
    z.writestr(f'{SLUG}/landing/index.html', html)
    for ruta, datos in fotos.items():
        z.writestr(f'{SLUG}/landing/{ruta}', datos)
print(len(fotos), 'fotos,', round(out.stat().st_size / 1e6, 2), 'MB ->', out)
