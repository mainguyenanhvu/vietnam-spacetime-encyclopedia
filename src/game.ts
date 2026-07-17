// Game «Đoán Tỉnh Xưa» — daily puzzle kiểu Worldle:
// đoán tỉnh/thành qua hình bóng (silhouette); phản hồi khoảng cách + hướng;
// chuỗi ngày chơi (streak) lưu localStorage; chia sẻ lưới emoji không spoiler.

interface GameFeature {
  name: string;
  mergedFrom: string;
  rings: number[][][];
  centroid: [number, number];
}

interface DayState {
  date: string;
  guesses: string[];
  done: boolean;
  win: boolean;
}

interface Stats {
  played: number;
  wins: number;
  streak: number;
  maxStreak: number;
  lastDate: string;
}

const MAX_GUESSES = 6;
const LS_STATE = "dtx_state";
const LS_STATS = "dtx_stats";

let features: GameFeature[] = [];
let boundariesUrl = "";

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

// FNV-1a — chọn tỉnh của ngày một cách tất định
function hashDate(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

function bearingArrow(from: [number, number], to: [number, number]): string {
  const dLon = to[0] - from[0];
  const dLat = to[1] - from[1];
  const angle = (Math.atan2(dLon, dLat) * 180) / Math.PI; // 0 = Bắc
  const arrows = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"];
  return arrows[Math.round(((angle + 360) % 360) / 45) % 8];
}

async function loadFeatures(): Promise<GameFeature[]> {
  if (features.length) return features;
  const res = await fetch(boundariesUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const gj = (await res.json()) as {
    features: Array<{
      geometry: { type: string; coordinates: number[][][] | number[][][][] };
      properties: Record<string, string>;
    }>;
  };
  features = gj.features
    .filter((f) => !f.properties["loai"])
    .map((f) => {
      const polys = (
        f.geometry.type === "MultiPolygon"
          ? (f.geometry.coordinates as number[][][][])
          : [f.geometry.coordinates as number[][][]]
      ).map((p) => p[0]);
      // polygon lớn nhất làm hình bóng & tâm
      const main = polys.reduce((a, b) => (b.length > a.length ? b : a));
      let sx = 0;
      let sy = 0;
      for (const [x, y] of main) {
        sx += x;
        sy += y;
      }
      return {
        name: f.properties["Tỉnh thành mới"],
        mergedFrom: f.properties["Tỉnh thành cũ"],
        rings: polys,
        centroid: [sx / main.length, sy / main.length] as [number, number],
      };
    });
  return features;
}

function silhouetteSvg(f: GameFeature): string {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ring of f.rings)
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const size = 220;
  const scale = size / Math.max(w, h);
  const paths = f.rings
    .map(
      (ring) =>
        "M" +
        ring
          .map(
            ([x, y]) =>
              `${((x - minX) * scale).toFixed(1)},${((maxY - y) * scale).toFixed(1)}`,
          )
          .join("L") +
        "Z",
    )
    .join(" ");
  return `<svg viewBox="0 0 ${(w * scale).toFixed(0)} ${(h * scale).toFixed(0)}" class="dtx-silhouette" role="img" aria-label="Hình bóng tỉnh cần đoán"><path d="${paths}"/></svg>`;
}

function loadState(): DayState {
  try {
    const s = JSON.parse(localStorage.getItem(LS_STATE) ?? "null") as DayState | null;
    if (s && s.date === todayStr() && Array.isArray(s.guesses)) return s;
  } catch {
    /* bỏ qua */
  }
  return { date: todayStr(), guesses: [], done: false, win: false };
}

function saveState(s: DayState): void {
  localStorage.setItem(LS_STATE, JSON.stringify(s));
}

function loadStats(): Stats {
  try {
    const s = JSON.parse(localStorage.getItem(LS_STATS) ?? "null") as Stats | null;
    if (
      s &&
      [s.played, s.wins, s.streak, s.maxStreak].every((n) => Number.isFinite(n)) &&
      typeof s.lastDate === "string"
    )
      return s;
  } catch {
    /* bỏ qua */
  }
  return { played: 0, wins: 0, streak: 0, maxStreak: 0, lastDate: "" };
}

function recordResult(win: boolean): Stats {
  const stats = loadStats();
  stats.played++;
  if (win) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    stats.wins++;
    stats.streak = stats.lastDate === yStr ? stats.streak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
    stats.lastDate = todayStr();
  } else {
    stats.streak = 0;
  }
  localStorage.setItem(LS_STATS, JSON.stringify(stats));
  return stats;
}

function targetOfToday(): GameFeature {
  return features[hashDate(todayStr()) % features.length];
}

function guessRows(state: DayState, target: GameFeature): string {
  return state.guesses
    .map((g) => {
      const f = features.find((x) => x.name === g);
      if (!f) return "";
      if (f.name === target.name)
        return `<div class="dtx-row dtx-win">🟩 ${esc(f.name)} — chính xác!</div>`;
      const km = haversineKm(f.centroid, target.centroid);
      const arrow = bearingArrow(f.centroid, target.centroid);
      return `<div class="dtx-row">⬛ ${esc(f.name)} · ${km} km ${arrow}</div>`;
    })
    .join("");
}

function shareText(state: DayState, target: GameFeature): string {
  const rows = state.guesses
    .map((g) => {
      const f = features.find((x) => x.name === g);
      if (!f) return "";
      return f.name === target.name
        ? "🟩"
        : "⬛" + bearingArrow(f.centroid, target.centroid);
    })
    .join(" ");
  const n = state.win ? state.guesses.length : "X";
  return `Đoán Tỉnh Xưa ${todayStr()} — ${n}/${MAX_GUESSES}\n${rows}\nhttps://mainguyenanhvu.github.io/vietnam-spacetime-encyclopedia/`;
}

function exportProgress(): void {
  const data: Record<string, string> = {};
  for (const k of [LS_STATE, LS_STATS])
    if (localStorage.getItem(k) !== null) data[k] = localStorage.getItem(k) as string;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `bach-khoa-vn-tien-trinh-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file: File, onDone: () => void): void {
  void file.text().then((text) => {
    try {
      const data = JSON.parse(text) as Record<string, string>;
      for (const k of [LS_STATE, LS_STATS]) {
        if (typeof data[k] !== "string") continue;
        JSON.parse(data[k]); // phải là JSON hợp lệ
        localStorage.setItem(k, data[k]);
      }
      // loadStats/loadState tự loại bỏ dữ liệu sai cấu trúc khi đọc lại
      onDone();
    } catch {
      alert("Tệp tiến trình không hợp lệ.");
    }
  });
}

function render(): void {
  const content = document.getElementById("game-content");
  if (!content) return;
  const target = targetOfToday();
  const state = loadState();
  const stats = loadStats();
  const remaining = MAX_GUESSES - state.guesses.length;
  const hint =
    !state.done && state.guesses.length >= 3 && target.mergedFrom !== target.name
      ? `<p class="giai-nghia">💡 Gợi ý: tỉnh này hợp thành từ <b>${esc(target.mergedFrom)}</b>.</p>`
      : "";

  const options = features
    .map((f) => f.name)
    .sort((a, b) => a.localeCompare(b, "vi"))
    .filter((n) => !state.guesses.includes(n))
    .map((n) => `<option value="${esc(n)}">${esc(n)}</option>`)
    .join("");

  const endBlock = state.done
    ? `<div class="dtx-end">
        <p>${state.win ? "🎉 Tuyệt vời!" : "😢 Hết lượt!"} Đáp án hôm nay: <b>${esc(target.name)}</b>${target.mergedFrom !== target.name ? ` (hợp thành từ ${esc(target.mergedFrom)})` : ""}.</p>
        <p>🔥 Chuỗi ngày thắng: <b>${stats.streak}</b> · Kỷ lục: <b>${stats.maxStreak}</b> · Thắng ${stats.wins}/${stats.played} ván</p>
        <button id="dtx-share" type="button">📤 Chia sẻ kết quả</button>
        <p class="muted">Nhấp vào tỉnh trên bản đồ để đọc hồ sơ bách khoa của đáp án nhé!</p>
      </div>`
    : `<form id="dtx-form">
        <select id="dtx-select" required><option value="" disabled selected>Chọn tỉnh/thành…</option>${options}</select>
        <button type="submit">Đoán (còn ${remaining} lượt)</button>
      </form>${hint}`;

  content.innerHTML = `
    <h2>🎮 Đoán Tỉnh Xưa <span class="muted">— ${todayStr()}</span></h2>
    <p class="muted">Đoán tỉnh/thành (bản đồ 34 tỉnh từ 1/7/2025) qua hình bóng. Sai sẽ được báo khoảng cách và hướng tới đáp án.</p>
    ${silhouetteSvg(target)}
    <div id="dtx-rows" aria-live="polite">${guessRows(state, target)}</div>
    ${endBlock}
    <div class="dtx-tools">
      <button id="dtx-export" type="button">💾 Xuất tiến trình</button>
      <label class="dtx-import-label">📂 Nhập tiến trình<input id="dtx-import" type="file" accept="application/json" hidden /></label>
    </div>`;

  document.getElementById("dtx-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const sel = document.getElementById("dtx-select") as HTMLSelectElement | null;
    if (!sel?.value) return;
    state.guesses.push(sel.value);
    if (sel.value === target.name) {
      state.done = true;
      state.win = true;
      recordResult(true);
    } else if (state.guesses.length >= MAX_GUESSES) {
      state.done = true;
      recordResult(false);
    }
    saveState(state);
    render();
  });
  document.getElementById("dtx-share")?.addEventListener("click", () => {
    void navigator.clipboard.writeText(shareText(state, target)).then(() => {
      const btn = document.getElementById("dtx-share");
      if (btn) btn.textContent = "✅ Đã sao chép!";
    });
  });
  document.getElementById("dtx-export")?.addEventListener("click", exportProgress);
  document.getElementById("dtx-import")?.addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    if (input.files?.[0]) importProgress(input.files[0], render);
  });
}

export function initGame(geojsonUrl: string): void {
  boundariesUrl = geojsonUrl;
  document.getElementById("game-btn")?.addEventListener("click", () => {
    const panel = document.getElementById("game-panel");
    if (!panel) return;
    hideOtherPanels("game-panel");
    panel.hidden = false;
    const content = document.getElementById("game-content");
    if (content && !features.length)
      content.innerHTML = `<p class="muted">Đang tải trò chơi…</p>`;
    void loadFeatures()
      .then(render)
      .catch(() => {
        const c = document.getElementById("game-content");
        if (c)
          c.innerHTML = `<p class="muted">⚠️ Không tải được dữ liệu trò chơi — vui lòng kiểm tra kết nối và thử lại.</p>`;
      });
  });
  document.getElementById("game-close")?.addEventListener("click", () => {
    const panel = document.getElementById("game-panel");
    if (panel) panel.hidden = true;
  });
}
