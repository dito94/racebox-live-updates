"""Unit test for 60-store-cards' generic card rewrite with a fake EVO card inserted first in the device list."""
import importlib.util, sys
LIVE = '/home/user/racebox-redesign/live-site'
sys.path.insert(0, LIVE + '/tools')
import rbu
spec = importlib.util.spec_from_file_location('c60', LIVE + '/patches/60-store-cards/change.py')
c60 = importlib.util.module_from_spec(spec); spec.loader.exec_module(c60)
html = open(LIVE + '/original/store/index.html', encoding='utf-8').read()
FAKE = '''<!-- rb-updates: 10 evo-page --><div class="rbu-evo-card">
				<div class="img"><img src="/product-image/racebox.png" alt="RaceBox EVO"/></div>
				<h3 class="rbu-evo-name">RaceBox EVO <span class="rbu-badge">Pre-order</span></h3>
                <ul class="reddot"><li>25 Hz GPS</li></ul>
				<div class="buttons">
					<a class="see-more rbu-see-more" href="/products/racebox-evo">See More</a>
					<form method="post" action="/store/add-to-cart" class="js-add-to-cart" data-sku="EVO_SKU"><button class="rbu-btn rbu-btn--pre">Pre-order</button></form>
				</div>
			</div>
'''
anchor = '<div class="content products-list">'
i = html.index(anchor) + len(anchor)
fake = html[:i] + '\n' + FAKE + html[i:]
out = c60.link_cards(fake, 'store/index.html')
n = out.count('class="rbu-card-link"')
assert n == 13, n
assert '<h3 class="rbu-evo-name"><a class="rbu-card-link" href="/products/racebox-evo">RaceBox EVO <span class="rbu-badge">Pre-order</span></a></h3>' in out
# first linked card is the EVO card
assert out.index('href="/products/racebox-evo">RaceBox EVO') < out.index('href="/products/sku/RB01">RaceBox<')
# running twice is refused loudly (no nested links)
try:
    c60.link_cards(out, 'store/index.html'); raise SystemExit('expected AnchorError on double apply')
except rbu.AnchorError as e:
    print('double apply refused:', e)
# a card whose See More moved out of its card (no h3 before it) makes the counts disagree -> loud failure
broken = fake.replace('<h3>RaceBox Mini</h3>', '<p>RaceBox Mini</p>')
try:
    c60.link_cards(broken, 'store/index.html'); raise SystemExit('expected AnchorError on mismatch')
except rbu.AnchorError as e:
    print('mismatch refused:', e)
print('OK: 13 cards linked, EVO first, badge kept inside the link')
