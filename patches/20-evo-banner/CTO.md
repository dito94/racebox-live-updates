## 20 EVO pre-order banner (every page)

**What and why.** A slim violet bar in the header tells every visitor that EVO pre-orders are open and links to the EVO page. One link, no popup, not dismissible.

**Where.** Site layout template, as the **first child of `<header>`** (before `<nav class="top">`). On every page except the checkout (`/store/checkout`: nothing should pull a buyer away from paying) and the EVO page itself (`/products/racebox-evo`).

**On screen it sits under the shipping banner and above the menu.** In the HTML it comes first, so a keyboard user reaches it first, in the order it is drawn (it is above the logo). The CSS shows it second: shipping banner, bar, nav.
- The shipping banner stays exactly where it is today, at the very top.
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
- **The header is laid out in normal flow** when it holds the bar: `header:has(.rbu-evo-bar)` is a flex column, height auto. Shipping banner (`order: 1`, made `position: static`, as tall as its text), bar (`order: 2`), nav (`order: 3`, `top: 0`). Each part follows the real height of the one above. This matters when a visitor sets their own text spacing (WCAG 1.4.12, line height 1.5, letter spacing .12em, word spacing .16em): the bar and the shipping text grow, and the nav moves down with them instead of text overlapping text.
- `--rbu-bar-h` is the bar's **minimum** height (`min-height`), per width: 30 px with a mouse from 768 px up; 44 px on phones (up to 767 px) and on touch screens (`pointer: coarse`), so the link is a 44 px target there; 58 px below 360 px (three lines); 0 on windows less than 521 px tall. At normal spacing the bar is exactly that tall, so nothing shifts after load.
- Slim-bar exception: with a mouse at 768 px and wider the bar (and its link) is 30 px tall, under the 44 px rule for new controls. It passes WCAG 2.5.8 (24 px). A taller bar would stop being slim on desktop; touch screens get the 44 px bar.
- `<main>` keeps the live offsets plus the bar: `margin-top: calc(85px / 120px + var(--rbu-bar-h) + var(--rbu-hdr-grow, 0px))` (65 / 100 px with no shipping banner). Same `:has()` selectors as main.css uses today. With user text spacing, main moves down with the header (`--rbu-hdr-grow`).
- On desktop the floated logo would make the nav 3 px taller inside the flex header (98 px, not 95 px); `nav.top .logo { margin-bottom: -3px }` from 941 px keeps the live nav height. The nav is the same height as the live one at every width (checked 320 to 1920).
- The live `.android-app-link` strip (not on any page today) keeps its place under the nav (`order: 4`, `top: 10px`).
- Hidden on very short windows (phones held sideways, 200% zoom on a laptop: 640 x 360, 683 x 384, 720 x 450, 844 x 390), where the fixed header already takes a third of the screen, and in browsers without `:has()` (the header layout needs it, as the live offsets do). There the header is exactly the live one. Decision kept on purpose: a fixed 30 to 44 px bar on a 360 px tall window costs about a tenth of the screen, and the EVO page stays linked from the menu, footer and store. If the owner wants the bar there too, remove the two `max-height: 520px` rules and the `--rbu-bar-h: 0px` line; the menu rule in change set 10 follows `--rbu-bar-h` by itself.
- **JS** (`rb-updates.js`, section `20-evo-banner/script.js`, about 15 lines). A `ResizeObserver` on the header measures how much the bar and the shipping banner have grown past their normal heights (the bar's `min-height`, and the banner's 20 px) and sets `--rbu-hdr-grow` on `<html>`. At normal spacing it is `0`, so nothing shifts. With the visitor's own text spacing (WCAG 1.4.12) it is the extra height, so `<main>` and the anchor offsets follow the header instead of sitting under it. Without `ResizeObserver` the variable is not set and the CSS falls back to `0px`.
- Live `:target` / `.hash-target` offsets in main.css (169 / 90 / 205 px) get `+ var(--rbu-bar-h)` (and `+ var(--rbu-hdr-grow)`) on pages with the bar. main.css shifts every anchor target up by the old header height, so without this a linked heading lands under the taller header on phones and tablets (about 30 links in the user manual, and `/features#lap-timer`). The rules are in `style.css` right after the `<main>` offsets. Desktop and the `#buy-section` / EVO page anchors are not affected.
- The bar has `max-width: 100vw`. On pages whose content is wider than a phone (oversized images: the app logos on the Mini, Mini S and Micro pages and the photos on `/info/return-instructions`), phone browsers widen the fixed header to 484-596 px. Without the cap the bar's text would be centred partly off screen. Desktop is unaffected.
- Optional, owner's call because it is pre-existing: the same `max-width: 100vw` on `header:has(.rbu-evo-bar) > .shipping-info-banner` would also re-centre the live shipping text on those pages.

If you move other anchors below the fixed header (for example `scroll-margin-top` on `#buy-section` in change set 50), add `var(--rbu-bar-h)` to them. The EVO page has no bar, so it does not (its `scroll-padding-top` is in change set 10).

**Back end.** None. If a country has no shipping banner, the bar still works (it is simply the first thing in the header). Pages must be served as UTF-8 for the "€" sign (the live server already does).

**Known limit.** At 320 px the live shipping text ("Free shipping to United States for all orders over $300.00.") wraps to two lines. The banner now grows with it (before, the second line ran over the nav), so the header is about 17 px taller than `<main>` expects and covers the top of the page at that width. Fix it with a shorter shipping text, or add 17 px to the `<main>` offsets below 340 px. The same happens at normal phone widths for countries with long names: "Free shipping to Bosnia and Herzegovina for all orders over 300.00 €." wraps at 360 to 390 px, and "United Arab Emirates" at 360 and 375 px. The header is then 17 px taller than `<main>` expects (nav bottom 146 px, main top 129 px). Today that second line runs over the nav instead. A shorter shipping text for every country (for example "Free shipping over $300.00") fixes both.

**When pre-orders close.** Remove the bar (or change it to "RaceBox EVO is here", without the struck price).

### How to test

- [ ] Home, store, a product page, an info page: the bar is under the grey shipping banner, nothing overlaps; logo, menu, cart and the shipping text are all visible and clickable.
- [ ] Not on /store/checkout and not on /products/racebox-evo.
- [ ] Phone 390 x 844: two lines, "Ships March 2027 · Pre-order EVO ›" on the second line, bar 44 px tall. Open the menu: all items, including "Racebox EVO" and "Buy RaceBox", are on screen.
- [ ] Desktop 1280 x 720 and 1920 x 1080: one line, centred, 30 px tall.
- [ ] Click anywhere on the bar: /products/racebox-evo opens. Tab to it: the whole bar gets an outline.
- [ ] Press Tab once on /store/: the bar's "Pre-order EVO" link is the first stop, before the logo (390 and 1280 px wide).
- [ ] Text spacing (WCAG 1.4.12): on /store/ add `* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important } p { margin-bottom: 2em !important }` (bookmarklet or devtools) at 390, 768 and 1280 px wide. The shipping banner, the bar and the nav sit one under the other: no text over text, all the bar's text inside the bar. On /products at 390 and 1440, the "Pick your RaceBox" heading is fully visible below the header.
- [ ] EU visitor: "339.00 € (449.00 € after pre-order)".
- [ ] Phone held sideways (844 x 390): no bar, header as today. Open the menu: it scrolls and "Buy RaceBox" can be reached.
- [ ] Touch tablet (iPad 768 x 1024): bar is 44 px tall.
- [ ] Page load: the page under the header does not move after it appears (Lighthouse CLS unchanged).
- [ ] Phone 360 x 800 with the longest shipping text the server prints: the header does not cover the top of the page.
- [ ] Phone 360 x 640 and 390 x 844 on /products/racebox-mini, /products/racebox-micro, /products/racebox-mini-s and /info/return-instructions: the whole first line, including "after pre-order)", and the "Pre-order EVO" link are on screen.
- [ ] At 390 x 844 open /info/racebox-user-manual/settings#gps and /features#lap-timer; the heading shows just below the header.
