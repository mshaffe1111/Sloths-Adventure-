W = {1: 'Emerald Canopy', 2: 'Sunlit Riverbank', 3: 'Mossy Grotto', 4: 'Mist Cascades', 5: 'Orchid Sanctuary', 6: 'Deep Mangrove',
     7: 'Ancient Ruins', 8: 'Twilight Treetops', 9: 'Volcanic Jungle', 10: 'Stormy Highlands Fortress'}
# What each world's kit is short of (reference/art/KIT-AUDIT.md, 11-06), used for the "fills" notes
GAP = {1: 'floor kinds (stones, stumps, logs), a painted thorn hazard', 2: 'docks, rafts, floor kinds, painted water',
       3: 'floor kinds, darker shelves', 4: 'floor kinds, a painted hazard', 5: 'its own floor (no branch, log, liana or perch)',
       6: 'variety (one log tiled three times)', 7: 'rubble blocks, fallen columns, root-split slabs', 8: 'a painted hazard, floor kinds',
       9: 'floor kinds', 10: 'anything but the iron grate'}
def fmt(ws): return '; '.join(f'{w} {W[w]}' for w in ws)
