"""Helpers shared by the change sets in live-site/patches.

The live site is server-rendered, so every change here is a plain-text edit of the mirrored HTML that the CTO can
repeat in the matching template. Edits are anchored on exact strings and fail loudly when an anchor is missing or
matches more often than expected, so a change never lands in the wrong place silently.
"""
import html as _html
import json
import os
import re

LIVE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PATCHES = os.path.join(LIVE, 'patches')


class AnchorError(Exception):
    pass


def esc(s):
    return _html.escape(str(s), quote=True)


def _check(html, anchor, count, where):
    n = html.count(anchor)
    if count is not None and n != count:
        raise AnchorError(f'{where}: anchor found {n}x, expected {count}x: {anchor[:120]!r}')
    if n == 0:
        raise AnchorError(f'{where}: anchor not found: {anchor[:120]!r}')
    return n


def insert_before(html, anchor, snippet, count=1, where=''):
    _check(html, anchor, count, where)
    return html.replace(anchor, snippet + anchor)


def insert_after(html, anchor, snippet, count=1, where=''):
    _check(html, anchor, count, where)
    return html.replace(anchor, anchor + snippet)


def replace(html, old, new, count=1, where=''):
    _check(html, old, count, where)
    return html.replace(old, new)


def re_sub(html, pattern, repl, count=1, flags=re.S, where=''):
    """Regex replace that insists on exactly `count` matches (None: at least one)."""
    n = len(re.findall(pattern, html, flags))
    if (count is not None and n != count) or n == 0:
        raise AnchorError(f'{where}: pattern matched {n}x, expected {count}: {pattern[:120]!r}')
    return re.sub(pattern, repl, html, flags=flags)


# Prices -------------------------------------------------------------------------------------------------------------

def page_currency(html):
    """The currency the page was rendered in. The mirror was crawled from the US, so pages are in USD; an EU visitor
    gets EUR from the server. Read it from the add-to-cart forms, else from the shipping banner."""
    m = re.search(r'data-currency="([A-Z]{3})"', html)
    if m:
        return m.group(1)
    if re.search(r'shipping-info-banner[^<]*<span>[^<]*€', html):
        return 'EUR'
    return 'USD'


def money(amount, cur):
    """Format like the live site: '$399.00' and '349.00 €'."""
    v = f'{float(amount):,.2f}'
    if cur == 'EUR':
        return f'{v} €'
    if cur == 'USD':
        return f'${v}'
    return f'{v} {cur}'


def evo():
    with open(os.path.join(PATCHES, 'evo.json'), encoding='utf-8') as f:
        return json.load(f)


def evo_prices(cur):
    """(pre-order price, price after pre-order) for a currency. Only USD and EUR are set; anything else raises, so a
    new currency can't silently show a wrong number."""
    e = evo()
    if cur not in e['preorderPrice']:
        raise KeyError(f'No EVO price for {cur}: add it to patches/evo.json')
    return e['preorderPrice'][cur], e['priceAfterPreorder'][cur]


def evo_price_html(cur, size='', note=True):
    """The one EVO price block used everywhere (store card, EVO page, home, banner, RaceBox comparison).
    Mirrors the live store's pattern (struck price first, then the bold price) and says in words what the struck
    price is, so it never reads as a former price. size: '' or 'lg' or 'sm'."""
    now, later = evo_prices(cur)
    later_s = money(later, cur)
    cls = 'rbu-price rbu-price--pre' + (f' rbu-price--{size}' if size else '')
    note_html = (f'<span class="rbu-price-note">Pre-order price. {esc(later_s)} after pre-order.</span>' if note else '')
    return (f'<p class="{cls}"><s class="rbu-price-later"><span class="rbu-sr">Price after pre-order: </span>'
            f'{esc(later_s)}</s> <strong class="rbu-price-now"><span class="rbu-sr">Pre-order price: </span>'
            f'{esc(money(now, cur))}</strong>{note_html}</p>')


# Pages --------------------------------------------------------------------------------------------------------------

class Site:
    """A built copy of the site. Paths are relative to the site root ('products/racebox.html')."""

    def __init__(self, root):
        self.root = root
        self.changed = set()

    def path(self, rel):
        return os.path.join(self.root, rel)

    def exists(self, rel):
        return os.path.isfile(self.path(rel))

    def pages(self):
        out = []
        for d, _, files in os.walk(self.root):
            for f in files:
                if f.endswith('.html'):
                    out.append(os.path.relpath(os.path.join(d, f), self.root))
        return sorted(out)

    def read(self, rel):
        with open(self.path(rel), encoding='utf-8') as f:
            return f.read()

    def write(self, rel, html):
        os.makedirs(os.path.dirname(self.path(rel)) or '.', exist_ok=True)
        with open(self.path(rel), 'w', encoding='utf-8') as f:
            f.write(html)
        self.changed.add(rel)

    def edit(self, rel, fn):
        """fn(html, rel) -> html. Raises AnchorError with the page name when an anchor is off."""
        html = self.read(rel)
        new = fn(html, rel)
        if new != html:
            self.write(rel, new)

    def new_page(self, rel, template_rel, title, description, canonical_path, main_html, jsonld=None, body_class=None):
        """A new page in the live layout: the head, header and footer of template_rel with a new title, meta
        description, canonical, Product JSON-LD and <main>."""
        html = self.read(template_rel)
        html = re.sub(r'<title>.*?</title>', f'<title>{esc(title)}</title>', html, count=1, flags=re.S)
        # drop the template's own structured data, description, canonical and Open Graph tags
        html = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', '', html, flags=re.S)
        html = re.sub(r'\s*<meta (?:name|property)="(?:description|og:[^"]*|twitter:[^"]*)"[^>]*>', '', html)
        html = re.sub(r'\s*<link rel="canonical"[^>]*>', '', html)
        url = 'https://www.racebox.pro' + canonical_path
        head = (f'\n\t<meta name="description" content="{esc(description)}">'
                f'\n\t<link rel="canonical" href="{esc(url)}">'
                f'\n\t<meta property="og:title" content="{esc(title)}">'
                f'\n\t<meta property="og:description" content="{esc(description)}">'
                f'\n\t<meta property="og:url" content="{esc(url)}">')
        if jsonld:
            head += ('\n\t<script type="application/ld+json">\n'
                     + json.dumps(jsonld, indent=1, ensure_ascii=False) + '\n\t</script>')
        html = html.replace('</head>', head + '\n</head>', 1)
        html = re.sub(r'<main>.*?</main>', lambda m: '<main>' + main_html + '</main>', html, count=1, flags=re.S)
        if body_class is not None:
            html = re.sub(r'<body class="[^"]*">', f'<body class="{esc(body_class)}">', html, count=1)
        # the template's current-page marker in the menu
        html = html.replace('<a class="current" ', '<a ')
        self.write(rel, html)
