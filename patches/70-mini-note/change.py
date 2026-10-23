"""70 mini-note: say plainly, where people choose between them, that the Mini records only with the phone connected.

One sentence, as the owner wrote it, with "Mini S" linking to the Mini S page:
  1. Mini product page: in the buy section next to the price (phones and desktop) and in the desktop product hero
     from change set 50, just above its price. Phones see it once, desktop sees it at the top and at the buy section.
  2. Comparison page (/products, "Pick your RaceBox"): a row under "Built-in storage" whose note spans the Mini and
     Mini S columns, so it reads as a note on those two products.
"""
import rbu

SENTENCE = ('The Mini records only while your phone stays connected. '
            'The <a href="/products/racebox-mini-s">Mini&nbsp;S</a> also records on its own.')
MARK = '<!-- rb-updates: 70 mini-note -->'


def note(indent='', extra=''):
    cls = 'rbu-note' + (f' {extra}' if extra else '')
    return f'{indent}{MARK}\n{indent}<p class="{cls}">{SENTENCE}</p>\n'


def mini(html, rel):
    # Buy section: right after the price line (the "Get RaceBox Mini now for ..." paragraph).
    html = rbu.re_sub(html, r'(<section class="buy" id="buy-section">.*?<p class="[^"]*\bprice">.*?</p>\n)',
                      lambda m: m.group(1) + note('\t\t\t', 'rbu-note--buy'), where=rel)
    # Desktop hero (change set 50), when it is there: between the key points and the price.
    if '<!-- rb-updates: 50 pdp-first-screen -->' in html:
        html = rbu.insert_before(html, '\t\t\t<div class="rbu-pdp-buy">', note('\t\t\t', 'rbu-note--pdp'), where=rel)
    return html


def compare(html, rel):
    row = ('\t\t\t\t' + MARK + '\n'
           '\t\t\t\t<tr class="rbu-compare-note"><td>&nbsp;</td><td>&nbsp;</td>'
           f'<td colspan="2"><p class="rbu-note">{SENTENCE}</p></td></tr>\n')
    anchor = ('<tr><td>Built-in storage</td><td><span class="yes">yes</span></td><td><span class="no">no</span></td>'
              '<td><span class="yes">yes</span></td></tr>\n')
    return rbu.insert_after(html, anchor, row, where=rel)


def apply(site):
    site.edit('products/racebox-mini.html', mini)
    site.edit('products.html', compare)
