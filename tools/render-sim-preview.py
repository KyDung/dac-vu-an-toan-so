# -*- coding: utf-8 -*-
"""
Dựng ảnh PNG xem trước cho các mô phỏng trong js/sim.js, dùng dữ liệu lệnh vẽ
do tools/dump-sim-ops.js xuất ra. Mục đích là kiểm tra bố cục bằng mắt mà không
cần mở trình duyệt.

Chạy:
    node tools/dump-sim-ops.js <thư mục ops>
    python tools/render-sim-preview.py <thư mục ops> <thư mục ảnh>
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

W, H = 800, 440
SCALE = 2  # vẽ ở độ phân giải gấp đôi cho nét chữ sắc hơn

FONT_DIR = os.path.join(os.environ.get("WINDIR", "C:/Windows"), "Fonts")
FONT_FILES = {
    (False, 400): "arial.ttf",
    (False, 700): "arialbd.ttf",
    (True, 400): "consola.ttf",
    (True, 700): "consolab.ttf",
}
_font_cache = {}


def load_font(size, weight, mono):
    bold = weight >= 700
    key = (mono, 700 if bold else 400, size)
    if key not in _font_cache:
        name = FONT_FILES[(mono, 700 if bold else 400)]
        path = os.path.join(FONT_DIR, name)
        try:
            _font_cache[key] = ImageFont.truetype(path, size)
        except OSError:
            _font_cache[key] = ImageFont.load_default()
    return _font_cache[key]


def blend(color, alpha):
    """Trộn màu với nền trắng để mô phỏng globalAlpha."""
    if alpha >= 0.99:
        return color
    color = color.lstrip("#")
    if len(color) == 3:
        color = "".join(c * 2 for c in color)
    r, g, b = (int(color[i:i + 2], 16) for i in (0, 2, 4))
    mix = lambda c: int(c * alpha + 255 * (1 - alpha))
    return (mix(r), mix(g), mix(b))


def dashed_line(draw, pts, color, width):
    """Vẽ nét đứt bằng cách chia nhỏ từng đoạn."""
    for i in range(len(pts) - 1):
        x1, y1 = pts[i]
        x2, y2 = pts[i + 1]
        dist = max(1.0, ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5)
        steps = max(1, int(dist / 12))
        for s in range(steps):
            a = s / steps
            b = min(1.0, a + 0.55 / steps * 12 / max(1, dist / steps) * (dist / steps) / 12)
            b = a + (0.6 / steps)
            draw.line(
                [x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, x1 + (x2 - x1) * min(b, 1.0), y1 + (y2 - y1) * min(b, 1.0)],
                fill=color, width=width,
            )


def render(ops, out_path):
    img = Image.new("RGB", (W * SCALE, H * SCALE), "white")
    draw = ImageDraw.Draw(img)

    for op in ops:
        alpha = op.get("alpha", 1)
        kind = op["op"]
        if kind == "poly":
            pts = [(x * SCALE, y * SCALE) for x, y in op["pts"]]
            draw.polygon(pts, fill=blend(op["fill"], alpha))
        elif kind == "rect":
            draw.rectangle(
                [op["x"] * SCALE, op["y"] * SCALE, (op["x"] + op["w"]) * SCALE, (op["y"] + op["h"]) * SCALE],
                fill=blend(op["fill"], alpha),
            )
        elif kind == "circle":
            r = op["r"] * SCALE
            draw.ellipse(
                [op["x"] * SCALE - r, op["y"] * SCALE - r, op["x"] * SCALE + r, op["y"] * SCALE + r],
                fill=blend(op["fill"], alpha),
            )
        elif kind == "line":
            pts = [(x * SCALE, y * SCALE) for x, y in op["pts"]]
            color = blend(op["color"], alpha)
            width = max(1, int(op["width"] * SCALE * 0.8))
            if op.get("dash"):
                dashed_line(draw, pts, color, width)
            else:
                draw.line([c for p in pts for c in p], fill=color, width=width)
        elif kind == "text":
            font = load_font(int(op["size"] * SCALE), op["weight"], op["mono"])
            value = op["value"]
            bbox = draw.textbbox((0, 0), value, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            x = op["x"] * SCALE
            if op["align"] == "center":
                x -= tw / 2
            elif op["align"] == "right":
                x -= tw
            y = op["y"] * SCALE - th / 2 - bbox[1]
            draw.text((x, y), value, font=font, fill=blend(op["color"], alpha))

    img.resize((W, H), Image.LANCZOS).save(out_path)


def main():
    ops_dir, img_dir = sys.argv[1], sys.argv[2]
    os.makedirs(img_dir, exist_ok=True)
    manifest = json.load(open(os.path.join(ops_dir, "manifest.json"), encoding="utf-8"))
    for entry in manifest:
        ops = json.load(open(os.path.join(ops_dir, entry["name"] + ".json"), encoding="utf-8"))
        render(ops, os.path.join(img_dir, entry["name"] + ".png"))
    print("Da dung", len(manifest), "anh vao", img_dir)


if __name__ == "__main__":
    main()
