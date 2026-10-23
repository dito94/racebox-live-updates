"""30 home-evo: the home page opens with the RaceBox EVO pre-order.

A dark launch hero is the first thing in <main>, on every screen size, in place of the large photo that opened the
page (the div.topimg at the top of section.front-introduction, removed here). The "Introducing RaceBox" section follows
it unchanged. Ported from the redesign's home hero offer (buildlib/pages_shop.py home(), .hero-offer) in the live
fonts. Every EVO fact comes from patches/evo.json; the price block is rbu.evo_price_html. The site-wide EVO bar
(change set 20) is left off the home page, since this hero carries the offer.
"""
import rbu

IMG = '/assets/rb-updates/img/home-evo-cut-racebox-angle'
INTRO = '<section class="front-introduction with-banner" role="main">'


def nb(text):
    """Escape, and keep a number with its unit ('25 Hz') on one line."""
    return rbu.esc(text).replace(' Hz', '&nbsp;Hz')


def hero_html(cur):
    e = rbu.evo()
    ship = rbu.esc(e['shipWindow'])
    terms = ' '.join(rbu.esc(t) for t in e['terms'][1:3])  # paid in full at checkout; cancel before it ships
    return f'''<!-- rb-updates: 30 home-evo -->
	<section class="rbu-home-hero" aria-labelledby="rbu-home-hero-title">
		<div class="rbu-home-hero-in">
			<div class="rbu-home-hero-copy">
				<p class="rbu-home-hero-flag"><span class="rbu-badge">Pre-order</span> <span>Ships {ship}</span></p>
				<h2 class="rbu-home-hero-name" id="rbu-home-hero-title">RaceBox <span>EVO</span></h2>
				<p class="rbu-home-hero-tagline">{nb(e['tagline'])}</p>
				<p class="rbu-home-hero-lede">{nb(e['oneLiner'])}</p>
				{rbu.evo_price_html(cur, size='lg')}
				<p class="rbu-home-hero-actions">
					<a class="rbu-btn rbu-btn--pre" href="{rbu.esc(e['path'])}">Pre-order EVO</a>
					<a class="rbu-home-hero-link" href="/products/racebox#evo-vs-racebox">Compare with the RaceBox</a>
				</p>
				<p class="rbu-home-hero-terms">{terms}</p>
			</div>
			<figure class="rbu-home-hero-media">
				<picture>
					<source type="image/webp" srcset="{IMG}-400.webp 400w, {IMG}-800.webp 800w, {IMG}-1200.webp 1200w" sizes="(min-width: 1001px) 560px, 88vw" />
					<img src="{IMG}-800.png" width="800" height="463" fetchpriority="high" decoding="async" alt="The current RaceBox, angled, with the lap timer on its screen" />
				</picture>
				<figcaption>{rbu.esc(e['imageNote'])}</figcaption>
			</figure>
		</div>
	</section>
	'''


def apply(site):
    def edit(html, rel):
        cur = rbu.page_currency(html)
        # The large photo that opened the page goes; the EVO hero takes its place, before "Introducing RaceBox".
        html = rbu.re_sub(html, r'(' + rbu.re.escape(INTRO) + r')\s*<div class="topimg">\s*<picture>.*?</picture>\s*</div>',
                          r'\1', where=rel)
        return rbu.insert_before(html, INTRO, hero_html(cur), where=rel)
    site.edit('index.html', edit)
