"""Run tools/art/w6to10/bossgpu.py with Wan 2.2's last frame pinned to its first (PIN=1), so a clip returns to its start pose:
a loop for walks, and a move that cannot drift away from the camera (2026-10-29 re-runs: Flicker's lead and dart, the Reaver's walk).
Same env as bossgpu.py. The patch is in memory only."""
import os, runpy

if os.environ.get('PIN') == '1':
    import diffusers
    _call = diffusers.WanImageToVideoPipeline.__call__

    def _pinned(self, *a, **k):
        if 'image' in k and 'last_image' not in k:
            k['last_image'] = k['image']
        return _call(self, *a, **k)
    diffusers.WanImageToVideoPipeline.__call__ = _pinned
runpy.run_path(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bossgpu.py'), run_name='__main__')
