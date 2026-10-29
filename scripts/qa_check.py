import re, sys, json

HTML = '/home/z/my-project/crystal-pop/index.html'
html = open(HTML, encoding='utf-8').read()

# 1) Extract inline script (the one without src=)
m = re.search(r'<script>\n(.*)\n</script>', html, re.S)
if not m:
    print('FAIL: inline script not found'); sys.exit(1)
js = m.group(1)
open('/home/z/my-project/scripts/game_extracted.js', 'w', encoding='utf-8').write(js)
print(f'JS extracted: {len(js)} chars, {js.count(chr(10))} lines')

# 2) Emoji / non-ascii scan (allow common safe chars)
allowed_extra = set('\u00b7\u2013\u2014\u00d7\u00e9\u00a0')
bad = []
for i, ch in enumerate(js):
    if ord(ch) > 127 and ch not in allowed_extra:
        bad.append((i, hex(ord(ch)), ch))
# scan whole html too for emoji ranges
emoji_re = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u2190-\u21FF]')
html_bad = emoji_re.findall(html)
print('Non-ascii in JS:', bad[:10] if bad else 'none (clean)')
print('Emoji-range chars in HTML:', html_bad if html_bad else 'none (clean)')

# 3) Basic structural checks
checks = {
    '</html>' in html: 'closing html tag',
    'telegram-web-app.js' in html: 'telegram sdk',
    'id="grid"' in html: 'grid element',
    'Crystal Pop!' in html: 'game title',
    html.count('class="slot"') == 3: '3 tray slots',
    'function placePiece' in js: 'placePiece fn',
    'function rotateTheme' in js: 'rotateTheme fn',
    'function burstAt' in js: 'burstAt fx fn',
    'initTelegram' in js: 'telegram init call',
}
ok = True
for k, v in checks.items():
    print(('PASS' if k else 'FAIL'), '-', v)
    ok = ok and bool(k)

# 4) brace balance sanity in JS
for a, b, name in [('{', '}', 'braces'), ('(', ')', 'parens'), ('[', ']', 'brackets')]:
    ca, cb = js.count(a), js.count(b)
    print(f'{name}: {ca} vs {cb}', 'OK' if ca == cb else 'MISMATCH')
    ok = ok and ca == cb

sys.exit(0 if ok else 2)
