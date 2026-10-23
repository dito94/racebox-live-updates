"""60 Store cards as links: the product name on every /store/ card becomes a link to the card's product page, and
its ::after stretches over the whole card (style.css), so a tap on the image, name, bullets or price opens the product.
See More and Add to cart stay as they are, above the stretched link.

Generic on purpose: every card that has a See More link gets the same treatment, including cards other change sets
insert (the EVO card). The link uses the See More href, so both always point to the same page.
"""
import re

import rbu

MARK = '<!-- rb-updates: 60 store-cards -->'

# A card's name heading. Attributes and inner markup (a badge, say) are kept as they are.
H3 = re.compile(r'<h3\b([^>]*)>(.*?)</h3>', re.S)
# The card's See More link, wherever class and href sit in the tag.
SEE_MORE = re.compile(r'<a\b[^>]*\bclass="(?:[^"]*\s)?see-more(?:\s[^"]*)?"[^>]*>')
HREF = re.compile(r'\bhref="([^"]+)"')
# Where the next card starts: its image block, or the next heading if a card has no image.
NEXT_CARD = re.compile(r'<div class="img">|<h3\b')
LIST = re.compile(r'<div class="content products-list">')


def link_cards(html, rel):
    see_more_total = len(SEE_MORE.findall(html))
    if not LIST.search(html) or see_more_total == 0:
        return html
    out, pos, linked = [], 0, 0
    for m in H3.finditer(html):
        # only headings inside a products list (the list starts before the heading)
        if not LIST.search(html, 0, m.start()):
            continue
        inner = m.group(2)
        if 'rbu-card-link' in inner:
            raise rbu.AnchorError(f'{rel}: card already linked: {inner[:60]!r}')
        nxt = NEXT_CARD.search(html, m.end())
        stop = nxt.start() if nxt else len(html)
        sm = SEE_MORE.search(html, m.end(), stop)
        if not sm:
            continue
        href = HREF.search(sm.group(0))
        if not href:
            raise rbu.AnchorError(f'{rel}: See More without href after {inner[:60]!r}')
        out.append(html[pos:m.start()])
        out.append(f'{MARK}<h3{m.group(1)}><a class="rbu-card-link" href="{href.group(1)}">{inner.strip()}</a></h3>')
        pos = m.end()
        linked += 1
    out.append(html[pos:])
    if linked != see_more_total:
        raise rbu.AnchorError(f'{rel}: linked {linked} card names but the page has {see_more_total} See More links')
    return ''.join(out)


def apply(site):
    # The store listing template: /store/ (and the two old URLs that redirect to it on the live site but were
    # mirrored as copies of it). The home page's cards are already <a> elements and are left alone.
    done = []
    for rel in site.pages():
        if not rel.startswith('store/') or not SEE_MORE.search(site.read(rel)):
            continue
        before = site.read(rel)
        site.edit(rel, link_cards)
        if site.read(rel) != before:
            done.append(rel)
    if 'store/index.html' not in done:
        raise rbu.AnchorError('60-store-cards: store/index.html has no linkable cards')
