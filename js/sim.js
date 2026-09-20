/*
  Mô phỏng cơ chế hoạt động của phần mềm độc hại bằng canvas.
  Nội dung bám theo SGK: virus là đoạn mã phải gắn vào vật chủ, worm là phần mềm
  hoàn chỉnh tự lây qua lỗ hổng hoặc do bị lừa cài, trojan là phần mềm nội gián.
  Mỗi mô phỏng gồm nhiều bước, mỗi bước có một câu mô tả hiện bên dưới canvas.
*/
(function () {
  "use strict";

  /* Toàn bộ hình vẽ dùng hệ tọa độ ảo 800x440 rồi được co giãn vừa khung. */
  const W = 800;
  const H = 440;

  const COLOR = {
    ink: "#16242c",
    muted: "#50636d",
    line: "#b8c6cc",
    lineStrong: "#7f949d",
    paper: "#ffffff",
    paper2: "#f0f4f5",
    accent: "#c84722",
    accentSoft: "#f9e5dd",
    danger: "#9b2f2f",
    dangerSoft: "#f8e2e2",
    safe: "#25634f",
    safeSoft: "#e0eee9",
    warning: "#8a5b10",
    warningSoft: "#fff1d3",
  };

  const FONT = '"Segoe UI", "Noto Sans", Arial, sans-serif';
  const MONO = '"Cascadia Code", "SFMono-Regular", Consolas, monospace';

  /* ---------- Hàm vẽ dùng chung ---------- */

  function rr(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function box(ctx, x, y, w, h, opts) {
    const o = opts || {};
    rr(ctx, x, y, w, h, o.radius || 10);
    ctx.fillStyle = o.fill || COLOR.paper;
    ctx.fill();
    ctx.lineWidth = o.width || 2;
    ctx.strokeStyle = o.stroke || COLOR.lineStrong;
    if (o.dashed) ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function text(ctx, value, x, y, opts) {
    const o = opts || {};
    ctx.fillStyle = o.color || COLOR.ink;
    ctx.font = `${o.weight || 600} ${o.size || 14}px ${o.mono ? MONO : FONT}`;
    ctx.textAlign = o.align || "center";
    ctx.textBaseline = o.baseline || "middle";
    ctx.fillText(value, x, y);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  function arrow(ctx, x1, y1, x2, y2, opts) {
    const o = opts || {};
    const color = o.color || COLOR.lineStrong;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = o.width || 2.5;
    if (o.dashed) ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = o.head || 9;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(angle - 0.42), y2 - head * Math.sin(angle - 0.42));
    ctx.lineTo(x2 - head * Math.cos(angle + 0.42), y2 - head * Math.sin(angle + 0.42));
    ctx.closePath();
    ctx.fill();
  }

  /* Máy tính: dùng cho sơ đồ mạng của worm và cho trojan. */
  function computer(ctx, x, y, label, state) {
    const infected = state === "infected";
    const target = state === "target";
    box(ctx, x - 44, y - 34, 88, 58, {
      fill: infected ? COLOR.dangerSoft : COLOR.paper,
      stroke: infected ? COLOR.danger : COLOR.lineStrong,
      width: infected ? 2.6 : 2,
      dashed: target,
    });
    ctx.fillStyle = infected ? COLOR.danger : COLOR.line;
    ctx.fillRect(x - 12, y + 24, 24, 8);
    ctx.fillRect(x - 24, y + 32, 48, 4);
    if (infected) {
      text(ctx, "!", x, y - 5, { size: 26, weight: 800, color: COLOR.danger });
    }
    text(ctx, label, x, y + 48, { size: 13, weight: 700, color: infected ? COLOR.danger : COLOR.ink, mono: true });
  }

  /* Khối phần mềm: virus dùng để phân biệt phần mềm sạch và phần mềm đã nhiễm. */
  function program(ctx, x, y, w, h, label, infected) {
    box(ctx, x, y, w, h, {
      fill: infected ? COLOR.dangerSoft : COLOR.paper,
      stroke: infected ? COLOR.danger : COLOR.lineStrong,
      width: infected ? 2.6 : 2,
    });
    text(ctx, label, x + w / 2, y + h / 2 - (infected ? 10 : 0), { size: 14, weight: 700, mono: true });
    if (infected) {
      box(ctx, x + 10, y + h - 26, w - 20, 17, { fill: COLOR.danger, stroke: COLOR.danger, radius: 5 });
      text(ctx, "đoạn mã độc", x + w / 2, y + h - 17, { size: 12, weight: 700, color: "#fff" });
    }
  }

  /* Mảnh mã độc đang di chuyển. */
  function codeChip(ctx, x, y) {
    box(ctx, x - 46, y - 11, 92, 22, { fill: COLOR.danger, stroke: COLOR.danger, radius: 6 });
    text(ctx, "đoạn mã độc", x, y, { size: 12, weight: 700, color: "#fff" });
  }

  function packet(ctx, x, y, label) {
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = COLOR.danger;
    ctx.fill();
    if (label) text(ctx, label, x, y - 20, { size: 12, weight: 700, color: COLOR.danger, mono: true });
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* Làm nhịp chuyển động mượt hơn ở đầu và cuối mỗi bước. */
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function caption(ctx, value) {
    text(ctx, value, W / 2, H - 16, { size: 13, weight: 600, color: COLOR.ink });
  }

  /* ---------- Định nghĩa từng mô phỏng ---------- */

  /* Khung có tiêu đề đặt phía trên, dùng để chia màn hình thành các vùng tách bạch. */
  function panel(ctx, x, y, w, h, title, tone) {
    const danger = tone === "danger";
    const safe = tone === "safe";
    box(ctx, x, y, w, h, {
      fill: danger ? COLOR.dangerSoft : safe ? COLOR.safeSoft : COLOR.paper2,
      stroke: danger ? COLOR.danger : safe ? COLOR.safe : COLOR.lineStrong,
      dashed: Boolean(tone === "ghost"),
    });
    if (title) {
      text(ctx, title, x + w / 2, y - 14, {
        size: 12,
        weight: 800,
        mono: true,
        color: danger ? COLOR.danger : safe ? COLOR.safe : COLOR.ink,
      });
    }
  }

  /* Đường đi hai chặng: đi dọc trước rồi đi ngang, để mảnh mã không cắt qua khối nào. */
  function elbow(from, to, p, verticalFirst) {
    const half = 0.5;
    if (verticalFirst) {
      if (p < half) return { x: from.x, y: lerp(from.y, to.y, ease(p / half)) };
      return { x: lerp(from.x, to.x, ease((p - half) / half)), y: to.y };
    }
    if (p < half) return { x: lerp(from.x, to.x, ease(p / half)), y: from.y };
    return { x: to.x, y: lerp(from.y, to.y, ease((p - half) / half)) };
  }

  const SIMS = {};

  /* ---------- Virus ---------- */
  /* Bố cục: bộ nhớ ở giữa trên, hai phần mềm ở hai bên dưới, hành lang trống ở giữa. */
  const VIRUS = {
    mem: { x: 310, y: 74, w: 180, h: 72 },
    a: { x: 70, y: 190, w: 200, h: 130 },
    b: { x: 530, y: 190, w: 200, h: 130 },
    lane: 124,
  };

  function virusStage(ctx, aInfected, bInfected, activeLeg) {
    panel(ctx, VIRUS.mem.x, VIRUS.mem.y, VIRUS.mem.w, VIRUS.mem.h, "BỘ NHỚ");
    /* Chú thích đặt ở nửa trên khung, hành lang mảnh mã đi qua nằm ở nửa dưới. */
    text(ctx, "nơi đoạn mã nằm chờ", 400, 92, { size: 12, color: COLOR.ink });

    /* Đường đi luôn hiện sẵn dạng nét mờ để thấy cơ chế ngay cả khi đang dừng. */
    const leg = (on) => (on ? COLOR.danger : COLOR.line);
    arrow(ctx, 170, 184, 170, VIRUS.lane + 16, { color: leg(activeLeg === 1), dashed: true, width: 2 });
    arrow(ctx, 196, VIRUS.lane, 336, VIRUS.lane, { color: leg(activeLeg === 1), dashed: true, width: 2 });
    arrow(ctx, 464, VIRUS.lane, 604, VIRUS.lane, { color: leg(activeLeg === 2), dashed: true, width: 2 });
    arrow(ctx, 630, VIRUS.lane + 16, 630, 184, { color: leg(activeLeg === 2), dashed: true, width: 2 });

    program(ctx, VIRUS.a.x, VIRUS.a.y, VIRUS.a.w, VIRUS.a.h, "PHẦN MỀM A", aInfected);
    program(ctx, VIRUS.b.x, VIRUS.b.y, VIRUS.b.w, VIRUS.b.h, "PHẦN MỀM B", bInfected);
    text(ctx, aInfected ? "đã nhiễm" : "còn sạch", 170, 340, {
      size: 12, weight: 700, color: aInfected ? COLOR.danger : COLOR.safe,
    });
    text(ctx, bInfected ? "đã nhiễm" : "còn sạch", 630, 340, {
      size: 12, weight: 700, color: bInfected ? COLOR.danger : COLOR.safe,
    });
  }

  SIMS.virus = {
    label: "Cơ chế lây lan của virus",
    steps: [
      {
        note: "Virus không phải phần mềm hoàn chỉnh. Nó là đoạn mã độc gắn sẵn bên trong một phần mềm vật chủ.",
        draw(ctx) {
          virusStage(ctx, true, false);
          caption(ctx, "Chưa chạy phần mềm A thì đoạn mã vẫn nằm yên, chưa phát tác.");
        },
      },
      {
        note: "Khi phần mềm A được chạy, đoạn mã độc được nạp vào bộ nhớ và nằm chờ ở đó.",
        draw(ctx, t) {
          virusStage(ctx, true, false, 1);
          const pos = elbow({ x: 170, y: 264 }, { x: 400, y: VIRUS.lane }, t, true);
          codeChip(ctx, pos.x, pos.y);
          caption(ctx, "Đoạn mã chỉ hoạt động được khi phần mềm vật chủ được thi hành.");
        },
      },
      {
        note: "Khi một phần mềm khác được chạy, đoạn mã trong bộ nhớ tự chèn bản sao vào phần mềm đó.",
        draw(ctx, t) {
          virusStage(ctx, true, t > 0.85, 2);
          const pos = elbow({ x: 400, y: VIRUS.lane }, { x: 630, y: 264 }, t, false);
          codeChip(ctx, pos.x, pos.y);
          caption(ctx, "Bộ nhớ là nơi đoạn mã chờ để bám sang vật chủ tiếp theo.");
        },
      },
      {
        note: "Phần mềm B cũng đã nhiễm. Một chu kì lây lan hoàn thành và tiếp tục lặp lại với phần mềm khác.",
        draw(ctx) {
          virusStage(ctx, true, true);
          arrow(ctx, 285, 370, 515, 370, { color: COLOR.danger });
          text(ctx, "chu kì lặp lại", 400, 388, { size: 13, weight: 700, color: COLOR.ink });
          caption(ctx, "Virus cần vật chủ: FILE A → [VIRUS + FILE A] → FILE B → [VIRUS + FILE B]");
        },
      },
    ],
  };

  /* ---------- Worm ---------- */
  /* Bố cục: thẻ tin nhắn nằm riêng ở dải trên, sơ đồ mạng nằm hẳn ở dải dưới. */
  const NET = {
    a: { x: 140, y: 268 },
    b: { x: 400, y: 196 },
    c: { x: 400, y: 340 },
    d: { x: 660, y: 268 },
  };

  function wormStage(ctx, states) {
    computer(ctx, NET.a.x, NET.a.y, "MÁY A", states.a);
    computer(ctx, NET.b.x, NET.b.y, "MÁY B", states.b);
    computer(ctx, NET.c.x, NET.c.y, "MÁY C", states.c);
    computer(ctx, NET.d.x, NET.d.y, "MÁY D", states.d);
  }

  function messageCard(ctx, title, subtitle, tone) {
    panel(ctx, 250, 34, 300, 74, "TIN NHẮN NHẬN ĐƯỢC", tone);
    text(ctx, title, 400, 60, { size: 13, weight: 700, color: COLOR.ink });
    text(ctx, subtitle, 400, 86, {
      size: 13, weight: 800, mono: true, color: tone === "danger" ? COLOR.danger : COLOR.warning,
    });
  }

  SIMS.worm = {
    label: "Cơ chế lây lan của worm",
    steps: [
      {
        note: "Worm là một phần mềm hoàn chỉnh. Nó thường được giấu sau một liên kết có vỏ bọc lành mạnh.",
        draw(ctx) {
          messageCard(ctx, "Ảnh của bạn ở đây nè!", "[ BẤM XEM ẢNH ]");
          wormStage(ctx, { a: "clean", b: "clean", c: "clean", d: "clean" });
          caption(ctx, "Liên kết trông lành mạnh nhưng có phần mềm độc hại đi kèm phía sau.");
        },
      },
      {
        note: "Nạn nhân bấm vào liên kết. Ngoài nội dung hiển thị, worm cũng được tải về và tự cài đặt.",
        draw(ctx, t) {
          const p = ease(t);
          messageCard(ctx, "Đang tải nội dung...", "+ worm đi kèm", "danger");
          wormStage(ctx, { a: p > 0.75 ? "infected" : "clean", b: "clean", c: "clean", d: "clean" });
          const pos = elbow({ x: 400, y: 130 }, { x: NET.a.x, y: 228 }, t, false);
          packet(ctx, pos.x, pos.y);
          caption(ctx, "Worm không cần bám vào phần mềm nào, nó tự chạy như một phần mềm bình thường.");
        },
      },
      {
        note: "Worm tự lan sang máy khác trong mạng, lợi dụng lỗ hổng bảo mật, không cần người dùng mở tệp.",
        draw(ctx, t) {
          const p = ease(t);
          const hit = p > 0.85;
          wormStage(ctx, { a: "infected", b: hit ? "infected" : "target", c: hit ? "infected" : "target", d: "clean" });
          arrow(ctx, 190, 250, 348, 208, { color: COLOR.danger, dashed: true });
          arrow(ctx, 190, 290, 348, 330, { color: COLOR.danger, dashed: true });
          packet(ctx, lerp(190, 348, p), lerp(250, 208, p));
          packet(ctx, lerp(190, 348, p), lerp(290, 330, p));
          text(ctx, "tự lan qua lỗ hổng bảo mật", 400, 60, { size: 14, weight: 700, color: COLOR.ink });
          caption(ctx, "Đây là điểm khác virus: worm tự lây, không chờ ai chạy vật chủ.");
        },
      },
      {
        note: "Chỉ từ một máy bị lừa, worm có thể lan ra toàn bộ mạng trong thời gian rất ngắn.",
        draw(ctx, t) {
          const p = ease(t);
          wormStage(ctx, { a: "infected", b: "infected", c: "infected", d: p > 0.85 ? "infected" : "target" });
          arrow(ctx, 452, 208, 610, 250, { color: COLOR.danger, dashed: true });
          arrow(ctx, 452, 330, 610, 290, { color: COLOR.danger, dashed: true });
          packet(ctx, lerp(452, 610, p), lerp(208, 250, p));
          packet(ctx, lerp(452, 610, p), lerp(330, 290, p));
          caption(ctx, "Worm có thể lan theo chuỗi: MÁY A → MÁY B → MÁY C → MÁY D");
        },
      },
    ],
  };

  /* ---------- Trojan ---------- */
  /* Bố cục chia đôi: trái là thứ người dùng thấy, phải là thứ đang thật sự diễn ra. */
  const LEFT = { x: 40, y: 96, w: 340, h: 250 };
  const RIGHT = { x: 420, y: 96, w: 340, h: 250 };

  function trojanSplit(ctx) {
    panel(ctx, LEFT.x, LEFT.y, LEFT.w, LEFT.h, "NGƯỜI DÙNG NHÌN THẤY", "safe");
    panel(ctx, RIGHT.x, RIGHT.y, RIGHT.w, RIGHT.h, "THỰC TẾ ĐANG DIỄN RA", "danger");
  }

  function gameWindow(ctx, subtitle) {
    box(ctx, 70, 140, 280, 160, { fill: COLOR.paper });
    box(ctx, 70, 140, 280, 28, { fill: COLOR.paper2, radius: 10 });
    text(ctx, "GAME PRO", 210, 154, { size: 12, weight: 800, mono: true });
    text(ctx, "Trò chơi chạy bình thường", 210, 215, { size: 13, weight: 700, color: COLOR.safe });
    text(ctx, subtitle, 210, 245, { size: 12, color: COLOR.ink });
  }

  SIMS.trojan = {
    label: "Cơ chế hoạt động của trojan",
    steps: [
      {
        note: "Người dùng tải một phần mềm bẻ khóa từ nguồn không rõ ràng.",
        draw(ctx) {
          panel(ctx, 230, 130, 340, 170, "TẢI VỀ TỪ TRANG LẠ");
          text(ctx, "GAME_PRO_FREE_CRACK.exe", 400, 180, { size: 14, weight: 800, mono: true });
          text(ctx, "miễn phí · nguồn không xác minh", 400, 210, { size: 12, color: COLOR.ink });
          box(ctx, 330, 240, 140, 34, { fill: COLOR.warningSoft, stroke: COLOR.warning, radius: 8 });
          text(ctx, "TẢI XUỐNG", 400, 257, { size: 12, weight: 800, color: COLOR.warning });
          caption(ctx, "Rất nhiều phần mềm bẻ khóa trên mạng bị gắn mã độc một cách cố ý.");
        },
      },
      {
        note: "Cài đặt xong, trò chơi chạy đúng như quảng cáo nên người dùng không nghi ngờ gì.",
        draw(ctx, t) {
          trojanSplit(ctx);
          gameWindow(ctx, "Màn " + Math.max(1, Math.round(ease(t) * 3)));
          text(ctx, "chưa thấy dấu hiệu nào", 590, 200, { size: 13, weight: 700, color: COLOR.danger });
          text(ctx, "nhưng phần mềm đã ở trong máy", 590, 230, { size: 12, color: COLOR.ink });
          caption(ctx, "Vỏ bọc hoạt động đúng như quảng cáo là điểm mạnh của trojan.");
        },
      },
      {
        note: "Phía sau lớp vỏ đó, một tiến trình nội gián âm thầm đọc dữ liệu của người dùng.",
        draw(ctx, t) {
          const p = ease(t);
          trojanSplit(ctx);
          gameWindow(ctx, "Người dùng không thấy gì khác lạ");
          box(ctx, 450, 140, 280, 160, { fill: COLOR.paper, stroke: COLOR.danger, dashed: true });
          text(ctx, "tiến trình ẩn", 590, 162, { size: 12, weight: 800, mono: true, color: COLOR.danger });
          ["đang đọc: tài khoản", "đang đọc: mật khẩu", "đang đọc: tệp cá nhân"].forEach((row, i) => {
            if (p > i * 0.3) text(ctx, row, 590, 200 + i * 32, { size: 12, color: COLOR.ink });
          });
          caption(ctx, "Người dùng chỉ nhìn thấy lớp vỏ phía trước, không thấy hoạt động nội gián.");
        },
      },
      {
        note: "Dữ liệu bị gửi ra máy của kẻ tấn công. Trojan không đặt trọng tâm vào việc tự lây sang máy khác.",
        draw(ctx, t) {
          const p = ease(t);
          computer(ctx, 130, 210, "MÁY NẠN NHÂN", "infected");
          panel(ctx, 560, 168, 200, 92, "KẺ TẤN CÔNG", "danger");
          text(ctx, p > 0.9 ? "đã nhận dữ liệu" : "đang nhận...", 660, 214, { size: 13, weight: 700, color: COLOR.danger });
          arrow(ctx, 190, 205, 550, 205, { color: COLOR.danger, dashed: true });
          packet(ctx, lerp(190, 550, p), 205, "dữ liệu");
          computer(ctx, 360, 340, "MÁY BÊN CẠNH", "clean");
          text(ctx, "không tự lây sang máy khác", 400, 62, { size: 14, weight: 700, color: COLOR.safe });
          caption(ctx, "Trojan là phần mềm nội gián: ăn cắp thông tin và chiếm quyền, không phải lây lan.");
        },
      },
    ],
  };

  /* ---------- Spyware ---------- */
  SIMS.spyware = {
    label: "Spyware · phần mềm gián điệp",
    steps: [
      {
        note: "Spyware nằm im trong máy và lặng lẽ ghi lại những gì người dùng làm.",
        draw(ctx) {
          panel(ctx, 60, 110, 330, 220, "MÀN HÌNH NGƯỜI DÙNG");
          ["truy cập ngân hàng", "hộp thư cá nhân", "trang mua sắm"].forEach((row, i) => {
            box(ctx, 90, 150 + i * 56, 270, 40, { fill: COLOR.paper, radius: 7 });
            text(ctx, row, 225, 170 + i * 56, { size: 12, color: COLOR.ink });
          });
          panel(ctx, 450, 160, 280, 120, "SPYWARE", "danger");
          text(ctx, "đang quan sát", 590, 205, { size: 13, weight: 700, color: COLOR.danger });
          text(ctx, "người dùng không thấy gì", 590, 240, { size: 12, color: COLOR.ink });
          caption(ctx, "Trên màn hình không có dấu hiệu nào cho thấy máy đang bị theo dõi.");
        },
      },
      {
        note: "Những thông tin thu thập được gom lại thành một gói dữ liệu.",
        draw(ctx, t) {
          const p = ease(t);
          panel(ctx, 60, 110, 330, 220, "MÀN HÌNH NGƯỜI DÙNG");
          ["truy cập ngân hàng", "hộp thư cá nhân", "trang mua sắm"].forEach((row, i) => {
            const taken = p > (i + 1) * 0.25;
            box(ctx, 90, 150 + i * 56, 270, 40, {
              fill: taken ? COLOR.dangerSoft : COLOR.paper,
              stroke: taken ? COLOR.danger : COLOR.lineStrong,
              radius: 7,
            });
            text(ctx, row, 225, 170 + i * 56, { size: 12, color: COLOR.ink });
          });
          panel(ctx, 450, 160, 280, 120, "GÓI DỮ LIỆU", "danger");
          text(ctx, Math.min(3, Math.round(p * 3)) + "/3 mục đã gom", 590, 220, {
            size: 14, weight: 800, mono: true, color: COLOR.danger,
          });
          caption(ctx, "Spyware có mục đích ăn trộm thông tin để chuyển ra ngoài.");
        },
      },
      {
        note: "Gói dữ liệu được gửi ra ngoài cho kẻ tấn công.",
        draw(ctx, t) {
          const p = ease(t);
          panel(ctx, 60, 170, 240, 120, "MÁY NẠN NHÂN");
          text(ctx, "gói dữ liệu", 180, 230, { size: 13, weight: 700, color: COLOR.danger });
          panel(ctx, 500, 170, 240, 120, "KẺ TẤN CÔNG", "danger");
          text(ctx, p > 0.9 ? "đã nhận" : "đang nhận...", 620, 230, { size: 13, weight: 700, color: COLOR.danger });
          arrow(ctx, 310, 230, 490, 230, { color: COLOR.danger, dashed: true });
          packet(ctx, lerp(310, 490, p), 230, "thông tin");
          caption(ctx, "Thông tin cá nhân rời khỏi máy mà người dùng không hề biết.");
        },
      },
    ],
  };

  /* ---------- Keylogger ---------- */
  function keyboard(ctx, activeIndex) {
    panel(ctx, 60, 240, 380, 120, "BÀN PHÍM");
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        const active = activeIndex >= 0 && r * 9 + c === activeIndex;
        box(ctx, 78 + c * 39, 256 + r * 34, 32, 27, {
          fill: active ? COLOR.accentSoft : COLOR.paper,
          stroke: active ? COLOR.accent : COLOR.line,
          radius: 5,
          width: 1.4,
        });
      }
    }
  }

  SIMS.keylogger = {
    label: "Keylogger · ghi lại phím bấm",
    steps: [
      {
        note: "Keylogger là một loại spyware, nó ngầm ghi lại hoạt động của bàn phím và chuột.",
        draw(ctx) {
          panel(ctx, 60, 90, 380, 110, "Ô NHẬP MẬT KHẨU");
          text(ctx, "••••••••", 250, 148, { size: 20, weight: 800, mono: true, color: COLOR.ink });
          keyboard(ctx, -1);
          panel(ctx, 500, 170, 240, 130, "KEYLOGGER", "danger");
          text(ctx, "đang ghi", 620, 220, { size: 13, weight: 700, color: COLOR.danger });
          text(ctx, "nằm ẩn trong máy", 620, 255, { size: 12, color: COLOR.ink });
          caption(ctx, "Trên màn hình, mật khẩu vẫn được che bằng dấu chấm như bình thường.");
        },
      },
      {
        note: "Từng phím bấm được ghi lại thành một bản nhật kí ở phía sau.",
        draw(ctx, t) {
          const p = ease(t);
          const typed = "m4tkh4u!";
          const count = Math.max(1, Math.round(p * typed.length));
          panel(ctx, 60, 90, 380, 110, "Ô NHẬP MẬT KHẨU");
          text(ctx, "•".repeat(count), 250, 148, { size: 20, weight: 800, mono: true, color: COLOR.ink });
          keyboard(ctx, Math.round(p * 26) % 27);
          panel(ctx, 500, 170, 240, 130, "NHẬT KÍ PHÍM", "danger");
          text(ctx, typed.slice(0, count), 620, 235, { size: 18, weight: 800, mono: true, color: COLOR.danger });
          caption(ctx, "Keylogger ghi đúng kí tự thật, không phải dấu chấm che trên màn hình.");
        },
      },
      {
        note: "Bản nhật kí được gửi ra ngoài, kẻ tấn công đọc được mật khẩu thật.",
        draw(ctx, t) {
          const p = ease(t);
          panel(ctx, 60, 170, 240, 120, "NHẬT KÍ PHÍM", "danger");
          text(ctx, "m4tkh4u!", 180, 230, { size: 18, weight: 800, mono: true, color: COLOR.danger });
          panel(ctx, 500, 170, 240, 120, "KẺ TẤN CÔNG", "danger");
          text(ctx, p > 0.9 ? "đã có mật khẩu" : "đang nhận...", 620, 230, { size: 13, weight: 700, color: COLOR.danger });
          arrow(ctx, 310, 230, 490, 230, { color: COLOR.danger, dashed: true });
          packet(ctx, lerp(310, 490, p), 230);
          caption(ctx, "Vì vậy đừng để lộ mật khẩu và hãy dùng phần mềm phòng chống mã độc.");
        },
      },
    ],
  };

  /* ---------- Backdoor ---------- */
  function machineWithDoors(ctx, backdoorAlpha, backdoorLabel) {
    panel(ctx, 260, 96, 280, 250, "MÁY TÍNH");
    box(ctx, 290, 140, 220, 76, { fill: COLOR.safeSoft, stroke: COLOR.safe, radius: 8 });
    text(ctx, "CỬA ĐĂNG NHẬP", 400, 164, { size: 12, weight: 800, mono: true, color: COLOR.safe });
    text(ctx, "cần tài khoản + mật khẩu", 400, 190, { size: 12, color: COLOR.ink });
    if (backdoorAlpha > 0) {
      ctx.globalAlpha = backdoorAlpha;
      box(ctx, 290, 246, 220, 76, { fill: COLOR.dangerSoft, stroke: COLOR.danger, radius: 8, dashed: backdoorAlpha < 1 });
      text(ctx, "CỬA SAU", 400, 270, { size: 12, weight: 800, mono: true, color: COLOR.danger });
      text(ctx, backdoorLabel, 400, 296, { size: 12, color: COLOR.ink });
      ctx.globalAlpha = 1;
    }
  }

  SIMS.backdoor = {
    label: "Backdoor · lối vào bí mật",
    steps: [
      {
        note: "Bình thường, muốn vào máy phải đi qua cửa đăng nhập và cần đúng mật khẩu.",
        draw(ctx) {
          machineWithDoors(ctx, 0, "");
          panel(ctx, 40, 150, 160, 80, "NGƯỜI DÙNG", "safe");
          arrow(ctx, 212, 180, 278, 178, { color: COLOR.safe });
          caption(ctx, "Đây là lối vào hợp lệ duy nhất khi máy còn an toàn.");
        },
      },
      {
        note: "Backdoor tạo thêm một tài khoản bí mật, giống như mở một cửa sau mà chủ máy không biết.",
        draw(ctx, t) {
          machineWithDoors(ctx, Math.max(0.15, ease(t)), "tài khoản bí mật");
          panel(ctx, 40, 150, 160, 80, "NGƯỜI DÙNG", "safe");
          arrow(ctx, 212, 180, 278, 178, { color: COLOR.safe });
          caption(ctx, "Cửa sau không hiện ra ở đâu cả, chủ máy vẫn dùng máy như thường.");
        },
      },
      {
        note: "Kẻ tấn công đi thẳng qua cửa sau, không cần biết mật khẩu của chủ máy.",
        draw(ctx, t) {
          const p = ease(t);
          machineWithDoors(ctx, 1, p > 0.9 ? "đã bị dùng" : "đang mở");
          panel(ctx, 600, 244, 160, 80, "KẺ TẤN CÔNG", "danger");
          arrow(ctx, 592, 284, 522, 284, { color: COLOR.danger, dashed: true });
          packet(ctx, lerp(592, 524, p), 284);
          caption(ctx, "Truy cập ngầm này là lí do backdoor rất nguy hiểm dù không phá gì ngay.");
        },
      },
    ],
  };

  /* ---------- Rootkit ---------- */
  const LAYERS = [
    { y: 110, label: "QUYỀN CAO NHẤT", tone: "danger" },
    { y: 196, label: "HỆ ĐIỀU HÀNH", tone: "plain" },
    { y: 282, label: "ỨNG DỤNG", tone: "plain" },
  ];

  function layerStack(ctx) {
    LAYERS.forEach((layer) => {
      box(ctx, 150, layer.y, 400, 66, {
        fill: layer.tone === "danger" ? COLOR.dangerSoft : COLOR.paper2,
        stroke: layer.tone === "danger" ? COLOR.danger : COLOR.lineStrong,
      });
      text(ctx, layer.label, 400, layer.y + 33, { size: 13, weight: 800, mono: true, color: COLOR.ink });
    });
  }

  SIMS.rootkit = {
    label: "Rootkit · chiếm quyền cao nhất",
    steps: [
      {
        note: "Một máy tính có nhiều lớp quyền. Phần mềm thông thường chỉ chạy ở lớp ứng dụng.",
        draw(ctx) {
          layerStack(ctx);
          box(ctx, 172, 300, 120, 30, { fill: COLOR.accentSoft, stroke: COLOR.accent, radius: 7 });
          text(ctx, "tiến trình", 232, 315, { size: 12, weight: 700, color: COLOR.accent });
          text(ctx, "càng lên cao quyền càng lớn", 400, 380, { size: 12, color: COLOR.ink });
          caption(ctx, "Ở lớp ứng dụng, một tiến trình không làm được mọi thứ trên máy.");
        },
      },
      {
        note: "Rootkit leo lên lớp quyền cao nhất, từ đó thực hiện được mọi hoạt động trên máy.",
        draw(ctx, t) {
          const p = ease(t);
          layerStack(ctx);
          const y = lerp(315, 143, p);
          box(ctx, 172, y - 15, 120, 30, { fill: COLOR.danger, stroke: COLOR.danger, radius: 7 });
          text(ctx, "ROOTKIT", 232, y, { size: 12, weight: 800, mono: true, color: "#fff" });
          arrow(ctx, 600, 320, 600, 150, { color: COLOR.danger, dashed: true });
          text(ctx, "chiếm quyền", 680, 235, { size: 12, weight: 700, color: COLOR.ink });
          caption(ctx, "Rootkit cũng tạo sẵn một tài khoản truy nhập ngầm cho kẻ tấn công.");
        },
      },
      {
        note: "Có quyền cao nhất, rootkit xóa luôn dấu vết của mình nên rất khó bị phát hiện.",
        draw(ctx, t) {
          const p = ease(t);
          panel(ctx, 190, 110, 420, 250, "NHẬT KÍ HỆ THỐNG");
          const logs = [
            "08:12 tiến trình lạ khởi động",
            "08:12 truy cập quyền quản trị",
            "08:13 tạo tài khoản ẩn",
            "08:13 thay đổi cấu hình",
          ];
          let cleared = 0;
          logs.forEach((row, i) => {
            const fade = p - (i + 1) * 0.2;
            if (fade > 0.2) { cleared += 1; return; }
            box(ctx, 220, 140 + i * 52, 360, 38, { fill: COLOR.dangerSoft, stroke: COLOR.danger, radius: 7 });
            text(ctx, row, 400, 159 + i * 52, { size: 12, color: COLOR.ink, mono: true });
          });
          if (cleared === logs.length) {
            text(ctx, "nhật kí đã sạch, không còn dấu vết", 400, 235, { size: 15, weight: 800, color: COLOR.safe });
          }
          caption(ctx, "Không còn dấu vết thì phần mềm phòng chống cũng khó tìm ra.");
        },
      },
    ],
  };

  /* ---------- Bộ điều khiển ---------- */

  const STEP_MS = 2600;

  function mount(root) {
    const kind = root.dataset.sim;
    const sim = SIMS[kind];
    if (!sim) return;

    const canvas = root.querySelector("canvas");
    const noteEl = root.querySelector("[data-sim-note]");
    const counterEl = root.querySelector("[data-sim-counter]");
    const playBtn = root.querySelector("[data-sim-play]");
    const nextBtn = root.querySelector("[data-sim-next]");
    const resetBtn = root.querySelector("[data-sim-reset]");
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let step = 0;
    let progress = reduced ? 1 : 0;
    let playing = false;
    let rafId = 0;
    let last = 0;

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      const wrap = canvas.parentElement;
      const available = wrap.clientWidth || root.clientWidth || 640;
      /*
        Giới hạn chiều cao để phần chú thích và các nút luôn nằm cùng màn hình
        với hình vẽ, không phải cuộn xuống bấm rồi cuộn lên xem.
      */
      const maxHeight = Math.max(280, Math.min(460, Math.round(window.innerHeight * 0.55)));
      let width = available;
      let height = Math.round(width * (H / W));
      if (height > maxHeight) {
        height = maxHeight;
        width = Math.round(height * (W / H));
      }
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      draw();
    }

    function draw() {
      const scale = canvas.width / W;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = COLOR.paper;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      sim.steps[step].draw(ctx, progress);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    function syncText() {
      noteEl.textContent = sim.steps[step].note;
      counterEl.textContent = `Bước ${step + 1}/${sim.steps.length}`;
      nextBtn.disabled = step === sim.steps.length - 1;
      playBtn.textContent = playing ? "Tạm dừng" : (step === sim.steps.length - 1 && progress >= 1 ? "Chạy lại" : "Chạy mô phỏng");
    }

    function tick(now) {
      if (!playing) return;
      const delta = now - last;
      last = now;
      progress += delta / STEP_MS;
      if (progress >= 1) {
        if (step < sim.steps.length - 1) {
          step += 1;
          progress = 0;
        } else {
          progress = 1;
          playing = false;
        }
        syncText();
      }
      draw();
      if (playing) rafId = window.requestAnimationFrame(tick);
    }

    function play() {
      if (step === sim.steps.length - 1 && progress >= 1) {
        step = 0;
        progress = 0;
      }
      playing = true;
      last = window.performance.now();
      syncText();
      rafId = window.requestAnimationFrame(tick);
    }

    function pause() {
      playing = false;
      window.cancelAnimationFrame(rafId);
      syncText();
    }

    playBtn.addEventListener("click", () => (playing ? pause() : play()));

    nextBtn.addEventListener("click", () => {
      /* Bấm một lần là sang hẳn bước kế tiếp, không dừng lại để kết thúc hoạt ảnh. */
      pause();
      if (step < sim.steps.length - 1) step += 1;
      progress = 1;
      syncText();
      draw();
    });

    resetBtn.addEventListener("click", () => {
      pause();
      step = 0;
      progress = reduced ? 1 : 0;
      syncText();
      draw();
    });

    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(root);
    } else {
      window.addEventListener("resize", resize);
    }

    syncText();
    resize();
  }

  window.MalwareSim = {
    has(kind) {
      return Boolean(SIMS[kind]);
    },
    label(kind) {
      return SIMS[kind] ? SIMS[kind].label : "";
    },
    steps(kind) {
      return SIMS[kind] ? SIMS[kind].steps.map((item) => item.note) : [];
    },
    setupAll() {
      document.querySelectorAll("[data-sim]").forEach(mount);
    },
  };
})();
