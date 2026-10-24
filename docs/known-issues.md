# racebox.pro quick updates: what was built, and what NOT to report

Integrated build: /home/user/racebox-redesign/live-site/patched, served at http://localhost:8901 (patched) and
http://localhost:8900 (original mirror, for before/after). Both servers are shared: never stop them. If you need your
own server use a port from your assigned range. Per-page diffs: live-site/diff/. Porting notes: live-site/patches/*/CTO.md.

## The owner's requests (the acceptance criteria)
1. /store/: each whole product card (image and name) links to its product page. -> 60-store-cards
2. Links apply discount codes automatically (?code=XXXX), so customers never type one. -> 80-discount-links
   (checkout with items can't be tested on the mirror: the cart is empty and POSTs get 501; P4's fixture and tests are in
   scratchpad/live-P4/ (tests/, checkout fixture). Test the saving part on any page: /store/?code=TEST10.)
3. Price and Add to cart in the first screen of every product page on desktop (>= 1001 px), decorative graphic moved
   down; phones unchanged by request. -> 50-pdp-first-screen
4. On the Mini page and the comparison (/products): "The Mini records only while your phone stays connected. The Mini S
   also records on its own." -> 70-mini-note
5. RaceBox EVO pre-order at 339 USD/EUR, 449 after pre-order, 449 struck next to 339 (labelled "after pre-order").
   -> 10-evo-page (/products/racebox-evo, store card first in the device list, menu + footer links)
6. Site-wide EVO pre-order banner linking to the EVO page (not on /store/checkout or the EVO page itself). -> 20-evo-banner
7. EVO vs RaceBox spec comparison on /products/racebox (#evo-vs-racebox), EVO column links to pre-order. -> 40-racebox-compare
8. EVO pre-order section on the home page, like the redesign. -> 30-home-evo
Shared: 00-core (rbu- tokens, .rbu-price, .rbu-btn pill buttons, RBU helpers). EVO facts: patches/evo.json only.

## Decisions already made (don't report as bugs)
- Mirror is the US view (USD). EVO SKU/product id are placeholders EVO_SKU / EVO_PRODUCT_ID for the CTO.
- Add to cart / Pre-order buttons POST to /store/add-to-cart -> 501 locally (no back end). Expected.
- The EVO table button on /products/racebox links to the EVO page (terms first) instead of adding to cart.
- RaceBox screen size and battery mAh left out of the comparison: the live pages disagree (2.4"/2000 mAh/400 sessions on
  the product page vs 2.5"/2500 mAh/256+128 sessions on tech-specs); owner question.
- The comparison table's "Standalone Device" row (Mini S = no) vs the owner's Mini note: owner question.
- Struck "Limited Time Offer" prices now visible in the desktop first screen (they existed in the buy section): owner question.
- Desktop home: the EVO section starts below the top photo; the site-wide bar carries EVO into the first screen.
- Banner hidden on windows under 521 px tall and in browsers without :has() (deliberate).
- All EVO photos are the current RaceBox, captioned/alt-texted per evo.json imageNote.
- Mini note appears in the desktop hero and next to the bottom price on the Mini page (twice on desktop): owner question.

## Pre-existing on the live site (identical on the original mirror): don't report unless a change made it worse
- 15 px horizontal overflow at 320 px (footer/header logo) on every page; 94 px overflow at 390 on Mini, Mini S, Micro.
- Random CLS from header photos/videos without width/height (/store/ about 0.17).
- Live red #ea2127 text/links/buttons at 4.43:1 (under AA) across the site; duplicate main landmarks; store h1->h3 order.
- /product-image/racebox-mini-package-contents.png?2 404 in the mirror; newsletter-subscribe-popup.js throws with
  storage blocked; checkout.js first sync posts to /store/undefined on an empty cart; no charset declared in the mirror
  (non-ASCII may look garbled locally; live sends UTF-8).
- Desktop flat menu wrapping at ~940 px (original too).
