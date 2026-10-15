"""Genera la landing en un solo archivo HTML, con imágenes, estilos y código dentro.

Uso: python3 herramientas/html_unico.py <carpeta del proyecto> <archivo de salida>

Las fotos se reducen y se pasan a WebP para que el archivo pese poco (unos 3-4 MB).
El formulario apunta a la función publicada en Vercel, porque el archivo se abre desde el disco.
Requiere Pillow (pip install pillow).
"""
import base64, io, re, sys, pathlib
from PIL import Image

ENDPOINT = 'https://landing-navidad-casawestfalia.vercel.app/api/contacto'

root = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
cache = {}

def data_uri(rel):
    if rel not in cache:
        im = Image.open(root / rel)
        maxw = 1600 if ('hero' in rel or 'caviar' in rel) else (900 if 'productos' in rel else 1100)
        if 'logo' in rel: maxw = 200
        if im.width > maxw: im = im.resize((maxw, round(maxw * im.height / im.width)), Image.LANCZOS)
        buf = io.BytesIO(); im.convert('RGB').save(buf, 'WEBP', quality=74, method=6)
        cache[rel] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    return cache[rel]

sub = lambda s: re.sub(r'assets/img/[\w./-]+\.(?:jpg|jpeg|png|webp)', lambda m: data_uri(m.group(0)), s)

html = (root / 'index.html').read_text()
css = (root / 'css/styles.css').read_text()
html = html.replace('<link rel="stylesheet" href="css/styles.css">', '<style>\n' + sub(css) + '\n</style>')
for js in ['config', 'data', 'main']:
    code = (root / f'js/{js}.js').read_text()
    if js == 'data': code = sub(code)
    if js == 'config': code = code.replace("FORM_ENDPOINT: '/api/contacto'", f"FORM_ENDPOINT: '{ENDPOINT}'")
    html = html.replace(f'<script src="js/{js}.js"></script>', '<script>\n' + code.replace('</script', '<\\/script') + '\n</script>')
html = sub(html)
assert 'assets/' not in html and 'src="js/' not in html and ENDPOINT in html
out.write_text(html)
print(len(cache), 'imágenes,', round(out.stat().st_size / 1e6, 2), 'MB ->', out)
