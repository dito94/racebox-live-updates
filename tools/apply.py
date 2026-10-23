#!/usr/bin/env python3
"""Build the patched site: the mirror in live-site/original plus the change sets in live-site/patches.

    python3 tools/apply.py                      # every change set -> live-site/patched, diffs -> live-site/diff
    python3 tools/apply.py --only 10,60 --out /tmp/x   # core plus the listed change sets, into another folder

A change set is a folder patches/NN-name/ with any of:
    change.py   def apply(site): edits pages through tools/rbu.Site
    style.css   appended to /assets/rb-updates/rb-updates.css, in NN order
    script.js   appended to /assets/rb-updates/rb-updates.js, in NN order (wrap it in its own IIFE)
    static/     copied to /assets/rb-updates/ (images and other files)
    CTO.md      the instructions for porting the change into the real templates

After the change sets run, every page gets the two rb-updates tags: the stylesheet after main.css and the script
before </body>. Then diff/ gets a unified diff per changed page.
"""
import argparse
import difflib
import hashlib
import importlib.util
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import rbu  # noqa: E402

LIVE = rbu.LIVE
ORIGINAL = os.path.join(LIVE, 'original')
PATCHES = rbu.PATCHES
ASSET_DIR = 'assets/rb-updates'


def change_sets(only):
    sets = sorted(d for d in os.listdir(PATCHES) if os.path.isdir(os.path.join(PATCHES, d)) and d[:2].isdigit())
    if only:
        keep = {'00'} | set(only)
        sets = [d for d in sets if d[:2] in keep]
    return sets


def build(out, only=None, diffs=True):
    if os.path.exists(out):
        shutil.rmtree(out)
    # videos are large and unchanged: link them instead of copying
    shutil.copytree(ORIGINAL, out, ignore=shutil.ignore_patterns('*.mp4', '*.webm', '*.ogv'))
    for d, _, files in os.walk(ORIGINAL):
        for f in files:
            if f.endswith(('.mp4', '.webm', '.ogv')):
                src = os.path.join(d, f)
                dst = os.path.join(out, os.path.relpath(src, ORIGINAL))
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                os.symlink(src, dst)
    site = rbu.Site(out)
    css, js = [], []
    os.makedirs(os.path.join(out, ASSET_DIR), exist_ok=True)
    for name in change_sets(only):
        folder = os.path.join(PATCHES, name)
        static = os.path.join(folder, 'static')
        if os.path.isdir(static):
            shutil.copytree(static, os.path.join(out, ASSET_DIR), dirs_exist_ok=True)
        for fname, bucket in (('style.css', css), ('script.js', js)):
            p = os.path.join(folder, fname)
            if os.path.isfile(p):
                with open(p, encoding='utf-8') as f:
                    bucket.append(f'/* ---- {name}/{fname} ---- */\n' + f.read().rstrip() + '\n')
        p = os.path.join(folder, 'change.py')
        if os.path.isfile(p):
            spec = importlib.util.spec_from_file_location(f'change_{name.replace("-", "_")}', p)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            try:
                mod.apply(site)
            except rbu.AnchorError as e:
                sys.exit(f'{name}: {e}')
    css_text, js_text = '\n'.join(css), '\n'.join(js)
    for fname, text in (('rb-updates.css', css_text), ('rb-updates.js', js_text)):
        with open(os.path.join(out, ASSET_DIR, fname), 'w', encoding='utf-8') as f:
            f.write(text)
    ver = hashlib.sha1((css_text + js_text).encode()).hexdigest()[:10]
    link = f'\n\t<link href="/{ASSET_DIR}/rb-updates.css?v={ver}" type="text/css" rel="stylesheet" media="all" />'
    script = f'<script src="/{ASSET_DIR}/rb-updates.js?v={ver}" defer></script>\n'
    for rel in site.pages():
        html = site.read(rel)
        if 'rb-updates.css' in html:
            continue
        if '/css/main.css' in html:
            i = html.index('/css/main.css')
            j = html.index('>', i) + 1
            html = html[:j] + link + html[j:]
        else:
            html = html.replace('</head>', link + '\n</head>', 1)
        html = html.replace('</body>', script + '</body>', 1)
        site.write(rel, html)
    if diffs:
        ddir = os.path.join(LIVE, 'diff')
        if os.path.exists(ddir):
            shutil.rmtree(ddir)
        for rel in site.pages():
            new = site.read(rel).splitlines(keepends=True)
            orig_path = os.path.join(ORIGINAL, rel)
            old = open(orig_path, encoding='utf-8').read().splitlines(keepends=True) if os.path.isfile(orig_path) else []
            d = ''.join(difflib.unified_diff(old, new, f'original/{rel}', f'patched/{rel}', n=3))
            if d:
                dp = os.path.join(ddir, rel + '.diff')
                os.makedirs(os.path.dirname(dp), exist_ok=True)
                with open(dp, 'w', encoding='utf-8') as f:
                    f.write(d)
    return site


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(LIVE, 'patched'))
    ap.add_argument('--only', default='', help='comma-separated NN prefixes; core (00) is always included')
    a = ap.parse_args()
    only = [x.strip() for x in a.only.split(',') if x.strip()]
    s = build(os.path.abspath(a.out), only, diffs=not only and os.path.abspath(a.out) == os.path.join(LIVE, 'patched'))
    print(f'built {os.path.abspath(a.out)}: {len(s.pages())} pages')
