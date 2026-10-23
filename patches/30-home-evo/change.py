"""30 home-evo: a RaceBox EVO pre-order section on the home page, right below the top photo.

Ported from the redesign's home hero offer (buildlib/pages_shop.py home(), .hero-offer) as a full section in the live
look. Every EVO fact comes from patches/evo.json; the price block is rbu.evo_price_html.
"""
import rbu

IMG = '/assets/rb-updates/img/home-evo-cut-racebox-angle'


def nb(text):
    """Escape, and keep a number with its unit ('25 Hz') on one line."""
    return rbu.esc(text).replace(' Hz', '&nbsp;Hz')


def section_html(cur):
    e = rbu.evo()
    ship = rbu.esc(e['shipWindow'])
    terms = ' '.join(rbu.esc(t) for t in e['terms'][1:3])  # paid in full at checkout; cancel before it ships
    return f'''<!-- rb-updates: 30 home-evo -->
	<section class="rbu-home-evo" aria-labelledby="rbu-home-evo-title">
		<div class="rbu-home-evo-card">
			<div class="rbu-home-evo-copy">
				<p class="rbu-home-evo-flag"><span class="rbu-badge">Pre-order</span> <span>Ships {ship}</span></p>
				<h2 class="rbu-home-evo-name" id="rbu-home-evo-title">RaceBox <span>EVO</span></h2>
				<p class="rbu-home-evo-tagline">{nb(e['tagline'])}</p>
				<p class="rbu-home-evo-lede">{nb(e['oneLiner'])}</p>
			</div>
			<figure class="rbu-home-evo-media">
				<picture>
					<source type="image/webp" srcset="{IMG}-400.webp 400w, {IMG}-800.webp 800w" sizes="(min-width: 1001px) 440px, (min-width: 700px) 50vw, 86vw" />
					<img src="{IMG}-800.png" width="800" height="463" loading="lazy" decoding="async" alt="The current RaceBox, angled, with the lap timer on its screen" />
				</picture>
				<figcaption>{rbu.esc(e['imageNote'])}</figcaption>
			</figure>
			<div class="rbu-home-evo-buy">
				{rbu.evo_price_html(cur, size='lg')}
				<p class="rbu-home-evo-actions">
					<a class="rbu-btn rbu-btn--pre" href="{rbu.esc(e['path'])}">Pre-order EVO</a>
					<a class="rbu-home-evo-link rbu-focus" href="/products/racebox#evo-vs-racebox">Compare with the RaceBox</a>
				</p>
				<p class="rbu-home-evo-terms">{terms}</p>
			</div>
		</div>
	</section>
	'''


def apply(site):
    def edit(html, rel):
        cur = rbu.page_currency(html)
        # Right after the top photo (div.topimg) and before the "Introducing RaceBox" heading of section.front-introduction
        return rbu.insert_before(html, '<h1><a id="what-is-racebox"></a>Introducing RaceBox</h1>', section_html(cur),
                                 where=rel)
    site.edit('index.html', edit)
