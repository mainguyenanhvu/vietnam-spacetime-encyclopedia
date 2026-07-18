// Trò chơi kiến thức mô phỏng format «Đường lên đỉnh Olympia» — 4 vòng:
// Khởi động → Vượt chướng ngại vật → Tăng tốc → Về đích.
// Module tự chứa: initOlympia() tự tạo nút mở + panel bằng JS (không sửa index.html),
// tự tải ngân hàng câu hỏi JSON, lưu điểm cao nhất vào localStorage (không PII).

interface MCQuestion {
  id: string;
  vong: "khoi_dong" | "tang_toc" | "ve_dich";
  cau_hoi: string;
  dap_an: string;
  cac_lua_chon: string[];
  giai_thich: string;
  nguon: string;
  do_kho?: number;
}

interface HangNgang {
  goi_y: string;
  dap_an: string;
}

interface VcnvPuzzle {
  id: string;
  vong: "vcnv";
  tu_khoa: string;
  hang_ngang: HangNgang[];
  giai_thich: string;
  nguon: string;
}

interface QuestionBank {
  khoi_dong: MCQuestion[];
  vcnv: VcnvPuzzle[];
  tang_toc: MCQuestion[];
  ve_dich: MCQuestion[];
}

const LS_HIGHSCORE = "olympia_highscore";
const KHOI_DONG_COUNT = 6;
const KHOI_DONG_SECONDS = 15;
const TANG_TOC_SECONDS = 20;
const VE_DICH_COUNT = 3;
const VE_DICH_GOI = [20, 30, 40] as const;

let bank: QuestionBank | null = null;
let totalScore = 0;
let timerId: number | null = null;

// Trạng thái từng vòng
let kdList: MCQuestion[] = [];
let kdIndex = 0;
let ttList: MCQuestion[] = [];
let ttIndex = 0;
let vdList: MCQuestion[] = [];
let vdIndex = 0;
let vdStake = 0;

const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(pool: T[], n: number): T[] {
  return shuffle(pool).slice(0, n);
}

function clearTimer(): void {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function content(): HTMLElement | null {
  return document.getElementById("olympia-content");
}

function loadHighScore(): number {
  const raw = Number(localStorage.getItem(LS_HIGHSCORE));
  return Number.isFinite(raw) ? raw : 0;
}

function saveHighScore(score: number): number {
  const best = Math.max(loadHighScore(), score);
  localStorage.setItem(LS_HIGHSCORE, String(best));
  return best;
}

// Đóng các panel khác của trang khi mở Olympia (và ngược lại).
function hideOtherPanels(): void {
  for (const id of [
    "province-panel",
    "library-panel",
    "game-panel",
    "quiz-panel",
    "story-panel",
  ]) {
    const p = document.getElementById(id);
    if (p) p.hidden = true;
  }
}

function scoreBar(extra = ""): string {
  return `<div class="ol-scorebar">🏆 Tổng điểm: <b>${totalScore}</b><span class="muted"> · Kỷ lục: ${loadHighScore()}</span>${extra}</div>`;
}

function sourceNote(giai_thich: string, nguon: string): string {
  return `<p class="ol-explain">💡 ${esc(giai_thich)}</p><p class="ol-source">📚 Nguồn: ${esc(nguon)}</p>`;
}

// ── Màn chào ────────────────────────────────────────────────────────────────
function renderIntro(): void {
  clearTimer();
  const c = content();
  if (!c) return;
  c.innerHTML = `
    <h2>🏔️ Leo núi kiến thức <span class="muted">— mô phỏng Olympia</span></h2>
    ${scoreBar()}
    <p class="muted">Bốn vòng thi kiến thức lịch sử – địa lý – văn hoá Việt Nam:</p>
    <ol class="ol-rules">
      <li><b>Khởi động</b> — ${KHOI_DONG_COUNT} câu nhanh, mỗi câu ${KHOI_DONG_SECONDS}s, đúng +10 điểm.</li>
      <li><b>Vượt chướng ngại vật</b> — mở dần gợi ý, đoán từ khoá càng sớm điểm càng cao (80/60/40/20).</li>
      <li><b>Tăng tốc</b> — 4 câu khó dần, trả lời càng nhanh điểm càng cao.</li>
      <li><b>Về đích</b> — tự chọn gói điểm 20/30/40; đúng được trọn điểm, sai bị trừ nửa.</li>
    </ol>
    <button id="ol-start" type="button">🚀 Bắt đầu leo núi</button>`;
  document.getElementById("ol-start")?.addEventListener("click", () => {
    totalScore = 0;
    startKhoiDong();
  });
}

// ── Vòng 1: Khởi động ────────────────────────────────────────────────────────
function startKhoiDong(): void {
  if (!bank) return;
  kdList = pick(bank.khoi_dong, Math.min(KHOI_DONG_COUNT, bank.khoi_dong.length));
  kdIndex = 0;
  renderKhoiDong();
}

function renderKhoiDong(): void {
  clearTimer();
  const c = content();
  if (!c) return;
  if (kdIndex >= kdList.length) {
    startVcnv();
    return;
  }
  const q = kdList[kdIndex];
  const options = shuffle(q.cac_lua_chon);
  c.innerHTML = `
    <h2>🔔 Vòng 1 · Khởi động <span class="muted">câu ${kdIndex + 1}/${kdList.length}</span></h2>
    ${scoreBar()}
    <div class="ol-timer"><div id="ol-timer-fill" class="ol-timer-fill"></div><span id="ol-timer-text">${KHOI_DONG_SECONDS}s</span></div>
    <p class="ol-question">${esc(q.cau_hoi)}</p>
    <div class="ol-options">${options
      .map((o) => `<button type="button" class="ol-option" data-v="${esc(o)}">${esc(o)}</button>`)
      .join("")}</div>
    <div id="ol-feedback" aria-live="polite"></div>`;

  let timeLeft = KHOI_DONG_SECONDS;
  const updateBar = (): void => {
    const fill = document.getElementById("ol-timer-fill");
    const text = document.getElementById("ol-timer-text");
    if (fill) fill.style.width = `${(timeLeft / KHOI_DONG_SECONDS) * 100}%`;
    if (text) text.textContent = `${timeLeft}s`;
  };
  updateBar();
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    updateBar();
    if (timeLeft <= 0) answerKhoiDong(null, q);
  }, 1000);

  c.querySelectorAll<HTMLButtonElement>(".ol-option").forEach((btn) =>
    btn.addEventListener("click", () => answerKhoiDong(btn.dataset.v ?? null, q)),
  );
}

function answerKhoiDong(value: string | null, q: MCQuestion): void {
  clearTimer();
  const ok = value === q.dap_an;
  if (ok) totalScore += 10;
  const c = content();
  if (!c) return;
  c.querySelectorAll<HTMLButtonElement>(".ol-option").forEach((b) => {
    b.disabled = true;
    if (b.dataset.v === q.dap_an) b.classList.add("ol-right");
    else if (b.dataset.v === value) b.classList.add("ol-wrong");
  });
  const fb = document.getElementById("ol-feedback");
  if (fb)
    fb.innerHTML = `<p class="ol-verdict">${
      ok
        ? "✅ Chính xác! +10 điểm"
        : value === null
          ? `⏰ Hết giờ! Đáp án: <b>${esc(q.dap_an)}</b>`
          : `❌ Sai rồi. Đáp án: <b>${esc(q.dap_an)}</b>`
    }</p>${sourceNote(q.giai_thich, q.nguon)}
      <button id="ol-next" type="button">Câu tiếp theo →</button>`;
  document.getElementById("ol-next")?.addEventListener("click", () => {
    kdIndex += 1;
    renderKhoiDong();
  });
}

// ── Vòng 2: Vượt chướng ngại vật ─────────────────────────────────────────────
function startVcnv(): void {
  clearTimer();
  const c = content();
  if (!c || !bank) return;
  if (bank.vcnv.length === 0) {
    startTangToc();
    return;
  }
  const puzzle = pick(bank.vcnv, 1)[0];
  let opened = 0;
  let solved = false;

  const render = (): void => {
    const rows = puzzle.hang_ngang
      .map((h, i) => {
        const isOpen = i < opened;
        return `<li class="ol-row ${isOpen ? "ol-row-open" : ""}">
          <span class="ol-row-no">${i + 1}</span>
          ${
            isOpen
              ? `<span class="ol-row-clue">${esc(h.goi_y)}</span> <b class="ol-row-ans">→ ${esc(h.dap_an)}</b>`
              : `<span class="ol-row-clue muted">Hàng ngang chưa mở</span>`
          }
        </li>`;
      })
      .join("");
    const nextPoints = opened <= 1 ? 80 : opened === 2 ? 60 : opened === 3 ? 40 : 20;
    c.innerHTML = `
      <h2>🧩 Vòng 2 · Vượt chướng ngại vật</h2>
      ${scoreBar()}
      <p class="muted">Mở dần các hàng ngang gợi ý rồi đoán <b>TỪ KHOÁ</b>. Đoán đúng khi đã mở ${opened} hàng: <b>+${nextPoints}</b> điểm.</p>
      <ul class="ol-rows">${rows}</ul>
      ${
        opened < puzzle.hang_ngang.length
          ? `<button id="ol-open" type="button">🔓 Mở hàng ngang ${opened + 1}</button>`
          : `<p class="muted">Đã mở hết gợi ý.</p>`
      }
      <form id="ol-kw-form" class="ol-kw-form">
        <input id="ol-kw" type="text" placeholder="Nhập từ khoá…" autocomplete="off" />
        <button type="submit">Đoán từ khoá</button>
      </form>
      <div id="ol-feedback" aria-live="polite"></div>`;

    document.getElementById("ol-open")?.addEventListener("click", () => {
      if (opened < puzzle.hang_ngang.length) opened += 1;
      render();
    });
    document.getElementById("ol-kw-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (solved) return;
      const input = document.getElementById("ol-kw") as HTMLInputElement | null;
      const guess = normalize(input?.value ?? "");
      const target = normalize(puzzle.tu_khoa);
      const fb = document.getElementById("ol-feedback");
      if (guess.length === 0) return;
      if (guess === target) {
        solved = true;
        const points = opened <= 1 ? 80 : opened === 2 ? 60 : opened === 3 ? 40 : 20;
        totalScore += points;
        if (fb)
          fb.innerHTML = `<p class="ol-verdict">✅ Chính xác! Từ khoá: <b>${esc(puzzle.tu_khoa)}</b> · +${points} điểm</p>
            ${sourceNote(puzzle.giai_thich, puzzle.nguon)}
            <button id="ol-next" type="button">Sang vòng Tăng tốc →</button>`;
        document.getElementById("ol-next")?.addEventListener("click", startTangToc);
      } else if (fb) {
        fb.innerHTML = `<p class="ol-verdict">❌ Chưa đúng — mở thêm gợi ý rồi thử lại nhé.</p>`;
      }
    });
  };
  render();

  // Cho phép "bỏ qua" sau khi mở hết mà vẫn chưa đoán được: nút xuất hiện khi hết hàng.
  // (Từ khoá vẫn hiển thị trong phần giải thích khi sang vòng — nhưng để đơn giản,
  //  người chơi luôn có thể tiếp tục bằng nút dưới đây.)
  const skip = document.createElement("button");
  skip.type = "button";
  skip.id = "ol-vcnv-skip";
  skip.className = "ol-skip";
  skip.textContent = "Bỏ qua (0 điểm) →";
  skip.addEventListener("click", () => {
    if (solved) return;
    const fb = document.getElementById("ol-feedback");
    if (fb)
      fb.innerHTML = `<p class="ol-verdict">Từ khoá là: <b>${esc(puzzle.tu_khoa)}</b></p>${sourceNote(puzzle.giai_thich, puzzle.nguon)}`;
    solved = true;
    startTangToc();
  });
  c.appendChild(skip);
}

// So khớp từ khoá không phân biệt hoa/thường và khoảng trắng thừa.
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

// ── Vòng 3: Tăng tốc ─────────────────────────────────────────────────────────
function startTangToc(): void {
  clearTimer();
  if (!bank) return;
  // Chọn 1 câu cho mỗi mức độ khó 1→4 (khó dần); thiếu mức nào thì lấy ngẫu nhiên.
  const byLevel: MCQuestion[] = [];
  for (let level = 1; level <= 4; level++) {
    const pool = bank.tang_toc.filter((q) => q.do_kho === level);
    const chosen = pool.length ? pick(pool, 1)[0] : null;
    if (chosen) byLevel.push(chosen);
  }
  ttList = byLevel.length ? byLevel : pick(bank.tang_toc, 4);
  ttIndex = 0;
  renderTangToc();
}

function renderTangToc(): void {
  clearTimer();
  const c = content();
  if (!c) return;
  if (ttIndex >= ttList.length) {
    startVeDich();
    return;
  }
  const q = ttList[ttIndex];
  const options = shuffle(q.cac_lua_chon);
  c.innerHTML = `
    <h2>⚡ Vòng 3 · Tăng tốc <span class="muted">câu ${ttIndex + 1}/${ttList.length} · độ khó ${q.do_kho ?? ttIndex + 1}</span></h2>
    ${scoreBar()}
    <div class="ol-timer"><div id="ol-timer-fill" class="ol-timer-fill"></div><span id="ol-timer-text">${TANG_TOC_SECONDS}s</span></div>
    <p class="muted">Trả lời càng nhanh, điểm càng cao (tối đa ${10 + TANG_TOC_SECONDS} điểm).</p>
    <p class="ol-question">${esc(q.cau_hoi)}</p>
    <div class="ol-options">${options
      .map((o) => `<button type="button" class="ol-option" data-v="${esc(o)}">${esc(o)}</button>`)
      .join("")}</div>
    <div id="ol-feedback" aria-live="polite"></div>`;

  let timeLeft = TANG_TOC_SECONDS;
  const updateBar = (): void => {
    const fill = document.getElementById("ol-timer-fill");
    const text = document.getElementById("ol-timer-text");
    if (fill) fill.style.width = `${(timeLeft / TANG_TOC_SECONDS) * 100}%`;
    if (text) text.textContent = `${timeLeft}s`;
  };
  updateBar();
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    updateBar();
    if (timeLeft <= 0) answerTangToc(null, q, 0);
  }, 1000);

  c.querySelectorAll<HTMLButtonElement>(".ol-option").forEach((btn) =>
    btn.addEventListener("click", () => answerTangToc(btn.dataset.v ?? null, q, timeLeft)),
  );
}

function answerTangToc(value: string | null, q: MCQuestion, timeLeft: number): void {
  clearTimer();
  const ok = value === q.dap_an;
  const points = ok ? 10 + Math.max(0, timeLeft) : 0;
  totalScore += points;
  const c = content();
  if (!c) return;
  c.querySelectorAll<HTMLButtonElement>(".ol-option").forEach((b) => {
    b.disabled = true;
    if (b.dataset.v === q.dap_an) b.classList.add("ol-right");
    else if (b.dataset.v === value) b.classList.add("ol-wrong");
  });
  const fb = document.getElementById("ol-feedback");
  if (fb)
    fb.innerHTML = `<p class="ol-verdict">${
      ok
        ? `✅ Chính xác! +${points} điểm`
        : value === null
          ? `⏰ Hết giờ! Đáp án: <b>${esc(q.dap_an)}</b>`
          : `❌ Sai. Đáp án: <b>${esc(q.dap_an)}</b>`
    }</p>${sourceNote(q.giai_thich, q.nguon)}
      <button id="ol-next" type="button">Câu tiếp theo →</button>`;
  document.getElementById("ol-next")?.addEventListener("click", () => {
    ttIndex += 1;
    renderTangToc();
  });
}

// ── Vòng 4: Về đích ──────────────────────────────────────────────────────────
function startVeDich(): void {
  clearTimer();
  if (!bank) return;
  vdList = pick(bank.ve_dich, Math.min(VE_DICH_COUNT, bank.ve_dich.length));
  vdIndex = 0;
  renderVeDichStake();
}

function renderVeDichStake(): void {
  clearTimer();
  const c = content();
  if (!c) return;
  if (vdIndex >= vdList.length) {
    renderFinal();
    return;
  }
  c.innerHTML = `
    <h2>🏁 Vòng 4 · Về đích <span class="muted">câu ${vdIndex + 1}/${vdList.length}</span></h2>
    ${scoreBar()}
    <p class="muted">Chọn gói điểm cho câu này. Đúng: cộng trọn điểm; sai: trừ nửa số điểm đã chọn.</p>
    <div class="ol-stakes">${VE_DICH_GOI.map(
      (g) => `<button type="button" class="ol-stake" data-g="${g}">${g} điểm</button>`,
    ).join("")}</div>`;
  c.querySelectorAll<HTMLButtonElement>(".ol-stake").forEach((btn) =>
    btn.addEventListener("click", () => {
      vdStake = Number(btn.dataset.g);
      renderVeDichQuestion();
    }),
  );
}

function renderVeDichQuestion(): void {
  const c = content();
  if (!c) return;
  const q = vdList[vdIndex];
  const options = shuffle(q.cac_lua_chon);
  c.innerHTML = `
    <h2>🏁 Vòng 4 · Về đích <span class="muted">câu ${vdIndex + 1}/${vdList.length} · gói ${vdStake} điểm</span></h2>
    ${scoreBar()}
    <p class="ol-question">${esc(q.cau_hoi)}</p>
    <div class="ol-options">${options
      .map((o) => `<button type="button" class="ol-option" data-v="${esc(o)}">${esc(o)}</button>`)
      .join("")}</div>
    <div id="ol-feedback" aria-live="polite"></div>`;
  c.querySelectorAll<HTMLButtonElement>(".ol-option").forEach((btn) =>
    btn.addEventListener("click", () => answerVeDich(btn.dataset.v ?? null, q)),
  );
}

function answerVeDich(value: string | null, q: MCQuestion): void {
  const ok = value === q.dap_an;
  const delta = ok ? vdStake : -Math.round(vdStake / 2);
  totalScore += delta;
  const c = content();
  if (!c) return;
  c.querySelectorAll<HTMLButtonElement>(".ol-option").forEach((b) => {
    b.disabled = true;
    if (b.dataset.v === q.dap_an) b.classList.add("ol-right");
    else if (b.dataset.v === value) b.classList.add("ol-wrong");
  });
  const fb = document.getElementById("ol-feedback");
  if (fb)
    fb.innerHTML = `<p class="ol-verdict">${
      ok ? `✅ Chính xác! +${vdStake} điểm` : `❌ Sai. Đáp án: <b>${esc(q.dap_an)}</b> · ${delta} điểm`
    }</p>${sourceNote(q.giai_thich, q.nguon)}
      <button id="ol-next" type="button">${vdIndex + 1 < vdList.length ? "Câu tiếp theo →" : "Xem kết quả →"}</button>`;
  document.getElementById("ol-next")?.addEventListener("click", () => {
    vdIndex += 1;
    renderVeDichStake();
  });
}

// ── Kết thúc ─────────────────────────────────────────────────────────────────
function renderFinal(): void {
  clearTimer();
  const c = content();
  if (!c) return;
  const best = saveHighScore(totalScore);
  const isRecord = totalScore >= best && totalScore > 0;
  c.innerHTML = `
    <h2>🎉 Hoàn thành phần thi!</h2>
    <div class="ol-final">
      <p class="ol-final-score">Tổng điểm của bạn: <b>${totalScore}</b></p>
      <p>${isRecord ? "🏆 Kỷ lục mới!" : `Kỷ lục hiện tại: <b>${best}</b>`}</p>
    </div>
    <p class="muted">Kiến thức trong trò chơi có trích dẫn nguồn ở mỗi câu — đọc lại để nhớ lâu hơn nhé!</p>
    <button id="ol-again" type="button">🔁 Chơi lại</button>`;
  document.getElementById("ol-again")?.addEventListener("click", renderIntro);
}

// ── Tải dữ liệu & khởi tạo ───────────────────────────────────────────────────
async function loadBank(): Promise<QuestionBank> {
  if (bank) return bank;
  const url = `${import.meta.env.BASE_URL}data/games/olympia-questions.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  bank = (await res.json()) as QuestionBank;
  return bank;
}

function buildDom(): { btn: HTMLButtonElement; panel: HTMLElement } {
  const btn = document.createElement("button");
  btn.id = "olympia-btn";
  btn.type = "button";
  btn.textContent = "🏔️ Leo núi";
  btn.title = "Trò chơi kiến thức mô phỏng Đường lên đỉnh Olympia";
  // Chèn vào thanh điều hướng có sẵn để đồng bộ giao diện; nếu không có thì gắn vào body.
  const nav = document.getElementById("topbar-nav");
  if (nav) nav.appendChild(btn);
  else document.body.appendChild(btn);

  const panel = document.createElement("aside");
  panel.id = "olympia-panel";
  panel.hidden = true;
  panel.innerHTML = `<button id="olympia-close" aria-label="Đóng">×</button><div id="olympia-content"></div>`;
  const app = document.getElementById("app") ?? document.body;
  app.appendChild(panel);
  return { btn, panel };
}

export function initOlympia(): void {
  if (document.getElementById("olympia-panel")) return; // tránh khởi tạo hai lần
  const { btn, panel } = buildDom();

  // Khi mở các panel khác của trang → ẩn Olympia để không chồng lấp.
  for (const id of ["threed-btn", "story-btn", "game-btn", "quiz-btn", "library-btn"]) {
    document.getElementById(id)?.addEventListener("click", () => {
      panel.hidden = true;
      clearTimer();
    });
  }

  btn.addEventListener("click", () => {
    hideOtherPanels();
    panel.hidden = false;
    const c = content();
    if (c && !bank) c.innerHTML = `<p class="muted">Đang tải câu hỏi…</p>`;
    void loadBank()
      .then(renderIntro)
      .catch(() => {
        const cc = content();
        if (cc)
          cc.innerHTML = `<p class="muted">⚠️ Không tải được ngân hàng câu hỏi — vui lòng kiểm tra kết nối và thử lại.</p>`;
      });
  });

  document.getElementById("olympia-close")?.addEventListener("click", () => {
    panel.hidden = true;
    clearTimer();
  });
}
