(() => {
  "use strict";

  const app = document.getElementById("app");
  const screenLabel = document.getElementById("screen-label");
  const missionCount = document.getElementById("mission-count");
  const teacherStatus = document.getElementById("teacher-status");
  const warning = document.getElementById("storage-warning");
  const toast = document.getElementById("toast");

  const teacherRequested =
    new URLSearchParams(window.location.search).get("teacher") === "1";
  let teacherMode = teacherRequested && readTeacherSession();
  let teacherCollapsed = false;
  let teacherHints = false;
  let storageAvailable = true;
  let toastTimer = null;

  const freshState = () => ({
    version: 1,
    started: false,
    student: { name: "", className: "" },
    currentScreen: "home",
    scenarioIndex: 0,
    scenarioAnswers: {},
    malwareIndex: 0,
    malwareAnswers: {},
    secretChecked: false,
    secretMatches: {},
    secretComplete: false,
    comparison: {},
    comparisonComplete: false,
    defenseIndex: 0,
    defenseAnswers: [],
    defenseComplete: false,
    reflections: ["", "", ""],
    scores: { identify: 0, decide: 0, analysis: 0 },
    completedChapters: 0,
    completedAt: "",
    savedAt: "",
  });

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      return raw ? { ...freshState(), ...JSON.parse(raw) } : freshState();
    } catch (error) {
      storageAvailable = false;
      return freshState();
    }
  }

  function saveState() {
    state.savedAt = new Date().toISOString();
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
    } catch (error) {
      storageAvailable = false;
      warning.hidden = false;
    }
  }

  function clearSavedState() {
    try {
      localStorage.removeItem(CONFIG.storageKey);
    } catch (error) {
      storageAvailable = false;
    }
  }

  function esc(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function slugFile(value = "") {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function readTeacherSession() {
    try {
      return sessionStorage.getItem("ansoso_teacher_auth") === "1";
    } catch (error) {
      return false;
    }
  }

  function writeTeacherSession(enabled) {
    try {
      if (enabled) sessionStorage.setItem("ansoso_teacher_auth", "1");
      else sessionStorage.removeItem("ansoso_teacher_auth");
    } catch (error) {
      /* Vẫn cho phép dùng trong tab hiện tại nếu sessionStorage bị chặn. */
    }
  }

  function renderAsset(src, alt, variant = "wide", fallbackMarkup = "") {
    const fallback =
      fallbackMarkup ||
      `
      <div class="asset-placeholder">
        <strong>Chưa có ảnh minh họa</strong>
        <span>Đặt tệp đúng tên: ${esc(src)}</span>
      </div>`;
    return `
      <div class="asset-slot asset-slot-${esc(variant)}">
        <img class="asset-image" data-src="${esc(src)}" alt="${esc(alt)}">
        <div class="asset-fallback">${fallback}</div>
      </div>`;
  }

  /*
    Chương 2 dùng mô phỏng canvas thay cho ảnh tĩnh. Nếu vì lí do nào đó không tải
    được sim.js, phần này tự quay về ảnh minh họa như trước để màn hình không trống.
  */
  function renderSim(kind, fallbackSrc, alt, variant = "case") {
    if (!window.MalwareSim || !window.MalwareSim.has(kind)) {
      return renderAsset(fallbackSrc, alt, variant);
    }
    const steps = window.MalwareSim.steps(kind);
    return `
      <figure class="sim-slot sim-slot-${esc(variant)}" data-sim="${esc(kind)}">
        <figcaption class="sim-head">
          <strong>${esc(window.MalwareSim.label(kind))}</strong>
          <span data-sim-counter>Bước 1/${steps.length}</span>
        </figcaption>
        <div class="sim-canvas-wrap"><canvas role="img" aria-label="${esc(alt)}"></canvas></div>
        <p class="sim-note" data-sim-note aria-live="polite"></p>
        <div class="sim-controls">
          <button class="button button-sim" type="button" data-sim-play>Chạy mô phỏng</button>
          <button class="button button-sim" type="button" data-sim-next>Bước tiếp</button>
          <button class="button button-sim" type="button" data-sim-reset>Đặt lại</button>
        </div>
        <details class="sim-transcript">
          <summary>Xem mô tả bằng chữ</summary>
          <ol>${steps.map((note) => `<li>${esc(note)}</li>`).join("")}</ol>
        </details>
      </figure>`;
  }

  function setupAssetFallbacks() {
    document.querySelectorAll(".asset-slot").forEach((slot) => {
      const image = slot.querySelector(".asset-image");
      if (!image) return;
      const src = image.dataset.src;
      const showImage = () => slot.classList.add("has-asset");
      const showFallback = () => slot.classList.remove("has-asset");
      image.addEventListener("load", showImage, { once: true });
      image.addEventListener("error", showFallback, { once: true });
      if (window.location.protocol === "file:") {
        image.src = src;
        return;
      }
      fetch(src, { method: "HEAD", cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error("asset-missing");
          image.src = src;
        })
        .catch(showFallback);
    });
  }

  function renderComicPages(input, title) {
    /* Mỗi tình huống dùng một trang truyện, nhưng vẫn nhận mảng nhiều trang nếu cần. */
    const pages = Array.isArray(input) ? input : input ? [input] : [];
    if (pages.length === 0) return "";
    const single = pages.length === 1;
    const fileList = pages
      .map((src) => `<code>${esc(src.split("/").pop())}</code>`)
      .join("");
    return `
      <section class="comic-book" data-comic-book aria-label="Truyện tranh ${esc(title)}">
        <div class="comic-book-head">
          <strong>Truyện tranh tình huống</strong>
          <span class="comic-page-status">${single ? "Chưa thêm ảnh" : `0/${pages.length} trang đã thêm`}</span>
        </div>
        <div class="comic-page-list">
          ${pages
            .map(
              (src, index) => `
            <figure class="comic-page" hidden>
              <img data-comic-src="${esc(src)}" alt="Truyện tranh tình huống ${esc(title)}">
              ${single ? "" : `<figcaption>Trang ${index + 1}/${pages.length}</figcaption>`}
            </figure>`,
            )
            .join("")}
        </div>
        <div class="comic-placeholder">
          <strong>Chưa có truyện tranh</strong>
          <span>Đặt ${single ? "ảnh" : `${pages.length} ảnh`} đúng tên vào <code>assets/chapter1</code>:</span>
          <div class="comic-file-list">${fileList}</div>
        </div>
      </section>`;
  }

  function setupComicPages() {
    document.querySelectorAll("[data-comic-book]").forEach((book) => {
      const images = [...book.querySelectorAll("[data-comic-src]")];
      const status = book.querySelector(".comic-page-status");
      const transcript = book.parentElement.querySelector(
        "[data-comic-transcript]",
      );
      let loaded = 0;
      const showPage = (image) => {
        image.closest(".comic-page").hidden = false;
        loaded += 1;
        book.classList.add("has-pages");
        status.textContent =
          images.length === 1
            ? "Đã thêm ảnh"
            : `${loaded}/${images.length} trang đã thêm`;
        if (transcript) transcript.open = false;
      };
      images.forEach((image) => {
        const src = image.dataset.comicSrc;
        image.addEventListener("load", () => showPage(image), { once: true });
        if (window.location.protocol === "file:") {
          image.src = src;
          return;
        }
        fetch(src, { method: "HEAD", cache: "no-store" })
          .then((response) => {
            if (!response.ok) throw new Error("comic-page-missing");
            image.src = src;
          })
          .catch(() => {});
      });
    });
  }

  window.gameHelpers = {
    esc,
    slugFile,
    getState: () => state,
    getActiveScenarios,
    getScenarioCatalog,
  };

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 3500);
  }

  function setScreen(name, extras = {}) {
    Object.assign(state, extras, { currentScreen: name });
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getScenarioCatalog() {
    return scenarios.map((item) =>
      item.id === 4 && CONFIG.replaceScenario4 ? CONFIG.replaceScenario4 : item,
    );
  }

  function getActiveScenarios() {
    return getScenarioCatalog();
  }

  function getDefenseActions() {
    return defenseActions;
  }

  function updateChrome() {
    screenLabel.textContent =
      SCREEN_NAMES[state.currentScreen] || "Trung tâm chỉ huy";
    missionCount.textContent = `${state.completedChapters}/2 nhiệm vụ`;
    warning.hidden = storageAvailable;
  }

  function render() {
    updateChrome();
    const renderers = {
      home: renderHome,
      scenario: renderScenario,
      transition: renderTransition,
      malware: renderMalware,
      risksIntro: renderRisksIntro,
      secrets: renderSecrets,
      comparison: renderComparison,
      defense: renderDefense,
      reflection: renderReflection,
      report: renderReport,
    };
    (renderers[state.currentScreen] || renderHome)();
    setupAssetFallbacks();
    setupComicPages();
    if (window.MalwareSim) window.MalwareSim.setupAll();
    setupTeacherToolbar();
  }

  function renderHome() {
    const hasProgress = state.started && state.student.name;
    app.innerHTML = `
      <section class="screen home-layout" aria-labelledby="home-title">
        <div class="hero-copy">
          <p class="eyebrow">Bài 9: An toàn trên không gian mạng</p>
          <h1 id="home-title">ĐẶC VỤ <span>AN TOÀN SỐ</span></h1>
          <p class="hero-quote">“Không phải mọi thứ trên Internet đều giống như những gì em nhìn thấy.”</p>
          ${renderAsset(
            ASSETS.ui.badge,
            "Huy hiệu Đặc vụ An toàn số",
            "hero",
            `<div class="hero-visual" aria-label="Huy hiệu tạm thời Đặc vụ An toàn số"><div class="radar" aria-hidden="true">S</div></div><div class="asset-placeholder"><strong>Ảnh huy hiệu chưa được thêm</strong><span>Đặt tệp đúng tên: ${esc(ASSETS.ui.badge)}</span></div>`,
          )}
        </div>

        <div>
          ${
            hasProgress
              ? `
            <section class="panel resume-panel" aria-labelledby="resume-title">
              <h2 id="resume-title">Hồ sơ đang thực hiện</h2>
              <p>Tiếp tục nhiệm vụ của <strong>${esc(state.student.name)}</strong> tại màn hình “${esc(SCREEN_NAMES[state.currentScreen])}”.</p>
              <div class="button-row">
                <button class="button button-primary" data-action="resume" type="button">Tiếp tục nhiệm vụ</button>
                <button class="button button-danger" data-action="reset" type="button">Bắt đầu lại</button>
              </div>
            </section>
          `
              : ""
          }

          <form id="student-form" class="form-panel" novalidate>
            <h2>Nhận hồ sơ đặc vụ</h2>
            <div class="field-grid">
              <div class="field">
                <label for="student-name">Họ và tên</label>
                <input id="student-name" name="name" type="text" autocomplete="name" required placeholder="Ví dụ: Nguyễn Thị Ánh" value="${esc(state.student.name)}">
              </div>
              <div class="field">
                <label for="student-class">Lớp</label>
                <input id="student-class" name="className" type="text" required placeholder="Ví dụ: 10A2" value="${esc(state.student.className)}">
              </div>
            </div>
            <div class="button-row">
              <button class="button button-primary" type="submit">Bắt đầu nhiệm vụ</button>
            </div>
            <p class="privacy-note">Dữ liệu chỉ được lưu tạm trên thiết bị này và không được gửi ra Internet.</p>
          </form>
        </div>
      </section>`;
  }

  /*
    Khối hướng dẫn đặt ở đầu mỗi màn hình. Học sinh cần biết ba điều trước khi làm:
    việc phải làm, cách làm từng bước, và điều kiện để được đi tiếp.
  */
  function taskBrief(brief) {
    if (!brief) return "";
    return `
      <section class="task-brief" aria-label="Hướng dẫn làm bài">
        <div class="task-brief-head">
          <span class="step-label">EM CẦN LÀM GÌ</span>
          <p>${esc(brief.what)}</p>
        </div>
        <ol class="task-steps">${brief.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>
        ${brief.done ? `<p class="task-done"><strong>Hoàn thành khi:</strong> ${esc(brief.done)}</p>` : ""}
        ${brief.tip ? `<p class="task-tip"><strong>Gợi ý:</strong> ${esc(brief.tip)}</p>` : ""}
      </section>`;
  }

  /* Truyện dạng chữ: kể liền mạch thành đoạn văn, không dùng khung hội thoại. */
  function storyProse(scenario) {
    const paragraphs = scenario.narrative || [];
    if (paragraphs.length === 0) return storyFrames(scenario.story);
    return `<div class="story-prose">${paragraphs.map((para) => `<p>${esc(para)}</p>`).join("")}</div>`;
  }

  function storyFrames(story) {
    return story
      .map(
        (frame, index) => `
      <article class="story-frame" data-index="${index + 1}" data-type="${esc(frame.type)}">
        <strong>${esc(frame.who)}</strong>
        <p>${esc(frame.text)}</p>
      </article>`,
      )
      .join("");
  }

  function renderScenario() {
    const active = getActiveScenarios();
    const scenario = active[state.scenarioIndex] || active[0];
    const answer = state.scenarioAnswers[scenario.id] || {};
    const actionFeedback =
      answer.lastAction !== undefined
        ? scenario.feedbackByOption[Number(answer.lastAction)]
        : "";
    const retryFeedback =
      answer.lastRisk !== scenario.riskType
        ? scenario.hint
        : Number(answer.lastAction) !== scenario.correctAnswer
          ? actionFeedback
          : scenario.supportQuestion && !answer.supportCorrect
            ? scenario.supportExplanation
            : scenario.hint;
    const complete = Boolean(answer.complete || answer.skipped);
    const choices = scenario.options
      .map(
        (option, index) => `
      <label class="choice-card ${teacherHints && index === scenario.correctAnswer ? "teacher-answer" : ""}">
        <input type="radio" name="action-choice" value="${index}" ${Number(answer.lastAction) === index ? "checked" : ""} ${complete ? "disabled" : ""}>
        <span>${esc(option)}</span>
      </label>`,
      )
      .join("");
    const risks = RISK_OPTIONS.map(
      (risk) => `
      <label class="choice-card ${teacherHints && risk === scenario.riskType ? "teacher-answer" : ""}">
        <input type="radio" name="risk-choice" value="${esc(risk)}" ${answer.lastRisk === risk ? "checked" : ""} ${complete ? "disabled" : ""}>
        <span>${esc(risk)}</span>
      </label>`,
    ).join("");
    const supportChoices = scenario.supportOptions
      ? scenario.supportOptions
          .map(
            (option, index) => `
      <label class="choice-card">
        <input type="checkbox" name="support-choice" value="${index}" ${(answer.lastSupport || []).includes(index) ? "checked" : ""} ${complete ? "disabled" : ""}>
        <span>${esc(option)}</span>
      </label>`,
          )
          .join("")
      : "";

    app.innerHTML = `
      <section class="screen" aria-labelledby="scenario-title">
        <div class="screen-heading">
          <div>
            <p class="eyebrow">Dấu vết trên không gian mạng</p>
            <h1 id="scenario-title">${esc(scenario.title)}</h1>
            <p class="lead">${esc(scenario.lead)}</p>
          </div>
          <div class="case-counter">Tình huống ${state.scenarioIndex + 1}/${active.length}</div>
        </div>

        ${scenario.sensitiveNote ? `<div class="sensitive-note" role="note"><strong>Lưu ý:</strong> ${esc(scenario.sensitiveNote)}</div>` : ""}

        ${taskBrief({
          what: "Đọc tình huống, tìm ra điều bất thường, rồi chọn cách xử lí em cho là an toàn nhất.",
          steps: [
            "Đọc truyện tranh hoặc phần truyện dạng chữ ở bên trái. Chú ý những chi tiết khiến em thấy gợn.",
            "Viết một hai câu vào ô phân tích: em thấy điều gì bất thường và vì sao.",
            "Chọn loại nguy cơ mà tình huống này thuộc về.",
            "Chọn một cách xử lí. Nếu chọn chưa đúng, em sẽ nhận gợi ý và được chọn lại, không bị trừ điểm.",
          ],
          done: "Em chọn đúng cả loại nguy cơ và cách xử lí, sau đó nút sang tình huống tiếp theo sẽ hiện ra.",
          tip: "Không có câu trả lời nào bị phạt. Chọn sai chỉ để em hiểu vì sao phương án đó chưa an toàn.",
        })}

        <div class="case-layout">
          <div>
            ${renderComicPages(scenario.comicPages || scenario.asset, scenario.title)}
            <details class="story-transcript" data-comic-transcript open>
              <summary>Đọc truyện dạng chữ</summary>
              ${storyProse(scenario)}
            </details>
          </div>

          <form id="scenario-form" class="panel investigation-panel" data-scenario="${scenario.id}">
            <div class="question-block">
              <span class="step-label">QUAN SÁT VÀ PHÂN TÍCH</span>
              <label class="field" for="analysis">
                <span>${esc(scenario.question)}</span>
                <textarea id="analysis" name="analysis" placeholder="Ghi nhận định ngắn của em..." ${complete ? "disabled" : ""}>${esc(answer.analysis || "")}</textarea>
              </label>
            </div>
            <div class="question-block">
              <h3>Nhận diện nguy cơ</h3>
              <div class="choice-list">${risks}</div>
            </div>
            <div class="question-block">
              <h3>Em sẽ xử lí như thế nào?</h3>
              <div class="choice-list">${choices}</div>
            </div>
            ${
              scenario.supportQuestion
                ? `
              <div class="question-block">
                <h3>${esc(scenario.supportQuestion)}</h3>
                <div class="choice-list">${supportChoices}</div>
              </div>`
                : ""
            }
            ${
              scenario.applicationQuestion
                ? `
              <div class="question-block">
                <label class="field" for="application">
                  <span>${esc(scenario.applicationQuestion)}</span>
                  <textarea id="application" name="application" placeholder="Nguyên tắc của em..." ${complete ? "disabled" : ""}>${esc(answer.application || "")}</textarea>
                </label>
              </div>`
                : ""
            }
            ${!complete ? `<div class="button-row"><button class="button button-primary" type="submit">Phân tích quyết định</button>${scenario.skippable ? `<button class="button button-subtle" data-action="skip-scenario" type="button">Bỏ qua tình huống</button>` : ""}</div>` : ""}

            ${
              answer.attempted && !complete
                ? `
              <section class="feedback-panel attention" aria-live="polite">
                <h3>Hãy xem lại một chi tiết.</h3>
                <p>${esc(retryFeedback)}</p>
                <p class="hint-line">${esc(scenario.explanation)}</p>
              </section>`
                : ""
            }

            ${
              answer.skipped
                ? `
              <section class="feedback-panel" aria-live="polite">
                <h3>Đã ghi nhận em bỏ qua tình huống này</h3>
                <p>Em có thể chia sẻ với thầy cô nếu nội dung khiến em không thoải mái. Hồ sơ không bị trừ điểm.</p>
              </section>`
                : ""
            }

            ${
              answer.complete
                ? `
              <section class="feedback-panel success">
                <h3>Quyết định có căn cứ</h3>
                <p>${esc(actionFeedback)}</p>
                ${scenario.supportQuestion ? `<p>${esc(scenario.supportExplanation)}</p>` : ""}
                <p>${esc(scenario.explanation)}</p>
              </section>
              <section class="knowledge-card">
                <span class="step-label">KIẾN THỨC VỪA KHÁM PHÁ</span>
                <p>${esc(scenario.knowledge)}</p>
              </section>`
                : ""
            }

            ${complete ? `<div class="button-row"><button class="button button-primary" data-action="next-scenario" type="button">${state.scenarioIndex === active.length - 1 ? "Mở bản đồ nguy cơ" : "Sang hồ sơ tiếp theo"}</button></div>` : ""}
          </form>
        </div>
      </section>`;
  }

  function renderRisksIntro() {
    /* Banner mở đầu Chương 1, đối xứng với màn mở đầu Chương 2. */
    app.innerHTML = `
      <section class="screen transition-screen" aria-labelledby="risks-title">
        <div>
          <p class="eyebrow">Chương 1</p>
          <h1 id="risks-title">Một số nguy cơ trên mạng</h1>
          <p class="lead">Internet rất tiện, nhưng đi kèm với nó là một số nguy cơ mà ai dùng mạng cũng có thể gặp.</p>
          <ul class="signal-list">
            ${RISK_OPTIONS.filter((risk) => risk !== "Không có nguy cơ").map((risk) => `<li>${esc(risk)}</li>`).join("")}
          </ul>
          <p>Em sẽ gặp lần lượt ${getActiveScenarios().length} tình huống có thật trong đời sống học sinh. Mỗi tình huống dừng lại đúng lúc nhân vật phải quyết định, và em là người chọn giúp bạn ấy.</p>
          <button class="button button-primary" data-action="start-scenarios" type="button">Vào tình huống đầu tiên</button>
        </div>
        <div>
          <div class="alert-visual">
            <div class="alert-mark" aria-hidden="true">?</div>
            <h2>${getActiveScenarios().length} tình huống</h2>
            <p>Không có bẫy và không bị trừ điểm khi chọn sai. Chọn sai chỉ để em hiểu vì sao cách đó chưa an toàn.</p>
          </div>
        </div>
      </section>`;
  }

  function renderTransition() {
    app.innerHTML = `
      <section class="screen transition-screen" aria-labelledby="alert-title">
        <div>
          <p class="eyebrow">Cảnh báo bảo mật</p>
          <h1 id="alert-title">Phần mềm độc hại</h1>
          <p class="lead">Có phải tất cả phần mềm độc hại đều là virus?</p>
          <ul class="signal-list">
            <li>Máy hoạt động chậm bất thường</li>
            <li>Xuất hiện chương trình lạ</li>
            <li>Có lưu lượng mạng không rõ nguyên nhân</li>
            <li>Một số tài khoản có dấu hiệu bị truy cập</li>
          </ul>
          <button class="button button-primary" data-action="start-malware" type="button">Bắt đầu điều tra</button>
        </div>
        <div>
          ${renderAsset(
            ASSETS.chapter2.warningComputer,
            "Máy tính trong phòng máy đang có cảnh báo bảo mật",
            "alert",
            `<div class="alert-visual"><div class="alert-mark" aria-hidden="true">!</div><h2>Phòng máy số 02</h2><p>Thiết bị cần được cô lập và phân tích dấu vết trước khi kết luận.</p></div><div class="asset-placeholder"><strong>Ảnh cảnh báo chưa được thêm</strong><span>Đặt tệp đúng tên: ${esc(ASSETS.chapter2.warningComputer)}</span></div>`,
          )}
        </div>
      </section>`;
  }

  function renderMalware() {
    /*
      Thứ tự dạy: đọc giải thích trước, xem mô phỏng sau, cuối cùng mới trả lời
      câu hỏi. Học sinh mới học không phải tự suy ra khái niệm từ hình động.
    */
    const item = malwareCases[state.malwareIndex] || malwareCases[0];
    const answer = state.malwareAnswers[item.id] || {};
    const options = item.options
      .map(
        (option, index) => `
      <label class="choice-card ${teacherHints && index === item.correctAnswer ? "teacher-answer" : ""}">
        <input type="radio" name="malware-choice" value="${index}" ${Number(answer.lastChoice) === index ? "checked" : ""} ${answer.complete ? "disabled" : ""}>
        <span>${esc(option)}</span>
      </label>`,
      )
      .join("");

    app.innerHTML = `
      <section class="screen" aria-labelledby="malware-title">
        <div class="screen-heading">
          <div>
            <p class="eyebrow">Loại mã độc thứ ${state.malwareIndex + 1} trong ${malwareCases.length}</p>
            <h1 id="malware-title">${esc(item.title)}</h1>
            <p class="lead">${esc(item.subtitle)}</p>
          </div>
          <div class="case-counter">Phần ${state.malwareIndex + 1}/${malwareCases.length}</div>
        </div>
        ${taskBrief({
          what: `Tìm hiểu ${item.title} hoạt động thế nào, sau đó trả lời một câu hỏi để kiểm tra lại.`,
          steps: [
            "Đọc phần giải thích ở bước 1. Đây là kiến thức cần nhớ.",
            "Bấm Chạy mô phỏng ở bước 2 để xem lại chính điều vừa đọc bằng hình.",
            "Đọc ba dấu vết ở bước 3 rồi chọn đáp án và bấm Kiểm tra.",
          ],
          done: "Chọn đúng đáp án ở bước 3.",
          tip: "Chọn sai không sao, em sẽ nhận gợi ý và được chọn lại.",
        })}

        <section class="learn-step">
          <div class="learn-step-head"><span class="step-number">1</span><h2>Đọc trước: ${esc(item.title)} là gì</h2></div>
          ${item.intro.map((para) => `<p class="learn-text">${esc(para)}</p>`).join("")}
          <p class="key-point"><strong>Cần nhớ:</strong> ${esc(item.keyPoint)}</p>
        </section>

        <section class="learn-step">
          <div class="learn-step-head"><span class="step-number">2</span><h2>Xem lại bằng mô phỏng</h2></div>
          <p class="learn-text">Mô phỏng dưới đây diễn lại đúng những gì em vừa đọc. Bấm <strong>Chạy mô phỏng</strong>, hoặc bấm <strong>Bước tiếp</strong> để đi chậm từng bước.</p>
          ${renderSim(item.sim || item.id, item.asset, `Mô phỏng cơ chế hoạt động của ${item.title}`, "case")}
        </section>

        <section class="learn-step">
          <div class="learn-step-head"><span class="step-number">3</span><h2>Kiểm tra lại</h2></div>
          <div class="case-layout">
            <div>
              <h3>Một máy tính có các dấu vết sau</h3>
              <ol class="evidence-list">${item.story.map((line) => `<li>${esc(line)}</li>`).join("")}</ol>
            </div>
            <form id="malware-form" class="panel investigation-panel">
              <span class="step-label">CÂU HỎI</span>
              <h3>${esc(item.question)}</h3>
              <div class="choice-list">${options}</div>
              ${!answer.complete ? `<div class="button-row"><button class="button button-primary" type="submit">Kiểm tra</button></div>` : ""}
              ${answer.attempted && !answer.complete ? `<section class="feedback-panel attention"><h3>Chưa đúng, thử lại nhé.</h3><p>${esc(item.hint)}</p></section>` : ""}
              ${
                answer.complete
                  ? `
                <section class="feedback-panel success"><h3>Chính xác</h3><p>${esc(item.explanation)}</p></section>
                <div class="flow-visual" aria-label="Sơ đồ hoạt động">${item.visual.map((node, index) => `${index ? `<span class="flow-arrow" aria-hidden="true">→</span>` : ""}<span class="flow-node">${esc(node)}</span>`).join("")}</div>
                <section class="knowledge-card"><span class="step-label">GHI VÀO HỒ SƠ</span><p>${esc(item.knowledge)}</p></section>
                <div class="button-row"><button class="button button-primary" data-action="next-malware" type="button">${state.malwareIndex === malwareCases.length - 1 ? "Sang phần Trojan có những loại nào" : `Học tiếp: ${esc(malwareCases[state.malwareIndex + 1].title)}`}</button></div>`
                  : ""
              }
            </form>
          </div>
        </section>
      </section>`;
  }

  function renderSecrets() {
    /*
      Bốn thẻ hiện sẵn kèm mô phỏng, không khóa. Phần luyện tập ở dưới dùng dấu vết
      thật trên máy nên học sinh phải suy luận thay vì chép lại mô tả trên thẻ.
    */
    const cards = secretFiles
      .map(
        (item, index) => `
      <article class="panel secret-card">
        <div class="secret-head">
          <span class="file-code">LOẠI ${index + 1}/${secretFiles.length}</span>
          <h2>${esc(item.name)}</h2>
          <p class="secret-vi">${esc(item.vi)}</p>
          <p>${esc(item.behavior)}</p>
        </div>
        <div class="secret-body">${renderSim(item.sim || item.id, item.asset, `Mô phỏng hành vi của ${item.name}`, "secret")}</div>
      </article>`,
      )
      .join("");

    const rowState = (index) => {
      if (!state.secretChecked) return "";
      return state.secretMatches[index] === secretFiles[index].id
        ? "match-right"
        : "match-wrong";
    };

    const wrongCount = secretFiles.filter(
      (item, index) => state.secretMatches[index] !== item.id,
    ).length;

    const practice = `
      <section class="panel form-panel" id="secret-practice">
        <h2>Đọc dấu vết, đoán loại mã độc</h2>
        <p>Bốn máy tính dưới đây mỗi máy có một dấu hiệu khác nhau. Dựa vào những gì em vừa xem, chọn loại mã độc phù hợp nhất với từng dấu hiệu.</p>
        <div class="clue-list">
          ${secretFiles
            .map(
              (item, index) => `
            <div class="clue-row ${rowState(index)}">
              <p class="clue-text"><strong>Máy ${index + 1}.</strong> ${esc(item.clue)}</p>
              <label class="clue-pick">
                <span class="sr-only">Chọn loại mã độc cho máy ${index + 1}</span>
                <select data-secret-match="${index}" ${state.secretComplete ? "disabled" : ""}>
                  <option value="">Chọn loại mã độc</option>
                  ${secretFiles.map((choice) => `<option value="${choice.id}" ${state.secretMatches[index] === choice.id ? "selected" : ""}>${esc(choice.name)}</option>`).join("")}
                </select>
              </label>
              ${state.secretChecked && state.secretMatches[index] === item.id ? `<p class="clue-why">${esc(item.clueWhy)}</p>` : ""}
            </div>`,
            )
            .join("")}
        </div>
        ${
          state.secretComplete
            ? `<div class="feedback-panel success"><strong>Đúng cả bốn.</strong> Em đã phân biệt được bốn nhánh của trojan qua dấu vết chúng để lại.</div>`
            : `
            ${state.secretChecked ? `<section class="feedback-panel attention"><h3>Còn ${wrongCount} máy chưa đúng.</h3><p>Những máy đã đúng có thêm dòng giải thích màu xanh. Hãy xem lại các máy còn lại.</p></section>` : ""}
            <div class="button-row"><button class="button button-primary" data-action="check-secrets" type="button">Kiểm tra</button></div>`
        }
      </section>`;

    const canContinue = state.secretComplete;
    app.innerHTML = `
      <section class="screen" aria-labelledby="secret-title">
        <p class="eyebrow">Bốn nhánh của Trojan</p>
        <h1 id="secret-title">Trojan có những loại nào</h1>
        <p class="lead">Trojan không phải một thứ duy nhất. Tùy việc nó làm sau khi đã vào được máy, người ta gọi nó bằng những tên khác nhau.</p>
        ${taskBrief({
          what: "Tìm hiểu bốn loại trojan, sau đó đọc dấu vết trên bốn máy tính và đoán mỗi máy dính loại nào.",
          steps: [
            "Xem lần lượt bốn thẻ bên dưới. Mỗi thẻ có một mô phỏng, bấm Chạy mô phỏng để xem cách loại đó hoạt động.",
            "Xuống phần luyện tập, đọc dấu hiệu của từng máy.",
            "Chọn loại mã độc cho cả bốn máy rồi bấm Kiểm tra.",
          ],
          done: "Đoán đúng cả bốn máy.",
          tip: "Dấu vết trong phần luyện tập không lặp lại mô tả trên thẻ. Hãy hỏi: thứ gì mới làm được đúng chuyện đó?",
        })}
        <div class="secret-grid">${cards}</div>
        ${practice}
        ${canContinue ? `<div class="button-row"><button class="button button-primary" data-action="to-comparison" type="button">Lập bảng phân biệt</button></div>` : ""}
      </section>`;
  }

  /*
    Mỗi ô trong bảng phân biệt là một danh sách mô tả của chính dòng đó.
    Các mô tả trùng nhau được gộp lại và sắp theo bảng chữ cái, để vị trí trong
    danh sách không tiết lộ ô nào thuộc cột nào.
  */
  function comparisonOptions(row, malware, selected) {
    const labels = [
      ...new Set(["virus", "worm", "trojan"].map((key) => row.values[key])),
    ].sort((a, b) => a.localeCompare(b, "vi"));
    return labels
      .map(
        (label) =>
          `<option value="${esc(label)}" ${selected === label ? "selected" : ""}>${esc(label)}</option>`,
      )
      .join("");
  }

  function renderComparison() {
    const malwares = ["virus", "worm", "trojan"];
    const labels = { virus: "Virus", worm: "Worm", trojan: "Trojan" };
    const rows = malwareComparison
      .map(
        (row, rowIndex) => `
      <tr>
        <td><strong>${esc(row.feature)}</strong></td>
        ${malwares
          .map(
            (malware) => `
          <td>
            <label class="field">
              <span class="sr-only">${esc(row.feature)} của ${labels[malware]}</span>
              <select data-compare-row="${rowIndex}" data-compare-malware="${malware}" ${state.comparisonComplete ? "disabled" : ""}>
                <option value="">Chọn mô tả</option>
                ${comparisonOptions(row, malware, state.comparison[rowIndex]?.[malware])}
              </select>
            </label>
          </td>`,
          )
          .join("")}
      </tr>`,
      )
      .join("");

    const standard = state.comparisonComplete
      ? `
      <section class="knowledge-card answer-table">
        <h2>Bảng chuẩn để đối chiếu</h2>
        <div class="comparison-wrap">
          <table class="comparison-table">
            <thead><tr><th>Đặc điểm</th><th>Virus</th><th>Worm</th><th>Trojan</th></tr></thead>
            <tbody>${malwareComparison.map((row) => `<tr><td><strong>${esc(row.feature)}</strong></td><td>${esc(row.values.virus)}</td><td>${esc(row.values.worm)}</td><td>${esc(row.values.trojan)}</td></tr>`).join("")}</tbody>
          </table>
        </div>
      </section>`
      : "";

    app.innerHTML = `
      <section class="screen" aria-labelledby="comparison-title">
        <p class="eyebrow">Nhiệm vụ phân loại</p>
        <h1 id="comparison-title">Phân biệt Virus, Worm và Trojan</h1>
        <p class="lead">Mỗi ô cần một mô tả đúng với loại mã độc ở đầu cột. Một mô tả có thể xuất hiện ở nhiều cột nếu bản chất giống nhau.</p>
        ${taskBrief({
          what: "Điền đủ bảng so sánh ba loại mã độc, mỗi ô chọn một mô tả từ danh sách thả xuống.",
          steps: [
            "Đọc tên đặc điểm ở cột đầu tiên, ví dụ có phải phần mềm hoàn chỉnh không.",
            "Với từng cột Virus, Worm, Trojan, chọn mô tả đúng cho đặc điểm đó.",
            "Điền hết mọi ô rồi bấm nút kiểm tra ở cuối bảng.",
          ],
          done: "Toàn bộ các ô đều đúng. Sau đó bảng chuẩn hiện ra để em đối chiếu lại.",
          tip: "Hai cột có thể có cùng một mô tả. Ví dụ worm và trojan đều là phần mềm hoàn chỉnh, khác nhau ở khả năng lây.",
        })}
        <div class="comparison-wrap">
          <table class="comparison-table">
            <thead><tr><th>Đặc điểm</th><th>Virus</th><th>Worm</th><th>Trojan</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div id="comparison-feedback"></div>
        ${standard}
        <div class="button-row">
          ${!state.comparisonComplete ? `<button class="button button-primary" data-action="check-comparison" type="button">Kiểm tra bảng</button>` : `<button class="button button-primary" data-action="to-defense" type="button">Thiết lập phòng tuyến</button>`}
        </div>
      </section>`;
  }

  function renderDefense() {
    const actions = getDefenseActions();
    const index = Math.min(state.defenseIndex, actions.length - 1);
    const item = actions[index];
    const answered = state.defenseAnswers[index];
    const history = state.defenseAnswers
      .map(
        (answer, answerIndex) => `
      <div class="history-row">
        <span>${esc(actions[answerIndex].text)}</span>
        <strong>${answer.correct ? "Phù hợp" : `Cần sửa: ${esc(actions[answerIndex].category)}`}</strong>
      </div>`,
      )
      .join("");

    app.innerHTML = `
      <section class="screen" aria-labelledby="defense-title">
        <p class="eyebrow">Nhiệm vụ cuối của chương 2</p>
        <h1 id="defense-title">Phòng tuyến an toàn</h1>
        <p class="lead">Phân loại từng hành động. Sau mỗi quyết định, em sẽ nhận được lời giải thích trước khi đi tiếp.</p>
        ${taskBrief({
          what: `Xem xét ${actions.length} thói quen sử dụng máy tính và quyết định thói quen nào an toàn, thói quen nào nguy hiểm.`,
          steps: [
            "Đọc hành động đang hiện trong khung.",
            "Bấm An toàn hoặc Nguy hiểm theo phán đoán của em.",
            "Đọc lời giải thích hiện ra, rồi bấm để xem hành động tiếp theo.",
          ],
          done: `Phân loại xong cả ${actions.length} hành động.`,
          tip: "Mỗi hành động chỉ trả lời một lần, nhưng chọn sai không bị trừ điểm. Phần giải thích mới là chỗ cần đọc kỹ.",
        })}
        <article class="panel defense-card">
          <div>
            <span class="step-label">HÀNH ĐỘNG ${index + 1}/${actions.length}</span>
            <blockquote>${esc(item.text)}</blockquote>
          </div>
          <div class="defense-actions">
            <button class="button button-safe" data-action="answer-defense" data-value="An toàn" type="button" ${answered ? "disabled" : ""}>An toàn</button>
            <button class="button button-risk" data-action="answer-defense" data-value="Nguy hiểm" type="button" ${answered ? "disabled" : ""}>Nguy hiểm</button>
          </div>
        </article>
        ${
          answered
            ? `
          <section class="feedback-panel ${answered.correct ? "success" : "attention"}">
            <h2>${answered.correct ? "Lập luận phù hợp" : "Cần điều chỉnh phòng tuyến"}</h2>
            <p><strong>Phân loại đúng: ${esc(item.category)}.</strong> ${esc(item.explanation)}</p>
            <div class="button-row"><button class="button button-primary" data-action="next-defense" type="button">${index === actions.length - 1 ? "Hoàn tất phòng tuyến" : "Xem hành động tiếp theo"}</button></div>
          </section>`
            : ""
        }
        ${history ? `<section class="defense-history" aria-label="Các quyết định đã thực hiện">${history}</section>` : ""}
      </section>`;
  }

  function renderReflection() {
    app.innerHTML = `
      <section class="screen" aria-labelledby="reflection-title">
        <p class="eyebrow">Tổng kết cá nhân</p>
        <h1 id="reflection-title">Điều em rút ra</h1>
        <p class="lead">Không có đáp án mẫu cho phần này. Giáo viên sẽ đọc nguyên văn suy nghĩ của em trong Hồ sơ An toàn số.</p>
        ${taskBrief({
          what: `Trả lời ${reflectionQuestions.length} câu hỏi bằng suy nghĩ thật của em. Đây là phần cuối trước khi xuất hồ sơ.`,
          steps: [
            "Đọc từng câu hỏi và viết ít nhất hai đến ba câu.",
            "Viết bằng lời của em, nhắc tới tình huống cụ thể mà em vừa làm nếu có.",
            "Bấm Hoàn thành Hồ sơ An toàn số khi đã điền đủ cả ba ô.",
          ],
          done: "Cả ba ô đều có nội dung. Phần này không chấm đúng sai.",
          tip: "Nội dung em viết sẽ được đưa nguyên văn vào file PDF và Word khi xuất hồ sơ.",
        })}
        <form id="reflection-form" class="reflection-list">
          ${reflectionQuestions
            .map(
              (question, index) => `
            <div class="panel reflection-item">
              <label for="reflection-${index}">${index + 1}. ${esc(question)}</label>
              <textarea id="reflection-${index}" name="reflection-${index}" required placeholder="Viết suy nghĩ của em...">${esc(state.reflections[index] || "")}</textarea>
            </div>`,
            )
            .join("")}
          <div class="button-row"><button class="button button-primary" type="submit">Hoàn thành Hồ sơ An toàn số</button></div>
        </form>
      </section>`;
  }

  function reportScenarioEntries() {
    return getScenarioCatalog()
      .map((scenario) => {
        const answer = state.scenarioAnswers[scenario.id];
        if (!answer)
          return `<article class="report-entry"><h3>${esc(scenario.title)}</h3><p>Chưa khám phá trong chế độ đã chọn.</p></article>`;
        if (answer.skipped)
          return `<article class="report-entry"><h3>${esc(scenario.title)}</h3><p>Đã bỏ qua theo lựa chọn của học sinh.</p></article>`;
        return `
        <article class="report-entry">
          <h3>${esc(scenario.title)}</h3>
          <dl>
            <dt>Nhận định ban đầu</dt><dd>${esc(answer.analysis || "Chưa nhập")}</dd>
            <dt>Nguy cơ đã chọn</dt><dd>${esc(answer.firstRisk || "Chưa chọn")}${answer.firstRisk !== answer.lastRisk ? ` → ${esc(answer.lastRisk)}` : ""}</dd>
            <dt>Xử lí lần đầu</dt><dd>${answer.firstAction !== undefined ? esc(scenario.options[answer.firstAction]) : "Chưa chọn"}</dd>
            <dt>Xử lí cuối cùng</dt><dd>${answer.lastAction !== undefined ? esc(scenario.options[answer.lastAction]) : "Chưa chọn"}</dd>
            ${scenario.supportQuestion ? `<dt>Người hỗ trợ đã chọn</dt><dd>${(answer.lastSupport || []).map((index) => esc(scenario.supportOptions[index])).join(", ") || "Chưa chọn"}</dd>` : ""}
            ${scenario.applicationQuestion ? `<dt>Nguyên tắc đề xuất</dt><dd>${esc(answer.application || "Chưa nhập")}</dd>` : ""}
            <dt>Kiến thức</dt><dd>${esc(scenario.knowledge)}</dd>
          </dl>
        </article>`;
      })
      .join("");
  }

  function reportMalwareEntries() {
    return malwareCases
      .map((item) => {
        const answer = state.malwareAnswers[item.id] || {};
        return `<article class="report-entry"><h3>${esc(item.unlock)}</h3><p><strong>Phân tích của học sinh:</strong> ${answer.lastChoice !== undefined ? esc(item.options[answer.lastChoice]) : "Chưa thực hiện"}</p><p>${esc(item.explanation)}</p></article>`;
      })
      .join("");
  }

  function renderReport() {
    const date = state.completedAt ? new Date(state.completedAt) : new Date();
    const total =
      state.scores.identify + state.scores.decide + state.scores.analysis;
    const padletUrl =
      typeof CONFIG.padletUrl === "string" &&
      /^https?:\/\//i.test(CONFIG.padletUrl.trim())
        ? CONFIG.padletUrl.trim()
        : "";
    app.innerHTML = `
      <section class="screen report" aria-labelledby="report-title">
        <header class="report-header">
          <div>
            <p class="eyebrow">Chứng nhận hoàn thành hoạt động</p>
            <h1 id="report-title">Hồ sơ An toàn số</h1>
            <p class="lead">Bản ghi quá trình quan sát, điều chỉnh quyết định và kiến thức đã khám phá.</p>
          </div>
          <div class="report-stamp">ĐẶC VỤ<br>AN TOÀN SỐ</div>
        </header>

        <div class="student-summary">
          <div><span>Họ và tên</span><strong>${esc(state.student.name)}</strong></div>
          <div><span>Lớp</span><strong>${esc(state.student.className)}</strong></div>
          <div><span>Ngày thực hiện</span><strong>${date.toLocaleDateString("vi-VN")}</strong></div>
        </div>
        <div class="score-summary">
          <span>Điểm điều tra: <strong>${state.scores.identify}</strong></span>
          <span>Điểm quyết định: <strong>${state.scores.decide}</strong></span>
          <span>Điểm phân tích: <strong>${state.scores.analysis}</strong></span>
          <span>Tổng ghi nhận: <strong>${total}</strong></span>
        </div>

        <section class="report-section">
          <h2>Phần A. Nguy cơ trên mạng</h2>
          ${reportScenarioEntries()}
        </section>

        <section class="report-section chapter-break">
          <h2>Phần B. Phần mềm độc hại</h2>
          ${reportMalwareEntries()}
          <article class="report-entry">
            <h3>Bảng tổng hợp Virus, Worm và Trojan</h3>
            <div class="comparison-wrap">
              <table class="comparison-table">
                <thead><tr><th>Đặc điểm</th><th>Virus</th><th>Worm</th><th>Trojan</th></tr></thead>
                <tbody>${malwareComparison.map((row) => `<tr><td>${esc(row.feature)}</td><td>${esc(row.values.virus)}</td><td>${esc(row.values.worm)}</td><td>${esc(row.values.trojan)}</td></tr>`).join("")}</tbody>
              </table>
            </div>
          </article>
          <article class="report-entry">
            <h3>Phòng tuyến an toàn</h3>
            ${state.defenseAnswers.map((answer, index) => `<p>${index + 1}. ${esc(getDefenseActions()[index].text)}: <strong>${esc(answer.choice)}</strong> (${answer.correct ? "phù hợp" : `đáp án phù hợp là ${esc(answer.category)}`})</p>`).join("")}
          </article>
        </section>

        <section class="report-section chapter-break">
          <h2>Phần C. Điều em rút ra</h2>
          ${reflectionQuestions.map((question, index) => `<article class="report-entry"><h3>${index + 1}. ${esc(question)}</h3><p>${esc(state.reflections[index] || "Chưa trả lời")}</p></article>`).join("")}
        </section>

        <section class="padlet-submit" aria-labelledby="padlet-title">
          <div>
            <span class="step-label">NỘP BÀI</span>
            <h2 id="padlet-title">Gửi Hồ sơ lên Padlet</h2>
            <ol>
              <li>Chọn <strong>Tải PDF</strong> và lưu tệp theo tên đã gợi ý.</li>
              <li>Mở Padlet của lớp.</li>
              <li>Tạo bài đăng, ghi họ tên và lớp, sau đó tải tệp PDF lên.</li>
            </ol>
          </div>
          ${
            padletUrl
              ? `<a class="button button-primary" href="${esc(padletUrl)}" target="_blank" rel="noopener noreferrer">Mở Padlet để nộp bài</a>`
              : `<p class="padlet-config-note">Giáo viên chưa cài đường dẫn Padlet. Hãy điền <code>CONFIG.padletUrl</code> trong <code>js/data.js</code>.</p>`
          }
        </section>

        <div class="report-actions">
          <button class="button button-primary" data-action="print-pdf" type="button">Tải PDF</button>
          <button class="button" data-action="export-word" type="button">Tải Word</button>
          <button class="button" data-action="copy-report" type="button">Sao chép nội dung Hồ sơ</button>
          <button class="button button-danger" data-action="reset" type="button">Bắt đầu lại</button>
        </div>
      </section>`;
  }

  function setupTeacherToolbar() {
    const toolbar = document.getElementById("teacher-toolbar");
    if (!teacherMode) {
      toolbar.hidden = true;
      teacherStatus.hidden = true;
      document.body.classList.remove("teacher-active");
      return;
    }
    teacherStatus.hidden = false;
    document.body.classList.add("teacher-active");
    toolbar.hidden = false;
    toolbar.classList.toggle("collapsed", teacherCollapsed);
    const controls = document.getElementById("teacher-controls");
    const collapseButton = document.getElementById("teacher-collapse");
    controls.hidden = teacherCollapsed;
    collapseButton.textContent = teacherCollapsed ? "Mở công cụ" : "Thu gọn";
    collapseButton.setAttribute("aria-expanded", String(!teacherCollapsed));
    const jump = document.getElementById("teacher-jump");
    const destinations = [
      ["home", "Khởi động"],
      ["risksIntro", "Mở đầu Chương 1"],
      ...getActiveScenarios().map((item, index) => [
        `scenario:${index}`,
        `Tình huống: ${item.title}`,
      ]),
      ["transition", "Cảnh báo bảo mật"],
      ["malware:0", "Virus"],
      ["malware:1", "Worm"],
      ["malware:2", "Trojan"],
      ["secrets", "Bốn nhánh của Trojan"],
      ["comparison", "Bảng phân biệt"],
      ["defense", "Phòng tuyến"],
      ["reflection", "Phản tư"],
      ["report", "Hồ sơ kết quả"],
    ];
    const currentValue =
      state.currentScreen === "scenario"
        ? `scenario:${state.scenarioIndex}`
        : state.currentScreen === "malware"
          ? `malware:${state.malwareIndex}`
          : state.currentScreen;
    jump.innerHTML = destinations
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join("");
    jump.value = currentValue;
    const currentDestination = destinations.find(
      ([value]) => value === currentValue,
    );
    document.getElementById("teacher-current-screen").textContent =
      currentDestination?.[1] || "Khởi động";
    document.getElementById("teacher-quick-nav").innerHTML = destinations
      .map(([value, label]) => {
        const active = value === currentValue;
        return `<button class="teacher-jump-button${active ? " active" : ""}" type="button" data-teacher-jump="${esc(value)}" title="${esc(label)}"${active ? ' aria-current="page"' : ""}>${esc(label)}</button>`;
      })
      .join("");
    document.getElementById("teacher-hints").checked = teacherHints;
    document.getElementById("teacher-project").checked =
      document.body.classList.contains("projection");
  }

  function goTeacherDestination(value) {
    const [screen, index] = value.split(":");
    const extras = {};
    if (screen === "scenario") extras.scenarioIndex = Number(index || 0);
    if (screen === "malware") extras.malwareIndex = Number(index || 0);
    teacherCollapsed = window.matchMedia("(max-width: 600px)").matches;
    setScreen(screen, extras);
  }

  function setTeacherCollapsed(collapsed) {
    teacherCollapsed = collapsed;
    setupTeacherToolbar();
  }

  function activateTeacherMode() {
    teacherMode = true;
    writeTeacherSession(true);
    document.getElementById("teacher-gate").hidden = true;
    teacherCollapsed = false;
    render();
  }

  function exitTeacherMode() {
    writeTeacherSession(false);
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("teacher");
    window.location.assign(cleanUrl.toString());
  }

  function handleStudentStart(form) {
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    state = freshState();
    state.started = true;
    state.student = {
      name: data.get("name").trim(),
      className: data.get("className").trim(),
    };
    state.currentScreen = "risksIntro";
    saveState();
    render();
  }

  function handleScenarioSubmit(form) {
    const id = Number(form.dataset.scenario);
    const scenario = scenarios.find((item) => item.id === id);
    const data = new FormData(form);
    const analysis = String(data.get("analysis") || "").trim();
    const application = String(data.get("application") || "").trim();
    const risk = data.get("risk-choice");
    const actionRaw = data.get("action-choice");
    const support = data.getAll("support-choice").map(Number);
    if (
      !analysis ||
      !risk ||
      actionRaw === null ||
      (scenario.applicationQuestion && !application) ||
      (scenario.supportQuestion && support.length === 0)
    ) {
      showToast(
        "Em hãy hoàn thành nhận định, nhận diện nguy cơ và chọn cách xử lí.",
      );
      return;
    }
    const action = Number(actionRaw);
    const answer = state.scenarioAnswers[id] || {};
    if (!answer.attempted) {
      answer.firstRisk = risk;
      answer.firstAction = action;
      if (scenario.supportQuestion) answer.firstSupport = support;
    }
    answer.analysis = analysis;
    answer.lastRisk = risk;
    answer.lastAction = action;
    if (scenario.supportQuestion) answer.lastSupport = support;
    if (scenario.applicationQuestion) answer.application = application;
    answer.supportCorrect =
      !scenario.supportQuestion ||
      support.some((index) => [1, 2, 3].includes(index));
    answer.attempted = true;
    answer.complete =
      risk === scenario.riskType &&
      action === scenario.correctAnswer &&
      answer.supportCorrect;
    if (!answer.analysisScored) {
      state.scores.analysis += CONFIG.points.analysis;
      answer.analysisScored = true;
    }
    if (risk === scenario.riskType && !answer.identifyScored) {
      state.scores.identify += scenario.points.identify;
      answer.identifyScored = true;
    }
    if (action === scenario.correctAnswer && !answer.decideScored) {
      state.scores.decide += scenario.points.decide;
      answer.decideScored = true;
    }
    state.scenarioAnswers[id] = answer;
    saveState();
    render();
  }

  function handleMalwareSubmit(form) {
    const item = malwareCases[state.malwareIndex];
    const data = new FormData(form);
    const raw = data.get("malware-choice");
    if (raw === null) {
      showToast("Em hãy chọn một nhận định từ các dấu vết.");
      return;
    }
    const choice = Number(raw);
    const answer = state.malwareAnswers[item.id] || {};
    if (!answer.attempted) answer.firstChoice = choice;
    answer.attempted = true;
    answer.lastChoice = choice;
    answer.complete = choice === item.correctAnswer;
    state.malwareAnswers[item.id] = answer;
    saveState();
    render();
  }

  function handleReflection(form) {
    const values = reflectionQuestions.map((_, index) =>
      String(new FormData(form).get(`reflection-${index}`) || "").trim(),
    );
    if (values.some((value) => !value)) {
      showToast("Em hãy hoàn thành cả ba câu phản tư trước khi tạo Hồ sơ.");
      return;
    }
    state.reflections = values;
    state.completedAt = new Date().toISOString();
    state.completedChapters = 2;
    setScreen("report");
  }

  app.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id === "student-form") handleStudentStart(event.target);
    if (event.target.id === "scenario-form") handleScenarioSubmit(event.target);
    if (event.target.id === "malware-form") handleMalwareSubmit(event.target);
    if (event.target.id === "reflection-form") handleReflection(event.target);
  });

  app.addEventListener("change", (event) => {
    if (event.target.matches("[data-secret-match]")) {
      state.secretMatches[event.target.dataset.secretMatch] =
        event.target.value;
      saveState();
    }
    if (event.target.matches("[data-compare-row]")) {
      const row = event.target.dataset.compareRow;
      state.comparison[row] ||= {};
      state.comparison[row][event.target.dataset.compareMalware] =
        event.target.value;
      saveState();
    }
  });

  app.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;

    if (action === "resume") setScreen(state.currentScreen);
    if (action === "reset") {
      if (
        window.confirm(
          "Bắt đầu lại sẽ xóa toàn bộ tiến trình đã lưu. Em có chắc muốn tiếp tục?",
        )
      ) {
        clearSavedState();
        state = freshState();
        render();
      }
    }
    if (action === "skip-scenario") {
      const scenario = getActiveScenarios()[state.scenarioIndex];
      state.scenarioAnswers[scenario.id] = { skipped: true, complete: true };
      saveState();
      render();
    }
    if (action === "next-scenario") {
      if (state.scenarioIndex < getActiveScenarios().length - 1) {
        state.scenarioIndex += 1;
        setScreen("scenario");
      } else {
        /* Het Chuong 1: danh dau hoan thanh roi sang man canh bao cua Chuong 2. */
        state.completedChapters = Math.max(state.completedChapters, 1);
        saveState();
        setScreen("transition");
      }
    }
    if (action === "to-transition") setScreen("transition");
    if (action === "start-malware") setScreen("malware", { malwareIndex: 0 });
    if (action === "next-malware") {
      if (state.malwareIndex < malwareCases.length - 1) {
        state.malwareIndex += 1;
        setScreen("malware");
      } else {
        setScreen("secrets");
      }
    }
    if (action === "check-secrets") {
      state.secretChecked = true;
      state.secretComplete = secretFiles.every(
        (item, index) => state.secretMatches[index] === item.id,
      );
      saveState();
      render();
      if (!state.secretComplete)
        showToast("Chưa đúng hết. Những máy sai được đánh dấu đỏ.");
    }
    if (action === "start-scenarios") setScreen("scenario", { scenarioIndex: 0 });
    if (action === "to-comparison") setScreen("comparison");
    if (action === "check-comparison") {
      const malwares = ["virus", "worm", "trojan"];
      const correct = malwareComparison.every((row, rowIndex) =>
        malwares.every(
          (malware) =>
            state.comparison[rowIndex]?.[malware] === row.values[malware],
        ),
      );
      const target = document.getElementById("comparison-feedback");
      if (correct) {
        state.comparisonComplete = true;
        saveState();
        render();
      } else {
        target.innerHTML = `<section class="feedback-panel attention"><h2>Hãy xem lại một chi tiết.</h2><p>Hãy đối chiếu lại với phần đã học: loại nào là phần mềm hoàn chỉnh, loại nào tự lây qua mạng, và loại nào cần người dùng tự cài đặt.</p></section>`;
      }
    }
    if (action === "to-defense") setScreen("defense", { defenseIndex: 0 });
    if (action === "answer-defense") {
      const item = getDefenseActions()[state.defenseIndex];
      const choice = button.dataset.value;
      state.defenseAnswers[state.defenseIndex] = {
        choice,
        correct: choice === item.category,
        category: item.category,
      };
      saveState();
      render();
    }
    if (action === "next-defense") {
      const actions = getDefenseActions();
      if (state.defenseIndex < actions.length - 1) {
        state.defenseIndex += 1;
        saveState();
        render();
      } else {
        state.defenseComplete = true;
        state.completedChapters = 2;
        setScreen("reflection");
      }
    }
    if (action === "print-pdf") window.reportExport.printPDF();
    if (action === "export-word") window.reportExport.exportWord();
    if (action === "copy-report") window.reportExport.copyReport();
  });

  document.addEventListener("click", (event) => {
    const homeLink = event.target.closest('[data-action="go-home"]');
    if (homeLink) {
      event.preventDefault();
      state.currentScreen = "home";
      saveState();
      render();
    }
  });

  function fillQuick() {
    state = freshState();
    state.started = true;
    state.student = { name: "Nguyễn Thị Ánh", className: "10A2" };
    const activeIds = scenarios.map((item) => item.id);
    getScenarioCatalog().forEach((scenario) => {
      if (activeIds.includes(scenario.id)) {
        state.scenarioAnswers[scenario.id] = {
          analysis: `Em nhận thấy các dấu hiệu bất thường trong tình huống ${scenario.title.toLowerCase()}.`,
          application: scenario.applicationQuestion
            ? "Em sẽ đặt giờ dừng, hoàn thành việc học trước và bảo đảm ngủ đủ."
            : "",
          firstRisk: scenario.riskType,
          lastRisk: scenario.riskType,
          firstAction: scenario.correctAnswer,
          lastAction: scenario.correctAnswer,
          attempted: true,
          complete: true,
          identifyScored: true,
          decideScored: true,
          analysisScored: true,
        };
        if (scenario.supportQuestion) {
          state.scenarioAnswers[scenario.id].firstSupport = [1, 2];
          state.scenarioAnswers[scenario.id].lastSupport = [1, 2];
          state.scenarioAnswers[scenario.id].supportCorrect = true;
        }
      }
    });
    malwareCases.forEach((item) => {
      state.malwareAnswers[item.id] = {
        firstChoice: item.correctAnswer,
        lastChoice: item.correctAnswer,
        attempted: true,
        complete: true,
      };
    });
    state.secretChecked = true;
    state.secretMatches = Object.fromEntries(
      secretFiles.map((item, index) => [index, item.id]),
    );
    state.secretComplete = true;
    state.comparison = Object.fromEntries(
      malwareComparison.map((row, index) => [index, { ...row.values }]),
    );
    state.comparisonComplete = true;
    state.defenseAnswers = getDefenseActions().map((item) => ({
      choice: item.category,
      correct: true,
      category: item.category,
    }));
    state.defenseIndex = getDefenseActions().length - 1;
    state.defenseComplete = true;
    state.reflections = [
      "Em cho rằng lừa đảo mạo danh dễ gặp vì tài khoản quen thuộc vẫn có thể bị chiếm quyền.",
      "Em sẽ không bấm link, liên hệ bạn qua kênh khác để xác minh và báo cáo nếu tài khoản bị chiếm.",
      "Em sẽ kiểm tra nguồn trước khi chia sẻ và đặt giới hạn thời gian sử dụng Internet.",
    ];
    state.scores = {
      identify: activeIds.length * 10,
      decide: activeIds.length * 10,
      analysis: activeIds.length * 5,
    };
    state.completedChapters = 2;
    state.completedAt = new Date().toISOString();
    state.currentScreen = "report";
    saveState();
    render();
    showToast("Đã điền dữ liệu mẫu và mở Hồ sơ kết quả.");
  }

  const toolbar = document.getElementById("teacher-toolbar");
  toolbar.addEventListener("change", (event) => {
    if (!teacherMode) return;
    if (event.target.id === "teacher-jump") {
      goTeacherDestination(event.target.value);
    }
    if (event.target.id === "teacher-hints") {
      teacherHints = event.target.checked;
      render();
    }
    if (event.target.id === "teacher-project") {
      document.body.classList.toggle("projection", event.target.checked);
    }
  });
  toolbar.addEventListener("click", (event) => {
    if (!teacherMode) return;
    const jumpButton = event.target.closest("[data-teacher-jump]");
    if (jumpButton) goTeacherDestination(jumpButton.dataset.teacherJump);
  });
  document.getElementById("teacher-autofill").addEventListener("click", () => {
    if (teacherMode) fillQuick();
  });
  document.getElementById("teacher-collapse").addEventListener("click", () => {
    if (teacherMode) setTeacherCollapsed(!teacherCollapsed);
  });
  teacherStatus.addEventListener("click", () => {
    if (teacherMode) setTeacherCollapsed(false);
  });
  document
    .getElementById("teacher-exit")
    .addEventListener("click", exitTeacherMode);

  document
    .getElementById("teacher-login")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const enteredPin = String(
        new FormData(event.target).get("teacherPin") || "",
      ).trim();
      const error = document.getElementById("teacher-gate-error");
      if (enteredPin === String(CONFIG.teacherPin)) {
        error.hidden = true;
        event.target.reset();
        activateTeacherMode();
      } else {
        error.hidden = false;
        document.getElementById("teacher-pin").select();
      }
    });

  render();
  if (teacherRequested && !teacherMode) {
    document.getElementById("teacher-gate").hidden = false;
    document.getElementById("teacher-pin").focus();
  }
})();
