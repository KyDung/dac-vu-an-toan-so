/*
  Sinh file DAP_AN.md từ chính js/data.js để đáp án không bao giờ lệch với web.
  Chạy lại mỗi khi sửa câu hỏi hoặc đáp án:  node tools/make-answer-key.js
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
const malwareCases = get("malwareCases");
const secretFiles = get("secretFiles");
const malwareComparison = get("malwareComparison");
const defenseActions = get("defenseActions");
const reflectionQuestions = get("reflectionQuestions");

const out = [];
const line = (value = "") => out.push(value);

/* Đánh dấu phương án đúng bằng ✅ và ghi kèm lí do của từng phương án sai. */
function optionList(options, correctIndex, feedback) {
  options.forEach((option, index) => {
    const mark = index === correctIndex ? "✅" : "⬜";
    line(`- ${mark} **${String.fromCharCode(65 + index)}.** ${option}`);
    if (feedback && feedback[index]) line(`  - *${feedback[index]}*`);
  });
}

line("# Bản đáp án dành cho giáo viên");
line();
line("File này được sinh tự động từ `js/data.js`. Không sửa trực tiếp file này: sửa `js/data.js` rồi chạy lại `node tools/make-answer-key.js`.");
line();
line("Ký hiệu: ✅ là phương án đúng, ⬜ là phương án sai. Dòng in nghiêng dưới mỗi phương án là phản hồi mà học sinh nhận được khi chọn phương án đó.");
line();
line("---");
line();

line("## Chương 1 — Năm tình huống");
line();
line("Mỗi tình huống có hai câu chấm điểm: nhận diện loại nguy cơ và chọn cách xử lí. Học sinh chọn sai được chọn lại, không bị trừ điểm.");
line();

scenarios.forEach((scenario, index) => {
  line(`### ${index + 1}. ${scenario.title}`);
  line();
  line(`**Loại nguy cơ đúng:** ${scenario.riskType}`);
  line();
  line(`**Câu hỏi tự luận:** ${scenario.question}`);
  line();
  line("Không chấm đúng sai, chỉ đọc để nắm khả năng quan sát của học sinh. Ý cần thấy:");
  line();
  line(`> ${scenario.explanation}`);
  line();
  line("**Chọn cách xử lí:**");
  line();
  optionList(scenario.options, scenario.correctAnswer, scenario.feedbackByOption);
  line();
  line(`**Gợi ý hiện khi chọn sai:** ${scenario.hint}`);
  line();
  if (scenario.supportQuestion) {
    line(`**Câu hỏi phụ (chọn nhiều):** ${scenario.supportQuestion}`);
    line();
    scenario.supportOptions.forEach((option) => line(`- ${option}`));
    line();
    line(`*${scenario.supportExplanation}*`);
    line();
  }
  if (scenario.applicationQuestion) {
    line(`**Câu hỏi vận dụng (tự luận, không chấm đúng sai):** ${scenario.applicationQuestion}`);
    line();
  }
  line(`**Kiến thức chốt lại:** ${scenario.knowledge}`);
  line();
});

line("---");
line();
line("## Chương 2 — Ba hồ sơ mã độc");
line();
malwareCases.forEach((item, index) => {
  line(`### ${index + 1}. ${item.title} — ${item.subtitle}`);
  line();
  line(`**Kiến thức cần nhớ:** ${item.keyPoint}`);
  line();
  line(`**Câu hỏi:** ${item.question}`);
  line();
  optionList(item.options, item.correctAnswer);
  line();
  line(`**Gợi ý hiện khi chọn sai:** ${item.hint}`);
  line();
  line(`**Giải thích:** ${item.explanation}`);
  line();
  line("**Bản ghi kiến thức sau khi trả lời đúng:**");
  line();
  line(`- **Từ khóa:** ${item.keywords.join(", ")}`);
  line(`- **Bản chất:** ${item.essence}`);
  line(`- **Cơ chế hoạt động:** ${item.mechanism}`);
  line("- **Tác hại:**");
  item.harms.forEach((harm) => line(`  - ${harm}`));
  line("- **Cách phòng tránh:**");
  item.prevention.forEach((action) => line(`  - ${action}`));
  line(`- **Dấu hiệu phân biệt:** ${item.distinguish}`);
  line(`- **Câu chốt:** ${item.knowledge}`);
  line();
});

line("---");
line();
line("## Bốn nhánh của trojan — đọc dấu vết, đoán loại");
line();
secretFiles.forEach((item, index) => {
  line(`**Máy ${index + 1} → ${item.name}** (${item.vi})`);
  line();
  line(`> ${item.clue}`);
  line();
  line(`Vì sao: ${item.clueWhy}`);
  line();
});
line("Nhắc lại hành vi của từng loại:");
line();
secretFiles.forEach((item) => line(`- **${item.name}:** ${item.behavior}`));
line();

line("---");
line();
line("## Bảng phân biệt Virus, Worm, Trojan");
line();
line("| Đặc điểm | Virus | Worm | Trojan |");
line("|---|---|---|---|");
malwareComparison.forEach((row) => {
  line(`| **${row.feature}** | ${row.values.virus} | ${row.values.worm} | ${row.values.trojan} |`);
});
line();
line("Lưu ý khi chấm: một mô tả có thể đúng ở nhiều cột. Ví dụ worm và trojan đều là phần mềm hoàn chỉnh.");
line();

line("---");
line();
line("## Phòng tuyến an toàn");
line();
line(`${defenseActions.length} hành động, học sinh phân loại An toàn hoặc Nguy hiểm.`);
line();
line("| # | Hành động | Đáp án | Giải thích |");
line("|---|---|---|---|");
defenseActions.forEach((item, index) => {
  line(`| ${index + 1} | ${item.text} | **${item.category}** | ${item.explanation} |`);
});
line();

line("---");
line();
line("## Phần phản tư");
line();
line("Không có đáp án đúng sai. Học sinh viết tự do, nội dung được đưa nguyên văn vào hồ sơ xuất ra.");
line();
reflectionQuestions.forEach((question, index) => line(`${index + 1}. ${question}`));
line();

fs.writeFileSync(path.join(root, "DAP_AN.md"), out.join("\n"), "utf8");
console.log("Đã ghi DAP_AN.md:", out.length, "dòng");
