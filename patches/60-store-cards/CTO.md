## 60 Store cards as links

**What and why.** On /store/, a tap anywhere on a product card (photo, name, bullets, price) now opens the product page. Clarity: product images are 30.6% of mobile dead taps on /store/, and the cards already show a pointer cursor and a grey hover, but only "See More" and "Add to cart" did anything.

**Template.** The store listing template (/store/). The mirror also has /store/shipping and /store/duty-and-taxes, which redirect to /store/ on the live site; they are the same template. The home page cards are already `<a>` elements: no change there.

**HTML.** In the product card loop, wrap the name in a link. Use the same URL as the card's See More link.

Before:

```html
<h3>{{name}}</h3>
```

After (from the built page):

```html
<!-- rb-updates: 60 store-cards --><h3><a class="rbu-card-link" href="/products/sku/RB01">RaceBox</a></h3>
```

Template form: `<h3><a class="rbu-card-link" href="{{see_more_url}}">{{name}}</a></h3>`, where `{{see_more_url}}` is the href of `a.see-more` in the same card (today `/products/sku/{{sku}}`). Do it for every card in both lists, including the RaceBox EVO card (change set 10).

Nothing else in the card changes. See More and Add to cart stay exactly as they are.

**CSS.** `rb-updates.css`, section `60-store-cards/style.css`. How it works:
- The name link's `::after` stretches over the whole card (`position:absolute; inset:0`). The card is already `position:relative` in main.css.
- `.buttons` sits above it (`z-index:2`), so See More and Add to cart work as before.
- `.buttons::before` adds a safety margin around the two buttons: 8px above, 10px left and right, 16px below (the card has 20px padding at the bottom). It has `z-index:-1`, so it sits behind the buttons but above the stretched link. A tap that just misses a button does nothing, as on the original page, instead of opening the product. Taps further away (image, name, bullets, price) open the product.
- `isolation:isolate` on each card keeps the stretched link inside its card, under the fixed header and the "Get 10% off!" button.
- Hover: the existing grey card, the name underlined in brand red, the photo grows 5%. Keyboard focus: a 2px ink ring around the whole card. No photo motion with "reduce motion".

**Why one stretched link, not a link around image and name.** One link per card with a short, clear name ("RaceBox Mini"), no nested interactive elements, and no second tab stop for the photo. Tab order per card: name, See More, Add to cart. The whole card is clickable, which matches the pointer cursor and hover the card already has. Trade-off: card text can't be selected by dragging.

**Back end.** None.

**How to test**
- [ ] /store/ on a phone: tap a photo, a name, a bullet and a price on several cards. Each opens that product.
- [ ] Tap See More: opens the product. Tap Add to cart: adds to cart, does not open the product page.
- [ ] Tap the gap between See More and Add to cart: nothing happens (no accidental navigation next to the buttons).
- [ ] Tap about 6 px beside Add to cart, and about 10 px below it: nothing happens, you stay on /store/. Tap the price: the product opens.
- [ ] Desktop: hover a card. Grey card, red underline under the name, photo grows slightly.
- [ ] Keyboard: Tab through the store. Each card gives name, See More, Add to cart, with a visible ring on the card.
- [ ] Ctrl/Cmd+click and long-press on a photo: "open in new tab" works.
- [ ] RaceBox EVO card (first card): photo and name open /products/racebox-evo. Its Pre-order button still adds to cart.
- [ ] Scroll the store on a phone: the "Get 10% off!" button and the header stay clickable over the cards.
