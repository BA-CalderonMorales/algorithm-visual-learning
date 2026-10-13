"""Rebuild the original node asset in a separate Blender background process.

Usage: blender --background --factory-startup --python this_file.py
The web app consumes the small JSON projection, not a Blender runtime.
"""
import json
import math
import sys
from pathlib import Path
import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[2]
scene = bpy.data.scenes.new('Study Studio Node Asset')
mesh = bpy.data.meshes.new('Study Node Body')
vertices = [
    (-1, -.55, -.2), (1, -.55, -.2), (1, .55, -.2), (-1, .55, -.2),
    (-1, -.55, .2), (1, -.55, .2), (1, .55, .2), (-1, .55, .2),
]
faces = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
         (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
mesh.from_pydata(vertices, [], faces)
mesh.update()
obj = bpy.data.objects.new('Node Body', mesh)
scene.collection.objects.link(obj)
rotation = Matrix.Rotation(math.radians(12), 4, 'Z') @ Matrix.Rotation(math.radians(18), 4, 'X')
points = [[round((rotation @ Vector(v)).x * 38 + 55, 2),
           round(-(rotation @ Vector(v)).y * 38 + 35, 2)] for v in vertices]
asset = {'generator': 'Blender 5.2 / original study asset', 'points': points,
         'faces': faces, 'edges': [[e.vertices[0], e.vertices[1]] for e in mesh.edges]}
destination = ROOT / 'src/structures/geometry/study-node.json'
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(asset, separators=(',', ':')), encoding='utf-8')
if '--' in sys.argv and len(sys.argv) > sys.argv.index('--') + 1:
    bpy.context.window.scene = scene
    bpy.ops.wm.save_as_mainfile(filepath=str(Path(sys.argv[sys.argv.index('--') + 1]).resolve()))
