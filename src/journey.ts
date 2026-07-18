// Chế độ «HÀNH TRÌNH LỊCH SỬ» — người dùng HOÁ THÂN đi qua các mốc dựng nước &
// giữ nước dạng slide tương tác. Mỗi chặng có lời dẫn nhập vai (ngôi thứ hai) +
// mô hình 3D nhân vật (figures3d.ts, nạp lười vì Three.js nặng).
//
// Module tự chứa: initJourney() tự tạo nút mở + panel bằng JS (không sửa
// index.html / main.ts). Chỉ MỘT mô hình 3D sống tại một thời điểm — đổi chặng
// hoặc đóng panel đều dispose mô hình cũ để tránh rò WebGL context.

interface Scene {
  id: string;
  tieu_de: string;
  nam: string;
  loi_dan: string;
  boi_canh: string;
  figure_id: string;
  battle_id?: string;
  lien_quan_tinh: string[];
  trang_thai: string;
  nguon: string[];
}

interface JourneyData {
  ghi_chu?: string;
  items: Scene[];
}

// Handle tối thiểu khớp figures3d.mountFigure3D (tránh import tĩnh Three.js).
type Figure3DHandle = { dispose(): void };

const DATA_URL = `${import.meta.env.BASE_URL}data/journey/hanh-trinh.json`;

const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

let scenes: Scene[] | null = null;
let current = 0;

// Chỉ giữ một mô hình 3D sống. mountGen tăng mỗi lần dispose để huỷ các lần
// mount đang chờ import (nạp lười có thể resolve sau khi đã đổi/đóng chặng).
let activeFigure: Figure3DHandle | null = null;
let mountGen = 0;

function content(): HTMLElement | null {
  return document.getElementById("journey-content");
}

function disposeFigure(): void {
  mountGen++; // vô hiệu hoá mọi lần mount đang chờ import
  if (activeFigure) {
    activeFigure.dispose();
    activeFigure = null;
  }
}

// Nạp lười figures3d rồi mount vào #journey-stage. Bảo vệ chống race: nếu chặng
// đã đổi (mountGen thay đổi) trong lúc import, huỷ ngay để không rò context.
async function mountFigure(figureId: string): Promise<void> {
  const gen = mountGen;
  const stage = document.getElementById("journey-stage");
  if (!stage) return;
  try {
    const { mountFigure3D } = await import("./figures3d");
    if (gen !== mountGen || !stage.isConnected) return; // đã đổi/đóng chặng
    const handle = mountFigure3D(stage, figureId);
    if (gen !== mountGen) {
      handle.dispose(); // chặng đổi ngay sau khi mount xong
      return;
    }
    activeFigure = handle;
  } catch {
    if (gen === mountGen) stage.innerHTML = `<p class="muted">Không tải được mô hình 3D.</p>`;
  }
}

function sourcesHtml(nguon: string[]): string {
  if (!nguon.length) return "";
  return `<details class="sources"><summary>📚 Nguồn</summary><ul>${nguon
    .map((n) => `<li>${esc(n)}</li>`)
    .join("")}</ul></details>`;
}

function renderScene(): void {
  const c = content();
  if (!c || !scenes || !scenes.length) return;
  disposeFigure(); // dọn mô hình chặng trước khi dựng lại DOM

  const scene = scenes[current];
  const total = scenes.length;
  const isDraft = scene.trang_thai === "draft";

  c.innerHTML = `
    <div class="journey-controls">
      <button type="button" class="journey-nav-prev" aria-label="Chặng trước"${
        current === 0 ? " disabled" : ""
      }>◀ Chặng trước</button>
      <span class="journey-counter" aria-live="polite">Chặng ${current + 1}/${total}</span>
      <button type="button" class="journey-nav-next" aria-label="Chặng sau"${
        current === total - 1 ? " disabled" : ""
      }>Chặng sau ▶</button>
    </div>
    <article class="journey-scene">
      <h2>${esc(scene.tieu_de)} <span class="muted">— ${esc(scene.nam)}</span>${
        isDraft ? ` <span class="draft-badge">Bản nháp</span>` : ""
      }</h2>
      <blockquote class="journey-narration">${esc(scene.loi_dan)}</blockquote>
      <p class="journey-context">📍 ${esc(scene.boi_canh)}</p>
      <div class="journey-stage" id="journey-stage" style="height:300px"><p class="muted">Đang dựng mô hình…</p></div>
      ${
        scene.battle_id
          ? `<button type="button" class="journey-battle-btn">⚔️ Xem sa đồ trận này</button>`
          : ""
      }
      ${sourcesHtml(scene.nguon)}
    </article>`;

  c.querySelector<HTMLButtonElement>(".journey-nav-prev")?.addEventListener("click", () => {
    if (current > 0) {
      current--;
      renderScene();
    }
  });
  c.querySelector<HTMLButtonElement>(".journey-nav-next")?.addEventListener("click", () => {
    if (scenes && current < scenes.length - 1) {
      current++;
      renderScene();
    }
  });
  c.querySelector<HTMLButtonElement>(".journey-battle-btn")?.addEventListener("click", () => {
    closePanel(); // rời chế độ hành trình → dispose mô hình 3D
    document.getElementById("battle-btn")?.click();
  });

  void mountFigure(scene.figure_id);
}

function closePanel(): void {
  disposeFigure();
  const panel = document.getElementById("journey-panel");
  if (panel) panel.hidden = true;
}

function hideOtherPanels(): void {
  for (const id of [
    "game-panel",
    "quiz-panel",
    "story-panel",
    "library-panel",
    "olympia-panel",
    "battle-panel",
  ]) {
    const p = document.getElementById(id);
    if (p) p.hidden = true;
  }
}

function buildDom(): { btn: HTMLButtonElement; panel: HTMLElement } {
  const btn = document.createElement("button");
  btn.id = "journey-btn";
  btn.type = "button";
  btn.textContent = "🏛️ Hành trình lịch sử";
  btn.title = "Hoá thân đi qua các mốc dựng nước & giữ nước";
  const nav = document.getElementById("topbar-nav");
  if (nav) nav.appendChild(btn);
  else document.body.appendChild(btn);

  const panel = document.createElement("aside");
  panel.id = "journey-panel";
  panel.hidden = true;
  panel.innerHTML = `<button id="journey-close" aria-label="Đóng">×</button><div id="journey-content"></div>`;
  const app = document.getElementById("app") ?? document.body;
  app.appendChild(panel);
  return { btn, panel };
}

export function initJourney(): void {
  if (document.getElementById("journey-panel")) return; // tránh khởi tạo hai lần
  const { btn, panel } = buildDom();

  btn.addEventListener("click", () => {
    hideOtherPanels();
    panel.hidden = false;
    const c = content();
    if (c && !scenes) c.innerHTML = `<p class="muted">Đang mở hành trình…</p>`;
    if (scenes) {
      renderScene();
      return;
    }
    void fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<JourneyData>;
      })
      .then((d) => {
        scenes = d.items ?? [];
        current = 0;
        renderScene();
      })
      .catch(() => {
        const cc = content();
        if (cc)
          cc.innerHTML = `<p class="muted">⚠️ Chưa tải được hành trình — vui lòng kiểm tra kết nối và thử lại.</p>`;
      });
  });

  document.getElementById("journey-close")?.addEventListener("click", closePanel);
}
