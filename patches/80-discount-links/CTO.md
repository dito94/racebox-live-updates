## 80 Discount links

**What and why.** A link can carry a discount code, and checkout applies it by itself, so customers never type a code. Clarity: on mobile checkout "Apply" (the coupon button) is tapped more often than "Proceed" (345 vs 264).

**Templates.** None. Everything is in the two shared files from 00-core, which every page already loads:
- `rb-updates.js`, section `80-discount-links/script.js`
- `rb-updates.css`, section `80-discount-links/style.css`

### How marketing builds a link

Add `?code=XXXX` to any page link:

```
https://www.racebox.pro/store/?code=XXXX
https://www.racebox.pro/products/racebox-mini-s?code=XXXX
https://www.racebox.pro/store/?code=XXXX&utm_source=newsletter&utm_medium=email&utm_campaign=autumn
```

- `discount=`, `coupon=` and `promo=` work too. If a link has several, the first valid one wins.
- A code is 2 to 40 characters: letters, digits, `-` and `_`. Anything else is ignored.
- Other parameters (utm_* and so on) and the `#anchor` stay in the address bar. Only the code is removed.
- The code is kept for 30 days on that device. A newer link replaces it.

**Newsletter.** The welcome email that sends the 10% code should link to the store with that code, for example a button "Shop with your 10% code" to `https://www.racebox.pro/store/?code={{code}}`. Every campaign email with a code should do the same.

### What the visitor sees

A small dark notice under the header, with a Dismiss button. It is announced politely to screen readers and does not take focus. It closes by itself after 10 seconds of being readable (not while hovered, focused, or behind the cookie banner or a dialog), except the last four messages below, which stay until dismissed.

| When | Message | Saved code |
|---|---|---|
| Code arrives on any page | Discount code XXXX saved. It's applied automatically at checkout. | kept |
| Checkout, cart has items, code accepted | Discount code XXXX applied. | cleared |
| Accepted but `discountApplies` is false | Discount code XXXX was added, but it doesn't apply to the items in your cart. | cleared |
| Code refused | Discount code XXXX couldn't be applied to this order. | cleared |
| The order already has another code | Your order already has a discount code, so XXXX wasn't added. | cleared |
| Storage blocked on the device | Your discount code is XXXX. Enter it at checkout. | none |

Empty cart: nothing is posted, the code is kept for later. No answer from the server (aborted or HTTP error): two more tries, 1.5 s apart, then the code stays saved for the next checkout visit.

While a code is saved, the newsletter popup does not open by itself after 5 seconds (it would offer a second discount). The "Get 10% off!" button still opens it. To drop this, remove `holdNewsletterPopup()` from the script.

### How it uses the checkout (checkout.js)

It goes through the site's own code path, so the cart updates as if the customer had typed the code:
1. Waits for `window.cart` and `window.checkoutForm` (built on DOMContentLoaded).
2. Waits until the first `load` sync has finished: `#checkout-form` has no `loading` class and the submit button has no `loading` class. This matters: `CheckoutForm.postToServer` aborts any request in flight, so posting earlier would cancel the first sync.
3. Applies only when the cart has products and `.discount_code_button` is visible (no class `hidden`, so no discount yet).
4. Calls `window.cart.applyDiscountCode(code)`. That posts `{action: 'apply-discount-code', code}` to the form's action URL and updates the cart.
5. Reads `discountCodeAccepted` and `discountApplies` from the answer. `applyDiscountCode` answers `{accepted:false}` both for a refused code and for no answer; the script tells them apart by the cart's `updating` class (it is removed only when an answer arrived).
6. If a discount is already applied, it compares with the code shown in `.discount_code_row span.lbl span` and never replaces the customer's code.

If any of these names change in the store package, update the script.

**Back end.** Nothing required. Two options for later:
- Accept `?code=` on the server as well (keep it in the session and apply it when the cart is built). That also covers browsers with storage blocked.
- Send an analytics event when a link code is applied. The order already reports the coupon (`trackSuccessfulCheckout` reads `items[0].discountCode.code`).

### Staging test plan (real checkout)

Use test codes from the store admin: one valid (10%), one invalid, one that does not apply to accessories or pre-orders.

- [ ] Open `/store/?code=VALID&utm_source=test`. Notice "saved" appears. The address bar shows `/store/?utm_source=test`.
- [ ] Add a RaceBox Mini S to the cart, go to checkout. The code is applied without typing: notice "applied", discount row shown, total lowered, "I have a discount code" link hidden.
- [ ] In the network panel: one `load` request, then one `apply-discount-code` after it finished. Nothing marked "cancelled".
- [ ] Reload checkout: no second request, no notice (the saved code was cleared).
- [ ] Remove the code with the cart's own Remove link: it stays removed after a reload.
- [ ] Open `/store/checkout?code=INVALID` with items: notice "couldn't be applied", cart unchanged.
- [ ] Cart with only an accessory, open `?code=VALID`: check which message shows and that the cart reads "Not Applicable". Tell the owner if the server refuses instead.
- [ ] Apply code A by hand, then open `/store/?code=B` and go to checkout: notice "already has a discount code", A still applied.
- [ ] Empty cart, open `/store/checkout?code=VALID`: notice "saved", no request posted. Add a product: applied on the next checkout load.
- [ ] Change the shipping country while the code is being applied: the code ends up applied (or saved for the next visit), never lost.
- [ ] EU visitor (cookie banner shown): the notice is still there after you answer the banner.
- [ ] Instagram and Facebook in-app browsers (half of /store/ traffic): link, add to cart, checkout.
- [ ] Safari with "Block all cookies": notice "Your discount code is XXXX. Enter it at checkout." No script errors from this change.
- [ ] Place a test order with a link code: the order and analytics show the coupon.
- [ ] Keyboard: Tab from the header reaches Dismiss; Escape closes the notice.

### Seen while testing (not changed)

- Empty checkout: checkout.js still builds `CheckoutForm` without `#checkout-form`, so its first sync posts to `/store/undefined`.
- `newsletter-subscribe-popup.js` throws when storage is blocked (`typeof localStorage` throws), so the popup breaks in those browsers.
- The store hero `<img>` has no width and height. That causes an occasional layout shift of about 0.17 on load, on the original pages too (Clarity reports CLS 0.18).
- The mirror has no back end, so the checkout tests used a page rebuilt from the selectors checkout.js uses and a mocked cart endpoint. The staging run above is the real check.
