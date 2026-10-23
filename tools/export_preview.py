#!/usr/bin/env python3
"""Export the patched site as a folder that opens from disk (double-click index.html), and zip it.

    python3 tools/export_preview.py [--src patched] [--out <dir>] [--zip <file.zip>]

Root-relative links and pretty URLs (/products/racebox, /store/) become relative file paths
(products/racebox.html, store/index.html), asset query strings are dropped, /products/sku/RBxx links point at the
product page, and crossorigin attributes go (browsers refuse them on file:// pages). The header videos (75 MB, unchanged
by the updates) are left out: their poster images show instead. Every page gets
a small corner label saying it is a preview, so a forwarded copy can't be mistaken for the live site. Add to cart,
checkout and forms need the real back end and don't work in the copy.
"""
import argparse
import os
import re
import shutil
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
LIVE = os.path.abspath(os.path.join(HERE, '..'))

LABEL = ('<div style="position:fixed;left:8px;bottom:8px;z-index:2147483647;pointer-events:none;'
         'font:12px/1.3 Arial,sans-serif;background:#2c2c2c;color:#fff;padding:4px 8px;border-radius:4px;opacity:.85">'
         'Preview of proposed changes. Not the live site.</div>')

URL_ATTR = re.compile(r'''(\s(?:href|src|poster|action|data-src)=)(["'])(/[^"']*)\2''')
SRCSET = re.compile(r'''(\ssrcset=)(["'])([^"']*)\2''')
CSS_URL = re.compile(r'''url\((["']?)(/[^)"']+)\1\)''')


def load_redirects():
    out = {}
    p = os.path.join(LIVE, 'redirects.tsv')
    if os.path.exists(p):
        for line in open(p):
            if '\t' in line:
                a, b = line.rstrip('\n').split('\t')
                out[a] = b
    return out


def resolve(root, url, redirects):
    """Map a root-relative URL to a site-relative file path plus fragment, or None to leave it alone."""
    frag = ''
    if '#' in url:
        url, frag = url.split('#', 1)
        frag = '#' + frag
    path, _, query = url.partition('?')
    path = redirects.get(path, path)
    rel = path.lstrip('/')
    cands = [rel] if rel and not rel.endswith('/') else []
    cands += [rel.rstrip('/') + '.html' if rel else None, os.path.join(rel, 'index.html')]
    for c in cands:
        if c and os.path.isfile(os.path.join(root, c)):
            keep_query = '?' + query if query and c.endswith('.html') else ''
            return c + keep_query + frag
    return None


def relative(from_file, target):
    base = os.path.dirname(from_file)
    t, sep, rest = target.partition('#')
    t2, qsep, q = t.partition('?')
    r = os.path.relpath(t2, base or '.')
    return r + (qsep + q if qsep else '') + (sep + rest if sep else '')


def fix_html(root, rel, html, redirects):
    def attr(m):
        target = resolve(root, m.group(3), redirects)
        if target is None:
            if m.group(3) == '/' or not os.path.splitext(m.group(3).split('?')[0])[1]:
                return m.group(0)  # a page that isn't in the copy (webapp, checkout POST targets): leave it
            return m.group(0)
        return f'{m.group(1)}{m.group(2)}{relative(rel, target)}{m.group(2)}'

    def srcset(m):
        parts = []
        for part in m.group(3).split(','):
            bits = part.strip().split(' ', 1)
            if bits and bits[0].startswith('/'):
                t = resolve(root, bits[0], redirects)
                if t:
                    bits[0] = relative(rel, t)
            parts.append(' '.join(bits))
        return f'{m.group(1)}{m.group(2)}{", ".join(parts)}{m.group(2)}'

    html = URL_ATTR.sub(attr, html)
    html = SRCSET.sub(srcset, html)
    html = CSS_URL.sub(lambda m: f'url({m.group(1)}{relative(rel, resolve(root, m.group(2), redirects) or m.group(2).lstrip("/"))}{m.group(1)})', html)
    html = re.sub(r'\s+crossorigin(?:="[^"]*")?(?=[\s>/])', '', html)
    html = re.sub(r'\s*<source src="/[^"]+\.(?:mp4|webm|ogv)"[^>]*>', '', html)  # videos aren't in the copy
    if '<meta charset' not in html.lower():
        html = html.replace('<head>', '<head>\n\t<meta charset="utf-8">', 1)
    return html.replace('</body>', LABEL + '\n</body>', 1)


def fix_css(root, rel, css, redirects):
    return CSS_URL.sub(lambda m: f'url({m.group(1)}{relative(rel, resolve(root, m.group(2), redirects) or m.group(2).lstrip("/"))}{m.group(1)})', css)


def export(src, out):
    if os.path.exists(out):
        shutil.rmtree(out)
    redirects = load_redirects()

    def ignore(d, names):
        return [n for n in names if n.endswith(('.mp4', '.webm', '.ogv'))]
    shutil.copytree(src, out, symlinks=False, ignore=ignore)
    for d, _, files in os.walk(out):
        for f in files:
            p = os.path.join(d, f)
            rel = os.path.relpath(p, out)
            if f.endswith('.html'):
                s = open(p, encoding='utf-8').read()
                open(p, 'w', encoding='utf-8').write(fix_html(out, rel, s, redirects))
            elif f.endswith('.css'):
                s = open(p, encoding='utf-8', errors='ignore').read()
                open(p, 'w', encoding='utf-8').write(fix_css(out, rel, s, redirects))
    # asset URLs carried ?v= cache busters; the files on disk have plain names
    return out


def make_zip(folder, zip_path, top='racebox-updates-preview'):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, _, files in os.walk(folder):
            for f in files:
                p = os.path.join(d, f)
                z.write(p, os.path.join(top, os.path.relpath(p, folder)))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=os.path.join(LIVE, 'patched'))
    ap.add_argument('--out', default=os.path.join(LIVE, 'preview-export'))
    ap.add_argument('--zip', default='')
    a = ap.parse_args()
    if not os.path.isdir(a.src):
        sys.exit(f'{a.src} not found: run tools/apply.py first')
    export(os.path.abspath(a.src), os.path.abspath(a.out))
    if a.zip:
        make_zip(os.path.abspath(a.out), os.path.abspath(a.zip))
        print(f'zip: {a.zip} ({os.path.getsize(a.zip) / 1e6:.1f} MB)')
    print(f'exported to {a.out}')
