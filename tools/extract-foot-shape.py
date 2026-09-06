"""Read sprite alpha and generate a matching, ball-sized collision envelope.

Usage: python tools/extract-foot-shape.py assets/foot-sprite-green.png
Requires Pillow and NumPy only for this asset preparation step.
The PNG itself is never modified.
"""
from pathlib import Path
import json
import sys

import numpy as np
from PIL import Image

root = Path(__file__).resolve().parent.parent
source = root / (sys.argv[1] if len(sys.argv) > 1 else 'assets/foot-sprite-green.png')
sprite = Image.open(source)
if sprite.mode != 'RGBA':
    raise ValueError('The foot sprite must have actual alpha transparency.')
mask = np.asarray(sprite)[:, :, 3] > 160
ys, xs = np.where(mask)
left, right = int(xs.min()), int(xs.max())
top, bottom = int(ys.min()), int(ys.max())
upper, lower = [], []
for x in np.linspace(left, right, 150).astype(int):
    column = np.where(mask[:, max(left, x - 2):min(right + 1, x + 3)].any(axis=1))[0]
    if len(column):
        px = -14 + 112 * (x - left) / (right - left)
        upper.append((px, -22 + 48 * (int(column.min()) - top) / (bottom - top)))
        lower.append((px, -22 + 48 * (int(column.max()) - top) / (bottom - top)))


def simplify(points, tolerance=.35):
    if len(points) < 3:
        return points
    p = np.asarray(points)
    v = p[-1] - p[0]
    t = np.clip((p - p[0]) @ v / (v @ v or 1), 0, 1)
    distance = np.linalg.norm(p - p[0] - t[:, None] * v, axis=1)
    index = int(distance.argmax())
    if distance[index] <= tolerance:
        return [points[0], points[-1]]
    return simplify(points[:index + 1], tolerance)[:-1] + simplify(points[index:], tolerance)


# Tiny gaps between toes are narrower than the ball, so use a smooth envelope.
points = simplify(upper) + simplify(lower[::-1])
path = 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in points) + ' Z'
bounds = [left, top, right - left + 1, bottom - top + 1]
(root / 'assets/foot-shape.js').write_text(
    'const FOOT_IMAGE_BOUNDS=' + json.dumps(bounds) + ';\n'
    'const FOOT_IMAGE_PATH=' + json.dumps(path) + ';\n', encoding='utf-8')
print(f'{source.name}: {len(points)} collider points, bounds {bounds}')
