"""AS-2: decide, flag, apply. Flags (each anchored on the q82 pictures Matt looked at and passed on the AS-1 page: gear SSIM 0.983 /
PSNR 35.1, pokey-1 0.989 / 38.6, w2-near 0.990 with worst tile 0.902 and worst dark tile 36.7 dB): anything measurably worse than
the worst of those is flagged and kept as shipped. Plus: any picture with some smooth dark area (>= 5%) whose worst dark tile is as bad
as the black picture's (w10-far at q82, 39.5 dB, which Matt rejected). SSIMULACRA2 (composited over grey) gives Matt's three passed
pictures 78.7 / 85.4 / 81.3 and the black picture he rejected 75.2, so it is a gate too: under 78.5 is flagged.
Usage: python3 tools/assets/art82_apply.py MEASURE_JSON DARK_JSON FILES SUMMARY_JSON [--write]"""
import json, os, shutil, sys

def flag(r, sd):
    why = []
    if r['ssim'] < 0.98: why.append('SSIM < 0.98')
    if r['tile_ssim'] < 0.90: why.append('worst tile SSIM < 0.90')
    if r['psnr'] < 35.0: why.append('PSNR < 35 dB')
    dt = r.get('dark_tile_psnr')
    if dt is not None and dt < 36.5: why.append('dark tile < 36.5 dB')
    if dt is not None and sd >= 0.05 and dt <= 39.5: why.append('smooth dark area, dark tile as bad as the black picture')
    if r['ssimu2'] < 78.5: why.append('SSIMULACRA2 < 78.5')
    if r['q82_bytes'] >= r['orig_bytes']: why.append('q82 not smaller')
    return ', '.join(why)

def main(mj, dj, files, sj, write=False):
    m = json.load(open(mj)); d = {x['src']: x for x in json.load(open(dj))}
    dark = sorted([x for x in d.values() if x['q_est'] >= 84 and (x['near_black'] >= 0.5 or x['smooth_dark'] >= 0.1)],
                  key=lambda x: -x['near_black'])
    names = {x['src'] for x in dark}
    m = [r for r in m if r['src'] not in names]  # dark: exempt, kept exactly as shipped (measured run may include them)
    for r in m:
        r['smooth_dark'] = d[r['src']]['smooth_dark']
        r['flag'] = flag(r, r['smooth_dark'])
    json.dump(m, open(mj, 'w'), indent=1)
    keep = [r for r in m if not r['flag']]
    flagged = sorted([r for r in m if r['flag']], key=lambda r: r['ssim'])
    saved = sum(r['orig_bytes'] - r['q82_bytes'] for r in keep)
    if write:
        for r in keep:
            shutil.copyfile(os.path.join(files, r['src'].replace('/', '__')), r['src'])
    worst = min(keep, key=lambda r: r['ssim'])
    s = dict(dark=dark, flagged=flagged, n_re=len(keep), n_dark=len(dark), n_flag=len(flagged), saved_mb=saved / 2**20,
             worst=dict(src=worst['src'], ssim=worst['ssim'], psnr=worst['psnr']),
             worst_tile=min(r['tile_ssim'] for r in keep), worst_psnr=min(r['psnr'] for r in keep),
             ssimu2_range=[min(r['ssimu2'] for r in keep), max(r['ssimu2'] for r in keep)])
    json.dump(s, open(sj, 'w'), indent=1)
    print(json.dumps({k: v for k, v in s.items() if k not in ('dark', 'flagged')}, indent=1))
    print('flagged:'); [print(' ', r['src'], r['flag']) for r in flagged]

if __name__ == '__main__':
    main(*sys.argv[1:5], write='--write' in sys.argv)
