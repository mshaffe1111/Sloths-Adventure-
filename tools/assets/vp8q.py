"""Read the quantizer a lossy WebP was encoded with (the VP8 key-frame header, RFC 6386 9.2-9.6), to tell what quality the shipped
files already are: libwebp's quality setting maps to these indices, so a file's index is compared with fresh encodes at known
qualities (calibrate()). Returns the mean y_ac_qi over the 4 segments (0 = finest, 127 = coarsest)."""
import struct


class Bool:
    def __init__(s, b):
        s.b, s.i = b, 2
        s.value = (b[0] << 8) | b[1]
        s.range, s.bits = 255, 0

    def bit(s, p=128):
        split = 1 + (((s.range - 1) * p) >> 8)
        S = split << 8
        if s.value >= S:
            r = 1; s.range -= split; s.value -= S
        else:
            r = 0; s.range = split
        while s.range < 128:
            s.value = (s.value << 1) & 0xFFFF
            s.range <<= 1
            s.bits += 1
            if s.bits == 8:
                s.bits = 0
                if s.i < len(s.b):
                    s.value |= s.b[s.i]
                s.i += 1
        return r

    def lit(s, n):
        v = 0
        for _ in range(n):
            v = (v << 1) | s.bit()
        return v

    def sig(s, n):
        v = s.lit(n)
        return -v if s.bit() else v


def vp8_chunk(data):
    i = 12
    while i + 8 <= len(data):
        cc, ln = data[i:i + 4], struct.unpack('<I', data[i + 4:i + 8])[0]
        if cc == b'VP8 ':
            return data[i + 8:i + 8 + ln]
        i += 8 + ln + (ln & 1)
    return None


def quant(path):
    d = vp8_chunk(open(path, 'rb').read())
    if d is None:
        return None
    bd = Bool(d[10:])
    bd.lit(1); bd.lit(1)  # color space, clamping
    seg = bd.lit(1)
    segq, absolute = None, False
    if seg:
        upd_map = bd.lit(1)
        upd_data = bd.lit(1)
        if upd_data:
            absolute = bd.lit(1) == 1
            segq = [bd.sig(7) if bd.lit(1) else 0 for _ in range(4)]
            for _ in range(4):
                if bd.lit(1): bd.sig(6)
        if upd_map:
            for _ in range(3):
                if bd.lit(1): bd.lit(8)
    bd.lit(1); bd.lit(6); bd.lit(3)
    if bd.lit(1):
        if bd.lit(1):
            for _ in range(8):
                if bd.lit(1): bd.sig(6)
    bd.lit(2)
    base = bd.lit(7)
    if segq is None:
        return float(base)
    qs = [q if absolute else base + q for q in segq]
    return sum(max(0, min(127, q)) for q in qs) / 4
