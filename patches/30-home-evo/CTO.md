## 30 Home page: RaceBox EVO pre-order section

**What and why:** a RaceBox EVO pre-order section right below the home page's top photo, so every visitor meets the pre-order (owner's request: "like the new design").

**Template:** the home page (`/`, `index.html`, body class `page-front`).

**Where:** inside `section.front-introduction`, right after the closing `</div>` of `div.topimg` and before
`<h1><a id="what-is-racebox"></a>Introducing RaceBox</h1>`.

Why there: it is the first thing under the photo (on phones the price and the Pre-order button are in the first screen at
390 x 844 and 768 x 1024). On desktop the site-wide EVO bar (change set 20) already puts the pre-order in the first screen,
so the photo stays as it is. The white card sits on the section's red centre line like the live headings do.

**HTML** (from the built page; values in `{{ }}` come from the store back end):

```html
<!-- rb-updates: 30 home-evo -->
	<section class="rbu-home-evo" aria-labelledby="rbu-home-evo-title">
		<div class="rbu-home-evo-card">
			<div class="rbu-home-evo-copy">
				<p class="rbu-home-evo-flag"><span class="rbu-badge">Pre-order</span> <span>Ships {{evo_ship_window}}</span></p>
				<h2 class="rbu-home-evo-name" id="rbu-home-evo-title">RaceBox <span>EVO</span></h2>
				<p class="rbu-home-evo-tagline">The RaceBox you know. Now at 25&nbsp;Hz.</p>
				<p class="rbu-home-evo-lede">Built-in screen, 25&nbsp;Hz GPS, bigger battery and more storage.</p>
			</div>
			<figure class="rbu-home-evo-media">
				<picture>
					<source type="image/webp" srcset="/assets/rb-updates/img/home-evo-cut-racebox-angle-400.webp 400w, /assets/rb-updates/img/home-evo-cut-racebox-angle-800.webp 800w" sizes="(min-width: 1001px) 440px, (min-width: 700px) 50vw, 86vw" />
					<img src="/assets/rb-updates/img/home-evo-cut-racebox-angle-800.png" width="800" height="463" loading="lazy" decoding="async" alt="The current RaceBox, angled, with the lap timer on its screen" />
				</picture>
				<figcaption>Photos show the current RaceBox. EVO keeps the same shape; EVO photos follow before shipping.</figcaption>
			</figure>
			<div class="rbu-home-evo-buy">
				<p class="rbu-price rbu-price--pre rbu-price--lg"><s class="rbu-price-later"><span class="rbu-sr">Price after pre-order: </span>{{evo_price_after}}</s> <strong class="rbu-price-now"><span class="rbu-sr">Pre-order price: </span>{{evo_price_preorder}}</strong><span class="rbu-price-note">Pre-order price. {{evo_price_after}} after pre-order.</span></p>
				<p class="rbu-home-evo-terms">Paid in full at checkout, at the pre-order price. Cancel any time before it ships for a full refund.</p>
				<p class="rbu-home-evo-actions">
					<a class="rbu-btn rbu-btn--pre" href="/products/racebox-evo">Pre-order EVO</a>
					<a class="rbu-home-evo-link rbu-focus" href="/products/racebox#evo-vs-racebox">Compare with the RaceBox</a>
				</p>
			</div>
		</div>
	</section>
```

Variables:
- `{{evo_price_preorder}}` and `{{evo_price_after}}`: the EVO pre-order price (339) and the price after pre-order (449), in the
  visitor's currency, formatted like other store prices (`$339.00`, `339.00 €`). Same values as the EVO product page.
- `{{evo_ship_window}}`: `March 2027`.

**Images:** upload these to `/assets/rb-updates/img/` (they are in `patches/30-home-evo/static/img/`):
`home-evo-cut-racebox-angle-400.webp`, `home-evo-cut-racebox-angle-800.webp`, `home-evo-cut-racebox-angle-800.png` (fallback).
They show the current RaceBox; the caption says so.

**CSS:** section `30-home-evo/style.css` in `rb-updates.css`. It uses the shared tokens and `.rbu-price`, `.rbu-badge`,
`.rbu-btn--pre`, `.rbu-focus` from `00-core`. No JavaScript.

**Back end:** none beyond the EVO prices and ship window above. The Pre-order button links to `/products/racebox-evo`
(change set 10); "Compare with the RaceBox" links to `/products/racebox#evo-vs-racebox` (change set 40).

**How to test**
- [ ] `/` on a phone (390 px wide): the EVO card is under the photo; price and Pre-order button visible without scrolling.
- [ ] Desktop (1280, 1440, 1920): two columns, text left, RaceBox image right; red line runs from the photo into the card.
- [ ] Prices: struck {{evo_price_after}} then {{evo_price_preorder}} in violet, with "Pre-order price. ... after pre-order." under them.
      An EU visitor sees euros (`449.00 €`, `339.00 €`).
- [ ] Pre-order EVO opens `/products/racebox-evo`; "Compare with the RaceBox" opens the RaceBox page at the comparison table.
- [ ] Keyboard: Tab reaches both links in order, with a dark focus ring.
- [ ] No horizontal scroll at 320 to 1920 px; zoom 200 % still reads well.
