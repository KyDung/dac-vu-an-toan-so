(() => {
  "use strict";

  function currentState() {
    return window.gameHelpers.getState();
  }

  function safeFileName() {
    const state = currentState();
    const name = window.gameHelpers.slugFile(state.student.name || "HocSinh");
    const className = window.gameHelpers.slugFile(state.student.className || "Lop");
    return `HoSoAnToanSo_${name}_${className}`;
  }

  function printPDF() {
    const oldTitle = document.title;
    document.title = safeFileName();
    window.alert("Trong hộp thoại in, hãy chọn “Lưu dưới dạng PDF” để tải hồ sơ.");
    window.addEventListener("afterprint", () => { document.title = oldTitle; }, { once: true });
    window.print();
  }

  function reportText() {
    const state = currentState();
    const active = window.gameHelpers.getActiveScenarios();
    const lines = [
      "HỒ SƠ AN TOÀN SỐ",
      `Họ và tên: ${state.student.name}`,
      `Lớp: ${state.student.className}`,
      `Ngày thực hiện: ${new Date(state.completedAt || Date.now()).toLocaleDateString("vi-VN")}`,
      "",
      "PHẦN A. NGUY CƠ TRÊN MẠNG"
    ];

    window.gameHelpers.getScenarioCatalog().forEach((scenario) => {
      const answer = state.scenarioAnswers[scenario.id];
      lines.push("", scenario.title);
      if (!answer) {
        lines.push("Chưa khám phá trong chế độ đã chọn.");
      } else if (answer.skipped) {
        lines.push("Đã bỏ qua theo lựa chọn của học sinh.");
      } else {
        lines.push(
          `Nhận định: ${answer.analysis || "Chưa nhập"}`,
          `Nguy cơ lần đầu: ${answer.firstRisk || "Chưa chọn"}`,
          `Nguy cơ cuối: ${answer.lastRisk || "Chưa chọn"}`,
          `Xử lí lần đầu: ${answer.firstAction !== undefined ? scenario.options[answer.firstAction] : "Chưa chọn"}`,
          `Xử lí cuối: ${answer.lastAction !== undefined ? scenario.options[answer.lastAction] : "Chưa chọn"}`,
          ...(scenario.supportQuestion ? [`Người hỗ trợ: ${(answer.lastSupport || []).map((index) => scenario.supportOptions[index]).join(", ") || "Chưa chọn"}`] : []),
          ...(scenario.applicationQuestion ? [`Nguyên tắc đề xuất: ${answer.application || "Chưa nhập"}`] : []),
          `Kiến thức: ${scenario.knowledge}`
        );
      }
    });

    lines.push("", "PHẦN B. PHẦN MỀM ĐỘC HẠI");
    malwareCases.forEach((item) => {
      const answer = state.malwareAnswers[item.id] || {};
      if (!answer.complete) {
        lines.push("", item.unlock, "Chưa hoàn thành hồ sơ kiến thức.");
        return;
      }
      lines.push(
        "",
        item.unlock,
        `Phân tích của học sinh: ${answer.lastChoice !== undefined ? item.options[answer.lastChoice] : "Chưa thực hiện"}`,
        `Từ khóa: ${item.keywords.join(", ")}`,
        `Bản chất: ${item.essence}`,
        `Cơ chế hoạt động: ${item.mechanism}`,
        "Tác hại có thể gây ra:",
        ...item.harms.map((text) => `- ${text}`),
        "Cách phòng tránh:",
        ...item.prevention.map((text) => `- ${text}`),
        `Dấu hiệu phân biệt: ${item.distinguish}`
      );
    });
    lines.push("", "Bảng phân biệt:");
    malwareComparison.forEach((row) => {
      lines.push(`${row.feature} | Virus: ${row.values.virus} | Worm: ${row.values.worm} | Trojan: ${row.values.trojan}`);
    });
    lines.push("", "Phòng tuyến an toàn:");
    state.defenseAnswers.forEach((answer, index) => {
      const item = defenseActions[index];
      if (item) lines.push(`${index + 1}. ${item.text}: ${answer.choice}. ${item.explanation}`);
    });

    lines.push("", "PHẦN C. ĐIỀU EM RÚT RA");
    reflectionQuestions.forEach((question, index) => lines.push("", `${index + 1}. ${question}`, state.reflections[index] || "Chưa trả lời"));
    lines.push("", `Điểm điều tra: ${state.scores.identify}`, `Điểm quyết định: ${state.scores.decide}`, `Điểm phân tích: ${state.scores.analysis}`);
    return lines.join("\n");
  }

  async function copyReport() {
    const content = reportText();
    try {
      await navigator.clipboard.writeText(content);
      window.alert("Đã sao chép nội dung Hồ sơ vào bộ nhớ tạm.");
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = content;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      window.alert("Đã sao chép nội dung Hồ sơ. Nếu thao tác không thành công, em có thể dùng chức năng in trang.");
    }
  }

  function textParagraph(docx, text, options = {}) {
    return new docx.Paragraph({
      ...options,
      children: [new docx.TextRun({ text: String(text || ""), font: "Times New Roman", size: options.size || 24, bold: Boolean(options.bold) })]
    });
  }

  function tableCell(docx, text, bold = false) {
    const border = { style: docx.BorderStyle.SINGLE, size: 4, color: "777777" };
    return new docx.TableCell({
      borders: { top: border, bottom: border, left: border, right: border },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [textParagraph(docx, text, { bold })]
    });
  }

  async function exportWord() {
    if (!window.docx) {
      window.alert("Không tải được thư viện tạo Word do kết nối mạng. Em có thể dùng nút Sao chép nội dung Hồ sơ hoặc Tải PDF.");
      return;
    }

    const state = currentState();
    const d = window.docx;
    const children = [
      textParagraph(d, "HỒ SƠ AN TOÀN SỐ", { heading: d.HeadingLevel.TITLE, bold: true, size: 36, alignment: d.AlignmentType.CENTER }),
      textParagraph(d, `Họ và tên: ${state.student.name}`),
      textParagraph(d, `Lớp: ${state.student.className}`),
      textParagraph(d, `Ngày thực hiện: ${new Date(state.completedAt || Date.now()).toLocaleDateString("vi-VN")}`),
      textParagraph(d, "PHẦN A. NGUY CƠ TRÊN MẠNG", { heading: d.HeadingLevel.HEADING_1, bold: true, size: 30 })
    ];

    window.gameHelpers.getScenarioCatalog().forEach((scenario) => {
      const answer = state.scenarioAnswers[scenario.id];
      children.push(textParagraph(d, scenario.title, { heading: d.HeadingLevel.HEADING_2, bold: true, size: 27 }));
      if (!answer) {
        children.push(textParagraph(d, "Chưa khám phá trong chế độ đã chọn."));
      } else if (answer.skipped) {
        children.push(textParagraph(d, "Đã bỏ qua theo lựa chọn của học sinh."));
      } else {
        const rows = [
          ["Nhận định ban đầu", answer.analysis || "Chưa nhập"],
          ["Nguy cơ lần đầu", answer.firstRisk || "Chưa chọn"],
          ["Nguy cơ cuối cùng", answer.lastRisk || "Chưa chọn"],
          ["Xử lí lần đầu", answer.firstAction !== undefined ? scenario.options[answer.firstAction] : "Chưa chọn"],
          ["Xử lí cuối cùng", answer.lastAction !== undefined ? scenario.options[answer.lastAction] : "Chưa chọn"],
          ...(scenario.supportQuestion ? [["Người hỗ trợ", (answer.lastSupport || []).map((index) => scenario.supportOptions[index]).join(", ") || "Chưa chọn"]] : []),
          ...(scenario.applicationQuestion ? [["Nguyên tắc đề xuất", answer.application || "Chưa nhập"]] : []),
          ["Kiến thức", scenario.knowledge]
        ];
        children.push(new d.Table({
          width: { size: 100, type: d.WidthType.PERCENTAGE },
          rows: rows.map((row) => new d.TableRow({ children: [tableCell(d, row[0], true), tableCell(d, row[1])] }))
        }));
      }
    });

    children.push(textParagraph(d, "PHẦN B. PHẦN MỀM ĐỘC HẠI", { heading: d.HeadingLevel.HEADING_1, bold: true, size: 30, pageBreakBefore: true }));
    malwareCases.forEach((item) => {
      const answer = state.malwareAnswers[item.id] || {};
      children.push(textParagraph(d, item.unlock, { heading: d.HeadingLevel.HEADING_2, bold: true, size: 27 }));
      if (!answer.complete) {
        children.push(textParagraph(d, "Chưa hoàn thành hồ sơ kiến thức."));
        return;
      }
      const rows = [
        ["Phân tích của học sinh", answer.lastChoice !== undefined ? item.options[answer.lastChoice] : "Chưa thực hiện"],
        ["Từ khóa", item.keywords.join(", ")],
        ["Bản chất", item.essence],
        ["Cơ chế hoạt động", item.mechanism],
        ["Tác hại", item.harms.join(" • ")],
        ["Cách phòng tránh", item.prevention.join(" • ")],
        ["Dấu hiệu phân biệt", item.distinguish]
      ];
      children.push(new d.Table({
        width: { size: 100, type: d.WidthType.PERCENTAGE },
        rows: rows.map((row) => new d.TableRow({ children: [tableCell(d, row[0], true), tableCell(d, row[1])] }))
      }));
    });

    children.push(textParagraph(d, "Bảng phân biệt Virus, Worm và Trojan", { heading: d.HeadingLevel.HEADING_2, bold: true, size: 27 }));
    children.push(new d.Table({
      width: { size: 100, type: d.WidthType.PERCENTAGE },
      rows: [
        new d.TableRow({ children: [tableCell(d, "Đặc điểm", true), tableCell(d, "Virus", true), tableCell(d, "Worm", true), tableCell(d, "Trojan", true)] }),
        ...malwareComparison.map((row) => new d.TableRow({ children: [tableCell(d, row.feature, true), tableCell(d, row.values.virus), tableCell(d, row.values.worm), tableCell(d, row.values.trojan)] }))
      ]
    }));

    children.push(textParagraph(d, "Phòng tuyến an toàn", { heading: d.HeadingLevel.HEADING_2, bold: true, size: 27 }));
    const actions = defenseActions;
    state.defenseAnswers.forEach((answer, index) => {
      if (actions[index]) children.push(textParagraph(d, `${index + 1}. ${actions[index].text}: ${answer.choice}. ${actions[index].explanation}`));
    });

    children.push(textParagraph(d, "PHẦN C. ĐIỀU EM RÚT RA", { heading: d.HeadingLevel.HEADING_1, bold: true, size: 30, pageBreakBefore: true }));
    reflectionQuestions.forEach((question, index) => {
      children.push(textParagraph(d, `${index + 1}. ${question}`, { bold: true }), textParagraph(d, state.reflections[index] || "Chưa trả lời"));
    });

    children.push(
      textParagraph(d, `Điểm điều tra: ${state.scores.identify}`),
      textParagraph(d, `Điểm quyết định: ${state.scores.decide}`),
      textParagraph(d, `Điểm phân tích: ${state.scores.analysis}`)
    );

    const documentFile = new d.Document({
      styles: {
        default: {
          document: { run: { font: "Times New Roman", size: 24 }, paragraph: { spacing: { after: 120 } } }
        }
      },
      sections: [{ properties: {}, children }]
    });

    try {
      const blob = await d.Packer.toBlob(documentFile);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${safeFileName()}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      console.error("Không thể tạo tệp Word:", error);
      window.alert("Không thể tạo tệp Word lúc này. Em có thể sao chép nội dung Hồ sơ hoặc dùng chức năng in PDF.");
    }
  }

  window.reportExport = { printPDF, exportWord, copyReport, reportText };
})();
