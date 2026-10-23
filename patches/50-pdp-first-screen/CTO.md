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
				{% for item in store_card_bullets %}<li>{{item}}</li>{% endfor %}
			</ul>
			<div class="rbu-pdp-buy">
				{% if limited_time_offer %}<p class="rbu-pdp-offer">{{offer_title}}</p>{% endif %}
				<div class="rbu-pdp-price-row">
					<p class="rbu-pdp-price">{% if limited_time_offer %}<s>{{price_was}}</s> {% endif %}<strong>{{price_now}}</strong></p>
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

Built example (RaceBox, US): `{{offer_title}}` = `Limited Time Offer`, `{{price_was}}` = `$509.00`, `{{price_now}}` = `$399.00`, `{{availability_warning}}` = `Limited Stock`, `{{sku}}` = `RB01`, `{{price}}` = `399`, `{{product_id}}` = `5fbcc249279fe9d96341a620`. Accessories have no offer: they show only `<strong>$20.00</strong>`, with no label and no struck price.

Notes:
- **Prices:** print exactly what the buy section prints, under the same condition. Show the struck price only when the buy section shows one.
- **Form:** the same form as the buy section, without `id="checkout-form"` (ids must be unique; that id only matters on the checkout page). `store-assets/js/analytics.js` binds every `form.js-add-to-cart`, so the hero sends the same `add_to_cart` event.
- **Out of stock:** if the buy section shows something other than the Add to cart form, show the same thing here. Never show a button the buy section doesn't have.
- **Bullets:** the hero prints the store card's full list (3 to 5 items). On three accessories the fifth item is the compatibility warning ("Not Compatible with RaceBox Mini"), so don't cut the list.
- **Image:** the store card image, `/product-image/*.png` (200 x 200, transparent). The Micro's card uses `racebox-micro-200.png`.
- **Heading:** the name is an `h1`, like every section title on these pages. It is hidden on phones, so the phone outline is unchanged.

### 2. CSS

In `rb-updates.css`, section `50-pdp-first-screen/style.css`. It holds:
- the block's layout. It is hidden at `max-width: 1000px`, the site's own breakpoint.
- the button in `#e32026`. The live red `#ea2127` gives white text 4.4:1, under WCAG AA; `#e32026` looks the same and reaches 4.7:1.
- a fix for `#buy-section`. main.css has `:target { visibility: hidden; top: -169px }` for the old empty `<a id>` anchors. Without the fix, the link `#buy-section` would hide the whole buy section. The fix keeps it visible and adds `scroll-margin-top: 120px` (85px on phones), so the section stops under the fixed header.
- `scroll-behavior: auto` for visitors who prefer reduced motion.

**If the site-wide EVO banner goes inside the fixed header**, raise `#buy-section { scroll-margin-top }` by the banner's height (120px + 48px = 168px).

No JavaScript. The sticky `#add-to-cart-popup` needs no change: main.css already keeps it off-screen from 1000px up, so it never shows next to the hero. On phones it works as before.

### Back end

Nothing new. The template needs the store card's image and bullet list on the product page. They are the same product fields `/store/` prints.

### How to test

- [ ] Desktop 1280x720, 1366x768, 1440x900, 1920x1080, 1024x768: name, image, price and Add to cart are visible without scrolling, also with the 48px EVO banner. Measured here: the lowest button bottom is at 551px (Mini page, with banner).
- [ ] The video or photo shows right below the block. Phones (390 px) and tablets (768 px) look exactly as before; full-page screenshots were pixel-identical here.
- [ ] Prices match the buy section on every product page. Struck price only on RaceBox, Mini, Mini S and Micro. Test one EU country: `349.00 €` format, "Euro" in the note.
- [ ] Add to cart in the hero adds the product: it posts `product={{product_id}}` to `/store/add-to-cart`, and analytics records the same `add_to_cart` event as the bottom button.
- [ ] "Delivery, payment and returns" scrolls to the buy section and the section stays visible.
- [ ] "Switch country" in the hero opens the country picker.
- [ ] Tab from the top of the page: the hero's links and button get a visible focus ring.
- [ ] No horizontal scroll and no new console errors.
