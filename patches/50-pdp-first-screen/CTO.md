## 50 Price and Add to cart in the first screen of every product page (desktop)

**What and why:** on desktop, product pages opened with a full-screen video or photo; the price and Add to cart were only at the very bottom. A compact product block now opens the page (image, name, key points, price, Add to cart). The rest of the desktop page is calmer too (CSS only, see section 2):
- **Device pages:** the block, then the description, then the video or photo (cropped to a band), then the specs.
- **Accessory pages:** one block, then the delivery details. The generic photo and the intro that repeats the product are hidden.

Phones are unchanged.

**Pages:** the 12 product pages (both product templates). Not the EVO page, Mobile App or the protocol page.
- **Device pages**, section class `rbu-pdp--device`: RaceBox, Mini, Mini S, Micro.
- **Accessory pages**, section class `rbu-pdp--accessory`: External GPS Antenna, Magnetic USB Cable, Mini Hook'n'loop Tapes, RaceBox Carry Case, Micro Spare Cases, Mini / Mini S Carry Case, Suction Cup, Spare Mini Accessories.

### 1. Template: add one block at the top of `<main>`

Put it right after `<main>`, before `<section class="top-banner" ...>`. It must be a direct child of `<main>`: the CSS looks for `main:has(> .rbu-pdp--device)`. Don't move the top banner or any other section in the HTML. The new block is hidden on phones, so on phones the banner stays first. On desktop the order on screen comes from CSS (section 2).

The section has a modifier class: `rbu-pdp--device` in the device template, `rbu-pdp--accessory` in the accessory template. Each template prints its own, so no variable is needed. The CSS needs it.

All values are ones the page already prints: the image and bullets from the product's store card (`/store/`), and the rest from the buy section (`section.buy#buy-section`). Use the same variables and the same conditions as those places.

```html
<!-- rb-updates: 50 pdp-first-screen -->
<section class="rbu-pdp rbu-pdp--device" aria-labelledby="rbu-pdp-name">
	<div class="rbu-pdp-in">
		<div class="rbu-pdp-media"><img src="{{store_card_image}}" alt="{{product_name}}" width="200" height="200" /></div>
		<div class="rbu-pdp-body">
			<h1 class="rbu-pdp-name" id="rbu-pdp-name">{{product_name}}</h1>
			<ul class="reddot rbu-pdp-points">
				{% for item in hero_bullets %}<li>{{item}}</li>{% endfor %}
			</ul>
			<div class="rbu-pdp-buy">
				{% if limited_time_offer %}<p class="rbu-pdp-offer">{{offer_title}}</p>{% endif %}
				<div class="rbu-pdp-price-row">
					<p class="rbu-pdp-price">{% if limited_time_offer %}<s><span class="rbu-sr">Regular price </span>{{price_was}}</s> <strong><span class="rbu-sr">Offer price </span>{{price_now}}</strong>{% else %}<strong>{{price_now}}</strong>{% endif %}</p>
					{% if availability_warning %}<p class="rbu-pdp-stock">{{availability_warning}}</p>{% endif %}
				</div>
				<div class="rbu-pdp-actions">
					<form method="post" action="/store/add-to-cart" class="js-add-to-cart" data-sku="{{sku}}" data-name="{{product_name}}" data-price="{{price_raw}}" data-currency="{{currency}}">
						<input type="hidden" name="product" value="{{product_id}}" />
						<button class="submit">Add to cart</button>
					</form>
					<a class="rbu-pdp-more" href="#buy-section">Delivery, payment and returns</a>
				</div>
				<p class="rbu-pdp-note">The price is in <strong>{{currency_name}}</strong> and is valid for <strong>{{country_name}}</strong>. <a href="#" class="country-select-open-button" data-current-selected="{{country_code}}">Switch&nbsp;country</a></p>
			</div>
		</div>
	</div>
</section>
```

The name is an `h1` in both templates (see "Heading" in the notes).

Built example (RaceBox, US): `{{offer_title}}` = `Limited Time Offer`, `{{price_was}}` = `$509.00`, `{{price_now}}` = `$399.00`, `{{availability_warning}}` = `Limited Stock`, `{{sku}}` = `RB01`, `{{price_raw}}` = `399`, `{{currency}}` = `USD`, `{{product_id}}` = `5fbcc249279fe9d96341a620`. Accessories have no offer: they show only the price, for example `<strong>$10.00</strong>`, with no label, no struck price and no hidden words.

**Accessory template.** The same block, with three differences: the class `rbu-pdp--accessory`, a subtitle line under the name, and all of the card's points. The top of the block, built for the Magnetic USB Cable (US); from `<div class="rbu-pdp-buy">` on it is the same as above (no offer line, and no struck price):

```html
<section class="rbu-pdp rbu-pdp--accessory" aria-labelledby="rbu-pdp-name">
	<div class="rbu-pdp-in">
		<div class="rbu-pdp-media"><img src="/product-image/racebox-magnetic-usb-cable.png" alt="RaceBox Magnetic USB Cable" width="200" height="200" /></div>
		<div class="rbu-pdp-body">
			<h1 class="rbu-pdp-name" id="rbu-pdp-name">RaceBox Magnetic USB Cable</h1>
			<p class="rbu-pdp-sub">Replacement RaceBox Magnetic USB Cable</p>
			<ul class="reddot rbu-pdp-points">
				<li>Right angle USB Type-C</li>
				<li>Magnetic Quick Release</li>
				<li>High-quality brading</li>
				<li>LED power indicator</li>
				<li>Length - 1m (3.3ft)</li>
			</ul>
			<div class="rbu-pdp-buy">
```

In template terms: `<img src="{{store_card_image}}" alt="{{product_name}}" ...>`, `<p class="rbu-pdp-sub">{{intro_subtitle}}</p>`, and `{% for item in hero_bullets %}` over all of the card's points. `{{intro_subtitle}}` is the text of `<p class="text">` in the page's own `section.other-product-info` (here `Replacement RaceBox Magnetic USB Cable`).

Image on the four device pages (RaceBox, Mini, Mini S, Micro): replace the first line of the media block with the `<picture>` below. The accessory pages keep the `<img>` of the snippet above. Built example (RaceBox):

```html
<div class="rbu-pdp-media rbu-pdp-media--cut"><picture><source type="image/webp" srcset="/assets/rb-updates/img/pdp-racebox-400.webp 400w, /assets/rb-updates/img/pdp-racebox-800.webp 800w, /assets/rb-updates/img/pdp-racebox-1200.webp 1200w" sizes="(min-width: 1001px) 400px, 1px"><img src="/assets/rb-updates/img/pdp-racebox-800.png" width="800" height="463" alt="{{product_name}}" /></picture></div>
```

The files are in `patches/50-pdp-first-screen/static/img/`. Upload them to `/assets/rb-updates/img/`. They are the redesign's transparent cut-outs, so the CTO can upload them as they are:

| Page | Files (`pdp-<slug>-...`) | Width x height of the PNG | Source in the redesign |
|---|---|---|---|
| RaceBox | `pdp-racebox-400.webp`, `-800.webp`, `-1200.webp`, `-800.png` | 800 x 463 | `cut-racebox-angle` |
| Mini | `pdp-racebox-mini-400.webp`, `-800.webp`, `-1200.webp`, `-800.png` | 800 x 751 | `cut-mini-angle` |
| Mini S | `pdp-racebox-mini-s-400.webp`, `-800.webp`, `-800.png` | 800 x 759 | `cut-mini-s` |
| Micro | `pdp-racebox-micro-400.webp`, `-800.webp`, `-800.png` | 800 x 471 | `cut-micro-front` |

Notes:
- **Prices:** print exactly what the buy section prints, under the same condition. Show the struck price only when the buy section shows one.
- **Hidden words (`rbu-sr`):** without them a screen reader reads "$249.00 $219.00" as two prices. With them it reads "Regular price $249.00 Offer price $219.00". The class `rbu-sr` is in the shared core CSS. Owner to confirm the wording: "was" is banned only for EVO, so "Regular price" and "Offer price" are fine, but the owner may prefer other words. The live buy section has the same bare pair of prices; the same two spans would fix it there too.
- **Form:** the same form as the buy section, without `id="checkout-form"` (ids must be unique; that id only matters on the checkout page). `store-assets/js/analytics.js` binds every `form.js-add-to-cart`, so the hero sends the same `add_to_cart` event.
- **Out of stock:** if the buy section shows something other than the Add to cart form, show the same thing here. Never show a button the buy section doesn't have.
- **Bullets (`hero_bullets`):** the store card's bullets, in card order.
  - **Accessory pages: all of them.** The intro that also lists them is hidden on desktop, so the block must show the full list. Four accessory cards have five points (External GPS Antenna RB04, Suction Cup RB05, Spare Mini Accessories RB03, Magnetic USB Cable RB06); the other four have four. The two fit warnings ("Not Compatible with RaceBox Mini", on RB04 and RB05) always show.
  - **Device pages: at most 4.** If a card has a fifth bullet that is a fit warning, the warning stays and the last ordinary bullet goes (first three plus the warning). Today the four device cards have 3 or 4 points (RaceBox 3, Mini 3, Mini S 4, Micro 4), so nothing is cut. Keep the cap if you want the block to stay short.
- **Subtitle, accessory pages only:** `<p class="rbu-pdp-sub">` prints the same text as `<p class="text">` in the page's own `section.other-product-info` (for example "Replacement RaceBox Magnetic USB Cable"). The build reads it from that section and stops if it cannot find it. In PHP, print the same variable in both places, under the same condition. Device pages have no subtitle line.
- **Image, accessory pages:** the store card image, `/product-image/*.png` (200 x 200, transparent). It is shown at 200 CSS px, its real size, so it stays sharp on 1x screens. On 2x screens it is soft; if the owner wants it sharper, export 400 x 400 files and add `srcset="... 400w"`.
- **Image, device pages (RaceBox, Mini, Mini S, Micro):** the 200 px store PNG would be soft at this size, so these four pages use the redesign's cut-outs (see the table above). The browser picks the 400, 800 or 1200 px webp for the screen. The PNG is only the fallback for browsers without webp. On 1x screens the 400 px file is used, on 2x screens the 800 px file (both sharp); on 3x screens the 1200 px file where it exists (RaceBox, Mini), else the 800 px file. The image panel has no background (the photos are transparent cut-outs, so they sit straight on the white page). The image fills the panel (88% wide, at most 85% tall, `object-fit: contain`) and is placed inside it, so it never makes the block taller. Keep the `width` and `height` of the PNG on the `<img>`.
- **Phones and `sizes`:** the hero is hidden below 1001 px, but a browser still fetches the picture it picks. With `sizes="... 100vw"` a phone with a 3x screen fetched the 1200 px file (80 to 99 KB) for an image nobody sees. So `sizes` says `(min-width: 1001px) 400px, 1px`: a phone fetches only the smallest file (about 18 KB, measured at 1x and 3x). Keep the `1px`. Do not add `loading="lazy"`: on desktop the image is in the first screen.
- **Heading:** the name is an `h1` on all 12 pages, in both templates. Do not use a `<p>`. On the 8 accessory pages the intro just below (`section.other-product-info`) has `<h1>{{product_name}}</h1>` too, but only one of the two is ever displayed: the block's on desktop (the intro is `display: none` there, so it is out of the outline), the intro's on phones (the block is hidden). So the outline has one `h1` at every width.
- **Accessory pages: photo and intro hidden on desktop (done; was an owner question, option b).** On desktop the generic header photo (the same shot on all eight pages) and the intro section (it repeats the image, name and points of the block) are hidden, and the block carries the intro's subtitle and all of the points. The page reads: one block, then the delivery details. This hides existing content on desktop, so the owner should know. To undo it, delete the accessory rule (the `display: none` rule for `section.top-banner` and `section.other-product-info` under `main:has(> .rbu-pdp--accessory)`, and the `padding-bottom: 56px` line under it). The page then shows the block, the photo and the intro again; the block's subtitle and extra points can stay.

### 2. CSS

In `rb-updates.css`, section `50-pdp-first-screen/style.css`. It holds:
- the block's layout. It is hidden at `max-width: 1000px`, the site's own breakpoint.
- the image panel. On the four device pages (`rbu-pdp-media--cut`) the picture is placed inside the panel with `position: absolute` and `object-fit: contain`, so its size never changes the height of the block.
- the button in `#e32026`. The live red `#ea2127` gives white text 4.4:1, under WCAG AA; `#e32026` looks the same and reaches 4.7:1.
- a larger click area for "Switch country" in the block (44 px tall; it is a 15 px line of text). It is a pseudo-element, so nothing moves and the focus ring stays tight around the words.
- a fix for `#buy-section`. main.css has `:target { visibility: hidden; top: -169px }` for the old empty `<a id>` anchors. Without the fix, the link `#buy-section` would hide the whole buy section. The fix keeps it visible and adds a scroll margin so the section stops just under the fixed header.
- `scroll-behavior: auto` for visitors who prefer reduced motion.
- `.rbu-pdp-sub`, the accessory subtitle: 1 rem RaceBox-Light in the grey `--rbu-text-2` (8.6:1 on white), just under the name.
- the desktop page flow, in one `@media (min-width: 1001px)` block at the end of the file (next section).

**Desktop page flow** (CSS only, min-width 1001px). It needs the modifier class on the section and `:has()`. Everything is inside the media query, so phones and tablets (1000 px and narrower) are untouched.

Device pages (`main:has(> .rbu-pdp--device)`):
- `<main>` becomes a flex column. The block gets `order: -3`, `section.what-racebox-does` `order: -2`, `section.top-banner` `order: -1`. Every other section keeps `order: 0`, so it follows in HTML order (specs, comparison table, box contents, the rest).
- The video or photo in `section.top-banner` becomes a band: `display: block; width: 100%; height: min(72vh, 640px); max-height: none; object-fit: cover`. It is cropped, not squeezed.
- The photo that opens `section.tech-specs` (`.topimg`) is hidden, so two large pictures never sit back to back. `section.tech-specs` gets 72 px of top padding, so its heading has room under the video.
- Mini S and Micro: their description section draws the product photo again as a large decoration (main.css `.introducing-mini-s .with-s-bg::before` and `.what-is-racebox-micro .with-bg-image::before`). The product block just above already shows it, so it is hidden on desktop and the description reads like the RaceBox and Mini pages. It is absolutely placed, so nothing moves. Phones keep it.

Accessory pages (`main:has(> .rbu-pdp--accessory)`):
- `section.top-banner` (the same generic photo on all eight pages) and `section.other-product-info` (repeats the product) are `display: none`.
- `.rbu-pdp--accessory { padding-bottom: 56px; }` keeps the delivery details from sitting against the block.

Only the visual order changes. In the HTML the order stays: block, video, description, specs. The moved video has no focusable content (it has no controls), so keyboard and screen-reader order stay hero, description, specs. Browsers without `:has()` ignore these rules and keep today's order: block, video, description, specs (accessory pages: block, photo, intro). Nothing breaks there.

**Scroll margin rule (always applies):** `#buy-section { scroll-margin-top: calc(120px + var(--rbu-bar-h, 0px)); }`, and `calc(90px + var(--rbu-bar-h, 0px))` at `max-width: 940px`. Change set 20 puts the EVO banner inside the fixed header and sets `--rbu-bar-h` (30 px with a mouse from 768 px, 44 px on phones and touch screens, 58 px below 360 px, 0 on windows 520 px tall or less). The `0px` fallback keeps the page right when set 20 is not applied. Any other anchor target under the fixed header needs the same `var(--rbu-bar-h, 0px)`.

No JavaScript. The sticky `#add-to-cart-popup` needs no change: main.css already keeps it off-screen from 1000px up, so it never shows next to the hero. On phones it works as before.

### Back end

Nothing new. The template needs the store card's image and bullet list on the product page. They are the same product fields `/store/` prints. Accessory pages also need the intro's subtitle, which the page already prints in `section.other-product-info`.

The cap of four points on device pages needs a way to find the fit warning: the build matches the bullet text (`not compatible` or `, not mini`, any letter case). In PHP use the same text match, or add a per-bullet "fit warning" flag in the store admin. Today no device card has more than four points, and accessory pages show all points, so no page needs the rule right now.

The four device pages also need the cut-out files uploaded (see "Image on the four device pages"). Nothing else is new.

### How to test

- [ ] Desktop 1280x720, 1366x768, 1440x900, 1920x1080, 1024x768: name, image, price and Add to cart are visible without scrolling, also with the EVO banner (30 px) and with a 48 px banner. Check the four accessory pages with five points first (External GPS Antenna, Suction Cup, Spare Mini Accessories, Magnetic USB Cable): their block is the tallest now (subtitle and all points). On the Mini page the button bottom was at 551 px with a 48 px banner.
- [ ] Desktop 1440x900, RaceBox, Mini, Mini S and Micro: the order down the page is product block, description (the `what-racebox-does` section), video or photo, then the specs. The video is a cropped band, about 640 px tall at most (72 % of the window height on a shorter window). No second large photo sits between it and the specs; the specs heading has 72 px of space above it.
- [ ] Desktop 1440x900, any of the 8 accessory pages: one product block (name, subtitle, image, all of the card's points, price, Add to cart), then the delivery details straight after it. No generic photo, and no second copy of the name, image and points.
- [ ] Desktop 1440x900, Mini S and Micro: the product photo shows once, in the product block. The description below has no large product picture on its left, like the RaceBox and Mini pages. Phones still show it.
- [ ] Keyboard, desktop, a device page: Tab goes hero, description, specs, in that order (the video has nothing to focus). Screen reader: same order.
- [ ] Phones (390 px) and tablets (768 px), and 1000 px wide: look exactly as before (compare full-page screenshots). Device pages open with the video; accessory pages still show the photo and the intro. At 1001 px the new order starts.
- [ ] A browser without `:has()` (or switch the flow rules off in devtools): the pages look as before the flow change; the hero still works.
- [ ] Prices match the buy section on every product page. Struck price only on RaceBox, Mini, Mini S and Micro. Test one EU country: `349.00 €` format, "Euro" in the note.
- [ ] Screen reader (or the accessibility tree) on the Mini: the price reads "Regular price $249.00 Offer price $219.00". On an accessory it reads just the price.
- [ ] Key points: device pages show 3 or 4. Accessory pages show all of the card's points (4 or 5), also the Suction Cup and the External GPS Antenna with "Not Compatible with RaceBox Mini". The subtitle is under the name on accessory pages only.
- [ ] Add to cart in the hero adds the product: it posts `product={{product_id}}` to `/store/add-to-cart`, and analytics records the same `add_to_cart` event as the bottom button.
- [ ] "Delivery, payment and returns" scrolls to the buy section and the section stays visible. With the EVO banner on, the section's top edge is below the whole header (no part of it hidden), at 1280x720 and 1366x768, on the Mini and on an accessory.
- [ ] "Switch country" in the hero opens the country picker, also when you click just above or below the words.
- [ ] Tab from the top of the page: the hero's links and button get a visible focus ring.
- [ ] Desktop, Magnetic USB Cable: the heading list matches today (the name once, then "Buy ... Now"). Only one `h1` is displayed on an accessory page: the block's on desktop, the intro's on phones. Desktop, Mini: one new h1 "RaceBox Mini" at the top.
- [ ] RaceBox, Mini, Mini S, Micro at 1280x720, 1440x900 and 1920x1080: the product photo is sharp (also on a 2x screen), sits straight on the white page with no grey box around it, and is not cut off. The Add to cart button is at the same height as before the image change (RaceBox 455 px, Mini 533 px, Mini S and Micro 480 px at 1280x720 with the 30 px bar).
- [ ] No horizontal scroll and no new console errors.
