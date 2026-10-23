## 40 RaceBox page: RaceBox vs RaceBox EVO comparison

**What and why:** a spec table that compares the RaceBox with RaceBox EVO, so a RaceBox shopper sees what EVO changes and can buy
either one from the same row. The home page and the EVO page link to it (`/products/racebox#evo-vs-racebox`).

**Template:** the RaceBox product page (`/products/racebox`).

**Where:** between "The technology" and "What's in the box": right after the closing `</section>` of `section.tech-specs`,
before `<section class="whats-in-the-box" role="main">`. A shopper who has just read the RaceBox specs gets the EVO
comparison next, before the box contents and the buy section.

**HTML** (from the built page; values in `{{ }}` come from the store back end):

```html
<!-- rb-updates: 40 racebox-compare -->
<section class="rbu-cmp" id="evo-vs-racebox" aria-labelledby="rbu-cmp-title">
	<h2 id="rbu-cmp-title">RaceBox vs RaceBox&nbsp;EVO</h2>
	<p class="rbu-cmp-lede">Same shape and controls. RaceBox EVO moves to 25&nbsp;Hz GPS, with a larger battery and more storage. The RaceBox ships now; EVO is on pre-order and ships {{evo_ship_window}}.</p>
	<div class="rbu-cmp-card">
		<table class="rbu-cmp-table" role="table">
			<caption class="rbu-sr">RaceBox and RaceBox EVO compared, row by row</caption>
			<thead role="rowgroup">
				<tr role="row"><td class="rbu-cmp-corner" role="cell"></td><th scope="col" role="columnheader"><span class="rbu-cmp-head">RaceBox</span></th><th scope="col" role="columnheader" class="rbu-cmp-evo"><span class="rbu-cmp-head"><a class="rbu-focus" href="/products/racebox-evo">RaceBox EVO</a> <span class="rbu-badge">Pre-order</span></span></th></tr>
			</thead>
			<tbody role="rowgroup">
				<tr role="row"><th scope="row" role="rowheader">GPS update rate</th><td role="cell" data-label="RaceBox">10&nbsp;Hz</td><td role="cell" data-label="EVO" class="rbu-cmp-evo">25&nbsp;Hz<span class="rbu-cmp-up">Upgrade</span></td></tr>
				<tr role="row"><th scope="row" role="rowheader">Screen</th><td role="cell" data-label="RaceBox">Colour LCD, 320 x 240</td><td role="cell" data-label="EVO" class="rbu-cmp-evo">Colour screen. Size and resolution TBA</td></tr>
				<tr role="row"><th scope="row" role="rowheader">Controls and mount</th><td role="cell" data-label="RaceBox">Four buttons, suction cup windscreen mount</td><td role="cell" data-label="EVO" class="rbu-cmp-evo">Same shape as the RaceBox: windscreen mount, four buttons</td></tr>
				<tr role="row"><th scope="row" role="rowheader">Works without a phone</th><td role="cell" data-label="RaceBox">Yes, completely standalone</td><td role="cell" data-label="EVO" class="rbu-cmp-evo">Yes: on-device lap timer, drag meter and history</td></tr>
				<tr role="row"><th scope="row" role="rowheader">Battery</th><td role="cell" data-label="RaceBox">Up to 8&nbsp;hours of driving (Wi-Fi off)</td><td role="cell" data-label="EVO" class="rbu-cmp-evo">Larger than the original RaceBox. Final figure TBA<span class="rbu-cmp-up">Upgrade</span></td></tr>
				<tr role="row"><th scope="row" role="rowheader">Storage</th><td role="cell" data-label="RaceBox">256 drag sessions and 128 track sessions</td><td role="cell" data-label="EVO" class="rbu-cmp-evo">Larger than the original RaceBox. Final figure TBA<span class="rbu-cmp-up">Upgrade</span></td></tr>
				<tr role="row"><th scope="row" role="rowheader">App connection</th><td role="cell" data-label="RaceBox">Wi-Fi</td><td role="cell" data-label="EVO" class="rbu-cmp-evo">TBA</td></tr>
				<tr role="row"><th scope="row" role="rowheader">Third-party apps</th><td role="cell" data-label="RaceBox">Official RaceBox app only. Recorded data can be exported to other software</td><td role="cell" data-label="EVO" class="rbu-cmp-evo">TBA</td></tr>
				<tr role="row"><th scope="row" role="rowheader">Fits RaceBox accessories</th><td role="cell" data-label="RaceBox">Yes</td><td role="cell" data-label="EVO" class="rbu-cmp-evo">TBA, confirmed before shipping</td></tr>
				<tr role="row" class="rbu-cmp-buy"><th scope="row" role="rowheader">Price and availability</th><td role="cell" data-label="RaceBox"><p class="rbu-cmp-price">{{price}}</p><p class="rbu-cmp-avail">Dispatch within {{dispatch_days}} business days.</p><form method="post" action="/store/add-to-cart" class="js-add-to-cart" data-sku="{{sku}}" data-name="RaceBox" data-price="{{price_raw}}" data-currency="{{currency}}"><input type="hidden" name="product" value="{{product_id}}" /><button class="submit">Add to cart</button></form></td><td role="cell" data-label="EVO" class="rbu-cmp-evo"><p class="rbu-price rbu-price--pre"><s class="rbu-price-later"><span class="rbu-sr">Price after pre-order: </span>{{evo_price_after}}</s> <strong class="rbu-price-now"><span class="rbu-sr">Pre-order price: </span>{{evo_price_preorder}}</strong><span class="rbu-price-note">Pre-order price. {{evo_price_after}} after pre-order.</span></p><p class="rbu-cmp-avail">Pre-order. Ships {{evo_ship_window}}.</p><a class="rbu-btn rbu-btn--pre" href="/products/racebox-evo">Pre-order EVO</a></td></tr>
			</tbody>
		</table>
	</div>
	<p class="rbu-cmp-note">TBA: not announced yet for EVO. EVO keeps the shape of the RaceBox. Full RaceBox figures are in the <a class="rbu-focus" href="/products/racebox/tech-specs">technical specifications</a>.</p>
</section>
```

Variables:
- `{{price}}`, `{{price_raw}}`, `{{currency}}`, `{{sku}}`, `{{product_id}}`: the RaceBox's own values, the same ones the buy
  section (`#buy-section`) uses. The form is the buy section's add-to-cart form without `id="checkout-form"` (that id stays
  unique). Show the form under the same conditions as the buy section's form (stock, country).
- `{{dispatch_days}}`: the dispatch time the buy section shows ("Dispatch within 5 business days"). Leave the line out when the
  buy section doesn't show it.
- `{{evo_price_preorder}}`, `{{evo_price_after}}`, `{{evo_ship_window}}`: as on the EVO page (339, 449, March 2027).
- Only the current RaceBox price is shown, not the struck "was" price of the buy section, so the table never shows two struck
  prices that mean different things (EVO's struck price is the price after pre-order).

**CSS:** section `40-racebox-compare/style.css` in `rb-updates.css`. No JavaScript.
- The live `main.css` rule `:target { position: relative; top: -169px; visibility: hidden }` hides any element that a link
  points to. The CSS undoes it for `#evo-vs-racebox` and uses `scroll-margin-top` (160 px desktop, 140 px phone) so the
  heading lands below the fixed header and the EVO bar.
- From 700 px up it is a normal 3-column table. Below 700 px each row stacks: the row label on top, RaceBox and EVO side by
  side, each with a small label. The `role` attributes keep it a table for screen readers in that layout: keep them.
- The table's Add to cart uses the live form and the live button look: the pill shape and uppercase RaceBox-Regular 19.2 px of
  `main.css button.submit`, so it sits right with the sticky "Add to cart" bar and the buy section's button, which show on the
  same screen. Two differences, on purpose: it is 44 px tall (the live one is 34 px; 44 px is the touch minimum) and its red is
  #e32026, not #ea2127. White on #ea2127 is 4.4:1, under the 4.5:1 minimum for text this size; #e32026 is 4.7:1 and looks the
  same. The "Pre-order EVO" button next to it takes the same pill shape (in violet) so the two buttons in the row match.
  Below 700 px both buttons are 14 px so each fits one line in its half-width column.
- **Core need (00-core, other pages):** the shared `.rbu-btn` is a 4 px-radius, sentence-case rectangle, and the live
  `button.submit` is a pill. Pick one shape for the whole site and apply it to `.rbu-btn` too, so Pre-order EVO on the EVO page, home
  page and banner matches the live Add to cart buttons. Here the table already follows the live pill.
- **Reduced motion:** `main.css` has `html { scroll-behavior: smooth }` and no `prefers-reduced-motion` rule, so the links from the
  home page and the EVO page glide about 2,500 px down to this table. The last rule in `style.css` sets
  `html { scroll-behavior: auto }` for visitors who ask for less motion. It applies to the whole site: move it to `00-core` or
  into `main.css` so it does not depend on this page's CSS.

**Facts and sources.** RaceBox column: tech specs page first (`/products/racebox/tech-specs`), then the RaceBox page and the FAQ.
EVO column: `patches/evo.json` (TBA where it says TBA). The live pages disagree on some RaceBox figures, so the table leaves
those figures out until the owner confirms them:
- Screen size: 2.4" on the RaceBox page, 2.5" on the tech specs page. The table says "Colour LCD, 320 x 240". Add the size
  once confirmed.
- Battery: 2000 mAh on the RaceBox page, 2500 mAh on the tech specs page. The table uses "Up to 8 hours of driving (Wi-Fi off)",
  which both pages support.
- Storage: "up to 400 racing sessions" on the RaceBox page, "256 drag sessions ... 128 track sessions" on the tech specs page.
  The table uses the tech specs figure.
- Also different (not in the table): charging time (2 hours vs less than 3 hours) and GNSS systems (Galileo/Beidou vs SBAS).

**Back end:** none beyond the variables above. The EVO links go to `/products/racebox-evo` (change set 10).

**How to test**
- [ ] `/products/racebox`: the table is after "The technology", before "What's in the box".
- [ ] `/products/racebox#evo-vs-racebox` (desktop and phone): the page scrolls to the table and the heading is visible below the
      header and the EVO bar (not hidden, not under the header).
- [ ] RaceBox price, dispatch line and Add to cart match the buy section. Add to cart puts one RaceBox in the cart.
- [ ] Add to cart in the table looks like the sticky "Add to cart" bar and the buy section's button (pill, uppercase, same red to
      the eye), and the Pre-order EVO button next to it has the same shape in violet.
- [ ] Reduce motion on (system setting, or DevTools "Emulate prefers-reduced-motion"): the link from the home page
      ("Compare with the RaceBox") and `/products/racebox#evo-vs-racebox` land on the table at once, with no glide. With it off, the
      page still scrolls smoothly.
- [ ] EVO: struck {{evo_price_after}}, {{evo_price_preorder}} in violet, "Pre-order. Ships March 2027.", violet Pre-order EVO button to
      `/products/racebox-evo`; the column header "RaceBox EVO" links there too.
- [ ] EU visitor: both columns in euros.
- [ ] Phone (390 px): rows stack, RaceBox and EVO side by side, no sideways scrolling, both buttons full width of their column.
- [ ] Screen reader: it is announced as a table with a caption, column headers RaceBox / RaceBox EVO and a row header per row.
- [ ] Keyboard: Tab goes RaceBox EVO link, Add to cart, Pre-order EVO, technical specifications, each with a dark focus ring.
