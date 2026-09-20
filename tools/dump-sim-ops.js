/*
  Ghi lại mọi lệnh vẽ của các mô phỏng ra JSON để tools/render-sim-preview.py
  dựng thành ảnh PNG xem trước, không cần mở trình duyệt.

  Chạy:  node tools/dump-sim-ops.js <thư mục xuất>
*/
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const outDir = process.argv[2];
if (!outDir) {
  console.error("Thiếu tham số: node tools/dump-sim-ops.js <thư mục xuất>");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

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

/* Context ghi lại lệnh vẽ theo đúng thứ tự để dựng lại y hệt trên PIL. */
function recorder() {
  const ops = [];
  let pts = [];
  let dash = false;
  const ctx = {
    globalAlpha: 1,
    fillStyle: "#000",
    strokeStyle: "#000",
    lineWidth: 1,
    font: "600 14px sans",
    textAlign: "center",
    textBaseline: "middle",
    ops,
    beginPath() { pts = []; },
    moveTo(x, y) { pts.push([x, y]); },
    lineTo(x, y) { pts.push([x, y]); },
    arcTo(x1, y1) { pts.push([x1, y1]); },
    arc(x, y, r) { ops.push({ op: "circle", x, y, r, fill: this.fillStyle, alpha: this.globalAlpha }); pts = []; },
    closePath() {},
    fill() {
      if (pts.length >= 3) ops.push({ op: "poly", pts: pts.slice(), fill: this.fillStyle, alpha: this.globalAlpha });
    },
    stroke() {
      if (pts.length >= 2) {
        ops.push({ op: "line", pts: pts.slice(), color: this.strokeStyle, width: this.lineWidth, dash, alpha: this.globalAlpha });
      }
    },
    setLineDash(pattern) { dash = Boolean(pattern && pattern.length); },
    fillRect(x, y, w, h) { ops.push({ op: "rect", x, y, w, h, fill: this.fillStyle, alpha: this.globalAlpha }); },
    clearRect() {},
    setTransform() {},
    measureText(value) { return { width: String(value).length * 8 }; },
    fillText(value, x, y) {
      const size = Number((this.font.match(/(\d+(?:\.\d+)?)px/) || [0, 14])[1]);
      const weight = Number((this.font.match(/^(\d+)/) || [0, 600])[1]);
      const mono = /Cascadia|Consolas|mono/i.test(this.font);
      ops.push({ op: "text", value: String(value), x, y, size, weight, mono, align: this.textAlign, color: this.fillStyle, alpha: this.globalAlpha });
    },
    save() {},
    restore() {},
  };
  return ctx;
}

const manifest = [];
Object.keys(SIMS).forEach((kind) => {
  SIMS[kind].steps.forEach((step, stepIndex) => {
    [0.5, 1].forEach((t) => {
      const ctx = recorder();
      step.draw(ctx, t);
      const name = `${kind}-b${stepIndex + 1}-t${String(t).replace(".", "")}`;
      fs.writeFileSync(path.join(outDir, name + ".json"), JSON.stringify(ctx.ops), "utf8");
      manifest.push({ name, kind, step: stepIndex + 1, t, note: step.note });
    });
  });
});

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 1), "utf8");
console.log("Đã ghi", manifest.length, "khung hình vào", outDir);
