# Brief: quick updates to the live racebox.pro (Oct 2026)

The full redesign (racebox-redesign/) waits until the end of the year. Meanwhile the CTO can make small changes to the
live site, www.racebox.pro. The owner (RaceBox staff) asked for these changes and likes the redesign's look, so
borrow its layouts and components, adapted to the live site's fonts and colours.

## Where things are
- Repo: /home/user/racebox-redesign (branch main-hgkgoo). Live-site work: /home/user/racebox-redesign/live-site
  - original/  pristine mirror of the public site, crawled 23 Oct 2026 from the US (prices in USD). NEVER edit it.
  - patches/NN-name/  one folder per change set: change.py (def apply(site)), style.css, script.js, static/, CTO.md
  - patches/evo.json  the single source for every RaceBox EVO fact (prices, ship window, specs, terms, FAQ)
  - patches/00-core/  shared tokens (--rbu-*), .rbu-price (EVO price block), .rbu-badge, .rbu-btn(--pre/--ghost),
    .rbu-sr, window.RBU.store (storage that never throws), RBU.ready. Read it; don't edit it (report needs instead).
  - tools/rbu.py  helpers: insert_before/insert_after/replace/re_sub (exact anchors; they raise when the anchor count
    is wrong), page_currency(html), money(amount, cur) ('$399.00', '349.00 €'), evo(), evo_prices(cur),
    evo_price_html(cur, size='', note=True), Site (pages/read/write/edit/new_page). Don't edit tools/.
  - tools/apply.py  builds original + patches. ALWAYS build into your own folder:
    `python3 tools/apply.py --only 10,20 --out <your scratch dir>/site` (00-core is always included).
    Only the orchestrator builds live-site/patched.
  - tools/serve.py  `python3 tools/serve.py <site dir> <your port>` serves pretty URLs (/products/racebox ->
    products/racebox.html, /products/sku/RBxx -> 301). POSTs get 501 (no back end).
- Redesign (reference for look and copy): /home/user/racebox-redesign/racebox-redesign
  - buildlib/pages_shop.py: home() (hero EVO offer, line ~187), evo() and _evo_upgrade/_evo_how (EVO page, EVO vs
    RaceBox table), product_card(); buildlib/components.py; src/assets/css/site.css (token contract at the top)
  - src/data/products.json, faq.json, images.json; images in src/assets/img/ (EVO pages use the RaceBox cut-outs
    cut-racebox-angle/front/side, windshield-bmw, wing-racebox: check the files and their sizes there)
  - preview/*.html is the built redesign (evo.html, index.html) if you want to see it rendered.
- Live site facts: docs/research/site-inventory.md (structure), docs/research/clarity-findings.md (behaviour data).
- Live checkout bundle (read-only): live-site/original/assets/v-1776405836/js/store/checkout.js. The checkout page
  bootstraps `window.cart` (Cart) and `window.checkoutForm` (CheckoutForm) on DOMContentLoaded.

## How the live site is built
Server-rendered PHP templates behind Cloudflare, jQuery, one main.css (fonts RaceBox-Regular / RaceBox-Light; red
#ea2127; ink #2c2c2c; greys #f1f1f3 / #e4e4ec; mobile breakpoint max-width 1000px). Header: logo, cart icon,
hamburger menu (flat list + "Products" dropdown), "Buy RaceBox" button, then `div.shipping-info-banner`. Product pages
open with `section.top-banner` (header video or image), then intro, tech, box, testimonials, and the price and
"Add to cart" only at the bottom in `section.buy#buy-section`, plus a sticky `#add-to-cart-popup` driven by
bottom-popup-element.js. Add to cart is `form.js-add-to-cart` (action /store/add-to-cart, data-sku/name/price/
currency, hidden input product=<id>), handled by store-assets/js/analytics.js and the store scripts.

## Rules
1. Never edit original/, tools/ or another package's folder. Never send POST requests (or anything but plain GETs
   of public assets) to www.racebox.pro; test against your local server only. Block external requests in the
   browser (Google Tag Manager etc.): `ctx.route(u => !u.href.startsWith(base), r => r.abort())`.
2. Never invent facts: prices, specs, dates, reviews, ratings, stock, delivery times, policies. EVO facts only from
   patches/evo.json. RaceBox/Mini facts from the live pages (tech-specs pages first). Where the live site and the
   redesign disagree, use the live site and note it in your CTO.md.
3. EVO price (owner's decision): 339 USD/EUR pre-order, 449 USD/EUR after pre-order, with 449 struck through next to
   339. Always render it with rbu.evo_price_html (it labels the struck price "after pre-order" in words and for
   screen readers). Never "was", "save", "% off", "deal" or countdowns. EVO is "pre-order", ships March 2027.
   Pre-order buttons are violet (.rbu-btn--pre); violet is for pre-order only. No reviews/ratings in EVO JSON-LD;
   its Offer uses availability PreOrder and availabilityStarts from evo.json.
4. The EVO add-to-cart form uses the live pattern with placeholders the CTO fills: data-sku="EVO_SKU",
   hidden product="EVO_PRODUCT_ID", data-price="339", data-currency=<page currency>, data-name="RaceBox EVO".
5. Fit the live site: its fonts, red, greys, spacing and section rhythm; borrow the redesign's structure
   (layouts, hierarchy, copy patterns), not its fonts. The result must look like it belongs on racebox.pro and be
   a clear step up. UK spelling like the live site (colour, favourite).
6. Accessibility (WCAG 2.2 AA): contrast >= 4.5:1 for text, visible focus, targets >= 44x44 px for new controls,
   real links/buttons, alt text, sensible headings, works at 200% zoom, respects prefers-reduced-motion.
7. Every viewport must work, including the ones a change doesn't target: check at least 390x844 (phone),
   768x1024, 1280x720, 1366x768, 1440x900 and 1920x1080. No horizontal scroll, no overlap, no layout shift.
8. Changes are anchored edits (rbu helpers) so a moved anchor stops the build instead of failing silently.
   Keep the HTML you add simple and template-friendly: the CTO copies it into PHP templates. New classes start
   with rbu-. Put a comment `<!-- rb-updates: NN name -->` before each inserted block.
9. Pages are in USD in the mirror; an EU visitor gets EUR from the server. Use page_currency(html) and money().
10. Your CTO.md (one per change set): what changed and why (one line), which live template/page, the exact HTML
    to add (from the built page, with the server variables named, e.g. {{price}}), where it goes, the CSS/JS
    section names, back-end steps, and a "How to test" checklist. Plain, short sentences.
11. Don't commit. The orchestrator builds, integrates and commits.

## Testing toolkit
Node + playwright-core + axe-core in tools/qa
(run node from that folder or require with an absolute path). Chromium: /opt/pw-browsers/chromium-1194/chrome-linux/chrome.
Pages have a viewport meta. Before/after: serve original/ too (tools/serve.py original <port>) to compare.
Kill your servers when done: `pkill -f "serve.p[y] .* <port>"`.
