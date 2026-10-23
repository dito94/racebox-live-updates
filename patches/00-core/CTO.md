## 00 Shared styles and script

Add two files to the site layout (every page):

- `assets/rb-updates/rb-updates.css`, loaded right after `main.css`
- `assets/rb-updates/rb-updates.js`, loaded with `defer` before `</body>`

They hold the styles and scripts for every change below; each change's part is marked with a comment. All new class names start with `rbu-`, so nothing in `main.css` is affected. The EVO price block (`.rbu-price`) is one component used everywhere the EVO price appears; render it from the same price values in the store back end.
