## 70 Mini note: the Mini records only while the phone is connected

**What and why:** buyers mix up the Mini and Mini S. The owner's sentence now sits where people choose: next to the Mini's price and in the comparison table.

> The Mini records only while your phone stays connected. The Mini S also records on its own.

"Mini S" links to `/products/racebox-mini-s`. `Mini&nbsp;S` keeps the name on one line. Styling: a calm grey or white panel with a small "i", not an alert.

### 1. Mini product page (`/products/racebox-mini`): buy section

Show this only on the Mini (SKU RB02). Put it directly after the price line, `<p class="limited-time-offer price">Get RaceBox Mini now for ...</p>`, before the stock note and the Add to cart form. Phones and desktop both see it.

```html
<!-- rb-updates: 70 mini-note -->
<p class="rbu-note rbu-note--buy">The Mini records only while your phone stays connected. The <a href="/products/racebox-mini-s">Mini&nbsp;S</a> also records on its own.</p>
```

### 2. Mini product page: desktop product block (change set 50)

In the new top block, only for the Mini, put it between the key points list and `<div class="rbu-pdp-buy">`:

```html
<!-- rb-updates: 70 mini-note -->
<p class="rbu-note rbu-note--pdp">The Mini records only while your phone stays connected. The <a href="/products/racebox-mini-s">Mini&nbsp;S</a> also records on its own.</p>
```

Phones see the note once (buy section). Desktop sees it in the top block and again next to the bottom price.

### 3. Comparison page (`/products`, "Pick your RaceBox")

Add one row directly after the "Built-in storage" row. Its note spans the Mini and Mini S columns, so it reads as a note on those two products and explains their storage ticks:

```html
<!-- rb-updates: 70 mini-note -->
<tr class="rbu-compare-note"><td>&nbsp;</td><td>&nbsp;</td><td colspan="2"><p class="rbu-note">The Mini records only while your phone stays connected. The <a href="/products/racebox-mini-s">Mini&nbsp;S</a> also records on its own.</p></td></tr>
```

If the table ever gets another product column after Mini S, add one more `<td>&nbsp;</td>` at the end of this row.

### CSS

In `rb-updates.css`, section `70-mini-note/style.css`:
- `.rbu-note`: the note style.
- `.rbu-note--buy`: a white panel on the buy section's grey, centred on desktop.
- `.rbu-note--pdp`: spacing inside the top block.
- `tr.rbu-compare-note`: the table row. Below 600px the icon is dropped to keep the narrow cell readable.

No JavaScript. No back-end change.

### How to test

- [ ] `/products/racebox-mini` on a phone: the note shows under the price, above "Limited Stock" and Add to cart.
- [ ] On desktop: the note also shows in the top block, above the price.
- [ ] The "Mini S" link opens the Mini S page.
- [ ] `/products` at 390 px, 768 px and 1280 px: the note sits under the Mini and Mini S columns, right below "Built-in storage". No horizontal scroll.
- [ ] Text contrast: ink `#2c2c2c` on `#f1f1f3` is 12.8:1, on white 14:1.
