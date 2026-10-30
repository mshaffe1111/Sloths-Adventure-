"""Pack cut figures into story atlases (shelves, tallest first) and write the WebP pages.

    from pack import pack
    pages, places = pack({key: rgba}, max_w=2048, max_h=4096, pad=2)   -> [RGBA page], {key: (page, x, y, w, h)}
"""
from PIL import Image


def pack(figs, max_w=2048, max_h=4096, pad=2):
    order = sorted(figs, key=lambda k: (-figs[k].height, -figs[k].width))
    pages, places = [], {}
    shelves = []  # per page: [y of the next shelf, current shelf y, shelf height, x]

    def new_page():
        pages.append([])
        shelves.append([0, 0, 0, 0])

    new_page()
    for k in order:
        im = figs[k]
        w, h = im.width + pad, im.height + pad
        p = len(pages) - 1
        st = shelves[p]
        if st[3] + w > max_w:  # next shelf
            st[1] += st[2]
            st[2], st[3] = 0, 0
        if st[1] + h > max_h:
            new_page()
            p = len(pages) - 1
            st = shelves[p]
        x, y = st[3], st[1]
        pages[p].append((k, x, y))
        places[k] = (p, x, y, im.width, im.height)
        st[3] += w
        st[2] = max(st[2], h)
    out = []
    for p, items in enumerate(pages):
        W = max(x + figs[k].width for k, x, y in items)
        H = max(y + figs[k].height for k, x, y in items)
        page = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        for k, x, y in items:
            page.alpha_composite(figs[k], (x, y))
        out.append(page)
    return out, places
