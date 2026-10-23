"""50 pdp-first-screen: on desktop, every product page opens with the product, its price and Add to cart.

A compact product hero goes at the top of <main>, before section.top-banner. It reuses what the page already prints:
the store card's image and bullets (store/index.html, the same product data) and the buy section's price, stock note,
add-to-cart form and currency note. On phones (max-width 1000px, the site's breakpoint) the hero is hidden, so the top
banner stays first and phones look exactly as today.
Desktop layout (CSS only, style.css): on the four device pages the header video or photo moves below the product
description and takes the place of the photo that opens the tech specs (that photo is hidden on desktop), so the page
reads product, description, video, specs. On the eight accessory pages the generic header photo and the intro section
(which repeats the product) are hidden on desktop; the hero carries the intro's subtitle and all of the card's points.

Everything is read from the live markup, so a changed template stops the build instead of printing a wrong price
(price, add-to-cart form, price note, country link and the stock note are all anchors).
Key points: the card's bullets, at most 4; a fit warning ("Not Compatible with ...") is never the one that is cut.
The struck price gets hidden words for screen readers ("Regular price", "Offer price").
Image: the four device pages use the redesign's high-resolution cut-outs (static/img/pdp-*); the store card's 200 px PNG
would be soft in the large panel. Accessory pages keep the store PNG.
"""
import os
import re
import struct

import rbu

PAGES = [
    'products/racebox.html',
    'products/racebox-mini.html',
    'products/racebox-mini-s.html',
    'products/racebox-micro.html',
    'products/external-gps-antenna.html',
    'products/magnetic-usb-cable.html',
    'products/mini-hook-and-loop-tapes.html',
    'products/racebox-carry-case.html',
    'products/racebox-micro-cases.html',
    'products/racebox-mini-carry-case.html',
    'products/racebox-suction-cup.html',
    'products/spare-mini-accessories.html',
]

# Device pages: slug of the cut-out files in static/img (pdp-<slug>-400.webp, -800.webp, -800.png) and the widths of
# the webp files. 1200 exists only for the RaceBox and the Mini (the other two cut-outs are 1062 and 932 px wide).
IMG = '/assets/rb-updates/img'
STATIC_IMG = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'img')
CUTOUTS = {
    'products/racebox.html': ('racebox', (400, 800, 1200)),
    'products/racebox-mini.html': ('racebox-mini', (400, 800, 1200)),
    'products/racebox-mini-s.html': ('racebox-mini-s', (400, 800)),
    'products/racebox-micro.html': ('racebox-micro', (400, 800)),
}

# The pristine store page: the card data (image, bullets) per SKU, as the server prints it on /store/.
STORE = os.path.join(rbu.LIVE, 'original', 'store', 'index.html')


def _one(pattern, text, where, what):
    m = re.search(pattern, text, re.S)
    if not m:
        raise rbu.AnchorError(f'{where}: {what} not found: {pattern[:100]!r}')
    return m


def store_cards():
    """sku -> (image src, name, [bullet html]) from the store's product cards."""
    with open(STORE, encoding='utf-8') as f:
        html = f.read()
    cards = {}
    for m in re.finditer(r'<div class="img"><img src="([^"]+)" alt="[^"]*"/></div>\s*<h3>(.*?)</h3>\s*'
                         r'<ul class="reddot">\s*(.*?)\s*</ul>.*?data-sku="([^"]+)"', html, re.S):
        img, name, ul, sku = m.groups()
        cards[sku] = (img, name, re.findall(r'<li>(.*?)</li>', ul))
    if len(cards) < 12:
        raise rbu.AnchorError(f'store/index.html: expected 12 product cards, found {len(cards)}')
    return cards


# The brief asks for 2-4 key points. Store cards print 3 to 5 bullets. Four accessory pages have 5, and on two of them
# (RB04, RB05) the last one is the fit warning ("Not Compatible with RaceBox Mini"), which a buyer must not miss.
MAX_POINTS = 4
COMPAT = re.compile(r'not compatible|, not mini', re.I)


def key_points(points):
    """At most MAX_POINTS bullets, in card order. A compatibility line is never the one that gets cut."""
    if len(points) <= MAX_POINTS:
        return points
    keep = [i for i, p in enumerate(points) if COMPAT.search(p)][:MAX_POINTS]
    for i in range(len(points)):
        if len(keep) >= MAX_POINTS:
            break
        if i not in keep:
            keep.append(i)
    return [points[i] for i in sorted(keep)]


def cutout_html(rel, name):
    """<picture> for a device page: webp at 400/800(/1200) w, the 800 px PNG as fallback, with its real size."""
    slug, widths = CUTOUTS[rel]
    for w in widths:
        if not os.path.isfile(os.path.join(STATIC_IMG, f'pdp-{slug}-{w}.webp')):
            raise rbu.AnchorError(f'{rel}: missing static/img/pdp-{slug}-{w}.webp')
    png = os.path.join(STATIC_IMG, f'pdp-{slug}-800.png')
    if not os.path.isfile(png):
        raise rbu.AnchorError(f'{rel}: missing static/img/pdp-{slug}-800.png')
    with open(png, 'rb') as f:
        head = f.read(24)
    if head[:8] != b'\x89PNG\r\n\x1a\n':
        raise rbu.AnchorError(f'{rel}: {png} is not a PNG')
    w, h = struct.unpack('>II', head[16:24])
    srcset = ', '.join(f'{IMG}/pdp-{slug}-{x}.webp {x}w' for x in widths)
    return (f'<picture><source type="image/webp" srcset="{srcset}" sizes="(min-width: 1001px) 400px, 1px">'
            f'<img src="{IMG}/pdp-{slug}-800.png" width="{w}" height="{h}" alt="{name}" /></picture>')


def buy_parts(html, where):
    """What the page's own buy section shows: price (and struck price), offer title, stock note, form, notes."""
    buy = _one(r'<section class="buy" id="buy-section">(.*?)</section>', html, where, 'buy section').group(1)
    offer = re.search(r'<h1>([^<]*)</h1>\s*<p class="limited-time-offer price">[^<]*<strike>([^<]*)</strike>\s*'
                      r'<strong>([^<]*)</strong></p>', buy)
    if offer:
        title, was, now = offer.groups()
    else:
        title, was = None, None
        now = _one(r'<p class="price">[^<]*<strong>([^<]*)</strong></p>', buy, where, 'price').group(1)
    stock = re.search(r'<div class="availability-warning">([^<]*)</div>', buy)
    if not stock and 'availability-warning' in buy:
        # The stock note changed shape (another class, nested markup): stop, don't drop "Limited Stock" silently.
        raise rbu.AnchorError(f'{where}: availability note found in the buy section but not in the expected markup '
                              '<div class="availability-warning">text</div>')
    form =_one(r'<form method="post" action="/store/add-to-cart" id="checkout-form" class="js-add-to-cart"'
                r'( data-sku="[^"]*" data-name="[^"]*" data-price="[^"]*" data-currency="[^"]*")>\s*'
                r'(<input type="hidden" name="product" value="[^"]*" />)\s*<button class="submit">Add to cart</button>',
                buy, where, 'add-to-cart form')
    sku = re.search(r'data-sku="([^"]*)"', form.group(1)).group(1)
    note = _one(r'<p class="price-note">(.*?)</p>', buy, where, 'price note').group(1)
    switch = _one(r'<a href="#" class="country-select-open-button" data-current-selected="[^"]*">Switch&nbsp;country</a>',
                  buy, where, 'switch country link').group(0)
    return dict(title=title, was=was, now=now, stock=stock.group(1).strip() if stock else None,
                form_attrs=form.group(1), form_input=form.group(2), sku=sku,
                note=re.sub(r'\s+', ' ', note).strip(), switch=switch)


def hero_html(card, b, cutout=None, subtitle=None):
    img, name, points = card
    # Device pages: at most MAX_POINTS. Accessory pages: all of them, because the intro that lists them is hidden on desktop.
    shown = key_points(points) if cutout else points
    points_html = ''.join(f'\n\t\t\t\t<li>{p}</li>' for p in shown)
    variant = 'device' if cutout else 'accessory'
    sub_html = f'\t\t\t<p class="rbu-pdp-sub">{subtitle}</p>\n' if subtitle else ''
    if b['was']:
        # The words in .rbu-sr are for screen readers: without them "$249.00 $219.00" reads as two prices.
        price = (f'\n\t\t\t\t<p class="rbu-pdp-offer">{b["title"]}</p>'
                 f'\n\t\t\t\t<div class="rbu-pdp-price-row">'
                 f'\n\t\t\t\t\t<p class="rbu-pdp-price"><s><span class="rbu-sr">Regular price </span>{b["was"]}</s> '
                 f'<strong><span class="rbu-sr">Offer price </span>{b["now"]}</strong></p>')
    else:
        price = (f'\n\t\t\t\t<div class="rbu-pdp-price-row">'
                 f'\n\t\t\t\t\t<p class="rbu-pdp-price"><strong>{b["now"]}</strong></p>')
    if b['stock']:
        price += f'\n\t\t\t\t\t<p class="rbu-pdp-stock">{b["stock"]}</p>'
    price += '\n\t\t\t\t</div>'
    if cutout:
        media = f'<div class="rbu-pdp-media rbu-pdp-media--cut">{cutout}</div>'
    else:
        media = f'<div class="rbu-pdp-media"><img src="{img}" alt="{name}" width="200" height="200" /></div>'
    return (
        '<!-- rb-updates: 50 pdp-first-screen -->\n'
        f'<section class="rbu-pdp rbu-pdp--{variant}" aria-labelledby="rbu-pdp-name">\n'
        '\t<div class="rbu-pdp-in">\n'
        f'\t\t{media}\n'
        '\t\t<div class="rbu-pdp-body">\n'
        f'\t\t\t<h1 class="rbu-pdp-name" id="rbu-pdp-name">{name}</h1>\n'
        f'{sub_html}'
        f'\t\t\t<ul class="reddot rbu-pdp-points">{points_html}\n\t\t\t</ul>\n'
        f'\t\t\t<div class="rbu-pdp-buy">{price}\n'
        '\t\t\t\t<div class="rbu-pdp-actions">\n'
        f'\t\t\t\t\t<form method="post" action="/store/add-to-cart" class="js-add-to-cart"{b["form_attrs"]}>\n'
        f'\t\t\t\t\t\t{b["form_input"]}\n'
        '\t\t\t\t\t\t<button class="submit">Add to cart</button>\n'
        '\t\t\t\t\t</form>\n'
        '\t\t\t\t\t<a class="rbu-pdp-more" href="#buy-section">Delivery, payment and returns</a>\n'
        '\t\t\t\t</div>\n'
        f'\t\t\t\t<p class="rbu-pdp-note">{b["note"]} {b["switch"]}</p>\n'
        '\t\t\t</div>\n'
        '\t\t</div>\n'
        '\t</div>\n'
        '</section>\n')


def apply(site):
    cards = store_cards()

    def edit(html, rel):
        b = buy_parts(html, rel)
        if b['sku'] not in cards:
            raise rbu.AnchorError(f'{rel}: no store card for {b["sku"]}')
        card = cards[b['sku']]
        cutout = cutout_html(rel, card[1]) if rel in CUTOUTS else None
        subtitle = None
        if not cutout:
            # Accessory pages: on desktop the intro (h1, subtitle, image, points) is hidden because it repeats the hero,
            # so the hero takes its subtitle. Both name the product with an h1, but only one of them is ever displayed:
            # the hero on desktop, the intro on phones.
            intro = _one(r'<section class="other-product-info">\s*<h1>([^<]*)</h1>\s*<p class="text">(.*?)</p>', html, rel,
                         'accessory intro (h1 and subtitle)')
            if intro.group(1) != card[1]:
                raise rbu.AnchorError(f'{rel}: other-product-info h1 {intro.group(1)!r} is not the store card name {card[1]!r}')
            subtitle = re.sub(r'\s+', ' ', intro.group(2)).strip()
        return rbu.insert_before(html, '<section class="top-banner', hero_html(card, b, cutout, subtitle), where=rel)

    for rel in PAGES:
        site.edit(rel, edit)
