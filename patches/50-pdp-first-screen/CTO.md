## 50 Price and Add to cart in the first screen of every product page (desktop)

**What and why:** on desktop, product pages opened with a full-screen video or photo; the price and Add to cart were only at the very bottom. A compact product block now opens the page (image, name, key points, price, Add to cart). The video or photo follows right below it. Phones are unchanged.

**Pages:** the 12 product pages: RaceBox, Mini, Mini S, Micro and the 8 accessory pages (both product templates). Not the EVO page, Mobile App or the protocol page.

### 1. Template: add one block at the top of `<main>`

Put it right after `<main>`, before `<section class="top-banner" ...>`. Don't move the top banner. The new block is hidden on phones, so on phones the banner stays first. On desktop the banner now simply comes second.

All values are ones the page already prints: the image and bullets from the product's store card (`/store/`), and the rest from the buy section (`section.buy#buy-section`). Use the same variables and the same conditions as those places.

```html
<!-- rb-updates: 50 pdp-first-screen -->
<section class="rbu-pdp" aria-labelledby="rbu-pdp-name">
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
					<form method="post" action="/store/add-to-cart" class="js-add-to-cart" data-sku="{{sku}}" data-name="{{product_name}}" data-price="{{price}}" data-currency="{{currency_code}}">
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

Device template (RaceBox, Mini, Mini S, Micro): `<h1 class="rbu-pdp-name" id="rbu-pdp-name">`. Accessory template: the same element as `<p class="rbu-pdp-name" id="rbu-pdp-name">{{product_name}}</p>`.

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

Built example (RaceBox, US): `{{offer_title}}` = `Limited Time Offer`, `{{price_was}}` = `$509.00`, `{{price_now}}` = `$399.00`, `{{availability_warning}}` = `Limited Stock`, `{{sku}}` = `RB01`, `{{price}}` = `399`, `{{product_id}}` = `5fbcc249279fe9d96341a620`. Accessories have no offer: they show only `<strong>$20.00</strong>`, with no label, no struck price and no hidden words.

Notes:
- **Prices:** print exactly what the buy section prints, under the same condition. Show the struck price only when the buy section shows one.
- **Hidden words (`rbu-sr`):** without them a screen reader reads "$249.00 $219.00" as two prices. With them it reads "Regular price $249.00 Offer price $219.00". The class `rbu-sr` is in the shared core CSS. Owner to confirm the wording: "was" is banned only for EVO, so "Regular price" and "Offer price" are fine, but the owner may prefer other words. The live buy section has the same bare pair of prices; the same two spans would fix it there too.
- **Form:** the same form as the buy section, without `id="checkout-form"` (ids must be unique; that id only matters on the checkout page). `store-assets/js/analytics.js` binds every `form.js-add-to-cart`, so the hero sends the same `add_to_cart` event.
- **Out of stock:** if the buy section shows something other than the Add to cart form, show the same thing here. Never show a button the buy section doesn't have.
- **Bullets (`hero_bullets`), 2 to 4 items:** the store card's bullets in card order, at most 4. If the card has a fifth bullet that is a fit warning ("Not Compatible with RaceBox Mini"), the warning stays and the last ordinary bullet goes: first three plus the warning. Four accessory cards have 5 bullets (the other 8 pages have 3 or 4 and show all of them):

  | Page | Left out of the hero (still on the store card) | Fifth bullet is a fit warning? |
  |---|---|---|
  | External GPS Antenna (RB04) | Supports GPS/GLONASS/SBAS | yes, kept |
  | Suction Cup (RB05) | Compatible with GoPro | yes, kept |
  | Spare Mini Accessories (RB03) | USB-C Water/Dust covers for extra protection | no |
  | Magnetic USB Cable (RB06) | Length - 1m (3.3ft) | no |

  Which four points to show on these pages is a content choice. The rule above is the default.
- **Image, accessory pages:** the store card image, `/product-image/*.png` (200 x 200, transparent). It is shown at 200 CSS px, its real size, so it stays sharp on 1x screens. On 2x screens it is soft; if the owner wants it sharper, export 400 x 400 files and add `srcset="... 400w"`.
- **Image, device pages (RaceBox, Mini, Mini S, Micro):** the 200 px store PNG would be soft in the large grey panel, so these four pages use the redesign's cut-outs (see the table above). The browser picks the 400, 800 or 1200 px webp for the screen. The PNG is only the fallback for browsers without webp. The image fills the panel (88% wide, at most 85% tall, `object-fit: contain`) and is placed inside it, so it never makes the block taller. Keep the `width` and `height` of the PNG on the `<img>`.
- **Phones and `sizes`:** the hero is hidden below 1001 px, but a browser still fetches the picture it picks. With `sizes="... 100vw"` a phone with a 3x screen fetched the 1200 px file (80 to 99 KB) for an image nobody sees. So `sizes` says `(min-width: 1001px) 400px, 1px`: a phone fetches only the smallest file (about 18 KB, measured at 1x and 3x). Keep the `1px`. Do not add `loading="lazy"`: on desktop the image is in the first screen.
- **Heading:** on RaceBox, Mini, Mini S and Micro the name is an `h1`, like every section title on these pages. On the 8 accessory pages the intro just below (`section.other-product-info`) already has `<h1>{{product_name}}</h1>`, so there the hero name is a `<p>` with the same class (same look). It still names the section. The hero is hidden on phones, so the phone outline is unchanged.
- **Accessory pages repeat their intro (owner question):** on the 8 accessory pages the intro section below the photo (`section.other-product-info`) shows the same image, name and bullets as the new block, so on desktop the product shows twice, about one screen apart. Phones are unaffected (the block is hidden there). Options: (a) keep it as is; (b) on desktop (min-width: 1001px), hide that section with `.rbu-pdp ~ .other-product-info { display: none; }` and show all of the card's bullets, plus the section's subtitle `<p class="text">`, in the block. Option (b) changes existing content, so it needs the owner's OK.

### 2. CSS

In `rb-updates.css`, section `50-pdp-first-screen/style.css`. It holds:
- the block's layout. It is hidden at `max-width: 1000px`, the site's own breakpoint.
- the image panel. On the four device pages (`rbu-pdp-media--cut`) the picture is placed inside the panel with `position: absolute` and `object-fit: contain`, so its size never changes the height of the block.
- the button in `#e32026`. The live red `#ea2127` gives white text 4.4:1, under WCAG AA; `#e32026` looks the same and reaches 4.7:1.
- a larger click area for "Switch country" in the block (44 px tall; it is a 15 px line of text). It is a pseudo-element, so nothing moves and the focus ring stays tight around the words.
- a fix for `#buy-section`. main.css has `:target { visibility: hidden; top: -169px }` for the old empty `<a id>` anchors. Without the fix, the link `#buy-section` would hide the whole buy section. The fix keeps it visible and adds a scroll margin so the section stops just under the fixed header.
- `scroll-behavior: auto` for visitors who prefer reduced motion.

**Scroll margin rule (always applies):** `#buy-section { scroll-margin-top: calc(120px + var(--rbu-bar-h, 0px)); }`, and `calc(90px + var(--rbu-bar-h, 0px))` at `max-width: 940px`. Change set 20 puts the EVO banner inside the fixed header and sets `--rbu-bar-h` (30 px with a mouse from 768 px, 44 px on phones and touch screens, 58 px below 360 px, 0 on windows 520 px tall or less). The `0px` fallback keeps the page right when set 20 is not applied. Any other anchor target under the fixed header needs the same `var(--rbu-bar-h, 0px)`.

No JavaScript. The sticky `#add-to-cart-popup` needs no change: main.css already keeps it off-screen from 1000px up, so it never shows next to the hero. On phones it works as before.

### Back end

Nothing new. The template needs the store card's image and bullet list on the product page. They are the same product fields `/store/` prints.

The bullet rule needs a way to find the fit warning: the build matches the bullet text (`not compatible` or `, not mini`, any letter case). In PHP use the same text match, or add a per-bullet "fit warning" flag in the store admin.

The four device pages also need the cut-out files uploaded (see "Image on the four device pages"). Nothing else is new.

### How to test

- [ ] Desktop 1280x720, 1366x768, 1440x900, 1920x1080, 1024x768: name, image, price and Add to cart are visible without scrolling, also with the EVO banner (30 px) and with a 48 px banner. Measured here with a 48 px banner: the lowest button bottom is at 551px (Mini page).
- [ ] The video or photo shows right below the block. Phones (390 px) and tablets (768 px) look exactly as before; full-page screenshots were pixel-identical here.
- [ ] Prices match the buy section on every product page. Struck price only on RaceBox, Mini, Mini S and Micro. Test one EU country: `349.00 €` format, "Euro" in the note.
- [ ] Screen reader (or the accessibility tree) on the Mini: the price reads "Regular price $249.00 Offer price $219.00". On an accessory it reads just the price.
- [ ] 2 to 4 key points on every page. The Suction Cup and the External GPS Antenna still show "Not Compatible with RaceBox Mini".
- [ ] Add to cart in the hero adds the product: it posts `product={{product_id}}` to `/store/add-to-cart`, and analytics records the same `add_to_cart` event as the bottom button.
- [ ] "Delivery, payment and returns" scrolls to the buy section and the section stays visible. With the EVO banner on, the section's top edge is below the whole header (no part of it hidden), at 1280x720 and 1366x768, on the Mini and on an accessory.
- [ ] "Switch country" in the hero opens the country picker, also when you click just above or below the words.
- [ ] Tab from the top of the page: the hero's links and button get a visible focus ring.
- [ ] Desktop, Magnetic USB Cable: the heading list matches today (the name once, then "Buy ... Now"). Desktop, Mini: one new h1 "RaceBox Mini" at the top.
- [ ] RaceBox, Mini, Mini S, Micro at 1280x720, 1440x900 and 1920x1080: the product photo is sharp (also on a 2x screen), sits inside the grey panel with an even margin, and is not cut off. The Add to cart button is at the same height as before the image change (RaceBox 455 px, Mini 533 px, Mini S and Micro 480 px at 1280x720 with the 30 px bar).
- [ ] No horizontal scroll and no new console errors.
