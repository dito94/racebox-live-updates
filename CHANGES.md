# racebox.pro quick updates (October 2026)

Eight small changes to the live www.racebox.pro, to run until the full redesign launches at the end of the year. They
are built and tested on a copy of the live site. This file is the starting point for porting them into the real PHP
templates. Each change has its own detailed notes in `patches/NN-name/CTO.md`, with the exact HTML, CSS and JS, the
server variables to fill in, and a test checklist.

## What changes

| # | Change | Where | Notes |
|---|---|---|---|
| 00 | Shared styles and script: one CSS file and one JS file loaded on every page | site layout | [00-core](patches/00-core/CTO.md) |
| 10 | New RaceBox EVO pre-order page; EVO card first in the store; "Racebox EVO" in the menu and footer | `/products/racebox-evo`, `/store/`, layout | [10-evo-page](patches/10-evo-page/CTO.md) |
| 20 | Slim EVO pre-order bar under the shipping banner, linking to the EVO page | every page except home, checkout and the EVO page | [20-evo-banner](patches/20-evo-banner/CTO.md) |
| 30 | The home page opens with a dark EVO pre-order hero, in place of the large photo (all screen sizes) | `/` | [30-home-evo](patches/30-home-evo/CTO.md) |
| 40 | "RaceBox vs RaceBox EVO" spec comparison; the EVO column links to the pre-order page | `/products/racebox#evo-vs-racebox` | [40-racebox-compare](patches/40-racebox-compare/CTO.md) |
| 50 | Desktop (1001 px and wider): name, photo, price and Add to cart in the first screen of every product page. Device pages: the header video moves below the description, in place of the specs photo. Accessory pages: the generic photo and the repeated intro are hidden. Phones unchanged | 4 device pages + 8 accessory pages | [50-pdp-first-screen](patches/50-pdp-first-screen/CTO.md) |
| 60 | The whole image and name of each store card open the product page | `/store/` | [60-store-cards](patches/60-store-cards/CTO.md) |
| 70 | "The Mini records only while your phone stays connected. The Mini S also records on its own." | `/products/racebox-mini`, `/products` | [70-mini-note](patches/70-mini-note/CTO.md) |
| 80 | Links can carry a discount code (`?code=XXXX`); it is saved and entered at checkout automatically | every page, `/store/checkout` | [80-discount-links](patches/80-discount-links/CTO.md) |

EVO price on every page: **339** (USD or EUR) for pre-orders, with **449 struck through and labelled "after pre-order"**.
Ships March 2027. All EVO facts come from one file, [patches/evo.json](patches/evo.json).

## Before release: decisions and checks

**Blocker**
1. **Refund promise vs the Terms and Conditions.** The EVO page and the home section say "Cancel any time before it
   ships for a full refund". The live T&C have no cancellation before dispatch and say shipping and payment fees are
   not refundable. Either add a pre-order clause to the T&C or change `terms` and `faq` in `patches/evo.json`, and
   publish the two together (10 CTO.md, back end item 7).

**Owner decisions**
2. **Struck 449 next to 339 (EU price rules).** Under the Omnibus rules a struck price is read as a previous price,
   which must be the lowest price of the last 30 days; EVO has never sold at 449. The page labels it "after
   pre-order" in words, which lowers the risk but doesn't remove it. Safer option: drop the struck amount and keep
   the words "449 after pre-order" (a small change in `tools/rbu.py` `evo_price_html` and the 20 bar's CSS).
3. **"Limited Time Offer" struck prices** now appear in the desktop first screen of the device pages (they were
   already in the buy section). Same 30-day rule.
4. **RaceBox figures disagree on the live site:** product page 2.4" screen, 2000 mAh, 400 sessions; tech specs page
   2.5", 2500 mAh, 256 drag + 128 track sessions. The comparison leaves screen size and battery capacity out and uses
   the tech specs storage figure until you confirm.
5. **Mini S "Standalone Device: no"** in the `/products` table vs the new sentence "The Mini S also records on its
   own". Rename the row (e.g. "Screen and controls on the device") or keep it.
6. Smaller ones, each described in its CTO.md: the Mini note shows twice on desktop (top block and next to the
   price); EVO photos are the current RaceBox, captioned; the home page no longer shows its large top photo (the
   EVO hero replaces it; easy to bring back lower on the page).
7. **Site red for small text.** The live red #ea2127 is 4.42:1 against white, just under the WCAG AA 4.5:1 for small
   text, on every footer link and See More link. The new footer "RaceBox EVO" link and the EVO card's See More match
   their neighbours, so they inherit it. A site-wide fix is a slightly darker red for small text (#e32026 reaches
   4.7:1 and looks the same; the new buttons already use it).

**Back end (CTO)**
7. Create the EVO product (339 / 449, USD and EUR; other currencies need prices before they can show EVO) and put
   its SKU and id in place of `EVO_SKU` and `EVO_PRODUCT_ID`.
8. Mark EVO as a pre-order in the cart, order confirmation and emails ("Pre-order, ships March 2027").
9. Make sure discount codes, including link codes, don't apply to the EVO pre-order (the newsletter terms already
   say so).
10. Check the parameter names `code`, `discount`, `coupon` and `promo` aren't used by other links, and confirm the
    list of pages where the discount script must not read them (80 CTO.md).
11. Route `/products/racebox-evo`, add it to the sitemap, and upload `assets/rb-updates/` (built files).
12. Run each CTO.md "How to test" list on staging, especially the real checkout with a link code (80).

## How to port

1. Add the two tags from 00 to the site layout and upload `patched/assets/rb-updates/` (built by `tools/apply.py`).
2. Port 10 to 80 in number order. Each CTO.md shows the HTML exactly as built, with server values as `{{variables}}`.
   `diff/` has a unified diff per page (original vs patched) to check against.
3. Later CSS sections use parts of earlier ones (20 uses 10's `.rbu-price-inline`, 50 uses 20's `--rbu-bar-h`, 80
   uses 00's `RBU.store`), so keep the order.

## Folder

- `original/` the public site as crawled on 23 Oct 2026 from the US (prices in USD), without the header videos
  (`tools/fetch-videos.sh` downloads them).
- `patches/` the change sets and `evo.json`. `tools/apply.py` builds `original/` + `patches/` into `patched/` and
  writes `diff/`.
- `tools/serve.py patched 8900` serves the build with the site's real URLs (POSTs answer 501: there is no store back
  end). `tools/export_preview.py --zip preview.zip` makes a copy that opens from disk.

## Testing done

Each change set was built and reviewed by separate agents, then the integrated build went through functional,
visual (desktop, tablet, phone), content and legal, accessibility (WCAG 2.2 AA, axe-core plus keyboard), regression
(all 48 pages, 390 and 1440 px) and porting-notes checks. Every finding was reproduced by a second agent before it
counted; the 30 confirmed findings are fixed or, where they need a decision, listed above. The discount links were
tested against a rebuilt checkout page with a mocked cart endpoint (42 scenarios), because the copy has no back end;
test them once more on staging with the real checkout.
