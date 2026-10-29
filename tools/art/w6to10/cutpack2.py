"""cutpack.py with its group list from PACKS (bash keeps GROUPS for itself, so GROUPS=... on a bash line never reaches Python)."""
import os, runpy
os.environ['GROUPS'] = os.environ.get('PACKS', '')
runpy.run_path(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cutpack.py'), run_name='__main__')
