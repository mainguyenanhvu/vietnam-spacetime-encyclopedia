// Chế độ Thiếu nhi — «Hành trình Con Rồng Cháu Tiên».
// Hai nhân vật Lạc & Âu du hành qua các tỉnh, mỗi chương một thử thách nhỏ;
// hoàn thành được nhận một hạt ngọc Lạc Việt (lưu localStorage, không PII).

interface Chapter {
  slug: string;
  tinh: string;
  tieu_de: string;
  loi_ke: string[];
  thu_thach: { cau_hoi: string; dap_an: string[]; dung: string };
  ngoc: string;
}

interface StoryData {
  gioi_thieu: string;
  nhan_vat: Array<{ ten: string; mo_ta: string }>;
  chapters: Chapter[];
}

const LS_GEMS = "story_gems";

let story: StoryData | null = null;
let dataUrl = "";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function gems(): string[] {
  try {
    const g = JSON.parse(localStorage.getItem(LS_GEMS) ?? "[]") as string[];
    return Array.isArray(g) ? g : [];
  } catch {
    return [];
  }
}

function addGem(slug: string): void {
  const g = gems();
  if (!g.includes(slug)) {
    g.push(slug);
    localStorage.setItem(LS_GEMS, JSON.stringify(g));
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speakerHtml(line: string): string {
  const m = line.match(/^(Lạc|Âu|Người kể):\s*(.*)$/);
  if (!m) return `<p class="story-line">${esc(line)}</p>`;
  const cls = m[1] === "Lạc" ? "lac" : m[1] === "Âu" ? "au" : "nguoi-ke";
  const icon = m[1] === "Lạc" ? "👦" : m[1] === "Âu" ? "👧" : "📖";
  return `<p class="story-line story-${cls}"><b>${icon} ${esc(m[1])}:</b> ${esc(m[2])}</p>`;
}

function renderList(): void {
  const content = document.getElementById("story-content");
  if (!content || !story) return;
  const got = gems();
  content.innerHTML = `
    <h2>🐉 Hành trình Con Rồng Cháu Tiên</h2>
    <p class="story-line">${esc(story.gioi_thieu)}</p>
    <div class="story-cast">${story.nhan_vat
      .map((n) => `<span>${n.ten === "Lạc" ? "👦" : "👧"} <b>${esc(n.ten)}</b> — ${esc(n.mo_ta)}</span>`)
      .join("")}</div>
    <p class="story-gems">💎 Ngọc đã thu thập: <b>${got.length}/${story.chapters.length}</b></p>
    <div class="story-chapters">${story.chapters
      .map(
        (c) => `<button type="button" class="story-chapter" data-slug="${esc(c.slug)}">
          ${got.includes(c.slug) ? "✅" : "⭕"} ${esc(c.tieu_de)}</button>`,
      )
      .join("")}</div>`;
  content.querySelectorAll<HTMLButtonElement>(".story-chapter").forEach((btn) =>
    btn.addEventListener("click", () => renderChapter(btn.dataset.slug ?? "")),
  );
}

function renderChapter(slug: string): void {
  const content = document.getElementById("story-content");
  const chapter = story?.chapters.find((c) => c.slug === slug);
  if (!content || !chapter) return;
  content.innerHTML = `
    <button type="button" id="story-back">← Về hành trình</button>
    <h2>${esc(chapter.tieu_de)}</h2>
    ${chapter.loi_ke.map(speakerHtml).join("")}
    <div class="story-quiz">
      <p><b>⭐ Thử thách:</b> ${esc(chapter.thu_thach.cau_hoi)}</p>
      <div class="story-options">${shuffle(chapter.thu_thach.dap_an)
        .map((d) => `<button type="button" class="story-option" data-v="${esc(d)}">${esc(d)}</button>`)
        .join("")}</div>
      <div id="story-feedback" aria-live="polite"></div>
    </div>`;
  document.getElementById("story-back")?.addEventListener("click", renderList);
  content.querySelectorAll<HTMLButtonElement>(".story-option").forEach((btn) =>
    btn.addEventListener("click", () => {
      const ok = btn.dataset.v === chapter.thu_thach.dung;
      const fb = document.getElementById("story-feedback");
      if (ok) {
        addGem(chapter.slug);
        if (fb)
          fb.innerHTML = `<p class="story-win">🎉 Giỏi quá! Bạn nhận được <b>${esc(chapter.ngoc)}</b>!</p>
            <button type="button" id="story-continue">Tiếp tục hành trình →</button>`;
        document.getElementById("story-continue")?.addEventListener("click", renderList);
      } else if (fb) {
        fb.innerHTML = `<p class="story-retry">💪 Chưa đúng rồi — đọc lại câu chuyện phía trên và thử lần nữa nhé!</p>`;
      }
    }),
  );
}

export function initStory(url: string): void {
  dataUrl = url;
  document.getElementById("story-btn")?.addEventListener("click", () => {
    const panel = document.getElementById("story-panel");
    if (!panel) return;
    for (const id of ["library-panel", "game-panel", "quiz-panel"]) {
      const p = document.getElementById(id);
      if (p) p.hidden = true;
    }
    document.body.classList.add("kid-mode");
    panel.hidden = false;
    const content = document.getElementById("story-content");
    if (content && !story) content.innerHTML = `<p>Đang mở cổng thời gian…</p>`;
    void fetch(dataUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<StoryData>;
      })
      .then((d) => {
        story = d;
        renderList();
      })
      .catch(() => {
        const c = document.getElementById("story-content");
        if (c)
          c.innerHTML = `<p>⚠️ Cổng thời gian đang bận — bạn kiểm tra mạng rồi thử lại nhé!</p>`;
      });
  });
  document.getElementById("story-close")?.addEventListener("click", () => {
    const panel = document.getElementById("story-panel");
    if (panel) panel.hidden = true;
    document.body.classList.remove("kid-mode");
  });
}
