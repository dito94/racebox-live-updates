"""20 evo-banner: a slim RaceBox EVO pre-order bar in the header of every page, right under the shipping banner.

One line on tablets and desktops, two on phones. The whole bar opens /products/racebox-evo: its one link
("Pre-order EVO") stretches over the bar. Not on the checkout (nothing should pull a buyer away from paying) and not on
the EVO page itself or the home page (its EVO hero, change set 30, carries the offer). The price is rbu.evo_price_html in the page's currency; style.css shows it as
"$339.00 ($449.00 struck, after pre-order)".

The bar is the FIRST child of <header>, so keyboard users reach it first, as it appears on screen (it sits above the
menu). style.css lays the header out in normal flow (banner, bar, nav) so each part follows the real height of the one
above it, even when a visitor's own text spacing makes the bar taller.
"""
import rbu

MARK = '<!-- rb-updates: 20 evo-banner -->'
# The home page opens with the EVO hero (change set 30), so the bar would only repeat it there.
SKIP = {'store/checkout.html', 'products/racebox-evo.html', 'index.html'}
# The bar goes first inside the live <header> (one per page), whether or not the page has a shipping banner
HEADER = r'(<header>)'


def bar_html(cur):
    e = rbu.evo()
    ship = rbu.esc(e['shipWindow']).replace(' ', '&nbsp;')
    return (f'\n\t\t\t{MARK}\n\t\t\t<div class="rbu-evo-bar">'
            f'<div class="rbu-evo-bar-in rbu-price-inline">'
            f'<span class="rbu-evo-bar-lead"><strong><span class="rbu-evo-bar-brand">RaceBox </span>EVO</strong> pre-order:</span> '
            f'{rbu.evo_price_html(cur, size="sm", note=False)}'
            f'<span class="rbu-evo-bar-tail"><span class="rbu-evo-bar-sep" aria-hidden="true"> &middot; </span>'
            f'<span>Ships {ship}<span class="rbu-sr">.</span></span>'
            f'<span class="rbu-evo-bar-sep" aria-hidden="true"> &middot; </span>'
            f'<a class="rbu-evo-bar-link" href="{rbu.esc(e["path"])}">Pre-order EVO</a></span>'
            f'</div></div>')


def apply(site):
    if not site.exists('products/racebox-evo.html'):
        raise rbu.AnchorError('20-evo-banner: the bar links to /products/racebox-evo, which change set 10 creates')
    done = 0
    for rel in site.pages():
        if rel in SKIP:
            continue

        def edit(html, rel):
            cur = rbu.page_currency(html)
            return rbu.re_sub(html, HEADER, lambda m: m.group(1) + bar_html(cur), count=1, where=rel)
        site.edit(rel, edit)
        done += 1
    if done < 40:
        raise rbu.AnchorError(f'20-evo-banner: only {done} pages got the bar')
