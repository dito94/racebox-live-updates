## 20 EVO pre-order banner (every page)

**What and why.** A slim violet bar in the header tells every visitor that EVO pre-orders are open and links to the EVO page. One link, no popup, not dismissible.

**Where.** Site layout template, inside `<header>`, right after the shipping banner (`<div class="shipping-info-banner">...</div>`). On every page except the checkout (`/store/checkout`: nothing should pull a buyer away from paying) and the EVO page itself (`/products/racebox-evo`).

**Why under the shipping banner (and above the menu).**
- The shipping banner stays exactly where it is today, at the very top.
- The bar has a set height, so the menu and the page move down by a known amount. Nothing jumps after the page loads.
- An open phone menu still drops straight down from the menu bar, so the bar never covers it.
- The two notices read as one strip of announcements above the menu, as on most shops.

**HTML** (one line in the template):

```html
<!-- rb-updates: 20 evo-banner -->
<div class="rbu-evo-bar"><div class="rbu-evo-bar-in rbu-price-inline"><span class="rbu-evo-bar-lead"><strong><span class="rbu-evo-bar-brand">RaceBox </span>EVO</strong> pre-order:</span> <p class="rbu-price rbu-price--pre rbu-price--sm"><s class="rbu-price-later"><span class="rbu-sr">Price after pre-order: </span>{{evo_price_after}}</s> <strong class="rbu-price-now"><span class="rbu-sr">Pre-order price: </span>{{evo_preorder_price}}</strong></p><span class="rbu-evo-bar-tail"><span class="rbu-evo-bar-sep" aria-hidden="true"> &middot; </span><span>Ships March&nbsp;2027<span class="rbu-sr">.</span></span><span class="rbu-evo-bar-sep" aria-hidden="true"> &middot; </span><a class="rbu-evo-bar-link" href="/products/racebox-evo">Pre-order EVO</a></span></div></div>
```

**Server variables.** `{{evo_preorder_price}}` (`$339.00` / `339.00 €`) and `{{evo_price_after}}` (`$449.00` / `449.00 €`), formatted in the visitor's currency, the same values as on the EVO page (change set 10).

**What it looks like.**
- Desktop and tablet (768 px and up), one line: "**RaceBox EVO** pre-order: **$339.00** (~~$449.00~~ after pre-order) · Ships March 2027 · Pre-order EVO ›"
- Phones, two lines: "**EVO** pre-order: **$339.00** (~~$449.00~~ after pre-order)" / "Ships March 2027 · Pre-order EVO ›". "RaceBox" is kept for screen readers only.
- Below 360 px it takes three lines.

The price is the shared price block from 00 core. CSS shows it in its "inline" form (`.rbu-price-inline`, defined in change set 10): the pre-order price first, then the struck price followed by the words "after pre-order". Screen readers hear "Price after pre-order: $449.00, Pre-order price: $339.00". The struck price never stands alone as a "was" price.

The whole bar is clickable: the link's `::before` stretches over the bar. Keyboard focus outlines the whole bar.

**CSS** (`rb-updates.css`, section `20-evo-banner/style.css`; it needs section 10 for `.rbu-price-inline`):
- `--rbu-bar-h`: the bar height, 30 px (768 px and up), 40 px (phones), 56 px (below 360 px), 0 on windows less than 521 px tall.
- The bar sits at `top: 20px` (under the 20 px shipping banner).
- The live header offsets grow by `--rbu-bar-h`: `nav.top` from `top: 20px` to `calc(20px + var(--rbu-bar-h))`; `<main>` margin-top from 85 / 120 px to `calc(85px / 120px + var(--rbu-bar-h))`. Same `:has()` selectors as main.css uses today.
- Hidden on very short windows (phones held sideways, 200% zoom on a laptop), where the fixed header already takes a third of the screen, and in browsers without `:has()` (the header offsets need it, as the live ones do).
- No JS.

If you move other anchors below the fixed header (for example `scroll-margin-top` on `#buy-section` in change set 50), add `var(--rbu-bar-h)` to them.

**Back end.** None. If a country has no shipping banner, the bar still works (it moves to `top: 0`). Pages must be served as UTF-8 for the "€" sign (the live server already does).

**When pre-orders close.** Remove the bar (or change it to "RaceBox EVO is here", without the struck price).

### How to test

- [ ] Home, store, a product page, an info page: the bar is under the grey shipping banner, nothing overlaps; logo, menu, cart and the shipping text are all visible and clickable.
- [ ] Not on /store/checkout and not on /products/racebox-evo.
- [ ] Phone 390 x 844: two lines, "Ships March 2027 · Pre-order EVO ›" on the second line. Open the menu: all items, including "Racebox EVO" and "Buy RaceBox", are on screen.
- [ ] Desktop 1280 x 720 and 1920 x 1080: one line, centred.
- [ ] Click anywhere on the bar: /products/racebox-evo opens. Tab to it: the whole bar gets an outline.
- [ ] EU visitor: "339.00 € (449.00 € after pre-order)".
- [ ] Phone held sideways (844 x 390): no bar, header as today.
- [ ] Page load: the page under the header does not move after it appears (Lighthouse CLS unchanged).
