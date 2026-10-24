# racebox.pro quick updates

Small updates to the live www.racebox.pro, to run until the full redesign launches (the redesign lives in its own
repo, `dito94/racebox-redesign`). The live site is server-rendered PHP, so this repo holds a copy of the public site
plus the changes as reproducible change sets, with porting notes the CTO follows to apply them in the real templates.

Start with **[CHANGES.md](CHANGES.md)**: what changes, the decisions that block release, back-end steps and porting order.

## What's here

| Path | What it is |
|---|---|
| `original/` | The public site as crawled on 23 Oct 2026 (US view, prices in USD), without the 75 MB of header videos |
| `patches/NN-name/` | One change set per folder: `change.py`, `style.css`, `script.js`, `static/`, and `CTO.md` (the porting notes) |
| `patches/evo.json` | Every RaceBox EVO fact the pages print (prices, ship window, specs, terms, FAQ) |
| `tools/apply.py` | Builds `original/` + `patches/` into `patched/` (git-ignored) and writes `diff/` |
| `diff/` | Unified diff per page, original vs patched |
| `tools/serve.py` | Serves a built copy with the site's real URLs (`/products/racebox`); POSTs answer 501 (no back end) |
| `tools/export_preview.py` | Makes a copy that opens from disk (relative links, preview label), optionally zipped |
| `tools/fetch-videos.sh` | Downloads the header videos into `original/` |
| `tools/qa/` | Browser checks (Playwright + axe): before/after review page, disk-copy check, discount-link checkout tests |
| `docs/BRIEF.md` | The working rules for anyone changing the change sets |
| `docs/known-issues.md` | Acceptance criteria, decisions already made, and live-site issues not to re-report |
| `HANDOFF.md` | Where the work stands and what to do next |

## Quick start

```sh
python3 tools/apply.py                 # build patched/ and diff/
python3 tools/serve.py patched 8901    # open http://localhost:8901/
python3 tools/serve.py original 8900   # the untouched copy, for comparison
python3 tools/export_preview.py --zip preview.zip   # a copy to send around (opens from disk)
cd tools/qa && npm install             # then: node before-after.js http://localhost:8900 http://localhost:8901 out.html
```

Python 3.10+ with no extra packages. The browser checks need Node 18+ and a Chromium (set its path in the scripts).
