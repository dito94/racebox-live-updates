## 30 Home page: RaceBox EVO launch hero

**What and why:** the home page now opens with a dark RaceBox EVO launch hero, on every screen size. It takes the place of the large photo that used to open the page. Every visitor meets the pre-order first (owner's request: "like the new design"). "Introducing RaceBox" follows unchanged. The site-wide EVO bar (change set 20) is not on the home page, because the hero carries the offer.

**Template:** the home page (`/`, `index.html`, body class `page-front`).

**Template steps:**
1. Remove the first `div.topimg` inside `section.front-introduction`: the `<div class="topimg"><picture>...</picture></div>` that holds the big photo (`/assets/.../img/fp/2-*.webp` and `.jpg`). The photo had `alt=""`, so nothing is lost for screen readers. The second `div.topimg` on the page (the app section, further down) stays. The old photo files can stay on the server.
2. Add the hero (HTML below) as the first child of `<main>`: right after `<main>`, before `<section class="front-introduction with-banner" role="main">`.
3. Leave the EVO bar out of this page (change set 20 skips the home page). Nothing else on the page changes.

The hero's title is an `h2`. The page's only `h1` stays "Introducing RaceBox", which now comes after the hero in the source.

**HTML** (from the built page `patched/index.html`; values in `{{ }}` come from the store back end):

```html
<!-- rb-updates: 30 home-evo -->
	<section class="rbu-home-hero" aria-labelledby="rbu-home-hero-title">
		<div class="rbu-home-hero-in">
			<div class="rbu-home-hero-copy">
				<p class="rbu-home-hero-flag"><span class="rbu-badge">Pre-order</span> <span>Ships {{evo_ship_window}}</span></p>
				<h2 class="rbu-home-hero-name" id="rbu-home-hero-title">RaceBox <span>EVO</span></h2>
				<p class="rbu-home-hero-tagline">The RaceBox you know. Now at 25&nbsp;Hz.</p>
				<p class="rbu-home-hero-lede">Built-in screen, 25&nbsp;Hz GPS, bigger battery and more storage.</p>
				<p class="rbu-price rbu-price--pre rbu-price--lg"><s class="rbu-price-later"><span class="rbu-sr">Price after pre-order: </span>{{evo_price_after}}</s> <strong class="rbu-price-now"><span class="rbu-sr">Pre-order price: </span>{{evo_preorder_price}}</strong><span class="rbu-price-note" aria-hidden="true">Pre-order price. {{evo_price_after}} after pre-order.</span></p>
				<p class="rbu-home-hero-actions">
					<a class="rbu-btn rbu-btn--pre" href="/products/racebox-evo">Pre-order EVO</a>
					<a class="rbu-home-hero-link" href="/products/racebox#evo-vs-racebox">Compare with the RaceBox</a>
				</p>
				<p class="rbu-home-hero-terms">Paid in full at checkout, at the pre-order price. Cancel any time before it ships for a full refund.</p>
			</div>
			<figure class="rbu-home-hero-media">
				<picture>
					<source type="image/webp" srcset="/assets/rb-updates/img/home-evo-cut-racebox-angle-400.webp 400w, /assets/rb-updates/img/home-evo-cut-racebox-angle-800.webp 800w, /assets/rb-updates/img/home-evo-cut-racebox-angle-1200.webp 1200w" sizes="(min-width: 1001px) 560px, 88vw" />
					<img src="/assets/rb-updates/img/home-evo-cut-racebox-angle-800.png" width="800" height="463" fetchpriority="high" decoding="async" alt="The current RaceBox, angled, with the lap timer on its screen" />
				</picture>
				<figcaption>Photos show the current RaceBox. EVO keeps the same shape; EVO photos follow before shipping.</figcaption>
			</figure>
		</div>
	</section>
```

Variables (the same as in 10-evo-page):
- `{{evo_preorder_price}}` and `{{evo_price_after}}`: the EVO pre-order price (339) and the price after pre-order (449), in the visitor's currency, formatted like other store prices (`$339.00`, `339.00 €`). Same values as the EVO product page.
- `{{evo_ship_window}}`: `March 2027`.

Notes on the markup:
- The price block is the shared one from 00-core and 10. The `rbu-sr` spans are for screen readers: they hear "Price after pre-order: $449.00 Pre-order price: $339.00". The visible note ("Pre-order price. ... after pre-order.") has `aria-hidden="true"`, so they do not hear the prices twice.
- The hero image is the first thing on the page, so it loads at once: `fetchpriority="high"`, no `loading="lazy"`. Keep the `width` and `height` of the PNG on the `<img>`.
- On phones the picture is shown, so `sizes` gives it `88vw` there. (Change set 50 uses `1px` because its picture is hidden on phones. Do not copy that here.)

**Images:** upload these to `/assets/rb-updates/img/` (they are in `patches/30-home-evo/static/img/`):
`home-evo-cut-racebox-angle-400.webp`, `home-evo-cut-racebox-angle-800.webp`, `home-evo-cut-racebox-angle-1200.webp`, `home-evo-cut-racebox-angle-800.png` (fallback for browsers without webp).
They show the current RaceBox; the caption says so.

**CSS:** section `30-home-evo/style.css` in `rb-updates.css`. It uses the shared tokens and `.rbu-price`, `.rbu-badge`, `.rbu-btn--pre`, `.rbu-sr` from `00-core`. No JavaScript. It holds:
- **The band:** `#0e1013` with a soft violet glow (`radial-gradient`, at most 42 % violet) behind the picture. Padding 56 / 40 / 64 px; 40 / 32 / 48 px up to 1000 px wide; 28 / 20 / 36 px on phones (up to 699 px).
- **Layout:** two columns (text 5fr, picture 6fr), at most 1120 px wide, the text centred against the picture. From 1001 px the block is at most `min(560px, 100vh - 200px)` tall, so on a short desktop window the offer is not pushed off the screen. On phones (up to 699 px) it is one column: the text comes first (price and Pre-order EVO in the first screen), the picture follows. The button is full width and the "Compare" link is centred.
- **Type:** the name is RaceBox-Light capitals, 3.25 rem (2.5 rem up to 1000 px, 2.125 rem on phones). The rule for it also sets the margin and left alignment and clears padding and background, so the live heading rules do not change it.
- **Price block, button, link:** the shared price block is recoloured for the dark band. The pre-order button is the shared violet `.rbu-btn--pre`, a little larger (52 px tall). Its hover is a lighter violet (`#7f55ea`), because the shared dark hover would sink into the band. The "Compare" link is white, underlined, with a small arrow, and 44 px tall.
- **Focus:** a white 2 px outline with a 3 px offset on both links. The shared dark focus ring would not show on the band.
- **Space below the hero:** `.rbu-home-hero + section.front-introduction { padding-top: 72px; }` (48 px on phones). main.css gives `page-front` banner sections no top padding (`:where(body.page-front) section.with-banner { padding-top: 0 }`); the photo's own 72 px bottom margin made the gap. The photo is gone, so the padding does it now.

**Colours and contrast on the dark band** (WCAG ratios against the base `#0e1013`, and against the brightest part of the glow, about `#362465`; all pass 4.5:1 for text):

| Use | Colour | On the base | On the glow |
|---|---|---|---|
| Name, tagline, "Compare" link | `#ffffff` | 19:1 | 13:1 |
| Flag line, lede, terms, struck price, price note | `#c3c8cf` | 11:1 | 7.8:1 |
| Pre-order price | `#c4adff` | 9.8:1 | 6.7:1 |
| Picture caption | `#a3aab4` | 8.1:1 | 5.6:1 |
| "Pre-order" badge text on its tint | `#d9cbff` on `rgba(196,173,255,.16)` | 9.4:1 | 6.3:1 |

The button's white text on `#6d3fd6` is 6.3:1 (4.8:1 on the hover colour `#7f55ea`). The violet button against the band is 3.0:1.

**Back end:** none beyond the EVO prices and ship window above. The Pre-order button links to `/products/racebox-evo` (change set 10); "Compare with the RaceBox" links to `/products/racebox#evo-vs-racebox` (change set 40).

Before release: the cancellation line comes from patches/evo.json and must match the live T&C. See 10-evo-page CTO.md, Back end item 7.

**How to test**
- [ ] Phone 390 x 844: `/` opens with the dark hero, not the photo. The first screen shows the price and "Pre-order EVO" (no scrolling). The RaceBox picture comes after the buttons.
- [ ] Desktop 1280 x 720: the first screen shows the whole offer (badge, name, price, "Pre-order EVO", the Compare link) and the picture, with nothing cut off. Also check 1440 x 900 and 1920 x 1080.
- [ ] Tablet 768 x 1024: the offer is in the first screen, no horizontal scroll.
- [ ] No EVO bar on the home page (no `.rbu-evo-bar` in the header). Other pages (for example `/store/`) still have it.
- [ ] "Introducing RaceBox" follows the hero with 72 px of space above its heading (48 px on phones); the red centre line starts under the hero; the app section's photo further down is still there.
- [ ] Prices: struck `{{evo_price_after}}` in grey, then `{{evo_preorder_price}}` in light violet, with "Pre-order price. ... after pre-order." under them. An EU visitor sees euros (`449.00 €`, `339.00 €`). A screen reader reads the prices once ("Price after pre-order: $449.00 Pre-order price: $339.00").
- [ ] "Pre-order EVO" opens `/products/racebox-evo`. "Compare with the RaceBox" lands on `/products/racebox#evo-vs-racebox`, at the comparison table, below the fixed header. With "reduce motion" on in the system settings the page lands there at once, with no long glide (change set 40 CSS).
- [ ] The hero image is requested early (network panel) and is not lazy-loaded; no layout jump when it appears.
- [ ] Keyboard: Tab reaches "Pre-order EVO", then "Compare with the RaceBox", in that order, each with a white focus ring.
- [ ] No horizontal scroll at 320 to 1920 px; zoom 200 % still reads well.
