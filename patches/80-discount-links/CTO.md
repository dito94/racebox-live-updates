## 80 Discount links

**What and why.** A link can carry a discount code, and checkout applies it by itself, so customers never type a code. Clarity: on mobile checkout "Apply" (the coupon button) is tapped more often than "Proceed" (345 vs 264).

**Templates.** None. Everything is in the two shared files from 00-core, which every page already loads:
- `rb-updates.js`, section `80-discount-links/script.js`
- `rb-updates.css`, section `80-discount-links/style.css`

### How marketing builds a link

Add `?code=XXXX` to any storefront page link (home, /store/, product pages, info pages):

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

### Parameter names: check before release

The script treats `code`, `discount`, `coupon` and `promo` as a discount code on every storefront page. Other links may already use one of these names for something else (a password-reset or confirmation link, a payment return, an order link, a partner link). The mirror has none of the account, payment or order pages, so this could not be checked here.

- **Ask the CTO to confirm** that no existing URL, including URLs in emails the back end sends, uses `code=`, `discount=`, `coupon=` or `promo=`.
- To be safe, the script ignores these paths and leaves their address bar alone: `/webapp/...`, `/api/...`, `/payment/...`, `/order/...`, `/orders/...`, `/store/payment/...`, `/store/pay/...`, `/store/order/...`, `/store/orders/...`, `/store/proforma/...`. The real payment and order paths are not known here. Check them and edit `EXCLUDED` at the top of the script.
- A value that is not a valid code (for example a long token with other characters, or one longer than 40 characters) is ignored, but its parameter is still removed from the address bar on storefront pages. That is another reason to keep these names off account links.

### What the visitor sees

A small dark notice with a Dismiss button. It is announced politely to screen readers and does not take focus. It never covers the page:

- **On /store/checkout** it sits in the page flow, at the top of the order summary under "Your order" (above the "Cart is empty" message when the cart is empty). It scrolls with the page, so it cannot hide the form, the cart or the "I have a discount code" link. It stays until dismissed or until the page is reloaded. On a phone the order summary is below the form, so a sighted visitor meets the notice when they scroll to their order. Screen reader users hear it at once.
- **On every other page** it is a toast under the header. It closes by itself: after 10 seconds for the "saved" message, after 20 seconds for the longer "Your discount code is XXXX" message (the countdown pauses while the toast is hovered or focused, or while the cookie banner or a dialog covers the page). Escape closes it from anywhere on the page. While it is shown, the browser keeps a focused element clear of it when it scrolls the element into view (`scroll-padding-top` on `<html>`, set by the script and removed again).

| When | Message | Saved code |
|---|---|---|
| Code arrives on a storefront page | Discount code XXXX saved. It's applied automatically at checkout. | kept |
| Checkout, cart has items, code accepted | Discount code XXXX applied. | cleared |
| Accepted but `discountApplies` is false | Discount code XXXX was added, but it doesn't apply to the items in your cart. | cleared |
| Code refused | Discount code XXXX couldn't be applied to this order. | cleared |
| The order already has another code | Your order already has a discount code, so XXXX wasn't added. | cleared |
| The order already has the same code | Discount code YYYY applied. (YYYY as the cart shows it) | cleared |
| No answer from the server, three tries | We couldn't apply discount code XXXX right now. We'll try again next time you open checkout, or you can enter it yourself. | kept |
| Storage blocked on the device | Your discount code is XXXX. Enter it at checkout. (20 s toast) | none |

Empty cart: nothing is posted, the code is kept for later, and the "saved" message shows (when the code came from the link). No answer from the server (aborted or HTTP error): two more tries, 1.5 s apart. Then the message above shows, the cart's `updating` class is removed, and the code stays saved for the next checkout visit. With storage blocked the last sentence is "You can enter it yourself." only.

### Decision for the owner: newsletter popup

The brief did not ask for any change to the "Get 10% OFF!" newsletter popup, so this change set leaves it alone. A visitor who arrives from the newsletter with a code can still get the popup 5 seconds later, which offers a second discount. If the owner wants it held, call `newsletterSubscribePopup.holdAutoShowTimer()` once on the visit where the code arrived (not for the whole 30 days), after `newsletter-subscribe-popup.js` has run. The "Get 10% off!" button would still open it. Ask the owner before adding this.

### How it uses the checkout (checkout.js)

It goes through the site's own code path, so the cart updates as if the customer had typed the code:
1. Waits for `window.cart` and `window.checkoutForm` (built on DOMContentLoaded).
2. Waits until the first `load` sync has finished: `#checkout-form` has no `loading` class and the submit button has no `loading` class. This matters: `CheckoutForm.postToServer` aborts any request in flight, so posting earlier would cancel the first sync.
3. Applies only when the cart has products and `.discount_code_button` is visible (no class `hidden`, so no discount yet).
4. Calls `window.cart.applyDiscountCode(code)`. That posts `{action: 'apply-discount-code', code}` to the form's action URL and updates the cart.
5. Reads `discountCodeAccepted` and `discountApplies` from the answer. `applyDiscountCode` answers `{accepted:false}` both for a refused code and for no answer; the script tells them apart by the cart's `updating` class (it is removed only when an answer arrived). After the last failed try it removes `updating` itself.
6. If a discount is already applied, it compares with the code shown in `.discount_code_row span.lbl span` and never replaces the customer's code.
7. The notice is added inside `main .cart` (the element checkout.js uses as its cart), after the first heading. checkout.js only changes text and classes inside the cart, so the notice stays. With no cart it goes before `section.checkout .layout`. If neither exists it falls back to the toast.

If any of these names change in the store package, update the script.

**Back end.** Nothing required. Two options for later:
- Accept `?code=` on the server as well (keep it in the session and apply it when the cart is built). That also covers browsers with storage blocked.
- Send an analytics event when a link code is applied. The order already reports the coupon (`trackSuccessfulCheckout` reads `items[0].discountCode.code`).

### Staging test plan (real checkout)

Use test codes from the store admin: one valid (10%), one invalid, one that does not apply to accessories or pre-orders.

- [ ] Open `/store/?code=VALID&utm_source=test`. Notice "saved" appears and closes after about 10 seconds. The address bar shows `/store/?utm_source=test`.
- [ ] Add a RaceBox Mini S to the cart, go to checkout. The code is applied without typing: notice "applied" in the order summary, discount row shown, total lowered, "I have a discount code" link hidden.
- [ ] In the network panel: one `load` request, then one `apply-discount-code` after it finished. Nothing marked "cancelled".
- [ ] Reload checkout: no second request, no notice (the saved code was cleared).
- [ ] Remove the code with the cart's own Remove link: it stays removed after a reload.
- [ ] Open `/store/checkout?code=INVALID` with items: notice "couldn't be applied" in the order summary, cart unchanged, "I have a discount code" link still works.
- [ ] **Refused code on a phone** (real phone or 390 px wide): scroll the whole page from top to bottom and back. The notice scrolls with the page and nothing is covered: not the form fields, not the Proceed button, not the discount link. Tab through the form: every focused field is visible.
- [ ] Same on a laptop (1280 px) and a tablet (768 px).
- [ ] Press Tab until Dismiss has focus, then Enter or Escape: the notice closes and focus goes back to where it came from.
- [ ] Cart with only an accessory, open `?code=VALID`: check which message shows and that the cart reads "Not Applicable". Tell the owner if the server refuses instead.
- [ ] Apply code A by hand, then open `/store/?code=B` and go to checkout: notice "already has a discount code", A still applied.
- [ ] Apply code A by hand, open `/store/checkout?code=a` (same code, other letter case): notice shows the code as the cart shows it, nothing is posted.
- [ ] Empty cart, open `/store/checkout?code=VALID`: notice "saved" above the "Cart is empty" message, no request posted. Add a product: applied on the next checkout load.
- [ ] Block the checkout request in dev tools (or switch the network off after the page loaded), then open `/store/checkout?code=VALID`: after three tries the notice says "We couldn't apply discount code ... right now", not "saved".
- [ ] Change the shipping country while the code is being applied: the code ends up applied (or saved for the next visit), never lost.
- [ ] EU visitor (cookie banner shown), open `/store/?code=VALID`: the toast is still there after you answer the banner.
- [ ] Toast on a phone, then Tab through the page while it is shown: a focused link is never left hidden behind it. Escape closes it from anywhere.
- [ ] Instagram and Facebook in-app browsers (half of /store/ traffic): link, add to cart, checkout.
- [ ] Safari with "Block all cookies": toast "Your discount code is XXXX. Enter it at checkout." stays about 20 seconds. No script errors from this change.
- [ ] **Existing links:** open a password-reset or confirmation link from a real account email, and a payment return link. Their parameters (even if named `code`) are untouched, no notice, no stored code. Also test every email the back end sends that contains a link with `code=`, `discount=`, `coupon=` or `promo=`.
- [ ] Place a test order with a link code: the order and analytics show the coupon.

### Seen while testing (not changed)

- Empty checkout: checkout.js still builds `CheckoutForm` without `#checkout-form`, so its first sync posts to `/store/undefined`.
- `newsletter-subscribe-popup.js` throws when storage is blocked (`typeof localStorage` throws), so the popup breaks in those browsers.
- The store hero `<img>` has no width and height. That causes an occasional layout shift of about 0.17 on load, on the original pages too (Clarity reports CLS 0.18).
- The notice in the order summary pushes the cart content down when it appears, about a second after load. That adds a layout shift of about 0.015 on a phone and 0.005 on a laptop (measured with the rebuilt checkout page). The checkout page already shifts by about 0.055 on a phone without any code, from the header image and the "Proceed" button area loading.
- The mirror has no back end, so the checkout tests used a page rebuilt from the selectors checkout.js uses and a mocked cart endpoint. The staging run above is the real check.
