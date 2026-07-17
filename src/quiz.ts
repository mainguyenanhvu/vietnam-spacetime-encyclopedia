// Ôn tập với spaced repetition (SM-2 rút gọn, hoàn toàn localStorage —
// không tài khoản, không thu thập dữ liệu cá nhân).
// Ngân hàng câu hỏi sinh tự động từ dữ liệu ranh giới + đồ thị kế thừa,
// nên đáp án luôn khớp nguồn đã trích dẫn của bản đồ.

interface Card {
  id: string;
  question: string;
  correct: string;
  distractors: string[];
}

interface Review {
  ef: number;
  reps: number;
  interval: number;
  due: string;
}

interface QuizMetric {
  sessions: number;
  completed: number;
  answered: number;
  correct: number;
}

const LS_REVIEWS = "quiz_reviews";
const LS_METRIC = "quiz_metric";
const SESSION_SIZE = 10;

let cards: Card[] = [];
let session: Card[] = [];
let sessionIndex = 0;
let sessionCorrect = 0;
let dataUrl = "";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function hideOtherPanels(current: string): void {
  for (const id of ["library-panel", "game-panel", "quiz-panel"]) {
    if (id === current) continue;
    const p = document.getElementById(id);
    if (p) p.hidden = true;
  }
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadReviews(): Record<string, Review> {
  try {
    return JSON.parse(localStorage.getItem(LS_REVIEWS) ?? "{}") as Record<string, Review>;
  } catch {
    return {};
  }
}

function loadMetric(): QuizMetric {
  try {
    const m = JSON.parse(localStorage.getItem(LS_METRIC) ?? "null") as QuizMetric | null;
    if (
      m &&
      [m.sessions, m.completed, m.answered, m.correct].every((n) => Number.isFinite(n))
    )
      return m;
  } catch {
    /* bỏ qua */
  }
  return { sessions: 0, completed: 0, answered: 0, correct: 0 };
}

function saveMetric(m: QuizMetric): void {
  localStorage.setItem(LS_METRIC, JSON.stringify(m));
}

/** SM-2 rút gọn: đúng → giãn kỳ ôn; sai → ôn lại ngay hôm sau. */
function applyAnswer(cardId: string, ok: boolean): void {
  const reviews = loadReviews();
  const r = reviews[cardId] ?? { ef: 2.5, reps: 0, interval: 0, due: todayStr() };
  if (ok) {
    r.reps += 1;
    r.interval = r.reps === 1 ? 1 : r.reps === 2 ? 3 : Math.round(r.interval * r.ef);
    r.ef = Math.min(2.8, r.ef + 0.05);
  } else {
    r.reps = 0;
    r.interval = 1;
    r.ef = Math.max(1.3, r.ef - 0.2);
  }
  r.due = addDays(r.interval);
  reviews[cardId] = r;
  localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function buildCards(): Promise<Card[]> {
  if (cards.length) return cards;
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const gj = (await res.json()) as {
    features: Array<{ properties: Record<string, string> }>;
  };
  const provinces = gj.features
    .map((f) => f.properties)
    .filter((p) => !p["loai"]);
  const allNew = provinces.map((p) => p["Tỉnh thành mới"]);
  const allCapitals = provinces.map((p) => p["TT hành chính"]);
  const merged = provinces.filter(
    (p) => p["Tỉnh thành cũ"] && p["Tỉnh thành cũ"] !== p["Tỉnh thành mới"],
  );

  const pick = <T>(pool: T[], not: T, n: number): T[] =>
    shuffle([...new Set(pool.filter((x) => x !== not))]).slice(0, n);

  const bank: Card[] = [];
  for (const p of merged) {
    bank.push({
      id: `hopthanh:${p["Tỉnh thành mới"]}`,
      question: `Từ 1/7/2025, «${p["Tỉnh thành mới"]}» hợp thành từ những tỉnh/thành nào?`,
      correct: p["Tỉnh thành cũ"],
      distractors: pick(
        merged.map((m) => m["Tỉnh thành cũ"]),
        p["Tỉnh thành cũ"],
        3,
      ),
    });
    for (const old of p["Tỉnh thành cũ"].split(",").map((s) => s.trim())) {
      if (old !== p["Tỉnh thành mới"])
        bank.push({
          id: `sapnhap:${old}`,
          question: `Tỉnh «${old}» thuộc tỉnh/thành nào sau sắp xếp 1/7/2025?`,
          correct: p["Tỉnh thành mới"],
          distractors: pick(allNew, p["Tỉnh thành mới"], 3),
        });
    }
  }
  for (const p of provinces) {
    bank.push({
      id: `tthc:${p["Tỉnh thành mới"]}`,
      question: `Trung tâm hành chính của «${p["Tỉnh thành mới"]}» đặt tại đâu?`,
      correct: p["TT hành chính"],
      distractors: pick(allCapitals, p["TT hành chính"], 3),
    });
  }
  cards = bank;
  return bank;
}

function pickSession(): Card[] {
  const reviews = loadReviews();
  const today = todayStr();
  const due = cards.filter((c) => reviews[c.id] && reviews[c.id].due <= today);
  const unseen = cards.filter((c) => !reviews[c.id]);
  return shuffle([...due, ...shuffle(unseen)]).slice(0, SESSION_SIZE);
}

function renderQuestion(): void {
  const content = document.getElementById("quiz-content");
  if (!content) return;
  const metric = loadMetric();

  if (sessionIndex >= session.length) {
    if (session.length > 0) {
      metric.completed += 1;
      saveMetric(metric);
    }
    const reviews = loadReviews();
    const dueCount = cards.filter(
      (c) => reviews[c.id] && reviews[c.id].due <= todayStr(),
    ).length;
    content.innerHTML = `
      <h2>🧠 Ôn tập</h2>
      ${
        session.length
          ? `<p>🎉 Hoàn thành phiên: <b>${sessionCorrect}/${session.length}</b> câu đúng.</p>`
          : ""
      }
      <p class="muted">Đã học ${Object.keys(reviews).length}/${cards.length} thẻ · đến hạn ôn hôm nay: ${dueCount} · tỉ lệ đúng tích luỹ: ${
        metric.answered ? Math.round((100 * metric.correct) / metric.answered) : 0
      }%</p>
      <button id="quiz-start" type="button">Bắt đầu phiên mới (${SESSION_SIZE} câu)</button>
      <p class="muted">Phương pháp lặp lại ngắt quãng: câu trả lời đúng sẽ lâu gặp lại hơn, câu sai quay lại ngay hôm sau. Toàn bộ tiến trình nằm trên máy của bạn.</p>`;
    document.getElementById("quiz-start")?.addEventListener("click", () => {
      const next = pickSession();
      if (next.length === 0) {
        const fb = content.querySelector(".muted");
        if (fb)
          fb.textContent =
            "🎉 Bạn đã ôn hết mọi thẻ và chưa có thẻ nào đến hạn — quay lại vào ngày mai nhé!";
        return;
      }
      session = next;
      sessionIndex = 0;
      sessionCorrect = 0;
      const m = loadMetric();
      m.sessions += 1;
      saveMetric(m);
      renderQuestion();
    });
    return;
  }

  const card = session[sessionIndex];
  const options = shuffle([card.correct, ...card.distractors]);
  content.innerHTML = `
    <h2>🧠 Ôn tập <span class="muted">câu ${sessionIndex + 1}/${session.length}</span></h2>
    <p class="quiz-question">${esc(card.question)}</p>
    <div class="quiz-options">${options
      .map((o) => `<button type="button" class="quiz-option" data-v="${esc(o)}">${esc(o)}</button>`)
      .join("")}</div>
    <div id="quiz-feedback" aria-live="polite"></div>`;
  content.querySelectorAll<HTMLButtonElement>(".quiz-option").forEach((btn) =>
    btn.addEventListener("click", () => {
      const ok = btn.dataset.v === card.correct;
      applyAnswer(card.id, ok);
      const m = loadMetric();
      m.answered += 1;
      if (ok) m.correct += 1;
      saveMetric(m);
      if (ok) sessionCorrect += 1;
      content.querySelectorAll<HTMLButtonElement>(".quiz-option").forEach((b) => {
        b.disabled = true;
        if (b.dataset.v === card.correct) b.classList.add("quiz-right");
        else if (b === btn) b.classList.add("quiz-wrong");
      });
      const fb = document.getElementById("quiz-feedback");
      if (fb)
        fb.innerHTML = `<p>${ok ? "✅ Chính xác!" : `❌ Đáp án đúng: <b>${esc(card.correct)}</b>`}</p>
          <button id="quiz-next" type="button">Câu tiếp theo →</button>`;
      document.getElementById("quiz-next")?.addEventListener("click", () => {
        sessionIndex += 1;
        renderQuestion();
      });
    }),
  );
}

export function initQuiz(geojsonUrl: string): void {
  dataUrl = geojsonUrl;
  document.getElementById("quiz-btn")?.addEventListener("click", () => {
    const panel = document.getElementById("quiz-panel");
    if (!panel) return;
    hideOtherPanels("quiz-panel");
    panel.hidden = false;
    const content = document.getElementById("quiz-content");
    if (content && !cards.length)
      content.innerHTML = `<p class="muted">Đang chuẩn bị câu hỏi…</p>`;
    void buildCards()
      .then(() => {
        session = [];
        sessionIndex = 0;
        renderQuestion();
      })
      .catch(() => {
        const c = document.getElementById("quiz-content");
        if (c)
          c.innerHTML = `<p class="muted">⚠️ Không tải được ngân hàng câu hỏi — vui lòng kiểm tra kết nối và thử lại.</p>`;
      });
  });
  document.getElementById("quiz-close")?.addEventListener("click", () => {
    const panel = document.getElementById("quiz-panel");
    if (panel) panel.hidden = true;
  });
}
