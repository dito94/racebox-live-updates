"""Test fixture: the built /store/checkout page with one item in the cart and the discount-code UI, reconstructed
from the selectors checkout.js (Cart, CartProduct, CartDiscountCodeForm, CheckoutForm) and main.css use. The live
page could not be captured with items (adding to cart is a POST). Not part of the patches.

Writes fixtures/checkout-items.html (no discount yet) and fixtures/checkout-has-discount.html (WELCOME5 applied)."""
import re, sys
site = sys.argv[1]
out = sys.argv[2]
html = open(site + '/store/checkout.html', encoding='utf-8').read()

def cart(applied):
    hid = '' if applied else ' hidden'
    btn_hid = ' hidden' if applied else ''
    return f'''<div class="cart">
			<h3>Your order</h3>
			<div class="product" data-product-sku="RB08">
				<div class="thumb"><img src="/product-image/racebox-mini-s.png" alt="RaceBox Mini S"></div>
				<h4>RaceBox Mini S</h4>
				<div class="price_row quantity-container"><span class="lbl">Quantity</span><span class="cnt"><button class="decrement" aria-label="One less">-</button><input type="text" value="1" aria-label="Quantity"><button class="increment" aria-label="One more">+</button></span></div>
				<div class="price_row"><span class="lbl">Price</span><span class="price regular-price strike">$319.00</span></div>
				<div class="price_row"><span class="lbl">Limited time offer</span><span class="price promotional-price">$289.00</span></div>
				<div class="price_row discount_code_row{hid}"><span class="lbl">Discount code <span>{'WELCOME5' if applied else ''}</span></span><span class="price">{'-$14.45' if applied else ''}</span></div>
				<div class="price_row discount{hid}"><span class="lbl">Discounted price</span><span class="price">{'$274.55' if applied else ''}</span></div>
				<div class="price_row volume_discount_row hidden"><span class="lbl">Volume discount</span><span class="price"></span></div>
				<div class="price_row total"><span class="lbl">Total</span><span class="price">{'$274.55' if applied else '$289.00'}</span></div>
			</div>
			<div class="price_row shipping_price hidden"><span class="lbl">Shipping</span><span class="price"></span></div>
			<p class="shipping_price_next_step_info">Shipping is calculated from your address.</p>
			<div class="price_row discount_code_row{hid}"><span class="lbl">Discount code applied<a href="#">Remove</a></span></div>
			<div class="discount_code_button{btn_hid}"><a href="#">I have a discount code</a></div>
			<div class="price_row cart_total"><span class="lbl">Total</span><span class="price">{'$274.55' if applied else '$289.00'}</span></div>
		</div>'''

FORM = '''<div class="form">
		<form id="checkout-form" method="post" action="/store/checkout/ajax">
			<h3>Shipping address</h3>
			<div id="shippingAddressFields">
				<div class="row"><select class="country-select" name="shippingCountry" aria-label="Country"><option value="US" selected>United States</option><option value="DE">Germany</option></select></div>
				<div class="row"><input type="text" id="inpShippingName" name="shippingName" required><label for="inpShippingName">Full name</label></div>
				<div class="row subregion-select shipping"><input type="text" id="inpShippingState" name="shippingState" autocomplete="address-level1" aria-label="State"></div>
				<div class="row"><input type="text" id="inpShippingZip" name="shippingZip"><label for="inpShippingZip">Postal code</label></div>
				<div class="row"><div class="phone-input"><input type="tel" id="inpShippingPhone" name="shippingPhone"><label for="inpShippingPhone">Phone</label></div></div>
			</div>
			<div class="row cbcontainer"><input type="checkbox" id="issueBusinessInvoiceCheckbox" name="businessInvoice"><label for="issueBusinessInvoiceCheckbox">I need a business invoice</label></div>
			<div><fieldset id="invoiceFields"><legend>Invoice</legend><div class="row"><select class="country-select" name="invoiceCountry" aria-label="Invoice country"><option value="US" selected>United States</option></select></div><div class="row subregion-select company"><input type="text" name="invoiceState" aria-label="Invoice state"></div></fieldset></div>
			<div id="shipping-data-container"></div>
			<div class="submit"><button class="submit">Proceed</button><span>Please wait</span></div>
		</form>
	</div>'''

MODALS = '''<div class="modal-container" id="discount-code-modal"><div><div class="header"><span class="close">&times;</span><h3>Discount code</h3></div><div class="contents"><form><div><input type="text" name="code" aria-label="Discount code"><button class="submit">Apply</button></div><div class="status"><span class="checking">Checking</span><span class="invalid">Invalid code</span><span class="accepted">Accepted</span></div></form></div></div></div>
<div class="modal-container" id="address-confirmation-modal"><div><p class="partialMatchSuggestion"></p><a href="#" class="back">Ok, let me double-check</a> <a href="#" class="confirm">I have checked, the address is correct</a></div></div>
<div class="modal-container" id="phone-confirmation-modal"><div><a href="#" class="back">Back</a> <a href="#" class="confirm">Confirm</a></div></div>
<div class="modal-container" id="destination-not-available-modal"><div><span class="close">&times;</span><p class="exclusivity-message"><span class="country"></span> <a class="distributor" href="#"></a></p><p class="destination-not-available-message"><span class="country"></span></p><a href="#" class="back">Back</a></div></div>
'''

for name, applied in (('checkout-items.html', False), ('checkout-has-discount.html', True)):
    h = re.sub(r'<div class="cart-empty">.*?</div>\s*</div>', lambda m: FORM + '\n\t\t' + cart(applied) + '\n\t</div>', html, count=1, flags=re.S)
    assert 'id="checkout-form"' in h, 'cart-empty block not found'
    h = h.replace('<div id="mini-cart" class="bottom-popup-element cart-icon">', '<div id="mini-cart" class="bottom-popup-element cart-icon"><div data-product-sku="RB08"><span class="quantity">1</span> x <span class="price">$289.00</span></div>', 1)
    h = h.replace('data-cart="{&quot;items&quot;:[],&quot;currency&quot;:&quot;USD&quot;,&quot;value&quot;:0}"', 'data-cart="{&quot;items&quot;:[{&quot;item_id&quot;:&quot;RB08&quot;,&quot;item_name&quot;:&quot;RaceBox Mini S&quot;,&quot;price&quot;:289,&quot;quantity&quot;:1}],&quot;currency&quot;:&quot;USD&quot;,&quot;value&quot;:289}"', 1)
    h = h.replace('</main>', MODALS + '</main>', 1)
    open(out + '/' + name, 'w', encoding='utf-8').write(h)
    print('wrote', name)
