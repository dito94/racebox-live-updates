#!/usr/bin/env python3
"""Turn the disk preview (tools/export_preview.py) into a folder that is safe to host on GitHub Pages.

    python3 tools/export_preview.py --out /tmp/preview
    python3 tools/export_pages.py --src /tmp/preview --out /tmp/pages

The copy must never report to the live site's analytics or ad accounts, and must stay out of search results:
- window.trackingConfig is emptied (it drives Google, Meta, Reddit, TikTok, Clarity and X in analytics.js),
  and the gtag.js tag is removed;
- a Content-Security-Policy meta allows requests to the hosting origin only, so any tracker or form post that
  slips through is blocked by the browser (outbound links still work: CSP doesn't cover navigation);
- every page gets <meta name="robots" content="noindex, nofollow">, plus robots.txt and .nojekyll.
"""
import argparse
import os
import re
import shutil
import sys

CSP = ("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; "
       "img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob:; connect-src 'self'; "
       "frame-src 'none'; form-action 'none'; base-uri 'self'")
HEAD_ADD = (f'<meta http-equiv="Content-Security-Policy" content="{CSP}">'
            '<meta name="robots" content="noindex, nofollow">')

TRACKING = re.compile(r'window\.trackingConfig\s*=\s*\{.*?\};', re.S)
GTAG = re.compile(r'<script[^>]*src="https://www\.googletagmanager\.com/[^"]*"[^>]*>\s*</script>')
HEAD = re.compile(r'<head(\s[^>]*)?>', re.I)


def clean(html, name):
    html, n_cfg = TRACKING.subn('window.trackingConfig = {};', html)
    html = GTAG.sub('', html)
    html, n_head = HEAD.subn(lambda m: m.group(0) + HEAD_ADD, html, count=1)
    if not n_head:
        sys.exit(f'no <head> in {name}')
    return html, n_cfg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True, help='folder written by export_preview.py')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    if os.path.exists(a.out):
        shutil.rmtree(a.out)
    shutil.copytree(a.src, a.out)
    pages = cfg = 0
    for root, _, files in os.walk(a.out):
        for f in files:
            if f.endswith('.html'):
                p = os.path.join(root, f)
                html, n = clean(open(p, encoding='utf-8', errors='surrogateescape').read(), p)
                open(p, 'w', encoding='utf-8', errors='surrogateescape').write(html)
                pages += 1
                cfg += n
    open(os.path.join(a.out, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
    open(os.path.join(a.out, '.nojekyll'), 'w').close()
    left = [os.path.join(r, f) for r, _, fs in os.walk(a.out) for f in fs if f.endswith('.html')
            and 'googletagmanager.com' in open(os.path.join(r, f), errors='ignore').read()]
    if left:
        sys.exit(f'gtag still present in {left[:3]}')
    print(f'{a.out}: {pages} pages, tracking config emptied on {cfg}')


if __name__ == '__main__':
    main()
