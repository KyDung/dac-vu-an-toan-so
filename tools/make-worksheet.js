/*
  Sinh file PHU_LUC_PHIEU_BAI_TAP.md từ chính js/data.js — phiên bản giấy của
  toàn bộ bài tập trong web, dùng khi lớp không có mạng để vào web. Không có
  đáp án (đáp án nằm ở DAP_AN.md dành cho giáo viên).

  Chạy lại mỗi khi sửa câu hỏi: node tools/make-worksheet.js
*/
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "js", "data.js"), "utf8"), sandbox);

const get = (name) => vm.runInContext(name, sandbox);
const scenarios = get("scenarios");
const RISK_OPTIONS = get("RISK_OPTIONS");
const malwareCases = get("malwareCases");
const secretFiles = get("secretFiles");
const malwareComparison = get("malwareComparison");
const defenseActions = get("defenseActions");
const reflectionQuestions = get("reflectionQuestions");

const out = [];
const line = (value = "") => out.push(value);
const box = "☐";
const letters = ["A", "B", "C", "D"];

line("# Phụ lục — Phiếu bài tập (bản giấy, dùng khi không có mạng)");
line();
line("File này được sinh tự động từ `js/data.js` để luôn khớp với nội dung trên web. Sau khi sửa câu hỏi trong `js/data.js`, chạy lại `node tools/make-worksheet.js` để cập nhật.");
line();
line("Đáp án dành cho giáo viên nằm riêng trong `DAP_AN.md`, không có trong phiếu này.");
line();
line("---");
line();
line("**Họ và tên học sinh:** .......................................................... **Lớp:** ....................");
line();
line("---");
line();

/* ============ Chương 1 ============ */
line("## Chương 1 — Một số nguy cơ trên mạng");
line();
line("Internet rất tiện, nhưng đi kèm với nó là một số nguy cơ mà ai dùng mạng cũng có thể gặp:");
line();
RISK_OPTIONS.filter((risk) => risk !== "Không có nguy cơ").forEach((risk) => line(`- ${risk}`));
line();
line(`Dưới đây là ${scenarios.length} tình huống có thật trong đời sống học sinh. Mỗi tình huống dừng lại đúng lúc nhân vật phải quyết định. Đọc kỹ rồi trả lời các câu hỏi bên dưới. Không có đáp án nào bị trừ điểm khi chọn sai — chọn sai chỉ để em hiểu vì sao cách đó chưa an toàn.`);
line();

scenarios.forEach((scenario, index) => {
  line(`### Tình huống ${index + 1}: ${scenario.title}`);
  line();
  if (scenario.sensitiveNote) {
    line(`> **Lưu ý:** ${scenario.sensitiveNote}`);
    line();
  }
  (scenario.narrative || []).forEach((para) => {
    line(para);
    line();
  });

  line(`**Câu hỏi 1.** ${scenario.question}`);
  line();
  line("......................................................................................................");
  line();
  line("......................................................................................................");
  line();

  line("**Câu hỏi 2.** Tình huống này thuộc loại nguy cơ nào? (chọn một)");
  line();
  RISK_OPTIONS.forEach((risk) => line(`${box} ${risk}`));
  line();

  line("**Câu hỏi 3.** Em sẽ xử lí thế nào? (chọn một)");
  line();
  scenario.options.forEach((option, i) => line(`${box} **${letters[i]}.** ${option}`));
  line();

  if (scenario.supportQuestion) {
    line(`**Câu hỏi phụ.** ${scenario.supportQuestion}`);
    line();
    scenario.supportOptions.forEach((option) => line(`${box} ${option}`));
    line();
  }
  if (scenario.applicationQuestion) {
    line(`**Câu hỏi vận dụng.** ${scenario.applicationQuestion}`);
    line();
    line("......................................................................................................");
    line();
    line("......................................................................................................");
    line();
  }
  line("---");
  line();
});

/* ============ Chương 2: ba loại mã độc ============ */
line("## Chương 2 — Phần mềm độc hại");
line();
line("Có phải tất cả phần mềm độc hại đều là virus? Dấu hiệu một máy tính có thể đang bị mã độc:");
line();
["Máy hoạt động chậm bất thường", "Xuất hiện chương trình lạ", "Có lưu lượng mạng không rõ nguyên nhân", "Một số tài khoản có dấu hiệu bị truy cập"].forEach((s) => line(`- ${s}`));
line();

malwareCases.forEach((item, index) => {
  line(`### ${index + 1}. ${item.title} — ${item.subtitle}`);
  line();
  item.intro.forEach((para) => {
    line(para);
    line();
  });
  line(`**Cần nhớ:** ${item.keyPoint}`);
  line();
  line("Một máy tính có các dấu vết sau:");
  line();
  item.story.forEach((s) => line(`- ${s}`));
  line();
  line(`**Câu hỏi.** ${item.question}`);
  line();
  item.options.forEach((option, i) => line(`${box} **${letters[i]}.** ${option}`));
  line();
  line("---");
  line();
});

/* ============ Bốn nhánh của Trojan ============ */
line("## Bốn nhánh của Trojan");
line();
line("Trojan không phải một thứ duy nhất. Tùy việc nó làm sau khi đã vào được máy, người ta gọi nó bằng những tên khác nhau:");
line();
secretFiles.forEach((item) => line(`- **${item.name}** (${item.vi}): ${item.behavior}`));
line();
line("Đọc dấu hiệu của từng máy tính dưới đây rồi đoán xem máy đó dính loại nào trong bốn loại ở trên.");
line();
secretFiles.forEach((item, index) => {
  line(`**Máy ${index + 1}.** ${item.clue}`);
  line();
  line("Đây là loại: ..................................................................");
  line();
});
line("---");
line();

/* ============ Bảng phân biệt ============ */
line("## Bảng phân biệt Virus, Worm, Trojan");
line();
line("Điền vào ô trống mô tả đúng cho từng loại (có thể tự viết bằng lời của em, không cần đúng nguyên văn).");
line();
line("| Đặc điểm | Virus | Worm | Trojan |");
line("|---|---|---|---|");
malwareComparison.forEach((row) => {
  line(`| ${row.feature} | | | |`);
});
line();
line("---");
line();

/* ============ Phòng tuyến an toàn ============ */
line("## Phòng tuyến an toàn");
line();
line("Với mỗi hành động dưới đây, đánh dấu An toàn hoặc Nguy hiểm.");
line();
line("| # | Hành động | An toàn | Nguy hiểm |");
line("|---|---|---|---|");
defenseActions.forEach((item, index) => {
  line(`| ${index + 1} | ${item.text} | ${box} | ${box} |`);
});
line();
line("---");
line();

/* ============ Phản tư ============ */
line("## Điều em rút ra");
line();
line("Không có đáp án đúng sai cho phần này. Viết suy nghĩ thật của em.");
line();
reflectionQuestions.forEach((question, index) => {
  line(`**${index + 1}.** ${question}`);
  line();
  line("......................................................................................................");
  line();
  line("......................................................................................................");
  line();
  line("......................................................................................................");
  line();
});

fs.writeFileSync(path.join(root, "PHU_LUC_PHIEU_BAI_TAP.md"), out.join("\n"), "utf8");
console.log("Đã ghi PHU_LUC_PHIEU_BAI_TAP.md:", out.length, "dòng");
