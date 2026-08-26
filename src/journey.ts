// Chế độ «HÀNH TRÌNH LỊCH SỬ» — người dùng HOÁ THÂN đi qua các mốc dựng nước &
// giữ nước dạng slide tương tác. Mỗi chặng có lời dẫn nhập vai (ngôi thứ hai) +
// mô hình 3D nhân vật (figures3d.ts, nạp lười vì Three.js nặng).
//
// Module tự chứa: initJourney() tự tạo nút mở + panel bằng JS (không sửa
// index.html / main.ts). Chỉ MỘT mô hình 3D sống tại một thời điểm — đổi chặng
// hoặc đóng panel đều dispose mô hình cũ để tránh rò WebGL context.
//
// Redesign 2026-08 (scratchpad/dacta_hanhtrinh_sado.md §3): thêm khay "Toàn bộ
// lộ trình" gập/mở nhóm theo thoi_ky, thanh tiến độ, chuyển cảnh có fade. UI
// phải chịu được vài chục chặng dù hôm nay chỉ có 6 — đây là vấn đề dữ liệu,
// không sửa ở lớp này.

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
  // Nhãn phân kỳ (vd. "Dựng nước", "Chống Bắc thuộc") — CHƯA có trong
  // hanh-trinh.json hiện tại. Trường tuỳ chọn: renderer gộp mọi chặng thiếu
  // trường này vào nhóm "Chưa phân kỳ" (xem CHUA_PHAN_KY bên dưới), không vỡ
  // khi dữ liệu cũ chưa cập nhật. Đề nghị schema cho đội nội dung — xem báo cáo.
  thoi_ky?: string;
}

interface JourneyData {
  ghi_chu?: string;
  items: Scene[];
}

// Handle tối thiểu khớp figures3d.mountFigure3D (tránh import tĩnh Three.js).
type Figure3DHandle = { dispose(): void };

import { esc, sourcesHtml } from "./util/html";
import { registerPanel, showOnly, hidePanel } from "./panels";

const DATA_URL = `${import.meta.env.BASE_URL}data/journey/hanh-trinh.json`;
const CHUA_PHAN_KY = "Chưa phân kỳ";

let scenes: Scene[] | null = null;
let current = 0;
let mapExpanded = false;

// Chỉ giữ một mô hình 3D sống. mountGen tăng mỗi lần dispose để huỷ các lần
// mount đang chờ import (nạp lười có thể resolve sau khi đã đổi/đóng chặng).
let activeFigure: Figure3DHandle | null = null;
let mountGen = 0;

// Tăng ở đầu mỗi lượt renderScene(); hàng đợi animationend so khớp gen của nó
// với renderGen hiện tại trước khi dựng DOM — click nhanh nhiều lần chỉ còn
// lượt dựng DOM cuối cùng chạy, tránh dựng trùng khi animation cũ chưa kết
// thúc (cùng pattern mountGen ở trên, áp cho lớp DOM/animation thay vì WebGL).
let renderGen = 0;

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

interface EraGroup {
  label: string;
  items: { scene: Scene; idx: number }[];
}

/** Nhóm chặng theo thoi_ky, giữ thứ tự xuất hiện đầu tiên của mỗi nhãn. */
function groupEras(all: Scene[]): EraGroup[] {
  const order: string[] = [];
  const map = new Map<string, EraGroup>();
  all.forEach((scene, idx) => {
    const label = scene.thoi_ky?.trim() || CHUA_PHAN_KY;
    if (!map.has(label)) {
      order.push(label);
      map.set(label, { label, items: [] });
    }
    map.get(label)!.items.push({ scene, idx });
  });
  return order.map((label) => map.get(label)!);
}

const theClass = (eraIdx: number): string => (eraIdx < 0 ? "" : `the-${(eraIdx % 6) + 1}`);

function stepStateClass(idx: number): "jn-step-done" | "jn-step-current" | "jn-step-upcoming" {
  if (idx < current) return "jn-step-done";
  if (idx === current) return "jn-step-current";
  return "jn-step-upcoming";
}

function renderMapHtml(eras: EraGroup[]): string {
  return eras
    .map((era, eraIdx) => {
      const cls = theClass(eraIdx);
      const steps = era.items
        .map(({ scene, idx }) => {
          const state = stepStateClass(idx);
          const ariaCurrent = idx === current ? ` aria-current="step"` : "";
          const dot = idx < current ? "✓" : String(idx + 1);
          return `<li>
            <button type="button" class="jn-step ${state}" data-idx="${idx}"${ariaCurrent}>
              <span class="jn-step-dot" aria-hidden="true">${dot}</span>
              <span class="jn-step-label">${esc(scene.tieu_de)} <em>— ${esc(scene.nam)}</em></span>
            </button>
          </li>`;
        })
        .join("");
      return `<div class="jn-era">
        <h3 class="jn-era-title ${cls}">${esc(era.label)}</h3>
        <ol class="jn-era-steps">${steps}</ol>
      </div>`;
    })
    .join("");
}

/** Gắn sự kiện cho mọi control vừa dựng — gọi lại sau MỖI lần c.innerHTML đổi. */
function wireControls(c: HTMLElement): void {
  c.querySelector<HTMLButtonElement>(".jn-map-toggle")?.addEventListener("click", (e) => {
    mapExpanded = !mapExpanded;
    const btn = e.currentTarget as HTMLButtonElement;
    btn.setAttribute("aria-expanded", String(mapExpanded));
    const body = document.getElementById("jn-map-body");
    if (body) body.hidden = !mapExpanded;
  });

  c.querySelectorAll<HTMLButtonElement>(".jn-step").forEach((stepBtn) => {
    stepBtn.addEventListener("click", () => {
      const idx = Number(stepBtn.dataset.idx);
      if (!scenes || Number.isNaN(idx) || idx === current) return;
      current = idx;
      mapExpanded = false; // nhảy chặng xong thì gập khay lại, giống menu chọn-rồi-đóng
      renderScene();
    });
  });

  c.querySelector<HTMLButtonElement>(".jn-nav-prev")?.addEventListener("click", () => {
    if (current > 0) {
      current--;
      renderScene();
    }
  });
  c.querySelector<HTMLButtonElement>(".jn-nav-next")?.addEventListener("click", () => {
    if (scenes && current < scenes.length - 1) {
      current++;
      renderScene();
    }
  });
  c.querySelector<HTMLButtonElement>(".jn-cta-battle")?.addEventListener("click", () => {
    const id = scenes?.[current]?.battle_id;
    closePanel(); // rời chế độ hành trình → dispose mô hình 3D
    // Nhảy THẲNG vào Màn B của đúng trận (battle.ts lắng nghe sự kiện này);
    // không có battle_id thì mở Màn A như cũ.
    window.dispatchEvent(new CustomEvent("sado:mo-tran", { detail: { id } }));
  });
}

/** Dựng toàn bộ nội dung panel cho `scenes[current]`. Đồng bộ, không chờ gì. */
function buildScene(c: HTMLElement): void {
  if (!scenes || !scenes.length) return;
  const scene = scenes[current];
  const total = scenes.length;
  const isDraft = scene.trang_thai === "draft";

  const eras = groupEras(scenes);
  const eraOrder = eras.map((e) => e.label);
  const sceneEraLabel = scene.thoi_ky?.trim() || CHUA_PHAN_KY;
  const sceneEraClass = theClass(eraOrder.indexOf(sceneEraLabel));
  const pct = ((current + 1) / total).toFixed(4);

  c.innerHTML = `
    <nav class="jn-map" aria-label="Toàn bộ lộ trình">
      <button type="button" class="jn-map-toggle" aria-expanded="${mapExpanded}" aria-controls="jn-map-body">
        🗺️ Toàn bộ lộ trình <span class="jn-map-count">(${total} chặng)</span>
      </button>
      <div class="jn-map-body" id="jn-map-body"${mapExpanded ? "" : " hidden"}>
        ${renderMapHtml(eras)}
      </div>
    </nav>

    <div class="jn-nav-row">
      <button type="button" class="jn-nav jn-nav-prev" aria-label="Chặng trước"${
        current === 0 ? " disabled" : ""
      }>◀</button>
      <div class="jn-progress" aria-hidden="true">
        <div class="jn-progress-track"><div class="jn-progress-fill" style="--pct:${pct}"></div></div>
      </div>
      <button type="button" class="jn-nav jn-nav-next" aria-label="Chặng sau"${
        current === total - 1 ? " disabled" : ""
      }>▶</button>
    </div>
    <p class="jn-progress-text" aria-live="polite">Chặng ${current + 1}/${total} · ${esc(sceneEraLabel)}</p>

    <article class="jn-scene jn-scene-in">
      <header class="jn-scene-head">
        <span class="jn-scene-era ${sceneEraClass}">${esc(sceneEraLabel)}</span>
        <h2 class="jn-scene-title">${esc(scene.tieu_de)} <span class="jn-scene-year">— ${esc(scene.nam)}</span>${
          isDraft ? ` <span class="draft-badge">Bản nháp</span>` : ""
        }</h2>
      </header>
      <blockquote class="jn-narration">${esc(scene.loi_dan)}</blockquote>
      <p class="jn-context">📍 ${esc(scene.boi_canh)}</p>
      <div class="journey-stage" id="journey-stage"><p class="muted">Đang dựng mô hình…</p></div>
      ${
        scene.battle_id
          ? `<button type="button" class="jn-cta-battle">⚔️ Xem sa đồ trận này</button>`
          : ""
      }
      ${sourcesHtml(scene.nguon)}
    </article>`;

  wireControls(c);
  void mountFigure(scene.figure_id);

  // Gỡ jn-scene-in sau khi animation "nên" đã xong, KHÔNG dựa vào
  // fill-mode both để tự khoá trạng thái cuối — đã kiểm thật: dưới
  // animation-duration gần 0 (giả lập reduced-motion), animationend không
  // bắn VÀ fill-mode không áp dụng, phần tử kẹt ở opacity:0 (từ keyframe
  // "from"). Gỡ class → rơi về rule mặc định `.jn-scene { opacity:1 }`,
  // đúng vô điều kiện vì không còn animation nào chi phối nữa.
  const newScene = c.querySelector<HTMLElement>(".jn-scene");
  if (newScene) {
    let cleaned = false;
    const clean = () => {
      if (cleaned) return;
      cleaned = true;
      newScene.classList.remove("jn-scene-in");
    };
    newScene.addEventListener("animationend", clean, { once: true });
    setTimeout(clean, 340); // > --dur-vua (280ms), dự phòng khi sự kiện không bắn
  }
}

// Đổi chặng: cảnh cũ fade-out (CSS @keyframes, ~--dur-nhanh) → dựng DOM mới
// → cảnh mới fade-in. disposeFigure() chạy NGAY, không chờ animation — mô
// hình 3D mount ngay sau khi DOM mới dựng xong, không đợi fade-in vẽ xong.
function renderScene(): void {
  const c = content();
  if (!c || !scenes || !scenes.length) return;
  disposeFigure(); // dọn mô hình chặng cũ ngay lập tức

  renderGen++;
  const gen = renderGen;
  const existing = c.querySelector<HTMLElement>(".jn-scene");
  if (existing) {
    // Bỏ jn-scene-in trước khi thêm jn-scene-out: cả hai cùng khai `animation`
    // trên cùng phần tử, đặc hiệu bằng nhau nên rule khai SAU trong CSS thắng
    // (jn-scene-in) — animationend của jn-fade-out sẽ không bao giờ bắn, màn
    // đứng hình giữa chừng. Đây là bug thật, bắt được khi bấm nhảy chặng.
    existing.classList.remove("jn-scene-in");
    existing.classList.add("jn-scene-out");
    let proceeded = false;
    const proceed = () => {
      if (proceeded || gen !== renderGen) return; // đã có lượt renderScene mới hơn
      proceeded = true;
      buildScene(c);
    };
    existing.addEventListener("animationend", proceed, { once: true });
    // Hẹn giờ dự phòng — ĐÃ KIỂM THẬT (không phải suy đoán): với
    // prefers-reduced-motion ép animation-duration còn 0.01ms, Chrome KHÔNG
    // bắn animationend cho animation gần-như-0-giây, màn đứng hình vĩnh viễn
    // (opacity khoá ở trạng thái cuối của jn-fade-out = 0, tức MẤT NỘI DUNG).
    // 220ms > --dur-nhanh (160ms) nên không cắt ngang animation bình thường;
    // cờ `proceeded` chặn chạy hai lần khi animationend vẫn bắn trước đó.
    setTimeout(proceed, 220);
  } else {
    buildScene(c); // lần mở đầu tiên: không có cảnh cũ để fade-out
  }
}

// Chỉ cần ẩn panel: `registerPanel` đã gắn observer nên disposeFigure() chạy
// dù panel bị ẩn từ đây hay từ module khác.
function closePanel(): void {
  hidePanel("journey-panel");
}

function buildDom(): { btn: HTMLButtonElement } {
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
  return { btn };
}

export function initJourney(): void {
  if (document.getElementById("journey-panel")) return; // tránh khởi tạo hai lần
  const { btn } = buildDom();

  // Dọn mô hình 3D mỗi khi panel bị ẩn — BẤT KỂ module nào ẩn nó. Trước đây chỉ
  // nút × của chính màn này mới dispose, nên chuyển sang Sa đồ/Việt Nam trong
  // tôi/Dòng thời gian là bỏ lại một WebGL context sống.
  registerPanel("journey-panel", disposeFigure);

  btn.addEventListener("click", () => {
    showOnly("journey-panel");
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

  // ←/→ nhảy chặng khi tiêu điểm nằm trong panel hành trình. Panel đã
  // tabIndex=-1 + focus() khi mở (panels.ts moPanel), nên activeElement là
  // chính #journey-panel ngay khi vừa mở — panel.contains(panel) = true.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const panel = document.getElementById("journey-panel");
    if (!panel || panel.hidden) return;
    const active = document.activeElement as HTMLElement | null;
    if (!active || !panel.contains(active)) return;
    if (active.tagName === "INPUT" || active.tagName === "TEXTAREA") return; // guard cho chắc
    if (!scenes || !scenes.length) return;
    if (e.key === "ArrowLeft" && current > 0) {
      current--;
      renderScene();
    } else if (e.key === "ArrowRight" && current < scenes.length - 1) {
      current++;
      renderScene();
    }
  });
}
