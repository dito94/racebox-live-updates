## 00 Shared styles and script

Add two files to the site layout (every page):

- `assets/rb-updates/rb-updates.css`, loaded right after `main.css`
- `assets/rb-updates/rb-updates.js`, loaded with `defer` before `</body>`

They hold the styles and scripts for every change below; each change's part is marked with a comment. New class names start with `rbu-`. Some sections also restyle live elements on purpose: 20 (the header layout through `header:has(.rbu-evo-bar)` and the `<main>` offsets), 60 (`div.products-list > div` cards and their `.buttons`), 10, 40 and 50 (they undo main.css's `:target` rule for their own targets and add scroll margins or padding), 40 and 50 (`html { scroll-behavior: auto }` under reduced motion). The EVO price block (`.rbu-price`) is one component used everywhere the EVO price appears; render it from the same price values in the store back end.

**Where the files come from.** `tools/apply.py` builds them: it joins each change set's `style.css` and `script.js` in number order (00, 10 ... 80) into `assets/rb-updates/rb-updates.css` and `rb-updates.js`, copies each set's `static/` into `assets/rb-updates/`, and adds `?v=<hash>` to both links. Upload the built files from `live-site/patched/assets/rb-updates/`. Keep the section order: 20 uses `.rbu-price-inline` from 10, 50 uses `--rbu-bar-h` from 20, and 80 uses `RBU.store` from 00.

**Shared parts.** Tokens `--rbu-*`, `.rbu-price` (EVO price block), `.rbu-badge`, `.rbu-btn`, `.rbu-btn--pre`, `.rbu-btn--ghost` (pill buttons), `.rbu-sr` (screen-reader text), `.rbu-focus`; `window.RBU.store` (storage that never throws) and `RBU.ready`.

**Placeholders in the notes.** `{{name}}` is a value the server prints. `{% if %}` and `{% for %}` (change set 50) are template logic: write them as PHP `if` and `foreach`.

### How to test
- [ ] Home, /store/, a product page, an info page, /store/checkout and /products/racebox-evo: both files load (200) with this build's `?v=`.
- [ ] No new console errors on those pages.
- [ ] In the console, `RBU.store` and `RBU.ready` exist.
- [ ] Header, menu, footer and store cards look as before, apart from the EVO bar, the "Racebox EVO" menu item and the clickable store cards.
