# Handoff: racebox.pro quick updates

Moved out of `dito94/racebox-redesign` (folder `live-site/`, history kept) on 24 Oct 2026 so the two projects can be
worked on separately. Read this file, then `CHANGES.md`, `docs/BRIEF.md` and `docs/known-issues.md`.

## Where it stands

All eight requested changes are built, reviewed, tested and documented for the CTO. Nothing is live: the CTO ports
each change set into the PHP templates following its `patches/NN-name/CTO.md`.

| Change set | What it does |
|---|---|
| 00-core | Shared `rb-updates.css` / `rb-updates.js`, tokens, the EVO price block, pill buttons |
| 10-evo-page | New `/products/racebox-evo` pre-order page ("Need it sooner?" RaceBox card right after its hero); EVO card first in the store; "Racebox EVO" in menu and footer |
| 20-evo-banner | Slim EVO pre-order bar under the shipping banner (not on home, checkout or the EVO page) |
| 30-home-evo | The home page opens with a dark EVO pre-order hero in place of the large photo (all screen sizes) |
| 40-racebox-compare | "Can you wait?" section (pre-order EVO, same design as the EVO page's "Need it sooner?") at the top of `/products/racebox`; "RaceBox vs RaceBox EVO" table at `#evo-vs-racebox` |
| 50-pdp-first-screen | Desktop: name, photo, price and Add to cart first on every product page; device pages show one real-world photo beside the description instead of the header video, so no picture repeats; accessory pages hide the generic photo and the repeated intro. Phones unchanged |
| 60-store-cards | Whole store card image and name link to the product page |
| 70-mini-note | "The Mini records only while your phone stays connected. The Mini S also records on its own." on the Mini page and `/products` |
| 80-discount-links | `?code=XXXX` links save the code and apply it at checkout through the store's own `applyDiscountCode` |

Testing done: per-package review, then a full QA pass (functional, desktop and phone visuals, content and legal,
WCAG 2.2 AA with axe and keyboard, regression over all 48 pages, porting-notes check). Every finding was reproduced by a
second agent before it counted; all 30 confirmed findings were fixed or documented. A later layout check covered the v2
home hero and product-page flow. The discount links were tested against a rebuilt checkout page with a mocked cart
endpoint (42 scenarios in `tools/qa/discount-links/`), because the copy has no back end: test once more on staging.

## Waiting on the owner (details in CHANGES.md)

1. **Blocker:** the EVO pages promise "Cancel any time before it ships for a full refund"; the live T&C have no
   pre-dispatch cancellation and say shipping and payment fees aren't refundable. Change the T&C or `patches/evo.json`.
2. The struck 449 next to 339 (EU Omnibus "was" price risk); the safer option is the words "449 after pre-order" only.
3. The existing struck "Limited Time Offer" prices now sit in the desktop first screen.
4. RaceBox specs disagree between the product page and tech specs (2.4"/2000 mAh/400 sessions vs 2.5"/2500 mAh/256+128).
5. `/products` says the Mini S is not a "Standalone Device" next to the new Mini S sentence.
6. The site red #ea2127 is 4.42:1 for small text (just under AA) site-wide.

CTO back-end steps: create the EVO product (339/449 in USD and EUR) and replace `EVO_SKU` / `EVO_PRODUCT_ID`; mark it as
a pre-order in cart, emails and order pages; keep discount codes off pre-orders; check the `code`/`discount`/`coupon`/
`promo` parameter names; route the EVO page; upload `assets/rb-updates/`.

## How to work here

- Rules: `docs/BRIEF.md` (never edit `original/`; anchored edits through `tools/rbu.py`; facts only from the live pages
  and `patches/evo.json`; never POST to www.racebox.pro; WCAG 2.2 AA; check 390, 768, 1280x720, 1366x768, 1440x900,
  1920x1080).
- Build a change set in isolation: `python3 tools/apply.py --only 10,20 --out /tmp/x` (00 is always included).
- Hosted preview (owner's request, 24 Oct 2026): the `gh-pages` branch holds the disk preview made safe to host by
  `tools/export_pages.py` (trackers emptied, gtag removed, a CSP that blocks every other domain, noindex). Rebuild:
  `python3 tools/apply.py && python3 tools/export_preview.py --out /tmp/p && python3 tools/export_pages.py --src /tmp/p --out /tmp/pages`,
  then replace the `gh-pages` branch contents with `/tmp/pages`.
- Deliverables the owner liked: the before/after review page (`tools/qa/before-after.js`) and the zipped disk copy
  (`tools/export_preview.py --zip`). Don't host the copy at a shareable link: it is a full working copy of racebox.pro.
