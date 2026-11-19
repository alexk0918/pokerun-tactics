"""Builds the dark theme for index.html.

Rewrites the <style> block once so that light surfaces, dark text and frame colours use CSS variables,
then writes the variable values for light (the original colours) and dark into a block between
/*THEME-VARS*/ markers. Run again after adding CSS: it only converts colours that are still literal hex.
Rules:
  - light plain backgrounds (#fff, pastels)     -> dark surfaces of the same hue
  - dark text colours                            -> light text of the same hue
  - light borders and inset frames               -> mid-dark lines
  - var(--ink) in borders/shadows                -> var(--edge) (stays dark in dark mode)
  - var(--paper) as a text colour                -> var(--cream) (always light)
  - gradients and saturated colours are left as they are; text on them keeps the original ink (var(--ink0))
"""
import re, colorsys, sys

PATH = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
src = open(PATH, encoding='utf-8').read()
a = src.index('<style>') + 7
b = src.index('</style>')
css = src[a:b]
css = re.sub(r'/\*THEME-VARS\*/.*?/\*END-THEME-VARS\*/\n?', '', css, flags=re.S)

def rgb(h):
    h = h.lstrip('#')
    if len(h) in (3, 4): h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)), (len(h) == 8)

def lum(c): return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]

def hexs(c): return '#' + ''.join('%02x' % max(0, min(255, round(v * 255))) for v in c)

def hls(c, L=None, S=None, neutral=(207 / 360, .4)):
    h, l, s = colorsys.rgb_to_hls(*c)
    if s < .08 or l > .97: h, s = neutral
    return h, l, s

def surface(c):
    h, l, s = hls(c)
    L = lum(c)
    return hexs(colorsys.hls_to_rgb(h, .13 + max(0, L - .86) / .14 * .07, min(s, .5) * .45 if s < .3 or l < .97 else .2))

def text(c):
    h, l, s = colorsys.rgb_to_hls(*c)
    return hexs(colorsys.hls_to_rgb(h, max(.74, 1 - l), min(s, .7)))

def line(c):
    h, l, s = hls(c)
    return hexs(colorsys.hls_to_rgb(h, .30, min(s, .4)))

VARS = {}
def var(kind, h, dark):
    name = '--%s%s' % (kind, h.lstrip('#').lower())
    VARS[name] = (h, dark)
    return 'var(%s)' % name

def pastel(c):
    h, l, s = colorsys.rgb_to_hls(*c)
    return l >= .86 and lum(c) >= LIGHT_SURF

def paleline(c):
    h, l, s = colorsys.rgb_to_hls(*c)
    return l >= .74 and s < .6 and lum(c) >= LIGHT_SURF

HEX = r'#[0-9a-fA-F]{3,8}\b'
LIGHT_SURF = .7

def conv_decl(prop, val, ctx):
    p = prop.strip().lower()
    grad = 'gradient(' in val or 'url(' in val
    def each(fn):
        return re.sub(HEX, lambda m: fn(m.group(0)), val)
    if p in ('color', '-webkit-text-stroke', '-webkit-text-stroke-color', 'fill', 'caret-color', 'text-decoration-color'):
        val = val.replace('var(--paper)', 'var(--cream)')
        def f(h):
            c, al = rgb(h)
            if al or len(h) not in (4, 7): return h
            return var('t', h, text(c)) if lum(c) < .42 else h
        return each(f)
    if p in ('background', 'background-color'):
        if grad:
            for h in re.findall(HEX, val):
                c, al = rgb(h)
                if not al and lum(c) > .45: ctx['lightbg'] = True
            if 'var(--gold)' in val: ctx['lightbg'] = True
            return val
        def f(h):
            c, al = rgb(h)
            if al or len(h) not in (4, 7): return h
            L = lum(c)
            if pastel(c): return var('b', h, surface(c))
            if L > .45: ctx['lightbg'] = True
            return h
        if 'var(--gold)' in val or 'var(--frame-lt)' in val: ctx['lightbg'] = True
        return each(f)
    if p.startswith('border') or p.startswith('outline') or p == 'box-shadow' or p == 'stroke':
        val = val.replace('var(--ink)', 'var(--edge)')
        if grad: return val
        def f(h):
            c, al = rgb(h)
            if al or len(h) not in (4, 7): return h
            return var('l', h, line(c)) if paleline(c) else h
        return each(f)
    if p == 'text-shadow':
        def f(h):
            c, al = rgb(h)
            if al or len(h) not in (4, 7): return h
            return var('s', h, '#0000') if lum(c) >= LIGHT_SURF else h
        return each(f)
    return val

def conv_rule(m):
    sel, body = m.group(1), m.group(2)
    if sel.strip().startswith('@') or re.match(r'\s*(from|to|\d+%)', sel.split(',')[-1]): return m.group(0)
    ctx = {}
    parts = re.split(r';(?![^(]*\))', body)
    out = []
    for d in parts:
        if ':' not in d: out.append(d); continue
        k, v = d.split(':', 1)
        out.append(k + ':' + conv_decl(k, v, ctx))
    body = ';'.join(out)
    if ctx.get('lightbg'):
        body = re.sub(r'(^|;)(\s*color\s*:\s*)var\(--ink\)', r'\1\2var(--ink0)', body)
        body = re.sub(r'(^|;)(\s*color\s*:\s*)var\(--muted\)', r'\1\2var(--muted0)', body)
    return sel + '{' + body + '}'

# innermost rules only (selectors inside @media are handled the same way); skip the :root block
head, sep, rest = css.partition('}')  # :root{...} is first
root_block = head + sep
rest = re.sub(r'([^{}]+)\{([^{}]*)\}', conv_rule, rest)
css = root_block + rest

# merge with variables from earlier runs so re-runs keep them
light = ''.join('  %s:%s;\n' % (k, v[0]) for k, v in sorted(VARS.items()))
dark = ''.join('  %s:%s;\n' % (k, v[1]) for k, v in sorted(VARS.items()))
block = ('/*THEME-VARS*/\n:root{\n' + light + '}\n'
         ':root[data-theme="dark"]{\n  --paper:#1b2630;--ink:#e8ede6;--edge:#070b0f;--muted:#a3b2bf;--frame:#4f7a9c;--frame-lt:#2c465a;color-scheme:dark;\n' + dark + '}\n'
         '/*END-THEME-VARS*/\n')
# place after the :root block
i = css.index('}') + 1
css = css[:i] + '\n' + block + css[i:]
open(PATH, 'w', encoding='utf-8').write(src[:a] + css + src[b:])
print(len(VARS), 'colour variables')
