#!/usr/bin/env python3
"""Serve a mirrored copy of racebox.pro locally with its pretty URLs.

Usage: python3 tools/serve.py <site-dir> [port]
/products/racebox -> products/racebox.html, /store/ -> store/index.html,
/products/sku/RBxx -> 301 to the slug listed in redirects.tsv.
POST requests (add to cart, checkout, forms) are answered with 501: the mirror
has no back end.
"""
import http.server, os, sys, functools

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8900
HERE = os.path.dirname(os.path.abspath(__file__))
REDIRECTS = {}
rpath = os.path.join(HERE, '..', 'redirects.tsv')
if os.path.exists(rpath):
    for line in open(rpath):
        if '\t' in line:
            a, b = line.rstrip('\n').split('\t')
            REDIRECTS[a] = b


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        if path in REDIRECTS:
            self.send_response(301)
            self.send_header('Location', REDIRECTS[path])
            self.end_headers()
            return
        local = os.path.join(ROOT, path.lstrip('/'))
        if not os.path.isfile(local):
            for cand in (local.rstrip('/') + '.html', os.path.join(local, 'index.html')):
                if os.path.isfile(cand):
                    rest = self.path[len(path):]
                    self.path = '/' + os.path.relpath(cand, ROOT) + rest
                    break
        return super().do_GET()

    def do_POST(self):
        self.send_response(501)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"error":"mirror has no back end"}')

    def log_message(self, *a):
        pass


http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Handler, directory=ROOT)).serve_forever()
