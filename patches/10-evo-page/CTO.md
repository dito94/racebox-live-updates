## 10 RaceBox EVO page, store card and menu links

**What and why.** EVO pre-orders get their own page, a first card on /store/ and a menu entry, so customers can find and pre-order it from anywhere on the site.

### 1. New page: /products/racebox-evo

**Template.** Copy the RaceBox product page template (`/products/racebox`). Keep its `<head>`, header, footer and scripts (`bottom-popup-element.js` is needed for the sticky bar on phones). Replace everything inside `<main>` with the HTML below. Give `<body>` the classes `page-front rbu-evo-page`.

**Head.** Replace the RaceBox title, description, canonical, Open Graph tags and JSON-LD with:

```html
<title>RaceBox EVO: 25 Hz Standalone Lap Timer | Pre-order</title>
<meta name="description" content="Pre-order RaceBox EVO, the standalone lap timer and drag meter with its own colour screen, now with 25 Hz GPS. {{evo_preorder_price}} pre-order price, {{evo_price_after}} after pre-order. Ships March 2027.">
<link rel="canonical" href="https://www.racebox.pro/products/racebox-evo">
<meta property="og:title" content="RaceBox EVO: 25 Hz Standalone Lap Timer | Pre-order">
<meta property="og:description" content="(same as the description)">
<meta property="og:url" content="https://www.racebox.pro/products/racebox-evo">
<script type="application/ld+json">
{
 "@context": "https://schema.org/",
 "@type": "Product",
 "name": "RaceBox EVO",
 "brand": {
  "@type": "Brand",
  "name": "RaceBox"
 },
 "image": [
  "https://www.racebox.pro/assets/rb-updates/img/evo-angle-800.png"
 ],
 "description": "RaceBox EVO is the next generation of the original standalone RaceBox: the same windscreen-mounted unit with its own colour screen, now with 25 Hz GPS, a larger battery and more internal storage. Lap timing and drag runs on the device, no phone needed.",
 "sku": "EVO_SKU",
 "offers": {
  "@type": "Offer",
  "availability": "https://schema.org/PreOrder",
  "availabilityStarts": "2027-03-01",
  "priceCurrency": "{{currency}}",
  "price": {{evo_preorder_amount}},
  "itemCondition": "https://schema.org/NewCondition",
  "url": "https://www.racebox.pro/products/racebox-evo"
 }
}
	</script>
```

The Product JSON-LD has no reviews or rating (EVO has none yet). Its Offer is `PreOrder` with `availabilityStarts` 2027-03-01. The image is the current RaceBox photo; swap it for an EVO photo when one exists.

**Server variables.**

| Variable | Example (US) | Example (EU) | Where it comes from |
|---|---|---|---|
| `{{evo_preorder_price}}` | `$339.00` | `339.00 €` | EVO product, pre-order price, formatted like every other price |
| `{{evo_price_after}}` | `$449.00` | `449.00 €` | EVO price after pre-order (a second price field on the product) |
| `{{evo_preorder_amount}}` | `339` | `339` | the raw number, for `data-price` and JSON-LD |
| `{{currency}}` | `USD` | `EUR` | visitor currency, as on the RaceBox page |
| `{{racebox_price}}` | `$399.00` | | RaceBox (RB01) current price |
| `{{price_note}}` | The price is in **US Dollars** and is valid for **United States**. | | the same line the RaceBox buy section prints |
| `{{buy_section_bullets_without_dispatch}}` | the `<li>` items of the RaceBox buy section | | same partial, minus "Dispatch within 5 business days" (EVO ships in March 2027 instead) |
| `{{switch_country_line}}` | Not purchasing in United States? Switch country | | same partial as the RaceBox buy section |
| `{{racebox_dispatch_line}}` | Dispatch within **5 business days** | | the dispatch bullet the RaceBox buy section prints |

`EVO_SKU` and `EVO_PRODUCT_ID` are placeholders: replace them with the EVO product's SKU and id (the hidden `product` input of the add-to-cart form, like `5fbcc249279fe9d96341a620` for RaceBox). Every EVO fact (ship window, terms, specs, FAQ) comes from `live-site/patches/evo.json`.

**Main HTML** (the whole `<main>`):

```html
<!-- rb-updates: 10 evo-page -->
<section class="rbu-evo-hero" aria-labelledby="rbu-evo-title">
	<div class="rbu-evo-hero-in">
		<div class="rbu-evo-hero-copy">
			<p class="rbu-evo-flag"><span class="rbu-badge">Pre-order</span> <span>Ships March&nbsp;2027</span></p>
			<h1 class="rbu-evo-name" id="rbu-evo-title">RaceBox <span>EVO</span></h1>
			<p class="rbu-evo-tagline">The RaceBox you know. Now at 25&nbsp;Hz.</p>
			<p class="rbu-evo-lede">Built-in screen, 25&nbsp;Hz GPS, bigger battery and more storage. No phone needed at the track.</p>
		</div>
		<figure class="rbu-evo-hero-media">
			<picture>
				<source type="image/webp" srcset="/assets/rb-updates/img/evo-angle-400.webp 400w, /assets/rb-updates/img/evo-angle-800.webp 800w, /assets/rb-updates/img/evo-angle-1200.webp 1200w" sizes="(min-width: 1001px) 520px, (min-width: 700px) 44vw, 64vw" />
				<img src="/assets/rb-updates/img/evo-angle-800.png" width="800" height="463" fetchpriority="high" decoding="async" alt="The current RaceBox, angled, with the lap timer on its screen" />
			</picture>
			<figcaption>Photos show the current RaceBox. EVO keeps the same shape; EVO photos follow before shipping.</figcaption>
		</figure>
		<div class="rbu-evo-buy" id="rbu-evo-buy">
			<p class="rbu-price rbu-price--pre rbu-price--lg"><s class="rbu-price-later"><span class="rbu-sr">Price after pre-order: </span>{{evo_price_after}}</s> <strong class="rbu-price-now"><span class="rbu-sr">Pre-order price: </span>{{evo_preorder_price}}</strong><span class="rbu-price-note">Pre-order price. {{evo_price_after}} after pre-order.</span></p>
			<div class="rbu-evo-actions">
				<form method="post" action="/store/add-to-cart" class="js-add-to-cart" data-sku="EVO_SKU" data-name="RaceBox EVO" data-price="{{evo_preorder_amount}}" data-currency="{{currency}}"><input type="hidden" name="product" value="EVO_PRODUCT_ID" /><button class="rbu-btn rbu-btn--pre rbu-evo-cta">Pre-order now</button></form>
				<a class="rbu-evo-more rbu-focus" href="#rbu-evo-how">How pre-ordering works</a>
			</div>
			<ul class="reddot rbu-evo-keyterms"><li>Paid in full at checkout, at the pre-order price.</li><li>Cancel any time before it ships for a full refund.</li><li>We email production updates while you wait.</li></ul>
			<p class="price-note rbu-evo-currency">{{price_note}}</p>
		</div>
	</div>
</section>
<!-- rb-updates: 10 evo-page -->
<section class="rbu-evo-band rbu-evo-band--pink" aria-labelledby="rbu-evo-new-title">
	<h2 id="rbu-evo-new-title">What's new</h2>
	<p class="rbu-evo-intro">Two and a half times the update rate. Same RaceBox.</p>
	<ol class="rbu-evo-new"><li><span class="rbu-evo-new-n" aria-hidden="true">01</span><h3>25 Hz, on the dash</h3><p>25&nbsp;Hz GPS instead of 10&nbsp;Hz, with live lap, sector and drag results on its own colour screen.</p></li><li><span class="rbu-evo-new-n" aria-hidden="true">02</span><h3>Bigger battery</h3><p>A larger battery than the original RaceBox. Capacity and runtime are confirmed before shipping.</p></li><li><span class="rbu-evo-new-n" aria-hidden="true">03</span><h3>More storage</h3><p>More room for sessions on the device itself. The final figure is confirmed before shipping.</p></li><li><span class="rbu-evo-new-n" aria-hidden="true">04</span><h3>Same shape you know</h3><p>The windscreen-mounted design and four-button controls of the original RaceBox.</p></li></ol>
</section>
<div class="rbu-evo-photo">
	<figure>
		<picture>
			<source type="image/webp" srcset="/assets/rb-updates/img/evo-windscreen-640.webp 640w, /assets/rb-updates/img/evo-windscreen-1024.webp 1024w, /assets/rb-updates/img/evo-windscreen-1600.webp 1600w" sizes="(min-width: 1001px) 960px, 100vw" />
			<img src="/assets/rb-updates/img/evo-windscreen-1024.jpg" width="1024" height="683" loading="lazy" decoding="async" alt="The current RaceBox on its windscreen suction mount, above a car's infotainment screen" />
		</picture>
		<figcaption>Photos show the current RaceBox. EVO keeps the same shape; EVO photos follow before shipping.</figcaption>
	</figure>
</div>
<!-- rb-updates: 10 evo-page -->
<section class="rbu-evo-band rbu-evo-band--grey" id="rbu-evo-how" aria-labelledby="rbu-evo-how-title">
	<h2 id="rbu-evo-how-title">How pre-ordering works</h2>
	<div class="rbu-evo-wrap">
		<ol class="rbu-evo-steps" aria-label="Pre-order steps"><li class="is-now">Pre-order today</li><li>Production updates by email</li><li>Ships March&nbsp;2027</li><li>Delivered</li></ol>
		<dl class="rbu-evo-terms"><div><dt>Payment</dt><dd>Paid in full at checkout, at the pre-order price.</dd></div><div><dt>Cancelling</dt><dd>Cancel any time before it ships for a full refund. <a href="/contact-us">Contact us</a> with your order number. After delivery you still have 14 days to change your mind.</dd></div><div><dt>Updates</dt><dd>We email production updates while you wait. If the ship date moves, we email you the new date before the old one passes.</dd></div><div><dt>Delivery</dt><dd>Ships March&nbsp;2027.</dd></div></dl>
		<h3 class="rbu-evo-h3">Buying from RaceBox</h3>
		<ul class="reddot rbu-evo-buying">{{buy_section_bullets_without_dispatch}}</ul>
		<p class="rbu-evo-switch">{{switch_country_line}}</p>
	</div>
</section>
<!-- rb-updates: 10 evo-page -->
<section class="rbu-evo-band" aria-labelledby="rbu-evo-vs-title">
	<h2 id="rbu-evo-vs-title">EVO or RaceBox?</h2>
	<div class="rbu-evo-wrap">
		<p class="rbu-evo-intro">Same windscreen-mounted shape and four-button controls. EVO moves to 25&nbsp;Hz GPS.</p>
		<div class="rbu-evo-table-scroll" role="region" aria-label="RaceBox and RaceBox EVO compared" tabindex="0">
			<table class="rbu-evo-table rbu-evo-vs">
				<thead><tr><th scope="col"><span class="rbu-sr">Feature</span></th><th scope="col">RaceBox</th><th scope="col">RaceBox EVO</th></tr></thead>
				<tbody><tr><th scope="row">GPS update rate</th><td>10&nbsp;Hz</td><td>25&nbsp;Hz</td></tr><tr><th scope="row">Battery</th><td>Up to 8 hours driving, Wi-Fi off</td><td>Larger, figure TBA</td></tr><tr><th scope="row">Storage</th><td>256 drag and 128 track sessions</td><td>More, figure TBA</td></tr><tr><th scope="row">Availability</th><td>{{racebox_dispatch_line}}</td><td>Pre-order, ships March&nbsp;2027</td></tr></tbody>
			</table>
		</div>
		<p class="rbu-evo-link-row"><a class="rbu-evo-more rbu-focus" href="/products/racebox#evo-vs-racebox">See EVO and RaceBox side by side</a></p>
	</div>
</section>
<!-- rb-updates: 10 evo-page -->
<section class="rbu-evo-band rbu-evo-band--pink" aria-labelledby="rbu-evo-specs-title">
	<h2 id="rbu-evo-specs-title">Specifications</h2>
	<div class="rbu-evo-wrap">
		<table class="rbu-evo-table rbu-evo-specs">
			<caption class="rbu-sr">RaceBox EVO specifications</caption>
			<tbody><tr><th scope="row">Display</th><td>Colour screen. Size and resolution <span class="rbu-evo-tba">TBA</span></td></tr><tr><th scope="row">GNSS update rate</th><td>25&nbsp;Hz</td></tr><tr><th scope="row">Standalone use</th><td>Yes: on-device lap timer, drag meter and history</td></tr><tr><th scope="row">Battery</th><td>Larger than the original RaceBox. Final figure <span class="rbu-evo-tba">TBA</span></td></tr><tr><th scope="row">Storage</th><td>Larger than the original RaceBox. Final figure <span class="rbu-evo-tba">TBA</span></td></tr><tr><th scope="row">App</th><td>RaceBox app for iOS and Android</td></tr><tr><th scope="row">App connection</th><td><span class="rbu-evo-tba">TBA</span></td></tr><tr><th scope="row">Third-party apps</th><td><span class="rbu-evo-tba">TBA</span></td></tr><tr><th scope="row">Accessory fit</th><td><span class="rbu-evo-tba">TBA</span>, confirmed before shipping</td></tr><tr><th scope="row">Ships</th><td>March&nbsp;2027</td></tr></tbody>
		</table>
		<p class="rbu-evo-small">Figures marked TBA are confirmed before EVO ships. For the current RaceBox, see its <a href="/products/racebox/tech-specs">technical specifications</a>.</p>
	</div>
</section>
<!-- rb-updates: 10 evo-page -->
<section class="rbu-evo-band" aria-labelledby="rbu-evo-faq-title">
	<h2 id="rbu-evo-faq-title">Pre-order questions</h2>
	<div class="rbu-evo-wrap rbu-evo-faq"><details class="rbu-evo-faq-item" open><summary>When does RaceBox EVO ship?</summary><p>March&nbsp;2027. You can cancel any time before it ships for a full refund.</p></details><details class="rbu-evo-faq-item"><summary>Will I be charged now?</summary><p>Yes. Pre-orders are paid in full at checkout, at the pre-order price.</p></details><details class="rbu-evo-faq-item"><summary>Can I cancel my pre-order?</summary><p>Yes, any time before it ships, for a full refund of everything you paid. Contact us with your order number. After delivery you still have 14 days to change your mind.</p></details><details class="rbu-evo-faq-item"><summary>Will you keep me updated while I wait?</summary><p>Yes. We email production updates while you wait. If the ship date moves, we email you the new date before the old one passes: keep your place or cancel for a full refund.</p></details><details class="rbu-evo-faq-item"><summary>Should I wait for EVO or buy the RaceBox now?</summary><p>If you want it before March&nbsp;2027, the RaceBox ships now, with the same shape and controls at 10&nbsp;Hz. EVO adds 25&nbsp;Hz GPS, a larger battery and more storage. On a motorcycle, the Mini S is the better fit: EVO is built for cars.</p></details><details class="rbu-evo-faq-item"><summary>Will my RaceBox accessories fit EVO?</summary><p>EVO has the same shape as the original RaceBox. Which accessories fit is confirmed before it ships.</p></details><details class="rbu-evo-faq-item"><summary>What will EVO cost after pre-order?</summary><p>449 (USD or EUR) once pre-orders close. Pre-orders pay 339.</p></details></div>
</section>
<!-- rb-updates: 10 evo-page -->
<section class="rbu-evo-band rbu-evo-band--mist" aria-labelledby="rbu-evo-sooner-title">
	<h2 id="rbu-evo-sooner-title">Need it sooner?</h2>
	<div class="rbu-evo-wrap rbu-evo-sooner">
		<div class="rbu-evo-sooner-main">
			<img src="/product-image/racebox.png" width="200" height="200" loading="lazy" alt="" />
			<div>
				<h3>RaceBox ships now</h3>
				<p>If you want it before March&nbsp;2027, the RaceBox ships now, with the same shape and controls at 10&nbsp;Hz.</p>
				<p class="rbu-evo-rb-price">{{racebox_price}}</p>
				<a class="rbu-btn rbu-btn--ghost rbu-evo-sooner-btn" href="/products/racebox">See the RaceBox</a>
			</div>
		</div>
		<div class="rbu-evo-sooner-side">
			<h3>On a motorcycle?</h3>
			<p>EVO is built for cars. On a motorcycle, the Mini&nbsp;S is the better fit.</p>
			<a class="rbu-evo-more rbu-focus" href="/products/racebox-mini-s">See the RaceBox Mini S</a>
		</div>
	</div>
</section>
<!-- rb-updates: 10 evo-page -->
<div id="add-to-cart-popup" class="bottom-popup-element cart-icon rbu-evo-sticky" data-track-element-id="rbu-evo-buy">
	<div>
		<div class="left rbu-price-inline"><p class="rbu-price rbu-price--pre rbu-price--sm"><s class="rbu-price-later"><span class="rbu-sr">Price after pre-order: </span>{{evo_price_after}}</s> <strong class="rbu-price-now"><span class="rbu-sr">Pre-order price: </span>{{evo_preorder_price}}</strong></p></div>
		<div class="right">
			<form method="post" action="/store/add-to-cart" class="js-add-to-cart" data-sku="EVO_SKU" data-name="RaceBox EVO" data-price="{{evo_preorder_amount}}" data-currency="{{currency}}"><input type="hidden" name="product" value="EVO_PRODUCT_ID" /><button class="submit rbu-submit-pre">Pre-order</button></form>
		</div>
	</div>
</div>
<div class="js-track-product-view hidden" style="display: none;" data-product="{&quot;name&quot;:&quot;RaceBox EVO&quot;,&quot;sku&quot;:&quot;EVO_SKU&quot;,&quot;price&quot;:{{evo_preorder_amount}},&quot;currency&quot;:&quot;{{currency}}&quot;,&quot;googleCategory&quot;:&quot;Electronics &gt; GPS Tracking Devices&quot;}"></div>
```

Notes on the page:
- The first screen (desktop and phone) holds the name, tagline, price, the violet Pre-order button, the ship month and the key terms. The photo comes after it on phones.
- The price block (`.rbu-price`) is the shared one from 00 core. The struck price is labelled "after pre-order" in words and for screen readers. It must never read "was", "save" or "% off".
- `#add-to-cart-popup` is the live sticky bar. Like on every product page, main.css shows it on phones only. It tracks `#rbu-evo-buy` (the hero buy block).
- "See EVO and RaceBox side by side" links to `/products/racebox#evo-vs-racebox`. Change set 40 adds that table to the RaceBox page.
- Copy that is not in evo.json: "What's new" intro ("Two and a half times the update rate. Same RaceBox.": 25 Hz vs 10 Hz) and the EVO or RaceBox table. RaceBox figures in that table come from /products/racebox/tech-specs (battery "up to 8 hours driving with WiFi off", "256 drag sessions, 128 track sessions"). The RaceBox product page itself says 2000 mAh and 400 sessions; the tech-specs page says 2500 mAh and 256 + 128 sessions. I used the tech-specs page. Please fix whichever is wrong.

**Images.** Copy `assets/rb-updates/img/` (from `patches/10-evo-page/static/img/`):
- `evo-angle-400/800/1200.webp` and `evo-angle-800.png`: hero (current RaceBox cut-out, transparent)
- `evo-windscreen-640/1024/1600.webp` and `evo-windscreen-1024.jpg`: photo band
- `evo-card-200.png` and `evo-card-400.png`: store card (200 x 200, like the other card images)

All of them show the current RaceBox and are captioned or labelled that way. Replace them when EVO photos exist.

### 2. Store card (store listing template, /store/)

**Where.** First card in the "RaceBox Lap Timers and Drag Meters" list, right after `<div class="content products-list">`. Same markup as the other cards (`div > div.img > img, h3, ul.reddot, price, div.buttons`), so change set 60 (whole card is a link) treats it like the others. In the template this is either a fixed card before the product loop or the loop with a pre-order variant.

```html
<!-- rb-updates: 10 evo-page -->
<div class="rbu-card-evo">
	<div class="img"><img src="/assets/rb-updates/img/evo-card-200.png" srcset="/assets/rb-updates/img/evo-card-200.png 1x, /assets/rb-updates/img/evo-card-400.png 2x" width="200" height="200" alt="RaceBox EVO (photo: the current RaceBox, same shape)"/></div>
	<h3>RaceBox EVO</h3>
	<ul class="reddot">
	<li>25&nbsp;Hz GPS on a built-in colour screen</li><li>Completely standalone, no phone needed</li><li>Bigger battery and more storage</li><li>Same shape and controls as RaceBox</li>
	</ul>
	<div class="rbu-card-status"><span class="rbu-badge">Pre-order</span> Ships March&nbsp;2027</div>
	<p class="rbu-price rbu-price--pre rbu-price--sm"><s class="rbu-price-later"><span class="rbu-sr">Price after pre-order: </span>{{evo_price_after}}</s> <strong class="rbu-price-now"><span class="rbu-sr">Pre-order price: </span>{{evo_preorder_price}}</strong><span class="rbu-price-note">Pre-order price. {{evo_price_after}} after pre-order.</span></p>
	<div class="buttons">
		<a href="/products/racebox-evo" class="see-more">See More</a>
		<form method="post" action="/store/add-to-cart" class="js-add-to-cart" data-sku="EVO_SKU" data-name="RaceBox EVO" data-price="{{evo_preorder_amount}}" data-currency="{{currency}}"><input type="hidden" name="product" value="EVO_PRODUCT_ID" /><button class="submit rbu-submit-pre">Pre-order</button></form>
	</div>
</div>
```

The badge and ship month sit where other cards show "Limited Stock". The button is the live pill in violet (violet means pre-order, nothing else).

### 3. Menu and footer (site layout, every page)

Header menu: add the item right after "Racebox" in **both** lists (the flat list and the "Products" dropdown). On the EVO page give the link `class="current"`, like the other product pages.

```html
<li class="product-single"><a  href="/products/racebox-evo">Racebox EVO</a></li>
```

Footer, first column: right after `<li><a href="/products/racebox">RaceBox</a></li>`:

```html
<li><a href="/products/racebox-evo">RaceBox EVO</a></li>
```

With one more item, the flat desktop menu (shown from 1460 px) would wrap under the logo between 1460 and 1549 px. The CSS section "Header menu" tightens the item spacing between 1460 and 1599 px so it stays on one line.

### CSS and JS

`rb-updates.css`, section `10-evo-page/style.css`: page frame, hero, what's new, photo band, how pre-ordering works, tables, FAQ, need it sooner, the inline EVO price (`.rbu-price-inline`, also used by 20), sticky bar, violet pill button (`.rbu-submit-pre`), store card, header menu, phones. No JS: the FAQ is `<details>`, the sticky bar uses the live `bottom-popup-element.js`.

### Back end

1. Create the EVO product: name "RaceBox EVO", pre-order price 339 USD / 339 EUR, price after pre-order 449 USD / 449 EUR, flagged as pre-order (as the Mini S pre-order was). Put its SKU and id in place of `EVO_SKU` and `EVO_PRODUCT_ID`.
2. Checkout, order confirmation and order emails should say "Pre-order, ships March 2027" for this line.
3. The newsletter popup says the 10% code "does not apply to accessories or products in pre-order". Make sure the checkout enforces that for EVO.
4. Route `/products/racebox-evo` to the new template, and add it to the sitemap if there is one.
5. Pages must be served as UTF-8 (the live server already does: EU prices print "339.00 €").
6. When pre-orders close: change the price to 449, remove the struck price and the pre-order wording, and update the JSON-LD availability.

### How to test

- [ ] /products/racebox-evo opens; title, canonical and one `<h1>` ("RaceBox EVO").
- [ ] Desktop 1280 x 720 and phone 390 x 844: name, price (449 struck, 339, "Pre-order price. 449 after pre-order."), violet Pre-order button, "Ships March 2027" and the three key terms are visible without scrolling.
- [ ] Pre-order now adds EVO to the cart at 339 in the visitor currency; the cart and checkout say pre-order.
- [ ] EU visitor: every EVO price shows "339.00 €" and "449.00 €"; `data-currency="EUR"`.
- [ ] Phone: scroll past the hero; the sticky bar shows $339.00 / ~~$449.00~~ after pre-order and a violet PRE-ORDER button, with "Get 10% off!" above it, not on it.
- [ ] FAQ items open and close with mouse, Enter and Space.
- [ ] /store/: EVO is the first card, same layout as the others, violet PRE-ORDER button, badge "Pre-order Ships March 2027".
- [ ] Menu: "Racebox EVO" after "Racebox" in the flat list (wide desktop), in the Products dropdown (laptop) and in the phone menu; menu stays on one line at 1460-1600 px. Footer shows "RaceBox EVO".
- [ ] Google Rich Results Test on the page: Product with an Offer (PreOrder), no errors.
