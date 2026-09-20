/*
  Kiểm tra bố cục các mô phỏng trong js/sim.js mà không cần mở trình duyệt.
  Cách làm: thay canvas context bằng một context giả ghi lại mọi hình chữ nhật và
  mọi dòng chữ được vẽ, sau đó tìm các cặp chồng lấn và các phần tràn ra ngoài khung.

  Chạy:  node tools/check-sim-layout.js
*/
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const W = 800;
const H = 440;
/* Chừa lề dưới cho dòng chú thích của mỗi bước. */
const CAPTION_TOP = H - 34;

const root = path.join(__dirname, "..");
const source = fs
  .readFileSync(path.join(root, "js", "sim.js"), "utf8")
  .replace("window.MalwareSim = {", "window.__SIMS = SIMS;\n  window.MalwareSim = {");

const sandbox = {
  window: { matchMedia: () => ({ matches: false }), devicePixelRatio: 1 },
  document: { querySelectorAll: () => [] },
  Math,
  console,
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const SIMS = sandbox.window.__SIMS;

/* Context giả: ghi lại hộp và chữ, bỏ qua mọi lệnh vẽ khác. */
function recorder() {
  const shapes = [];
  let path = null;
  const ctx = {
    globalAlpha: 1,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "600 14px sans-serif",
    textAlign: "center",
    textBaseline: "middle",
    shapes,
    beginPath() { path = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, points: 0 }; },
    moveTo(x, y) { this._pt(x, y); },
    lineTo(x, y) { this._pt(x, y); },
    arcTo(x1, y1, x2, y2) { this._pt(x1, y1); this._pt(x2, y2); },
    arc(x, y, r) { this._pt(x - r, y - r); this._pt(x + r, y + r); },
    closePath() {},
    _pt(x, y) {
      if (!path) return;
      path.points += 1;
      path.minX = Math.min(path.minX, x);
      path.minY = Math.min(path.minY, y);
      path.maxX = Math.max(path.maxX, x);
      path.maxY = Math.max(path.maxY, y);
    },
    fill() { this._commit("box"); },
    stroke() { this._commit("line"); },
    _commit(kind) {
      if (!path || path.points < 3) return;
      const w = path.maxX - path.minX;
      const h = path.maxY - path.minY;
      /* Chỉ quan tâm khối đặc đủ lớn, bỏ qua mũi tên và nét mảnh. */
      if (kind === "box" && w > 24 && h > 14 && this.globalAlpha > 0.5) {
        shapes.push({ type: "box", x: path.minX, y: path.minY, w, h });
      }
      path = null;
    },
    fillText(value, x, y) {
      if (this.globalAlpha <= 0.5) return;
      const size = Number((this.font.match(/(\d+(?:\.\d+)?)px/) || [0, 14])[1]);
      /* Ước lượng bề rộng chữ: hệ số 0.56 hợp với font sans và mono ở cỡ này. */
      const w = String(value).length * size * 0.56;
      const left = this.textAlign === "center" ? x - w / 2 : this.textAlign === "right" ? x - w : x;
      shapes.push({ type: "text", value: String(value), x: left, y: y - size / 2, w, h: size });
    },
    setLineDash() {},
    fillRect(x, y, w, h) { if (w > 24 && h > 14) shapes.push({ type: "box", x, y, w, h }); },
    clearRect() {},
    setTransform() {},
    measureText(value) { return { width: String(value).length * 8 }; },
    save() {},
    restore() {},
  };
  return ctx;
}

function overlap(a, b) {
  const x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return x * y;
}

const problems = [];

Object.keys(SIMS).forEach((kind) => {
  SIMS[kind].steps.forEach((step, stepIndex) => {
    [0, 0.5, 1].forEach((t) => {
      const ctx = recorder();
      step.draw(ctx, t);
      const where = `${kind} · bước ${stepIndex + 1} · t=${t}`;
      const texts = ctx.shapes.filter((s) => s.type === "text");
      const boxes = ctx.shapes.filter((s) => s.type === "box");

      /* 1. Chữ đè lên chữ. */
      for (let i = 0; i < texts.length; i += 1) {
        for (let j = i + 1; j < texts.length; j += 1) {
          if (overlap(texts[i], texts[j]) > 6) {
            problems.push(`${where}: chữ đè chữ — "${texts[i].value}" x "${texts[j].value}"`);
          }
        }
      }

      /* 2. Khối đè khối, bỏ qua trường hợp lồng hẳn vào nhau (nhãn nằm trong khung). */
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i];
          const b = boxes[j];
          const area = overlap(a, b);
          if (area <= 12) continue;
          const inside = area > Math.min(a.w * a.h, b.w * b.h) * 0.92;
          if (!inside) {
            problems.push(
              `${where}: khối đè khối — [${Math.round(a.x)},${Math.round(a.y)} ${Math.round(a.w)}x${Math.round(a.h)}] x [${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}x${Math.round(b.h)}]`
            );
          }
        }
      }

      /* 3. Tràn ra ngoài khung vẽ. */
      ctx.shapes.forEach((s) => {
        if (s.x < 0 || s.y < 0 || s.x + s.w > W || s.y + s.h > H) {
          problems.push(`${where}: tràn khung — ${s.type === "text" ? `"${s.value}"` : "khối"} tại [${Math.round(s.x)},${Math.round(s.y)}] ${Math.round(s.w)}x${Math.round(s.h)}`);
        }
      });

      /* 4. Lấn vào vùng dành cho dòng chú thích dưới cùng. */
      ctx.shapes.forEach((s) => {
        const isCaption = s.type === "text" && s.y > CAPTION_TOP - 12;
        if (!isCaption && s.y + s.h > CAPTION_TOP) {
          problems.push(`${where}: lấn vùng chú thích — ${s.type === "text" ? `"${s.value}"` : "khối"} chạm y=${Math.round(s.y + s.h)}`);
        }
      });
    });
  });
});

const unique = [...new Set(problems)];
if (unique.length === 0) {
  console.log("Bố cục sạch: không có chồng lấn, không tràn khung.");
} else {
  console.log(`Tìm thấy ${unique.length} vấn đề bố cục:\n`);
  unique.forEach((problem) => console.log(" - " + problem));
  process.exitCode = 1;
}
