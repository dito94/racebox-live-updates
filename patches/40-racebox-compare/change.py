"""40 racebox-compare: 'RaceBox vs RaceBox EVO' spec table on the RaceBox product page (id="evo-vs-racebox").

Ported from the redesign's _evo_upgrade (buildlib/pages_shop.py). RaceBox facts are quoted from the live pages
(products/racebox/tech-specs.html first, then products/racebox.html and the live FAQ); EVO facts come from
patches/evo.json (TBA where it says TBA). The RaceBox price, dispatch line and add-to-cart form are read from the
page's own buy section, so they always match it.
"""
import re

import rbu

EVO_UP = '<span class="rbu-cmp-up">Upgrade</span>'


def _one(pattern, html, what):
    m = re.findall(pattern, html, re.S)
    if len(m) != 1:
        raise rbu.AnchorError(f'40 racebox-compare: {what}: matched {len(m)}x, expected 1')
    return m[0]


def _nb(s):
    """Keep numbers with their units on one line."""
    return re.sub(r'(\d) (Hz|h|hours)\b', r'\1&nbsp;\2', s)


def table_html(html):
    e = rbu.evo()
    spec = dict(e['specs'])
    cur = rbu.page_currency(html)

    buy = _one(r'<section class="buy" id="buy-section">(.*?)</section>', html, 'buy section')
    form = _one(r'(<form method="post" action="/store/add-to-cart"[^>]*class="js-add-to-cart".*?</form>)', buy,
                'buy-section add-to-cart form')
    form = form.replace(' id="checkout-form"', '')  # the id stays unique to the buy section's form
    form = re.sub(r'\s*\n\s*', '', form)
    price = float(_one(r'data-price="([0-9.]+)"', form, 'RaceBox data-price'))
    rb_cur = _one(r'data-currency="([A-Z]{3})"', form, 'RaceBox data-currency')
    dispatch = re.findall(r'<li>(Dispatch within <strong>[^<]+</strong>)</li>', buy)
    dispatch = re.sub(r'</?strong>', '', dispatch[0]) + '.' if dispatch else ''

    ship = rbu.esc(e['shipWindow'])
    evo_path = rbu.esc(e['path'])
    # (label, RaceBox, RaceBox EVO, EVO is an upgrade). Sources:
    #   RaceBox: tech-specs.html (GPS receiver, Display, Usage on battery, Memory capacity, WiFi), racebox.html
    #   ("completely standalone", suction cup in the box), live FAQ ("works only with the official RaceBox
    #   application"; "Recorded data can be exported"), troubleshooting ("all four buttons").
    #   EVO: evo.json specs; controls and mount from evo.json highlights ("Same shape you know").
    rows = [
        ('GPS update rate', '10 Hz', spec['GNSS update rate'], True),
        ('Screen', 'Colour LCD, 320 x 240', spec['Display'], False),
        ('Controls and mount', 'Four buttons, suction cup windscreen mount',
         'Same shape as the RaceBox: windscreen mount, four buttons', False),
        ('Works without a phone', 'Yes, completely standalone', spec['Standalone use'], False),
        ('Battery', 'Up to 8 hours of driving (Wi-Fi off)', spec['Battery'], True),
        ('Storage', '256 drag sessions and 128 track sessions', spec['Storage'], True),
        ('App connection', 'Wi-Fi', spec['App connection'], False),
        ('Third-party apps', 'Official RaceBox app only. Recorded data can be exported to other software',
         spec['Third-party apps'], False),
        ('Fits RaceBox accessories', 'Yes', spec['Accessory fit'], False),
    ]
    trs = []
    for label, rb, ev, up in rows:
        trs.append(
            f'\t\t\t\t<tr role="row"><th scope="row" role="rowheader">{rbu.esc(label)}</th>'
            f'<td role="cell" data-label="RaceBox">{_nb(rbu.esc(rb))}</td>'
            f'<td role="cell" data-label="EVO" class="rbu-cmp-evo">{_nb(rbu.esc(ev))}{EVO_UP if up else ""}</td></tr>')
    rb_buy = (f'<p class="rbu-cmp-price">{rbu.esc(rbu.money(price, rb_cur))}</p>'
              + (f'<p class="rbu-cmp-avail">{rbu.esc(dispatch)}</p>' if dispatch else '')
              + form)
    evo_buy = (rbu.evo_price_html(cur, note=True)
               + f'<p class="rbu-cmp-avail">Pre-order. Ships {ship}.</p>'
               + f'<a class="rbu-btn rbu-btn--pre" href="{evo_path}">Pre-order EVO</a>')
    trs.append(
        f'\t\t\t\t<tr role="row" class="rbu-cmp-buy"><th scope="row" role="rowheader">Price and availability</th>'
        f'<td role="cell" data-label="RaceBox">{rb_buy}</td>'
        f'<td role="cell" data-label="EVO" class="rbu-cmp-evo">{evo_buy}</td></tr>')
    rows_html = '\n'.join(trs)

    return f'''<!-- rb-updates: 40 racebox-compare -->
<section class="rbu-cmp" id="evo-vs-racebox" aria-labelledby="rbu-cmp-title">
	<h2 id="rbu-cmp-title">RaceBox vs RaceBox&nbsp;EVO</h2>
	<p class="rbu-cmp-lede">Same shape and controls. RaceBox EVO moves to 25&nbsp;Hz GPS, with a larger battery and more storage. The RaceBox ships now; EVO is on pre-order and ships {ship}.</p>
	<div class="rbu-cmp-card">
		<table class="rbu-cmp-table" role="table">
			<caption class="rbu-sr">RaceBox and RaceBox EVO compared, row by row</caption>
			<thead role="rowgroup">
				<tr role="row"><td class="rbu-cmp-corner" role="cell"></td><th scope="col" role="columnheader"><span class="rbu-cmp-head">RaceBox</span></th><th scope="col" role="columnheader" class="rbu-cmp-evo"><span class="rbu-cmp-head"><a class="rbu-focus" href="{evo_path}">RaceBox EVO</a> <span class="rbu-badge">Pre-order</span></span></th></tr>
			</thead>
			<tbody role="rowgroup">
{rows_html}
			</tbody>
		</table>
	</div>
	<p class="rbu-cmp-note">TBA: not announced yet for EVO. EVO keeps the shape of the RaceBox. Full RaceBox figures are in the <a class="rbu-focus" href="/products/racebox/tech-specs">technical specifications</a>.</p>
</section>
'''


def wait_html(html):
    """"Can you wait?": the reverse of the EVO page's "Need it sooner?" (owner's request), in the same .rbu-alt design
    (CSS in 10-evo-page). Desktop: straight under the product block (style.css moves it there); phones: under the header
    video. Copy from evo.json: shipWindow, prices, the FAQ answer "Should I wait for EVO or buy the RaceBox now?" and
    imageNote (the photo is the current RaceBox)."""
    e = rbu.evo()
    cur = rbu.page_currency(html)
    ship = rbu.esc(e['shipWindow']).replace(' ', '&nbsp;')
    path = rbu.esc(e['path'])
    return f'''<!-- rb-updates: 40 racebox-compare -->
<section class="rbu-alt" aria-labelledby="rbu-alt-title">
	<h2 id="rbu-alt-title">Can you wait?</h2>
	<div class="rbu-alt-in">
		<div class="rbu-alt-main">
			<figure class="rbu-alt-media"><img src="/product-image/racebox.png" width="200" height="200" loading="lazy" alt="" /><figcaption>Photo shows the current RaceBox</figcaption></figure>
			<div>
				<h3>Pre-order RaceBox&nbsp;EVO</h3>
				<p>If you can wait until {ship}, you can pre-order RaceBox&nbsp;EVO: the same shape and controls, with 25&nbsp;Hz GPS, a larger battery and more storage.</p>
				{rbu.evo_price_html(cur, note=True)}
				<a class="rbu-btn rbu-btn--pre" href="{path}">Pre-order EVO</a>
			</div>
		</div>
		<div class="rbu-alt-side">
			<h3>Not sure which?</h3>
			<p>See what EVO changes, row by row, before you choose.</p>
			<a class="rbu-alt-more" href="#evo-vs-racebox">Compare RaceBox and EVO</a>
		</div>
	</div>
</section>
'''


def apply(site):
    def edit(html, rel):
        # After the header video (desktop: after the product block, see style.css), before "What RaceBox does"
        html = rbu.insert_before(html, '<section class="what-racebox-does" role="main">', wait_html(html), where=rel)
        # After "The technology" (section.tech-specs), before "What's in the box"
        return rbu.insert_before(html, '<section class="whats-in-the-box" role="main">', table_html(html), where=rel)
    site.edit('products/racebox.html', edit)
