#!/usr/bin/env python3
"""Make data/footprints.js, the DR1 and DR2 sky-coverage outlines drawn on the Data page.

Coverage follows the recipe behind the areas quoted in Danieli et al. (2025). Every N708 and
N540 exposure longer than 300 s counts as a flat RA/Dec circle of radius 1.006 deg (3.18 deg2)
around its center, with an effective exposure time

    t_eff = transparency^2 * seeing^-2 * 10^((sky - sky0) / 2.5) * exptime,

where sky0 = 20.9 (N708) or 22.1 (N540) and the seeing is in arcsec. t_eff is summed on a
0.01 deg grid. "Full color" means t_eff > 0 in both filters. "Full depth" means
t_eff > 1200 s in N708 and > 1800 s in N540 (half the nominal four-exposure depth).
DR1 uses the exposures up to expnum 1087049, and DR2 uses all of them.

Usage:
    python3 tools/make_footprints.py <exposure database FITS> [-o data/footprints.js]

The database is the Merian copy of the DECam exposure table (columns expnum, band, exptime,
racenter, deccenter, transparency, seeing, sky). Needs numpy, astropy, scikit-image, shapely.
"""
import argparse
import datetime
import os

import numpy as np
import shapely
from astropy.table import Table
from shapely.geometry import MultiPolygon, Polygon
from skimage.measure import find_contours

RADIUS = 1.006          # deg, circle of 3.18 deg2
STEP = 0.01             # deg, grid step
SKY0 = {'N708': 20.9, 'N540': 22.1}
FULL_DEPTH = {'N708': 1200.0, 'N540': 1800.0}   # s, half of 4 x 600 s and 4 x 900 s
DR1_LAST_EXPNUM = 1087049
SIMPLIFY = 0.02         # deg, well below one screen pixel at the drawn scale
PRECISION = 0.01        # deg, coordinates in the output


def read_exposures(path):
    t = Table.read(path)
    band = np.char.strip(np.asarray(t['band']).astype(str))
    keep = np.isin(band, list(SKY0)) & (np.asarray(t['exptime'], float) > 300)
    t, band = t[keep], band[keep]
    sky0 = np.array([SKY0[b] for b in band])
    teff = (np.asarray(t['transparency'], float) ** 2 * np.asarray(t['seeing'], float) ** -2
            * 10 ** ((np.asarray(t['sky'], float) - sky0) / 2.5) * np.asarray(t['exptime'], float))
    ok = np.isfinite(teff) & (teff > 0)
    ra = np.asarray(t['racenter'], float)[ok]
    return dict(band=band[ok], teff=teff[ok], expnum=np.asarray(t['expnum'])[ok],
                ra=np.where(ra > 300, ra - 360, ra),              # the fall fields run through RA 0
                dec=np.asarray(t['deccenter'], float)[ok])


def paint(ex, sel, xc, yc, band):
    """Summed t_eff of the selected exposures in one band on the grid of cell centers xc, yc."""
    out = np.zeros((len(yc), len(xc)), np.float32)
    for i in np.flatnonzero(sel & (ex['band'] == band)):
        x, y = ex['ra'][i], ex['dec'][i]
        ix0, ix1 = np.searchsorted(xc, x - RADIUS), np.searchsorted(xc, x + RADIUS)
        iy0, iy1 = np.searchsorted(yc, y - RADIUS), np.searchsorted(yc, y + RADIUS)
        inside = (yc[iy0:iy1, None] - y) ** 2 + (xc[None, ix0:ix1] - x) ** 2 <= RADIUS ** 2
        out[iy0:iy1, ix0:ix1] += np.where(inside, ex['teff'][i], 0).astype(np.float32)
    return out


def outline(mask, xc, yc):
    """Polygons (RA, Dec) of a boolean grid, simplified without changing the topology."""
    padded = np.pad(mask, 1).astype(float)
    region = None
    for c in find_contours(padded, 0.5):
        ring = np.column_stack([xc[0] + (c[:, 1] - 1) * STEP, yc[0] + (c[:, 0] - 1) * STEP])
        if len(ring) < 4:
            continue
        p = Polygon(ring)
        # The rings of a padded binary grid nest without crossing, so the region is their XOR.
        region = p if region is None else region.symmetric_difference(p)
    region = region.simplify(SIMPLIFY, preserve_topology=True)
    region = shapely.set_precision(region, PRECISION)
    return region if isinstance(region, MultiPolygon) else MultiPolygon([region])


def sky_area(geom):
    """Area in deg2 on the sphere: x = RA, y = sin(Dec) in degree units is an equal-area map."""
    return shapely.transform(geom, lambda c: np.column_stack([c[:, 0], np.degrees(np.sin(np.radians(c[:, 1])))])).area


def svg_path(geom):
    def fmt(v):
        s = f'{v:.2f}'.rstrip('0').rstrip('.')
        return '0' if s in ('-0', '') else s
    parts = []
    for poly in geom.geoms:
        for ring in [poly.exterior, *poly.interiors]:
            xy = np.asarray(ring.coords)[:-1]
            parts.append('M' + 'L'.join(f'{fmt(x)} {fmt(y)}' for x, y in xy) + 'Z')
    return ''.join(parts)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('database')
    ap.add_argument('-o', '--out', default=os.path.join(os.path.dirname(__file__), '..', 'data', 'footprints.js'))
    args = ap.parse_args()

    ex = read_exposures(args.database)
    is_fall = ex['ra'] < 80
    releases = {'dr1': ex['expnum'] <= DR1_LAST_EXPNUM, 'dr2': np.ones(len(ex['ra']), bool)}
    print(f"{len(ex['ra'])} exposures, {releases['dr1'].sum()} in DR1")

    fields, paths, areas = [], {r: {'color': {}, 'depth': {}} for r in releases}, {}
    for key, label, sel_field in [('spring', 'Spring fields', ~is_fall), ('fall', 'Fall fields', is_fall)]:
        x0, x1 = ex['ra'][sel_field].min() - RADIUS - 0.05, ex['ra'][sel_field].max() + RADIUS + 0.05
        y0, y1 = ex['dec'][sel_field].min() - RADIUS - 0.05, ex['dec'][sel_field].max() + RADIUS + 0.05
        xc = x0 + (np.arange(int(np.ceil((x1 - x0) / STEP))) + 0.5) * STEP
        yc = y0 + (np.arange(int(np.ceil((y1 - y0) / STEP))) + 0.5) * STEP
        cell = STEP ** 2 * np.cos(np.radians(yc))[:, None]
        for rel, sel in releases.items():
            t = {b: paint(ex, sel & sel_field, xc, yc, b) for b in SKY0}
            masks = {'color': (t['N708'] > 0) & (t['N540'] > 0),
                     'depth': (t['N708'] > FULL_DEPTH['N708']) & (t['N540'] > FULL_DEPTH['N540'])}
            for kind, m in masks.items():
                geom = outline(m, xc, yc)
                paths[rel][kind][key] = svg_path(geom)
                a = areas.setdefault(f'{rel}_{kind}', {'grid': 0.0, 'outline': 0.0})
                a['grid'] += float((cell * m).sum())
                a['outline'] += sky_area(geom)
            if rel == 'dr2':
                # Plot range of this strip, fixed by the full survey so the DR1 and DR2 maps match.
                rows, cols = np.nonzero(masks['color'])
                fields.append(dict(key=key, label=label,
                                   ra=[float(np.floor(xc[cols.min()] - 1)), float(np.ceil(xc[cols.max()] + 1))],
                                   dec=[float(np.floor(yc[rows.min()] * 2 - 1) / 2), float(np.ceil(yc[rows.max()] * 2 + 1) / 2)]))

    for k, a in areas.items():
        print(f"{k:10s} grid {a['grid']:7.1f} deg2   outline {a['outline']:7.1f} deg2   ratio {a['outline'] / a['grid']:.4f}")

    def js(v):
        import json
        return json.dumps(v, separators=(', ', ': '))
    lines = [
        '// Sky coverage of Merian DR1 and DR2, drawn on the Data page by assets/js/footprint-figure.js.',
        f'// Generated by tools/make_footprints.py on {datetime.date.today().isoformat()}. Do not edit by hand.',
        '// Paths are in degrees, x = RA (the fall fields use RA - 360 west of RA 0) and y = Dec.',
        '// Areas (deg2) of the drawn outlines, for reference. The page quotes Danieli et al. (2025).',
        'window.MERIAN_FOOTPRINTS = {',
        '  fields: [',
        ',\n'.join(f'    {js(f)}' for f in fields),
        '  ],',
        '  areas: ' + js({k: round(a['outline'], 1) for k, a in areas.items()}) + ',',
    ]
    for rel in releases:
        lines.append(f'  {rel}: {{')
        for kind in ['color', 'depth']:
            lines.append(f'    {kind}: {{')
            lines.append(',\n'.join(f'      {f["key"]}: "{paths[rel][kind][f["key"]]}"' for f in fields))
            lines.append('    },' if kind == 'color' else '    }')
        lines.append('  },' if rel == 'dr1' else '  }')
    lines.append('};')
    with open(args.out, 'w') as fh:
        fh.write('\n'.join(lines) + '\n')
    print('wrote', os.path.normpath(args.out), f'{os.path.getsize(args.out) / 1e3:.0f} kB')


if __name__ == '__main__':
    main()
