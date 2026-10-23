"""10 evo-page: the RaceBox EVO pre-order page, its store card and its menu and footer links.

(a) products/racebox-evo.html (/products/racebox-evo): a new page in the RaceBox product page layout. Ported from the
    redesign's EVO page (buildlib/pages_shop.py evo(), _evo_how and the home hero offer) in the live look. The first
    screen shows the name, tagline, price, Pre-order button, ship window and key terms on desktop and phone.
(b) An EVO card as the first card of the store's "RaceBox Lap Timers and Drag Meters" list, in the same markup as the
    other cards (div > div.img > img, h3, ul.reddot, price, div.buttons > a.see-more + form.js-add-to-cart).
(c) "Racebox EVO" in the header menu (flat list and Products dropdown, after Racebox) and "RaceBox EVO" in the footer
    product column, on every page.

Every EVO fact comes from patches/evo.json; every EVO price from rbu.evo_price_html. RaceBox facts are read from the
live RaceBox page, so a changed template stops the build instead of printing a stale figure.
"""
import re

import rbu

MARK = '<!-- rb-updates: 10 evo-page -->'
IMG = '/assets/rb-updates/img'
PAGE = 'products/racebox-evo.html'
TEMPLATE = 'products/racebox.html'


def nb(text):
    """Escape, and keep numbers with their unit on one line ('25 Hz', 'March 2027')."""
    return rbu.esc(text).replace(' Hz', '&nbsp;Hz').replace('March 2027', 'March&nbsp;2027')


def add_form(e, cur, label, cls):
    """The live add-to-cart form. EVO_SKU and EVO_PRODUCT_ID are placeholders the CTO replaces with the store's
    product record; the price is the pre-order price in the page currency."""
    now, _ = rbu.evo_prices(cur)
    return (f'<form method="post" action="/store/add-to-cart" class="js-add-to-cart" data-sku="{rbu.esc(e["sku"])}" '
            f'data-name="{rbu.esc(e["name"])}" data-price="{now}" data-currency="{cur}">'
            f'<input type="hidden" name="product" value="{rbu.esc(e["productId"])}" />'
            f'<button class="{cls}">{label}</button></form>')


def _one(pattern, text, what):
    m = re.search(pattern, text, re.S)
    if not m:
        raise rbu.AnchorError(f'{TEMPLATE}: {what} not found: {pattern[:100]!r}')
    return m


def racebox_facts(html):
    """What the EVO page borrows from the live RaceBox page: its price, the currency note and the buy-section
    bullets (server-rendered per country), so they always match what /products/racebox prints."""
    cur = rbu.page_currency(html)
    price = _one(r'class="js-add-to-cart" data-sku="RB01" data-name="RaceBox" data-price="([\d.]+)"', html,
                 'RaceBox add-to-cart price').group(1)
    buy = _one(r'<section class="buy" id="buy-section">(.*?)</section>', html, 'buy section').group(1)
    note = _one(r'<p class="price-note">.*?</p>', buy, 'currency note').group(0)
    switch = _one(r'<p>Not purchasing in .*?</p>', buy, 'switch country line').group(0)
    bullets = _one(r'<ul class="reddot">(.*?)</ul>', buy, 'buy bullets').group(1)
    items = [re.sub(r'\s+', ' ', li).strip() for li in re.findall(r'<li>(.*?)</li>', bullets, re.S)]
    # "Dispatch within 5 business days" is for stock; EVO ships in its pre-order window instead. It is shown in the
    # EVO vs RaceBox table as the RaceBox's availability.
    dispatch = [li for li in items if li.startswith('Dispatch within')]
    items = [li for li in items if not li.startswith('Dispatch within')]
    if len(items) < 4 or len(dispatch) != 1:
        raise rbu.AnchorError(f'{TEMPLATE}: expected the buy-section bullets, found {items!r}')
    return {'cur': cur, 'price': rbu.money(price, cur), 'note': note, 'switch': switch, 'bullets': items,
            'dispatch': dispatch[0]}


def hero(e, cur, rb):
    ship = nb(e['shipWindow'])
    terms = e['terms']
    key = [terms[1], terms[2], terms[3].split('. ')[0] + '.']   # paid in full; cancel for a refund; email updates
    keys = ''.join(f'<li>{rbu.esc(t)}</li>' for t in key)
    return f'''
{MARK}
<section class="rbu-evo-hero" aria-labelledby="rbu-evo-title">
	<div class="rbu-evo-hero-in">
		<div class="rbu-evo-hero-copy">
			<p class="rbu-evo-flag"><span class="rbu-badge">Pre-order</span> <span>Ships {ship}</span></p>
			<h1 class="rbu-evo-name" id="rbu-evo-title">RaceBox <span>EVO</span></h1>
			<p class="rbu-evo-tagline">{nb(e['tagline'])}</p>
			<p class="rbu-evo-lede">{nb(e['oneLiner'])} No phone needed at the track.</p>
		</div>
		<figure class="rbu-evo-hero-media">
			<picture>
				<source type="image/webp" srcset="{IMG}/evo-angle-400.webp 400w, {IMG}/evo-angle-800.webp 800w, {IMG}/evo-angle-1200.webp 1200w" sizes="(min-width: 1001px) 520px, (min-width: 700px) 44vw, 64vw" />
				<img src="{IMG}/evo-angle-800.png" width="800" height="463" fetchpriority="high" decoding="async" alt="The current RaceBox, angled, with the lap timer on its screen" />
			</picture>
			<figcaption>{rbu.esc(e['imageNote'])}</figcaption>
		</figure>
		<div class="rbu-evo-buy" id="rbu-evo-buy">
			{rbu.evo_price_html(cur, size='lg')}
			<div class="rbu-evo-actions">
				{add_form(e, cur, 'Pre-order now', 'rbu-btn rbu-btn--pre rbu-evo-cta')}
				<a class="rbu-evo-more rbu-focus" href="#rbu-evo-how">How pre-ordering works</a>
			</div>
			<ul class="reddot rbu-evo-keyterms">{keys}</ul>
			{rb['note'].replace('<p class="price-note">', '<p class="price-note rbu-evo-currency">', 1)}
		</div>
	</div>
</section>'''


def whats_new(e):
    items = ''.join(f'<li><span class="rbu-evo-new-n" aria-hidden="true">{n:02d}</span><h3>{rbu.esc(h["title"])}</h3>'
                    f'<p>{nb(h["body"])}</p></li>' for n, h in enumerate(e['highlights'], 1))
    return f'''
{MARK}
<section class="rbu-evo-band rbu-evo-band--pink" aria-labelledby="rbu-evo-new-title">
	<h2 id="rbu-evo-new-title">What's new</h2>
	<p class="rbu-evo-intro">Two and a half times the update rate. Same RaceBox.</p>
	<ol class="rbu-evo-new">{items}</ol>
</section>
<div class="rbu-evo-photo">
	<figure>
		<picture>
			<source type="image/webp" srcset="{IMG}/evo-windscreen-640.webp 640w, {IMG}/evo-windscreen-1024.webp 1024w, {IMG}/evo-windscreen-1600.webp 1600w" sizes="(min-width: 1001px) 960px, 100vw" />
			<img src="{IMG}/evo-windscreen-1024.jpg" width="1024" height="683" loading="lazy" decoding="async" alt="The current RaceBox on its windscreen suction mount, above a car's infotainment screen" />
		</picture>
		<figcaption>{rbu.esc(e['imageNote'])}</figcaption>
	</figure>
</div>'''


def how(e, cur, rb):
    t = e['terms']
    ship = nb(e['shipWindow'])
    steps = ['Pre-order today', 'Production updates by email', f'Ships {ship}', 'Delivered']
    steps_html = ''.join(f'<li{" class=" + chr(34) + "is-now" + chr(34) if i == 0 else ""}>{s}</li>' for i, s in enumerate(steps))
    cancel_faq = dict(e['faq'])['Can I cancel my pre-order?']
    # "Yes, any time before it ships, for a full refund of everything you paid. Contact us with your order number. ..."
    cancel_more = cancel_faq.split('. ', 1)[1]
    cancel_more = rbu.esc(cancel_more).replace('Contact us', '<a href="/contact-us">Contact us</a>', 1)
    rows = [('Payment', rbu.esc(t[1])),
            ('Cancelling', f'{rbu.esc(t[2])} {cancel_more}'),
            ('Updates', rbu.esc(t[3])),
            ('Delivery', nb(t[0]))]
    dl = ''.join(f'<div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in rows)
    buying = ''.join(f'<li>{li}</li>' for li in rb['bullets'])
    return f'''
{MARK}
<section class="rbu-evo-band rbu-evo-band--grey" id="rbu-evo-how" aria-labelledby="rbu-evo-how-title">
	<h2 id="rbu-evo-how-title">How pre-ordering works</h2>
	<div class="rbu-evo-wrap">
		<ol class="rbu-evo-steps" aria-label="Pre-order steps">{steps_html}</ol>
		<dl class="rbu-evo-terms">{dl}</dl>
		<h3 class="rbu-evo-h3">Buying from RaceBox</h3>
		<ul class="reddot rbu-evo-buying">{buying}</ul>
		{rb['switch'].replace('<p>', '<p class="rbu-evo-switch">', 1)}
	</div>
</section>'''


def versus(e, rb):
    rows = [('GPS update rate', '10&nbsp;Hz', '25&nbsp;Hz'),
            ('Battery', 'Up to 8 hours driving, Wi-Fi off', 'Larger, figure TBA'),
            ('Storage', '256 drag and 128 track sessions', 'More, figure TBA'),
            ('Availability', rb['dispatch'], f'Pre-order, ships {nb(e["shipWindow"])}')]
    trs = ''.join(f'<tr><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>' for k, a, b in rows)
    return f'''
{MARK}
<section class="rbu-evo-band" aria-labelledby="rbu-evo-vs-title">
	<h2 id="rbu-evo-vs-title">EVO or RaceBox?</h2>
	<div class="rbu-evo-wrap">
		<p class="rbu-evo-intro">Same windscreen-mounted shape and four-button controls. EVO moves to 25&nbsp;Hz GPS.</p>
		<div class="rbu-evo-table-scroll" role="region" aria-label="RaceBox and RaceBox EVO compared" tabindex="0">
			<table class="rbu-evo-table rbu-evo-vs">
				<thead><tr><th scope="col"><span class="rbu-sr">Feature</span></th><th scope="col">RaceBox</th><th scope="col">RaceBox EVO</th></tr></thead>
				<tbody>{trs}</tbody>
			</table>
		</div>
		<p class="rbu-evo-link-row"><a class="rbu-evo-more rbu-focus" href="/products/racebox#evo-vs-racebox">See EVO and RaceBox side by side</a></p>
	</div>
</section>'''


def specs(e):
    def cell(v):
        v = nb(v)
        return v.replace('TBA', '<span class="rbu-evo-tba">TBA</span>')
    trs = ''.join(f'<tr><th scope="row">{rbu.esc(k)}</th><td>{cell(v)}</td></tr>' for k, v in e['specs'])
    return f'''
{MARK}
<section class="rbu-evo-band rbu-evo-band--pink" aria-labelledby="rbu-evo-specs-title">
	<h2 id="rbu-evo-specs-title">Specifications</h2>
	<div class="rbu-evo-wrap">
		<table class="rbu-evo-table rbu-evo-specs">
			<caption class="rbu-sr">RaceBox EVO specifications</caption>
			<tbody>{trs}</tbody>
		</table>
		<p class="rbu-evo-small">Figures marked TBA are confirmed before EVO ships. For the current RaceBox, see its <a href="/products/racebox/tech-specs">technical specifications</a>.</p>
	</div>
</section>'''


def faq(e):
    items = ''.join(f'<details class="rbu-evo-faq-item"{" open" if i == 0 else ""}><summary>{rbu.esc(q)}</summary>'
                    f'<p>{nb(a)}</p></details>' for i, (q, a) in enumerate(e['faq']))
    return f'''
{MARK}
<section class="rbu-evo-band" aria-labelledby="rbu-evo-faq-title">
	<h2 id="rbu-evo-faq-title">Pre-order questions</h2>
	<div class="rbu-evo-wrap rbu-evo-faq">{items}</div>
</section>'''


def sooner(e, rb):
    ship = nb(e['shipWindow'])
    return f'''
{MARK}
<section class="rbu-evo-band rbu-evo-band--mist" aria-labelledby="rbu-evo-sooner-title">
	<h2 id="rbu-evo-sooner-title">Need it sooner?</h2>
	<div class="rbu-evo-wrap rbu-evo-sooner">
		<div class="rbu-evo-sooner-main">
			<img src="/product-image/racebox.png" width="200" height="200" loading="lazy" alt="" />
			<div>
				<h3>RaceBox ships now</h3>
				<p>If you want it before {ship}, the RaceBox ships now, with the same shape and controls at 10&nbsp;Hz.</p>
				<p class="rbu-evo-rb-price">{rb['price']}</p>
				<a class="rbu-btn rbu-btn--ghost rbu-evo-sooner-btn" href="/products/racebox">See the RaceBox</a>
			</div>
		</div>
		<div class="rbu-evo-sooner-side">
			<h3>On a motorcycle?</h3>
			<p>EVO is built for cars. On a motorcycle, the Mini&nbsp;S is the better fit.</p>
			<a class="rbu-evo-more rbu-focus" href="/products/racebox-mini-s">See the RaceBox Mini S</a>
		</div>
	</div>
</section>'''


def sticky(e, cur):
    """The live sticky bar (bottom-popup-element.js shows it once the tracked buy block has scrolled away)."""
    now, _ = rbu.evo_prices(cur)
    track = ('{&quot;name&quot;:&quot;RaceBox EVO&quot;,&quot;sku&quot;:&quot;' + rbu.esc(e['sku']) + '&quot;,&quot;price&quot;:'
             + str(now) + ',&quot;currency&quot;:&quot;' + cur + '&quot;,&quot;googleCategory&quot;:&quot;Electronics &gt; GPS Tracking Devices&quot;}')
    return f'''
{MARK}
<div id="add-to-cart-popup" class="bottom-popup-element cart-icon rbu-evo-sticky" data-track-element-id="rbu-evo-buy">
	<div>
		<div class="left rbu-price-inline">{rbu.evo_price_html(cur, size='sm', note=False)}</div>
		<div class="right">
			{add_form(e, cur, 'Pre-order', 'submit rbu-submit-pre')}
		</div>
	</div>
</div>
<div class="js-track-product-view hidden" style="display: none;" data-product="{track}"></div>
'''


def jsonld(e, cur):
    now, _ = rbu.evo_prices(cur)
    return {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': e['name'],
        'brand': {'@type': 'Brand', 'name': 'RaceBox'},
        # The current RaceBox: EVO keeps the same shape. Swap for EVO photos when they exist.
        'image': ['https://www.racebox.pro/assets/rb-updates/img/evo-angle-800.png'],
        'description': e['description'],
        'sku': e['sku'],
        'offers': {
            '@type': 'Offer',
            'availability': 'https://schema.org/PreOrder',
            'availabilityStarts': e['availabilityStarts'],
            'priceCurrency': cur,
            'price': now,
            'itemCondition': 'https://schema.org/NewCondition',
            'url': 'https://www.racebox.pro' + e['path'],
        },
    }


def store_card(e, cur):
    ship = nb(e['shipWindow'])
    return f'''
{MARK}
			<div class="rbu-card-evo">
				<div class="img"><img src="{IMG}/evo-card-200.png" srcset="{IMG}/evo-card-200.png 1x, {IMG}/evo-card-400.png 2x" width="200" height="200" alt="RaceBox EVO (photo: the current RaceBox, same shape)"/></div>
				<h3>RaceBox EVO</h3>

				<ul class="reddot">
				<li>25&nbsp;Hz GPS on a built-in colour screen</li><li>Completely standalone, no phone needed</li><li>Bigger battery and more storage</li><li>Same shape and controls as RaceBox</li>				</ul>

				<div class="rbu-card-status"><span class="rbu-badge">Pre-order</span> Ships {ship}</div>

				{rbu.evo_price_html(cur, size='sm')}

				<div class="buttons">
					<a href="{rbu.esc(e['path'])}" class="see-more">See More</a>
					{add_form(e, cur, 'Pre-order', 'submit rbu-submit-pre')}
				</div>
			</div>'''


# Menu and footer -----------------------------------------------------------------------------------------------------

MENU = re.compile(r'([ \t]*)(<li class="product-single"><a\s+(?:class="current"\s+)?href="/products/racebox">Racebox</a></li>)')
FOOTER = '<li><a href="/products/racebox">RaceBox</a></li>'


def links(html, rel):
    cur_attr = 'class="current" ' if rel == PAGE else ' '

    def item(m):
        ind = m.group(1)
        return (f'{ind}{m.group(2)}\n{ind}{MARK}\n{ind}<li class="product-single"><a {cur_attr}'
                f'href="{rbu.evo()["path"]}">Racebox EVO</a></li>')
    html = rbu.re_sub(html, MENU.pattern, item, count=2, where=rel)
    return rbu.insert_after(html, FOOTER, f'\n\t\t\t\t\t{MARK}\n\t\t\t\t\t<li><a href="{rbu.evo()["path"]}">RaceBox EVO</a></li>',
                            where=rel)


def apply(site):
    e = rbu.evo()
    tpl = site.read(TEMPLATE)
    rb = racebox_facts(tpl)
    cur = rb['cur']
    now, later = rbu.evo_prices(cur)
    main = (hero(e, cur, rb) + whats_new(e) + how(e, cur, rb) + versus(e, rb) + specs(e) + faq(e) + sooner(e, rb)
            + sticky(e, cur))
    site.new_page(
        PAGE, TEMPLATE,
        title='RaceBox EVO: 25 Hz Standalone Lap Timer | Pre-order',
        description=(f'Pre-order RaceBox EVO, the standalone lap timer and drag meter with its own colour screen, now '
                     f'with 25 Hz GPS. {rbu.money(now, cur)} pre-order price, {rbu.money(later, cur)} after '
                     f'pre-order. Ships {e["shipWindow"]}.'),
        canonical_path=e['path'], main_html=main, jsonld=jsonld(e, cur), body_class='page-front rbu-evo-page')
    # The template's own header video (section.top-banner) is gone with its <main>; nothing else of the RaceBox page
    # may remain in it.
    page = site.read(PAGE)
    for leftover in ('RB01', '5fbcc249279fe9d96341a620', 'front-video'):
        if leftover in page.split('<main>', 1)[1].split('</main>', 1)[0]:
            raise rbu.AnchorError(f'{PAGE}: RaceBox leftover {leftover!r} in <main>')

    def store(html, rel):
        return rbu.re_sub(html, r'(<h1>RaceBox Lap Timers and Drag Meters</h1>\s*<div class="content products-list">)',
                          lambda m: m.group(1) + store_card(e, rbu.page_currency(html)), count=1, where=rel)
    site.edit('store/index.html', store)

    for rel in site.pages():
        site.edit(rel, links)
