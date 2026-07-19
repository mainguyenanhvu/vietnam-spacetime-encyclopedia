import maplibregl from "maplibre-gl";
import type { ExpressionSpecification, MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import { initGame } from "./game";
import { initQuiz } from "./quiz";
import { initStory } from "./story";
import { initOlympia } from "./olympia";
import { initBattle } from "./battle";
import { initJourney } from "./journey";
import { initQuocGia } from "./quocgia";
import { initTimeline } from "./timeline";

// ---------------------------------------------------------------------------
// Cấu hình thời kỳ (era). Mỗi era = một lớp ranh giới GeoJSON.
// Nguồn dữ liệu: xem NGUON_DU_LIEU bên dưới — bắt buộc hiển thị trích dẫn.
// ---------------------------------------------------------------------------
interface Era {
  id: string;
  label: string;
  file: string;
  /** Thuộc tính chứa tên hiển thị của đơn vị hành chính trong era này */
  nameKey: string;
}

const ERAS: Era[] = [
  {
    id: "era-phapthuoc",
    label: "1887 – 1945 · Pháp thuộc: Bắc Kỳ – Trung Kỳ – Nam Kỳ",
    file: "data/boundaries/vn-phap-thuoc-1887-1945.geojson",
    nameKey: "Tỉnh thành cũ",
  },
  {
    id: "era-63",
    label: "1976 – 30/6/2025 · 63 tỉnh thành",
    file: "data/boundaries/vn-63-tinh-truoc-2025.geojson",
    nameKey: "Tỉnh thành cũ",
  },
  {
    id: "era-34",
    label: "Từ 1/7/2025 · 34 tỉnh thành (NQ 202/2025/QH15)",
    file: "data/boundaries/vn-34-tinh-2025.geojson",
    nameKey: "Tỉnh thành mới",
  },
];

const KY_COLORS: Record<string, string> = {
  "Bắc Kỳ": "#2563eb",
  "Trung Kỳ": "#ca8a04",
  "Nam Kỳ": "#059669",
};

/** Biểu thức màu dùng chung cho lớp phẳng và lớp khối 3D của một era. */
function eraColorExpr(era: Era): ExpressionSpecification {
  return era.id === "era-phapthuoc"
    ? [
        "match",
        ["get", "loai"],
        "quan-dao",
        "#dc2626",
        "dao",
        "#ea580c",
        [
          "match",
          ["get", "ky"],
          "Bắc Kỳ",
          KY_COLORS["Bắc Kỳ"],
          "Trung Kỳ",
          KY_COLORS["Trung Kỳ"],
          "Nam Kỳ",
          KY_COLORS["Nam Kỳ"],
          "#f59e0b",
        ],
      ]
    : [
        "match",
        ["get", "loai"],
        "quan-dao",
        "#dc2626",
        "dao",
        "#ea580c",
        "#f59e0b",
      ];
}

// Độ cao khối 3D (mét) — thuần minh hoạ để tạo hiệu ứng nổi khối,
// không phản ánh độ cao địa hình thật. Đảo thấp hơn tỉnh nhưng vẫn
// nổi rõ thành "tháp" đánh dấu chủ quyền biển đảo.
const HEIGHT_3D: ExpressionSpecification = [
  "case",
  ["boolean", ["feature-state", "hover"], false],
  ["match", ["get", "loai"], "quan-dao", 45000, "dao", 45000, 75000],
  ["match", ["get", "loai"], "quan-dao", 25000, "dao", 25000, 40000],
];

const NGUON_DU_LIEU = [
  "Ranh giới 63/34 tỉnh: Lê Quang Tuệ — github.com/lqtue/LacaProvinceMap",
  "Quần đảo Hoàng Sa & Trường Sa: Free-GIS-Data — github.com/nguyenduy1133/Free-GIS-Data",
  "Danh sách sáp nhập: Nghị quyết 202/2025/QH15 — chinhphu.vn",
  "Phân chia Bắc–Trung–Nam Kỳ: Hiệp ước Patenôtre 1884; Hoàng Sa thuộc Thừa Thiên (Dụ số 10/1938); Trường Sa thuộc Bà Rịa (Nghị định 21/12/1933) — dhannd.bocongan.gov.vn",
  "Nền bản đồ (không nhãn để bảo đảm chủ quyền): © OpenStreetMap contributors, © CARTO",
  "Hiệu ứng biển động (chế độ 3D): shader nước của Lâm Ngọc Khương — github.com/lamngockhuong/vietnam-3d-map (MIT)",
];

// Khung nhìn bao trọn lãnh thổ Việt Nam, bao gồm hai quần đảo
// Hoàng Sa và Trường Sa (chủ quyền Việt Nam) trên Biển Đông.
const VIETNAM_BOUNDS: [[number, number], [number, number]] = [
  [101.0, 6.5],
  [118.0, 23.5],
];

const map = new maplibregl.Map({
  container: "map",
  style: {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      // Nền KHÔNG NHÃN (CARTO light_nolabels). Bắt buộc: nền có nhãn của bên
      // thứ ba (OSM mặc định...) hiển thị địa danh phi pháp do nước ngoài đặt
      // trên Biển Đông (vd. «Tam Sa»), vi phạm chủ quyền Việt Nam và Luật Đo
      // đạc và bản đồ 2018. Nhãn chủ quyền tiếng Việt do dự án tự render.
      basemap: {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
          "https://d.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors © CARTO",
      },
    },
    // Nền dưới cùng (màu biển sâu) — bị basemap che ở chế độ 2D; lộ ra làm
    // phông biển/trời khi ẩn basemap ở chế độ 3D diorama.
    layers: [
      { id: "sky", type: "background", paint: { "background-color": "#0a3248" } },
      { id: "basemap", type: "raster", source: "basemap" },
    ],
  },
  bounds: VIETNAM_BOUNDS,
  fitBoundsOptions: { padding: 24 },
});

map.addControl(new maplibregl.NavigationControl(), "top-left");
map.addControl(new maplibregl.ScaleControl(), "bottom-left");

// Đồng bộ chiều cao thực của topbar vào biến CSS --topbar-h để mọi panel nổi
// (điều khiển lớp, hồ sơ tỉnh, thư viện…) luôn bám ngay dưới topbar. Chiều cao
// thay đổi vì (1) nhiều module thêm nút vào #topbar-nav khi chạy → topbar xuống
// 2 hàng, và (2) cửa sổ hẹp làm nav cuộn dòng. MutationObserver bắt (1) tin cậy
// (theo microtask, không phụ thuộc khung hình như ResizeObserver — vốn bị chặn
// khi tab chạy nền); resize bắt (2). Giữ tham chiếu ở scope module để không bị GC.
const topbarEl = document.getElementById("topbar");
const topbarNavEl = document.getElementById("topbar-nav");
const syncTopbarH = (): void => {
  if (topbarEl)
    document.documentElement.style.setProperty("--topbar-h", `${topbarEl.offsetHeight}px`);
};
const topbarNavObserver = topbarNavEl ? new MutationObserver(syncTopbarH) : null;
if (topbarNavEl && topbarNavObserver)
  topbarNavObserver.observe(topbarNavEl, { childList: true });
window.addEventListener("resize", syncTopbarH);
syncTopbarH();

let currentEra = ERAS.length - 1; // mặc định: 34 tỉnh hiện hành
let hoveredId: number | string | undefined;
let is3D = false;

// #5 — tô màu phân biệt tỉnh + nhãn tên tỉnh (tự render).
let showLabels = false;
let colorMode: "default" | "ruc-ro" | "pastel" = "default";
const PALETTES: Record<string, string[]> = {
  "ruc-ro": ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981"],
  pastel: ["#fca5a5", "#fdba74", "#fde68a", "#86efac", "#5eead4", "#93c5fd", "#c4b5fd", "#f9a8d4", "#fdcfb4", "#6ee7b7"],
};
// Đảo/quần đảo (chủ quyền) luôn giữ màu đỏ/cam nổi bật; đất liền tô phân biệt theo id.
function colorExprFor(era: Era): ExpressionSpecification {
  if (colorMode === "default") return eraColorExpr(era);
  const pal = PALETTES[colorMode];
  return [
    "match",
    ["get", "loai"],
    "quan-dao",
    "#dc2626",
    "dao",
    "#ea580c",
    ["at", ["%", ["id"], pal.length], ["literal", pal]],
  ] as ExpressionSpecification;
}
function applyColorMode(mode: "default" | "ruc-ro" | "pastel"): void {
  colorMode = mode;
  const base = mode === "default" ? 0.25 : 0.62;
  for (const era of ERAS) {
    if (map.getLayer(`${era.id}-fill`)) {
      map.setPaintProperty(`${era.id}-fill`, "fill-color", colorExprFor(era));
      map.setPaintProperty(`${era.id}-fill`, "fill-opacity", [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.82,
        base,
      ]);
    }
    if (map.getLayer(`${era.id}-3d`)) map.setPaintProperty(`${era.id}-3d`, "fill-extrusion-color", colorExprFor(era));
  }
}
function applyLabels(on: boolean): void {
  showLabels = on;
  ERAS.forEach((era, i) => {
    if (map.getLayer(`${era.id}-label`))
      map.setLayoutProperty(
        `${era.id}-label`,
        "visibility",
        i === currentEra && !is3D && showLabels ? "visible" : "none",
      );
  });
}

// #5b — nhãn SÔNG & NÚI tự render từ GeoJSON của dự án (public/data/geo/song-nui.json).
// Tự render để KHÔNG mở nhãn basemap (giữ chủ quyền — không lòi địa danh nước ngoài).
// Nhãn chủ quyền Hoàng Sa/Trường Sa vẫn nằm trên cùng nhờ beforeId.
let showSongNui = false;
function applySongNui(on: boolean): void {
  showSongNui = on;
  const v = on ? "visible" : "none";
  for (const id of ["song-labels", "nui-labels"]) {
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", v);
  }
}
function initSongNui(): void {
  const url = `${import.meta.env.BASE_URL}data/geo/song-nui.json`;
  void fetch(url)
    .then((r) => (r.ok ? (r.json() as Promise<GeoJSON.FeatureCollection>) : null))
    .then((geo) => {
      if (!geo || !geo.features?.length || map.getSource("song-nui")) return;
      map.addSource("song-nui", { type: "geojson", data: geo });
      const before = map.getLayer("chu-quyen-labels") ? "chu-quyen-labels" : undefined;
      const size = ["interpolate", ["linear"], ["zoom"], 4, 9, 8, 13] as unknown;
      map.addLayer(
        {
          id: "song-labels",
          type: "symbol",
          source: "song-nui",
          filter: ["==", ["get", "loai"], "song"],
          layout: {
            visibility: "none",
            "text-field": ["concat", "〰 ", ["get", "ten"]],
            "text-font": ["Open Sans Semibold"],
            "text-size": size,
            "text-max-width": 8,
          },
          paint: { "text-color": "#1d4ed8", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
        } as never,
        before,
      );
      map.addLayer(
        {
          id: "nui-labels",
          type: "symbol",
          source: "song-nui",
          filter: ["==", ["get", "loai"], "nui"],
          layout: {
            visibility: "none",
            "text-field": ["concat", "▲ ", ["get", "ten"]],
            "text-font": ["Open Sans Semibold"],
            "text-size": size,
            "text-max-width": 8,
          },
          paint: { "text-color": "#7c2d12", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
        } as never,
        before,
      );
      if (showSongNui) applySongNui(true);
    })
    .catch(() => {
      /* chưa có dữ liệu địa hình — bỏ qua, bản đồ vẫn chạy */
    });
}

// ---------------------------------------------------------------------------
// #6 — Bản đồ cổ Taberd 1838 (overlay georef) + Animation Nam tiến
// ---------------------------------------------------------------------------

// Bản «An Nam Đại Quốc Họa Đồ» (Taberd 1838, phạm vi công cộng) — ghi rõ
// "Paracel seu Cát Vàng" → giá trị chủ quyền. Phủ ảnh lên bản đồ tương tác qua
// image source căn 4 góc theo lưới kinh–vĩ đọc từ bản scan (kinh tuyến
// Greenwich; mốc 104°Đ ở rìa tây gần Vân Nam). Toạ độ góc là mức XẤP XỈ — nên
// tinh chỉnh trên production (đối chiếu bờ biển thực). Chèn raster DƯỚI lớp nhãn
// đầu tiên nên mọi nhãn tự render (tỉnh, sông–núi, chủ quyền) vẫn nằm trên cùng.
const TABERD_URL =
  "https://upload.wikimedia.org/wikipedia/commons/d/dd/An_Nam_Dai_Quoc_Hoa_Do_by_Jean_Louis_Taberd_1838.jpg";
// [Tây-Bắc, Đông-Bắc, Đông-Nam, Tây-Nam], mỗi góc = [lon, lat].
const TABERD_CORNERS: [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
] = [
  [101.6, 23.6],
  [111.4, 23.6],
  [111.4, 7.6],
  [101.6, 7.6],
];
let taberdOpacity = 0.6;
function applyTaberd(on: boolean): void {
  if (on && !map.getSource("taberd")) {
    map.addSource("taberd", { type: "image", url: TABERD_URL, coordinates: TABERD_CORNERS });
    const beforeId = map.getLayer(`${ERAS[0].id}-label`) ? `${ERAS[0].id}-label` : undefined;
    map.addLayer(
      { id: "taberd", type: "raster", source: "taberd", paint: { "raster-opacity": taberdOpacity } },
      beforeId,
    );
  }
  if (map.getLayer("taberd"))
    map.setLayoutProperty("taberd", "visibility", on ? "visible" : "none");
}
function setTaberdOpacity(v: number): void {
  taberdOpacity = v;
  if (map.getLayer("taberd")) map.setPaintProperty("taberd", "raster-opacity", v);
}

// --- Animation Nam tiến: lộ dần các tỉnh (bản đồ 34 tỉnh) theo mốc sáp nhập ---
interface NamTienMoc {
  buoc: number;
  nam: string;
  ten: string;
  mo_ta: string;
  tinh_moi: string[];
  nguon: string[];
}
let namTienMoc: NamTienMoc[] = [];
let namTienStep = -1;
let namTienTimer: number | null = null;
const namTienMax = (): number => namTienMoc.length - 1;

function initNamTien(): void {
  void fetchJson<{ moc: NamTienMoc[] }>("data/journey/nam-tien.json").then((data) => {
    if (!data?.moc?.length) return;
    namTienMoc = data.moc.slice().sort((a, b) => a.buoc - b.buoc);
    const slug2step = new Map<string, number>();
    for (const m of namTienMoc) for (const s of m.tinh_moi) slug2step.set(s, m.buoc);
    // Gắn nt_step vào từng tỉnh của geojson 34 tỉnh; tự tính slug (không commit
    // file dẫn xuất). ERAS[2] = lớp "34 tỉnh 2025".
    void fetch(`${import.meta.env.BASE_URL}${ERAS[2].file}`)
      .then((r) => (r.ok ? (r.json() as Promise<GeoJSON.FeatureCollection>) : null))
      .then((geo) => {
        if (!geo || map.getSource("nam-tien")) return;
        const feats = geo.features.flatMap((f) => {
          const name = (f.properties?.["Tỉnh thành mới"] as string) ?? "";
          const step = slug2step.get(slugify(name));
          if (step === undefined) return [];
          return [{ ...f, properties: { ...f.properties, nt_step: step, nt_ten: name } }];
        });
        map.addSource("nam-tien", {
          type: "geojson",
          data: { type: "FeatureCollection", features: feats } as GeoJSON.FeatureCollection,
        });
        const beforeId = map.getLayer(`${ERAS[0].id}-label`) ? `${ERAS[0].id}-label` : undefined;
        map.addLayer(
          {
            id: "nam-tien-fill",
            type: "fill",
            source: "nam-tien",
            layout: { visibility: "none" },
            filter: ["<=", ["get", "nt_step"], -1],
            paint: {
              // Bắc → Nam: đỏ sẫm → vàng, để thấy hướng mở cõi.
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", "nt_step"],
                0,
                "#7f1d1d",
                3,
                "#dc2626",
                6,
                "#f97316",
                9,
                "#f59e0b",
                11,
                "#fde047",
              ],
              "fill-opacity": 0.72,
            },
          } as never,
          beforeId,
        );
        map.addLayer(
          {
            id: "nam-tien-line",
            type: "line",
            source: "nam-tien",
            layout: { visibility: "none" },
            filter: ["<=", ["get", "nt_step"], -1],
            paint: { "line-color": "#450a0a", "line-width": 0.6 },
          } as never,
          beforeId,
        );
      });
    buildNamTienUI();
  });
}

function setNamTienStep(step: number): void {
  namTienStep = Math.max(0, Math.min(step, namTienMax()));
  const f = ["<=", ["get", "nt_step"], namTienStep];
  for (const id of ["nam-tien-fill", "nam-tien-line"])
    if (map.getLayer(id)) map.setFilter(id, f as never);
  renderNamTienPanel();
}
function namTienStop(): void {
  if (namTienTimer !== null) {
    clearInterval(namTienTimer);
    namTienTimer = null;
  }
  renderNamTienPanel();
}
function namTienPlay(): void {
  if (namTienTimer !== null) {
    namTienStop();
    return;
  }
  if (namTienStep >= namTienMax()) setNamTienStep(0);
  namTienTimer = window.setInterval(() => {
    if (namTienStep >= namTienMax()) {
      namTienStop();
      return;
    }
    setNamTienStep(namTienStep + 1);
  }, 1600);
  renderNamTienPanel();
}
function activateNamTien(on: boolean): void {
  const v = on ? "visible" : "none";
  for (const id of ["nam-tien-fill", "nam-tien-line"])
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", v);
  if (on) {
    if (namTienStep < 0) namTienStep = 0;
    map.fitBounds(VIETNAM_BOUNDS, { padding: 40, duration: 600 });
    setNamTienStep(namTienStep);
  } else {
    namTienStop();
  }
}
function buildNamTienUI(): void {
  if (document.getElementById("namtien-btn")) return;
  const nav = document.getElementById("topbar-nav");
  const btn = document.createElement("button");
  btn.id = "namtien-btn";
  btn.type = "button";
  btn.textContent = "🧭 Nam tiến";
  (nav ?? document.body).appendChild(btn);
  const panel = document.createElement("aside");
  panel.id = "namtien-panel";
  panel.hidden = true;
  panel.innerHTML = `<button id="namtien-close" aria-label="Đóng">×</button><div id="namtien-content"></div>`;
  document.getElementById("app")?.appendChild(panel);
  btn.addEventListener("click", () => {
    const opening = panel.hidden;
    panel.hidden = !opening;
    activateNamTien(opening);
    btn.classList.toggle("active", opening);
  });
  panel.querySelector("#namtien-close")?.addEventListener("click", () => {
    panel.hidden = true;
    activateNamTien(false);
    btn.classList.remove("active");
  });
  panel.addEventListener("click", (e) => {
    const act = (e.target as HTMLElement).dataset.act;
    if (act === "prev") {
      namTienStop();
      setNamTienStep(namTienStep - 1);
    } else if (act === "next") {
      namTienStop();
      setNamTienStep(namTienStep + 1);
    } else if (act === "play") {
      namTienPlay();
    }
  });
  panel.addEventListener("input", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "namtien-range") {
      namTienStop();
      setNamTienStep(Number(t.value));
    }
  });
}
function renderNamTienPanel(): void {
  const c = document.getElementById("namtien-content");
  if (!c || !namTienMoc.length) return;
  const m = namTienMoc[Math.max(0, namTienStep)];
  const playing = namTienTimer !== null;
  c.innerHTML = `
    <h2>🧭 Nam tiến — mở cõi về phương Nam</h2>
    <p class="namtien-year">${esc(m.nam)} · <strong>${esc(m.ten)}</strong></p>
    <p>${esc(m.mo_ta)}</p>
    <div class="namtien-controls">
      <button data-act="prev"${namTienStep <= 0 ? " disabled" : ""}>◀</button>
      <button data-act="play">${playing ? "⏸ Dừng" : "▶ Tự chạy"}</button>
      <button data-act="next"${namTienStep >= namTienMax() ? " disabled" : ""}>▶</button>
      <span class="namtien-count">Mốc ${namTienStep + 1}/${namTienMoc.length}</span>
    </div>
    <input type="range" name="namtien-range" min="0" max="${namTienMax()}" value="${Math.max(0, namTienStep)}"/>
    <p class="muted namtien-src">Nguồn: ${m.nguon.map((s) => esc(s)).join(" · ")}</p>
    <p class="muted">⚠️ Sơ đồ hoá ở mức tỉnh; tỉnh ghép gán theo mốc sáp nhập sớm nhất (phần cao nguyên trên thực tế muộn hơn).</p>`;
}

map.on("load", () => {
  for (const era of ERAS) {
    map.addSource(era.id, {
      type: "geojson",
      data: `${import.meta.env.BASE_URL}${era.file}`,
      generateId: true,
    });
    map.addLayer({
      id: `${era.id}-fill`,
      type: "fill",
      source: era.id,
      layout: { visibility: "none" },
      paint: {
        "fill-color": eraColorExpr(era),
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.55,
          0.25,
        ],
      },
    });
    map.addLayer({
      id: `${era.id}-line`,
      type: "line",
      source: era.id,
      layout: { visibility: "none" },
      paint: { "line-color": "#92400e", "line-width": 1 },
    });
    map.addLayer({
      id: `${era.id}-3d`,
      type: "fill-extrusion",
      source: era.id,
      layout: { visibility: "none" },
      paint: {
        "fill-extrusion-color": eraColorExpr(era),
        "fill-extrusion-height": HEIGHT_3D,
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.85,
      },
    });
    // Nhãn tên tỉnh — TỰ RENDER từ GeoJSON của dự án (không mở nhãn basemap để
    // giữ chủ quyền). Ẩn mặc định, bật qua điều khiển bản đồ. Đặt DƯỚI nhãn
    // chủ quyền (thêm trước lớp chu-quyen-labels bên dưới).
    map.addLayer({
      id: `${era.id}-label`,
      type: "symbol",
      source: era.id,
      layout: {
        visibility: "none",
        "text-field": ["coalesce", ["get", era.nameKey], ["get", "ten"]],
        "text-font": ["Open Sans Semibold"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 4, 9, 8, 13],
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#44403c",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.4,
      },
    });

    for (const layerId of [`${era.id}-fill`, `${era.id}-3d`]) {
      map.on("mousemove", layerId, (e) => {
        map.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0];
        if (!f) return;
        if (hoveredId !== undefined)
          map.setFeatureState({ source: era.id, id: hoveredId }, { hover: false });
        hoveredId = f.id;
        map.setFeatureState({ source: era.id, id: hoveredId }, { hover: true });
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
        if (hoveredId !== undefined)
          map.setFeatureState({ source: era.id, id: hoveredId }, { hover: false });
      hoveredId = undefined;
      });
      map.on("click", layerId, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        if (is3D) map.easeTo({ center: e.lngLat, duration: 800 });
        showProvincePanel(f, era);
      });
    }
  }

  // Nhãn chủ quyền tiếng Việt — vẽ SAU mọi lớp era để luôn nằm trên cùng,
  // hiển thị ở mọi thời kỳ và cả hai chế độ 2D/3D.
  map.addSource("chu-quyen", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { ten: "Quần đảo Hoàng Sa\n(Việt Nam)" },
          geometry: { type: "Point", coordinates: [112.0, 16.4] },
        },
        {
          type: "Feature",
          properties: { ten: "Quần đảo Trường Sa\n(Việt Nam)" },
          geometry: { type: "Point", coordinates: [113.8, 9.6] },
        },
      ],
    },
  });
  map.addLayer({
    id: "chu-quyen-labels",
    type: "symbol",
    source: "chu-quyen",
    layout: {
      "text-field": ["get", "ten"],
      "text-font": ["Open Sans Semibold"],
      "text-size": 12.5,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#b91c1c",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.6,
    },
  });

  initSongNui();
  initNamTien();
  setEra(currentEra);
  buildTimeline();
  buildLayerControl();

  document
    .getElementById("threed-btn")
    ?.addEventListener("click", () => setMode3D(!is3D));
});

// Lớp landmark 3D (Three.js) nạp lười ở lần bật 3D đầu tiên để không phình
// bundle chính cho người dùng không mở chế độ 3D.
let landmarks3d: { setVisible(v: boolean): void } | null = null;
let landmarks3dLoading = false;

async function ensureLandmarks3D(): Promise<void> {
  if (landmarks3d || landmarks3dLoading) return;
  landmarks3dLoading = true;
  try {
    const { createLandmarks3D } = await import("./landmarks3d");
    landmarks3d = createLandmarks3D(map);
    landmarks3d.setVisible(is3D);
  } catch {
    /* Không tải được Three.js — bản đồ khối 2.5D vẫn hoạt động bình thường. */
  } finally {
    landmarks3dLoading = false;
  }
}

/**
 * Chế độ 3D: tỉnh thành nổi khối (fill-extrusion) + landmark diorama (Three.js),
 * camera nghiêng, hover nhô cao, click bay tới — lấy cảm hứng từ
 * holetexvn/vietnam-3d-map (mô hình landmark là mã gốc của dự án này).
 */
function setMode3D(on: boolean): void {
  is3D = on;
  setEra(currentEra);
  map.easeTo({ pitch: on ? 55 : 0, bearing: on ? -12 : 0, duration: 1200 });
  document.getElementById("threed-btn")?.classList.toggle("active", on);
  // Chế độ 3D = diorama: ẩn basemap để Việt Nam nổi khối giữa biển động.
  if (map.getLayer("basemap"))
    map.setLayoutProperty("basemap", "visibility", on ? "none" : "visible");
  if (on) void ensureLandmarks3D();
  landmarks3d?.setVisible(on);
}

// ---------------------------------------------------------------------------
// R7 — Hai chế độ xem khi chọn tỉnh:
//   (a) Giữ nguyên bản đồ toàn quốc (mặc định).
//   (b) Focus: chỉ hiển thị tỉnh được chọn, zoom sâu để đi vào chi tiết.
// Focus lọc lớp era theo tên tỉnh (mọi tỉnh khác ẩn) và fit khung nhìn vào
// hình học của tỉnh đó. Đổi thời kỳ hoặc đóng panel sẽ tự thoát focus.
// ---------------------------------------------------------------------------
let focusMode = false;

function focusLayerIds(era: Era): string[] {
  return [`${era.id}-fill`, `${era.id}-line`, `${era.id}-3d`];
}

function clearFocusFilters(): void {
  for (const era of ERAS) {
    for (const id of focusLayerIds(era)) {
      if (map.getLayer(id)) map.setFilter(id, null);
    }
  }
  focusMode = false;
}

/** Gộp toạ độ lồng nhau (Polygon/MultiPolygon/…) vào một LngLatBounds. */
function extendBounds(b: maplibregl.LngLatBounds, coords: unknown): void {
  if (Array.isArray(coords) && typeof coords[0] === "number") {
    b.extend(coords as [number, number]);
    return;
  }
  if (Array.isArray(coords)) for (const c of coords) extendBounds(b, c);
}

function boundsOfFeature(f: MapGeoJSONFeature): maplibregl.LngLatBounds {
  const b = new maplibregl.LngLatBounds();
  const geom = f.geometry;
  if ("coordinates" in geom) extendBounds(b, geom.coordinates);
  return b;
}

function enterFocus(name: string, era: Era, f: MapGeoJSONFeature): void {
  const filter: ExpressionSpecification = ["==", ["get", era.nameKey], name];
  for (const id of focusLayerIds(era)) {
    if (map.getLayer(id)) map.setFilter(id, filter);
  }
  focusMode = true;
  const b = boundsOfFeature(f);
  if (!b.isEmpty())
    map.fitBounds(b, { padding: 80, duration: 1000, maxZoom: 9, pitch: is3D ? 55 : 0 });
}

function exitFocus(): void {
  clearFocusFilters();
  map.fitBounds(VIETNAM_BOUNDS, { padding: 24, duration: 1000 });
}

// ---------------------------------------------------------------------------
// R4 — trình xem mô hình 3D nhúng trong hồ sơ tỉnh (con vật, trái cây, đặc
// sản, biểu tượng). Three.js nạp lười khi người dùng mở mục để không phình
// bundle chính. Chỉ một mô hình sống tại một thời điểm; dọn khi đổi tỉnh/đóng.
// ---------------------------------------------------------------------------
let activeModel3DDispose: (() => void) | null = null;

async function buildModel3DPanel(host: HTMLElement): Promise<void> {
  if (host.dataset.ready === "1") return;
  host.dataset.ready = "1";
  try {
    const { mountModel3D, MODELS3D } = await import("./models3d");
    host.innerHTML = `
      <div class="model3d-gallery">${MODELS3D.map(
        (m) => `<button type="button" data-model="${m.id}">${esc(m.ten)}</button>`,
      ).join("")}</div>
      <div class="model3d-stage"></div>
      <div class="model3d-real"></div>`;
    const stage = host.querySelector<HTMLElement>(".model3d-stage");
    const realBox = host.querySelector<HTMLElement>(".model3d-real");
    if (!stage) return;
    let handle: { dispose(): void } | null = null;
    const LIC_TEN: Record<string, string> = { by: "CC-BY", "by-nc": "CC-BY-NC", "by-sa": "CC-BY-SA", "by-nc-sa": "CC-BY-NC-SA", cc0: "CC0" };
    const show = (id: string): void => {
      handle?.dispose();
      handle = mountModel3D(stage, id);
      stage.hidden = false;
      host
        .querySelectorAll<HTMLButtonElement>("button[data-model]")
        .forEach((b) => b.classList.toggle("active", b.dataset.model === id));
      // Mô hình 3D thật (Sketchfab CC) nếu có
      const def = MODELS3D.find((m) => m.id === id);
      if (realBox) {
        if (def?.sketchfab) {
          const sf = def.sketchfab;
          const url = `https://sketchfab.com/models/${sf.uid}`;
          realBox.innerHTML = `<button type="button" class="model3d-real-btn">🧊 Xem mô hình thật (Sketchfab)</button>`;
          realBox.querySelector<HTMLButtonElement>(".model3d-real-btn")?.addEventListener("click", () => {
            handle?.dispose();
            handle = null;
            stage.hidden = true;
            realBox.innerHTML = `
              <div class="model3d-embed"><iframe title="${esc(def.ten)}" loading="lazy" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen src="https://sketchfab.com/models/${sf.uid}/embed?autospin=0.3&ui_theme=dark&ui_hint=0"></iframe></div>
              <p class="model3d-attr">Mô hình «${esc(def.ten)}» của <a href="${url}" target="_blank" rel="noopener">${esc(sf.author)}</a> — giấy phép ${esc(LIC_TEN[sf.license] ?? sf.license)} (Sketchfab).</p>`;
          });
        } else {
          realBox.innerHTML = "";
        }
      }
    };
    host
      .querySelectorAll<HTMLButtonElement>("button[data-model]")
      .forEach((b) =>
        b.addEventListener("click", () => {
          if (b.dataset.model) show(b.dataset.model);
        }),
      );
    show(MODELS3D[0].id);
    activeModel3DDispose = () => {
      handle?.dispose();
      handle = null;
    };
  } catch {
    host.innerHTML = `<p class="muted">Không tải được trình xem 3D.</p>`;
  }
}

initGame(`${import.meta.env.BASE_URL}${ERAS[ERAS.length - 1].file}`);
initQuiz(`${import.meta.env.BASE_URL}${ERAS[ERAS.length - 1].file}`);
initStory(`${import.meta.env.BASE_URL}data/story/chapters.json`);
initOlympia();
initBattle();
initJourney();
initQuocGia();
initTimeline();

function setEra(index: number): void {
  // Đổi thời kỳ khác → thoát focus (tỉnh được lọc có thể không tồn tại ở
  // thời kỳ mới). Đổi chế độ 2D/3D (cùng thời kỳ) vẫn giữ focus.
  if (index !== currentEra && focusMode) clearFocusFilters();
  currentEra = index;
  ERAS.forEach((era, i) => {
    const active = i === index;
    const flat = active && !is3D ? "visible" : "none";
    map.setLayoutProperty(`${era.id}-fill`, "visibility", flat);
    map.setLayoutProperty(`${era.id}-line`, "visibility", flat);
    map.setLayoutProperty(
      `${era.id}-3d`,
      "visibility",
      active && is3D ? "visible" : "none",
    );
    map.setLayoutProperty(
      `${era.id}-label`,
      "visibility",
      active && !is3D && showLabels ? "visible" : "none",
    );
  });
  const label = document.getElementById("period-label");
  if (label) label.textContent = ERAS[index].label;
  const slider = document.getElementById("timeline") as HTMLInputElement | null;
  if (slider) slider.value = String(index);
  document
    .querySelectorAll<HTMLInputElement>("#layer-control input[name=era]")
    .forEach((r) => (r.checked = Number(r.value) === index));
}

function buildTimeline(): void {
  const slider = document.getElementById("timeline") as HTMLInputElement | null;
  if (!slider) return;
  slider.min = "0";
  slider.max = String(ERAS.length - 1);
  slider.step = "1";
  slider.disabled = false;
  slider.value = String(currentEra);
  slider.addEventListener("input", () => setEra(Number(slider.value)));
}

// ---------------------------------------------------------------------------
// Lớp phủ (overlays) — bật/tắt độc lập với thời kỳ
// ---------------------------------------------------------------------------
interface OverlayItem {
  ten: string;
  loai?: string;
  hang_muc?: string;
  nam?: string | number;
  dot?: number;
  lon: number;
  lat: number;
  tinh_34?: string;
}

interface OverlayConf {
  id: string;
  label: string;
  file: string;
  circleColor: ExpressionSpecification | string;
  nguon: string;
  popup: (p: OverlayItem) => string;
}

const OVERLAYS: OverlayConf[] = [
  {
    id: "unesco",
    label: "🏛️ Di sản thế giới & Công viên địa chất UNESCO",
    file: "data/overlays/unesco.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "di-san-the-gioi",
      "#7c3aed",
      "cong-vien-dia-chat",
      "#0d9488",
      "#7c3aed",
    ],
    nguon: "UNESCO (whc.unesco.org) · Cục Di sản văn hóa",
    popup: (p) =>
      `<strong>${esc(p.ten)}</strong><br/>${esc(String(p.hang_muc ?? ""))} · Ghi danh ${esc(String(p.nam ?? ""))}<br/><span style="color:#78716c">${esc(p.tinh_34 ?? "")}</span>`,
  },
  {
    id: "di-tich-qgdb",
    label: "🏯 Di tích quốc gia đặc biệt",
    file: "data/overlays/di-tich-qgdb.json",
    circleColor: "#b45309",
    nguon: "Cục Di sản văn hóa (dsvh.gov.vn) · Quyết định xếp hạng của Thủ tướng Chính phủ",
    popup: (p) =>
      `<strong>${esc(p.ten)}</strong><br/>${esc(String(p.loai ?? "di tích"))} · Xếp hạng ${esc(String(p.nam ?? ""))}${p.dot ? ` (đợt ${p.dot})` : ""}<br/><span style="color:#78716c">${esc(p.tinh_34 ?? "")}</span>`,
  },
  {
    id: "bao-vat-quoc-gia",
    label: "💎 Bảo vật quốc gia",
    file: "data/overlays/bao-vat-quoc-gia.json",
    circleColor: "#d4af37",
    nguon: "Cục Di sản văn hóa (dsvh.gov.vn) · Bảo tàng Lịch sử Quốc gia (baotanglichsu.vn)",
    popup: (p) => {
      const o = p as OverlayItem & { noi_luu_giu?: string; mo_ta?: string };
      return `<strong>${esc(o.ten)}</strong><br/>${esc(String(o.loai ?? ""))}${o.dot ? ` · công nhận đợt năm ${o.dot}` : ""}<br/>📍 ${esc(String(o.noi_luu_giu ?? ""))}${o.mo_ta ? `<br/><span style="color:#57534e">${esc(o.mo_ta)}</span>` : ""}`;
    },
  },
  {
    id: "huyen-su-khai-quoc",
    label: "🐉 Huyền sử khai quốc · Tứ bất tử · Hải đội Hoàng Sa",
    file: "data/overlays/huyen-su-khai-quoc.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "huyen-su-khai-quoc",
      "#b91c1c",
      "tu-bat-tu",
      "#7c3aed",
      "chu-quyen",
      "#dc2626",
      "#b91c1c",
    ],
    nguon:
      "Đại Việt Sử Ký Toàn Thư · Lĩnh Nam Chích Quái · Việt Điện U Linh · Phủ Biên Tạp Lục · Cục Di sản Văn hoá (dsvh.gov.vn)",
    popup: (p) => {
      const o = p as OverlayItem & {
        thoi_ky?: string;
        noi_tho?: string;
        cong_trang?: string;
        do_tin_cay_toa_do?: string;
        trang_thai?: string;
      };
      const tc =
        o.do_tin_cay_toa_do && o.do_tin_cay_toa_do !== "cao"
          ? `<br/><span style="color:#b45309;font-size:0.72rem">⚠️ Toạ độ nơi thờ độ tin cậy ${esc(o.do_tin_cay_toa_do)} — đang soát</span>`
          : "";
      return `<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(String(o.thoi_ky ?? ""))}</span><br/>📍 ${esc(String(o.noi_tho ?? ""))}${o.cong_trang ? `<br/><span style="color:#57534e">${esc(o.cong_trang)}</span>` : ""}${tc}`;
    },
  },
  {
    id: "khoi-nghia-bac-thuoc",
    label: "⚔️ Anh hùng chống Bắc thuộc & mở nền tự chủ",
    file: "data/overlays/khoi-nghia-bac-thuoc.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "khoi-nghia",
      "#ea580c",
      "tu-chu",
      "#15803d",
      "#ea580c",
    ],
    nguon:
      "Đại Việt Sử Ký Toàn Thư · Lĩnh Nam Chích Quái · Việt Điện U Linh · Cục Di sản Văn hoá (dsvh.gov.vn)",
    popup: (p) => {
      const o = p as OverlayItem & {
        thoi_ky?: string;
        noi_tho?: string;
        cong_trang?: string;
        do_tin_cay_toa_do?: string;
      };
      const tc =
        o.do_tin_cay_toa_do && o.do_tin_cay_toa_do !== "cao"
          ? `<br/><span style="color:#b45309;font-size:0.72rem">⚠️ Toạ độ nơi thờ độ tin cậy ${esc(o.do_tin_cay_toa_do)} — đang soát</span>`
          : "";
      return `<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(String(o.thoi_ky ?? ""))}</span><br/>📍 ${esc(String(o.noi_tho ?? ""))}${o.cong_trang ? `<br/><span style="color:#57534e">${esc(o.cong_trang)}</span>` : ""}${tc}`;
    },
  },
  {
    id: "khoa-bang-danh-nhan",
    label: "📜 Khoa bảng · thầy giáo · quan thanh liêm",
    file: "data/overlays/khoa-bang-danh-nhan.json",
    circleColor: [
      "match",
      ["get", "loai"],
      "khoa-bang",
      "#2563eb",
      "thay-giao",
      "#0d9488",
      "danh-nhan-van-hoa",
      "#6366f1",
      "quan-thanh-liem",
      "#15803d",
      "#2563eb",
    ],
    nguon:
      "Đại Việt Sử Ký Toàn Thư · Đại Nam Thực Lục · Phủ Biên Tạp Lục · Cục Di sản Văn hoá (dsvh.gov.vn) · vanmieu.gov.vn",
    popup: (p) => {
      const o = p as OverlayItem & {
        thoi_ky?: string;
        noi_tho?: string;
        cong_trang?: string;
        do_tin_cay_toa_do?: string;
      };
      const tc =
        o.do_tin_cay_toa_do && o.do_tin_cay_toa_do !== "cao"
          ? `<br/><span style="color:#b45309;font-size:0.72rem">⚠️ Toạ độ nơi thờ độ tin cậy ${esc(o.do_tin_cay_toa_do)} — đang soát</span>`
          : "";
      return `<strong>${esc(o.ten)}</strong><br/><span style="color:#78716c">${esc(String(o.thoi_ky ?? ""))}</span><br/>📍 ${esc(String(o.noi_tho ?? ""))}${o.cong_trang ? `<br/><span style="color:#57534e">${esc(o.cong_trang)}</span>` : ""}${tc}`;
    },
  },
];

const overlayLoaded = new Set<string>();

async function toggleOverlay(id: string, on: boolean): Promise<void> {
  const layerId = `overlay-${id}`;
  if (overlayLoaded.has(id)) {
    map.setLayoutProperty(layerId, "visibility", on ? "visible" : "none");
    return;
  }
  if (!on) return;
  const conf = OVERLAYS.find((o) => o.id === id);
  if (!conf) return;
  const data = await fetchJson<{ items: OverlayItem[] }>(conf.file);
  if (!data) {
    // Tải thất bại: bỏ tick checkbox để tránh trạng thái "đang bật" giả
    // trong khi lớp phủ chưa từng được thêm vào bản đồ.
    const cb = document.querySelector<HTMLInputElement>(
      `#layer-control input[name=overlay][value="${id}"]`,
    );
    if (cb) cb.checked = false;
    return;
  }
  map.addSource(layerId, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: data.items.map((it) => ({
        type: "Feature",
        properties: { ...it },
        geometry: { type: "Point", coordinates: [it.lon, it.lat] },
      })),
    },
  });
  map.addLayer({
    id: layerId,
    type: "circle",
    source: layerId,
    paint: {
      "circle-radius": 6,
      "circle-color": conf.circleColor,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
  map.on("click", layerId, (e) => {
    const f = e.features?.[0];
    if (!f) return;
    const p = f.properties as unknown as OverlayItem;
    new maplibregl.Popup({ offset: 10 })
      .setLngLat(e.lngLat)
      .setHTML(
        `${conf.popup(p)}<br/><span style="color:#78716c;font-size:0.75rem">Nguồn: ${conf.nguon}</span>`,
      )
      .addTo(map);
  });
  map.on("mouseenter", layerId, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", layerId, () => {
    map.getCanvas().style.cursor = "";
  });
  overlayLoaded.add(id);
}

function buildLayerControl(): void {
  const el = document.createElement("div");
  el.id = "layer-control";
  el.innerHTML = `
    <strong>🗺️ Lớp bản đồ</strong>
    <div class="group">
      ${ERAS.map(
        (era, i) => `
        <label><input type="radio" name="era" value="${i}" ${
          i === currentEra ? "checked" : ""
        }/> ${era.label}</label>`,
      ).join("")}
    </div>
    <strong>📌 Lớp phủ</strong>
    <div class="group">
      ${OVERLAYS.map(
        (o) => `<label><input type="checkbox" name="overlay" value="${o.id}"/> ${o.label}</label>`,
      ).join("")}
    </div>
    <strong>🎨 Kiểu bản đồ</strong>
    <div class="group">
      <label><input type="radio" name="palette" value="default" checked/> Mặc định</label>
      <label><input type="radio" name="palette" value="ruc-ro"/> Tô màu phân biệt tỉnh</label>
      <label><input type="radio" name="palette" value="pastel"/> Tô màu pastel</label>
      <label><input type="checkbox" name="labels"/> Hiện tên tỉnh</label>
      <label><input type="checkbox" name="songnui"/> Hiện sông &amp; núi</label>
    </div>
    <strong>🗺️ Bản đồ cổ</strong>
    <div class="group">
      <label><input type="checkbox" name="taberd"/> Taberd 1838 «Cát Vàng» (xấp xỉ)</label>
      <label class="taberd-op">Độ mờ <input type="range" name="taberd-opacity" min="0" max="1" step="0.05" value="0.6"/></label>
    </div>`;
  el.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "era") setEra(Number(t.value));
    if (t.name === "overlay") void toggleOverlay(t.value, t.checked);
    if (t.name === "palette") applyColorMode(t.value as "default" | "ruc-ro" | "pastel");
    if (t.name === "labels") applyLabels(t.checked);
    if (t.name === "songnui") applySongNui(t.checked);
    if (t.name === "taberd") applyTaberd(t.checked);
  });
  el.addEventListener("input", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "taberd-opacity") setTaberdOpacity(Number(t.value));
  });
  document.getElementById("app")?.appendChild(el);
}

// ---------------------------------------------------------------------------
// Hồ sơ bách khoa tỉnh (public/data/provinces/<slug>.json)
// ---------------------------------------------------------------------------
const SLUG_ALIASES: Record<string, string> = {
  "TP HCM": "thanh-pho-ho-chi-minh",
};

function slugify(name: string): string {
  return (
    SLUG_ALIASES[name] ??
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

interface ProvinceProfile {
  ten: string;
  trang_thai: string;
  giai_nghia_ten: string;
  tong_quan: string;
  ten_thoi_ky: Array<{ ten: string; thoi_ky: string }>;
  lich_su: string[];
  khao_co?: Array<{ ten: string; mo_ta: string }>;
  van_hoa?: {
    dac_san?: string[];
    le_hoi?: string[];
    lang_nghe?: string[];
    kien_truc?: string[];
    phuong_ngu?: string;
  };
  danh_nhan: Array<{ ten: string; ghi_chu: string }>;
  truyen_thuyet?: Array<{ ten: string; tom_tat: string }>;
  bien_so_xe?: string[];
  sap_nhap_2025?: string;
  sources: string[];
}

const profileCache = new Map<string, ProvinceProfile | null>();

async function loadProfile(name: string): Promise<ProvinceProfile | null> {
  const slug = slugify(name);
  if (profileCache.has(slug)) return profileCache.get(slug) ?? null;
  try {
    const res = await fetch(
      `${import.meta.env.BASE_URL}data/provinces/${slug}.json`,
    );
    const profile = res.ok ? ((await res.json()) as ProvinceProfile) : null;
    profileCache.set(slug, profile);
    return profile;
  } catch {
    profileCache.set(slug, null);
    return null;
  }
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const list = (items: string[] | undefined) =>
  items?.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";

function profileHtml(p: ProvinceProfile): string {
  const vh = p.van_hoa ?? {};
  const section = (title: string, body: string, open = false) =>
    body
      ? `<details class="profile-section"${open ? " open" : ""}><summary>${title}</summary>${body}</details>`
      : "";
  return `
    ${p.trang_thai === "draft" ? `<p class="draft-badge">📝 Bản nháp — đang kiểm chứng nguồn</p>` : ""}
    <p class="tong-quan">${esc(p.tong_quan)}</p>
    <p class="giai-nghia">💡 <em>${esc(p.giai_nghia_ten)}</em></p>
    ${section(
      "🕰️ Tên gọi qua các thời kỳ",
      `<table class="facts">${p.ten_thoi_ky
        .map((t) => `<tr><th>${esc(t.ten)}</th><td>${esc(t.thoi_ky)}</td></tr>`)
        .join("")}</table>`,
      true,
    )}
    ${section("📜 Dấu mốc lịch sử", list(p.lich_su))}
    ${section(
      "🏺 Di chỉ khảo cổ",
      list(p.khao_co?.map((k) => `${k.ten} — ${k.mo_ta}`)),
    )}
    ${section(
      "🎎 Văn hoá",
      [
        vh.dac_san?.length ? `<p><b>Đặc sản:</b> ${esc(vh.dac_san.join(", "))}</p>` : "",
        vh.le_hoi?.length ? `<p><b>Lễ hội:</b> ${esc(vh.le_hoi.join(", "))}</p>` : "",
        vh.lang_nghe?.length ? `<p><b>Làng nghề:</b> ${esc(vh.lang_nghe.join(", "))}</p>` : "",
        vh.kien_truc?.length ? `<p><b>Kiến trúc:</b> ${esc(vh.kien_truc.join(", "))}</p>` : "",
        vh.phuong_ngu ? `<p><b>Phương ngữ:</b> ${esc(vh.phuong_ngu)}</p>` : "",
      ].join(""),
    )}
    ${section(
      "🌟 Danh nhân & anh hùng",
      list(p.danh_nhan.map((d) => `${d.ten}: ${d.ghi_chu}`)),
    )}
    ${section(
      "🐉 Truyền thuyết & giai thoại",
      list(p.truyen_thuyet?.map((t) => `${t.ten} — ${t.tom_tat}`)),
    )}
    ${p.bien_so_xe?.length ? `<p><b>🚗 Biển số xe:</b> ${esc(p.bien_so_xe.join(", "))}</p>` : ""}
    ${p.sap_nhap_2025 ? `<p><b>🔀 Sắp xếp 2025:</b> ${esc(p.sap_nhap_2025)}</p>` : ""}
    <details class="sources"><summary>📚 Nguồn hồ sơ</summary>${list(p.sources)}</details>`;
}

function showProvincePanel(f: MapGeoJSONFeature, era: Era): void {
  const p = f.properties as Record<string, string | number>;
  const panel = document.getElementById("province-panel");
  const content = document.getElementById("panel-content");
  if (!panel || !content) return;

  // Dọn mô hình 3D của tỉnh trước đó (nếu có) trước khi dựng lại panel.
  activeModel3DDispose?.();
  activeModel3DDispose = null;
  disposeFigures();

  const num = (v: string | number | undefined) =>
    v === undefined || v === "" ? "—" : Number(String(v).replace(",", ".")).toLocaleString("vi-VN");

  const isIsland = p["loai"] === "quan-dao" || p["loai"] === "dao";
  const name = isIsland ? String(p["ten"]) : String(p[era.nameKey]);

  const isPhapThuoc = era.id === "era-phapthuoc";
  const rows: Array<[string, string]> = isIsland
    ? isPhapThuoc
      ? [
          ["Chủ quyền", "Việt Nam"],
          ["Thuộc Kỳ", String(p["ky"] ?? "—")],
          ["Trực thuộc", String(p["thuoc_tinh_thoi_ky"] ?? "—")],
          ["Văn bản thời kỳ", String(p["van_ban"] ?? "—")],
        ]
      : [
          ["Chủ quyền", "Việt Nam"],
          ["Trực thuộc (34 tỉnh)", String(p["thuoc_tinh_34"] ?? "—")],
          ["Trực thuộc (63 tỉnh)", String(p["thuoc_tinh_63"] ?? "—")],
        ]
    : isPhapThuoc
    ? [
        ["Thuộc Kỳ", String(p["ky"] ?? "—")],
        [
          "Chế độ cai trị",
          p["ky"] === "Nam Kỳ"
            ? "Thuộc địa (colonie), cai trị trực tiếp"
            : "Bảo hộ (protectorat), duy trì triều đình Huế",
        ],
        ["Nay thuộc (34 tỉnh)", String(p["Tỉnh thành mới"] ?? "—")],
      ]
    : [
        [
          era.nameKey === "Tỉnh thành mới" ? "Hợp thành từ" : "Sáp nhập vào (2025)",
          String(
            era.nameKey === "Tỉnh thành mới" ? p["Tỉnh thành cũ"] : p["Tỉnh thành mới"],
          ),
        ],
        ["Trung tâm hành chính", String(p["TT hành chính"] ?? "—")],
        ["Diện tích", `${num(p["Diện tích (km2)"])} km²`],
        ["Dân số", `${num(p["Dân số"])} người`],
        ["GRDP 2024", `${num(p["GRDP 2024 (tỷ VND)"])} tỷ đ`],
        ["Thu ngân sách 2024", `${num(p["Thu ngân sách 2024 (tỷ VND)"])} tỷ đ`],
        ["Số ĐVHC cấp xã", num(p["ĐVHC cấp xã"])],
      ];

  content.innerHTML = `
    <h2>${esc(name)}</h2>
    ${
      isIsland
        ? ""
        : `<div class="panel-actions"><button id="focus-btn" type="button" class="${
            focusMode ? "active" : ""
          }">${focusMode ? "🗺️ Về bản đồ đầy đủ" : "🔍 Chỉ xem tỉnh này"}</button></div>`
    }
    <table class="facts">${rows
      .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
      .join("")}</table>
    ${
      isPhapThuoc
        ? `<p class="muted">Ranh giới ba Kỳ thể hiện xấp xỉ theo địa giới tỉnh hiện đại; Liên bang Đông Dương thành lập theo sắc lệnh 17/10/1887.</p>`
        : ""
    }
    <div id="profile-slot"><p class="muted coming-soon">Đang tải hồ sơ bách khoa…</p></div>
    ${
      isIsland
        ? ""
        : `<details class="profile-section" id="model3d-section"><summary>🧊 Khám phá mô hình 3D</summary><div id="model3d-panel"><p class="muted">Mở mục này để tải trình xem 3D…</p></div></details>`
    }
    <details class="sources">
      <summary>📚 Nguồn dữ liệu bản đồ</summary>
      <ul>${NGUON_DU_LIEU.map((s) => `<li>${s}</li>`).join("")}</ul>
    </details>`;
  panel.hidden = false;

  // R7 — nút chuyển đổi giữa bản đồ toàn quốc và chế độ focus 1 tỉnh.
  const focusBtn = document.getElementById("focus-btn");
  if (focusBtn && !isIsland) {
    focusBtn.addEventListener("click", () => {
      if (focusMode) {
        exitFocus();
        focusBtn.textContent = "🔍 Chỉ xem tỉnh này";
        focusBtn.classList.remove("active");
      } else {
        enterFocus(name, era, f);
        focusBtn.textContent = "🗺️ Về bản đồ đầy đủ";
        focusBtn.classList.add("active");
      }
    });
  }

  // R4 — nạp lười trình xem 3D khi người dùng mở mục.
  const m3dSection = document.getElementById("model3d-section") as HTMLDetailsElement | null;
  if (m3dSection) {
    m3dSection.addEventListener("toggle", () => {
      const host = document.getElementById("model3d-panel");
      if (m3dSection.open && host) void buildModel3DPanel(host);
    });
  }

  if (!isIsland) {
    const slug = slugify(name);
    void Promise.all([
      loadProfile(name),
      loadLiterature(),
      loadMedia(),
      loadFigures(),
    ]).then(([profile, lib, media, figures]) => {
        const slot = document.getElementById("profile-slot");
        if (!slot) return;
        const imgs = media.filter((m) => m.slug === slug);
        const gallery = imgs.length
          ? `<details class="profile-section" open><summary>🖼️ Hình ảnh (${imgs.length})</summary>
              <div class="media-gallery">${imgs.map(mediaImgHtml).join("")}</div>
             </details>`
          : "";
        const figs = figures.filter((f) => f.lien_quan_tinh.includes(slug));
        const figuresSection = figs.length
          ? `<details class="profile-section" open><summary>🗿 Nhân vật lịch sử — mô hình 3D (${figs.length})</summary>
              ${figs.map(figureCardHtml).join("")}
             </details>`
          : "";
        const poems = [...lib.poems, ...lib.hcmWorks, ...lib.aboutHcm].filter(
          (p) => p.lien_quan_tinh.includes(slug),
        );
        const anecdotes = lib.anecdotes.filter((a) =>
          a.lien_quan_tinh.includes(slug),
        );
        const caDao = lib.caDao.filter((c) => c.lien_quan_tinh.includes(slug));
        const baiHat = lib.baiHat.filter((b) => b.lien_quan_tinh.includes(slug));
        const related =
          poems.length || anecdotes.length || caDao.length || baiHat.length
            ? `<details class="profile-section" open><summary>📖 Văn thơ, ca dao & bài hát gắn với vùng đất này</summary>
                ${poems.map(poemHtml).join("")}${anecdotes.map(anecdoteHtml).join("")}${caDao
                  .map(caDaoHtml)
                  .join("")}${baiHat.map(baiHatHtml).join("")}
               </details>`
            : "";
        slot.innerHTML =
          (profile
            ? profileHtml(profile)
            : `<p class="muted coming-soon">Hồ sơ bách khoa đầy đủ của tỉnh này đang được biên soạn.</p>`) +
          gallery +
          figuresSection +
          related;
        // Nạp lười mô hình 3D nhân vật khi người dùng mở từng thẻ.
        slot.querySelectorAll<HTMLDetailsElement>("details.fig3d").forEach((d) => {
          d.addEventListener("toggle", () => {
            const host = d.querySelector<HTMLElement>(".fig3d-stage");
            const id = d.dataset.figure;
            if (d.open && host && id) void mountFigureInto(host, id);
          });
        });
      },
    );
  } else {
    const slot = document.getElementById("profile-slot");
    if (slot) slot.innerHTML = "";
  }
}

document.getElementById("panel-close")?.addEventListener("click", () => {
  const panel = document.getElementById("province-panel");
  if (panel) panel.hidden = true;
  if (focusMode) exitFocus();
  activeModel3DDispose?.();
  activeModel3DDispose = null;
  disposeFigures();
});

// ---------------------------------------------------------------------------
// 📖 Thư viện văn thơ & giai thoại (public/data/literature/*.json)
// ---------------------------------------------------------------------------
interface Poem {
  id: string;
  ten: string;
  tac_gia: string;
  thoi_ky: string;
  the_loai: string;
  ban_quyen: "public-domain" | "cited-excerpt";
  lien_quan_tinh: string[];
  loi_binh?: string;
  vi_sao_hay?: string;
  xep_hang?: number;
  nguyen_van: string[];
  ban_dich?: string[];
  ghi_chu_dich?: string;
  sources: string[];
}

interface Anecdote {
  id: string;
  nhan_vat: string;
  danh_hieu: string;
  que_quan: string;
  lien_quan_tinh: string[];
  giai_thoai: Array<{ ten: string; noi_dung: string }>;
  y_nghia: string;
  sources: string[];
}

interface HcmPoem {
  ten: string;
  tac_gia: string;
  nam: string;
  ban_quyen: string;
  gioi_thieu: string;
  cau_tho: string[];
  nhung_nam_quan_trong?: string[];
  chu_thich?: string;
  sources: string[];
}

// R9 — ca dao/tục ngữ (dân gian, public-domain) + bài hát quê hương
// (chỉ NHÚNG YouTube chính chủ, không chép lời — tuân Luật SHTT).
interface CaDao {
  id: string;
  loai: "ca-dao" | "tuc-ngu";
  noi_dung: string[];
  lien_quan_tinh: string[];
  y_nghia?: string;
  nguon: string[];
}

interface BaiHat {
  id: string;
  ten: string;
  tac_gia_nhac?: string;
  tac_gia_loi?: string;
  nam?: string | number;
  the_loai?: string;
  lien_quan_tinh: string[];
  youtube_id: string;
  kenh_youtube?: string;
  gioi_thieu?: string;
  ban_quyen?: string;
  nguon: string[];
}

let literatureCache: {
  poems: Poem[];
  hcmWorks: Poem[];
  aboutHcm: Poem[];
  anecdotes: Anecdote[];
  hcm: HcmPoem | null;
  caDao: CaDao[];
  baiHat: BaiHat[];
} | null = null;

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}${path}`);
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function loadLiterature() {
  if (literatureCache) return literatureCache;
  const [poems, hcmWorks, aboutHcm, anecdotes, hcm, caDao, baiHat] = await Promise.all([
    fetchJson<{ items: Poem[] }>("data/literature/tho-yeu-nuoc.json"),
    fetchJson<{ items: Poem[] }>("data/literature/tac-pham-ho-chi-minh.json"),
    fetchJson<{ items: Poem[] }>("data/literature/tho-ve-bac.json"),
    fetchJson<{ items: Anecdote[] }>("data/literature/giai-thoai-khoa-bang.json"),
    fetchJson<HcmPoem>("data/literature/lich-su-nuoc-ta.json"),
    fetchJson<{ items: CaDao[] }>("data/literature/ca-dao-tuc-ngu.json"),
    fetchJson<{ items: BaiHat[] }>("data/literature/bai-hat-que-huong.json"),
  ]);
  literatureCache = {
    poems: poems?.items ?? [],
    hcmWorks: hcmWorks?.items ?? [],
    aboutHcm: (aboutHcm?.items ?? []).sort(
      (a, b) => (a.xep_hang ?? 99) - (b.xep_hang ?? 99),
    ),
    anecdotes: anecdotes?.items ?? [],
    hcm,
    caDao: caDao?.items ?? [],
    baiHat: baiHat?.items ?? [],
  };
  return literatureCache;
}

function poemHtml(p: Poem): string {
  const rank = p.xep_hang ? `<span class="rank-badge">#${p.xep_hang}</span> ` : "";
  return `<details class="profile-section"><summary>${rank}「${esc(p.ten)}」 — ${esc(p.tac_gia)}</summary>
    <p class="muted">${esc(p.thoi_ky)} · ${esc(p.the_loai)}</p>
    ${p.loi_binh ? `<p class="giai-nghia">💬 ${esc(p.loi_binh)}</p>` : ""}
    ${p.vi_sao_hay ? `<p class="giai-nghia">🏅 <b>Vì sao được xếp hạng cao:</b> ${esc(p.vi_sao_hay)}</p>` : ""}
    <blockquote class="poem">${p.nguyen_van.map(esc).join("<br/>")}</blockquote>
    ${p.ban_dich ? `<p class="muted">Dịch thơ:</p><blockquote class="poem">${p.ban_dich.map(esc).join("<br/>")}</blockquote>` : ""}
    ${p.ghi_chu_dich ? `<p class="muted">${esc(p.ghi_chu_dich)}</p>` : ""}
    ${p.ban_quyen === "cited-excerpt" ? `<p class="draft-badge">©️ Tác phẩm còn bảo hộ bản quyền — chỉ trích dẫn ngắn theo Điều 25 Luật SHTT.</p>` : ""}
    <details class="sources"><summary>📚 Nguồn</summary>${list(p.sources)}</details>
  </details>`;
}

function anecdoteHtml(a: Anecdote): string {
  return `<details class="profile-section"><summary>🎓 ${esc(a.nhan_vat)}</summary>
    <p class="muted">${esc(a.danh_hieu)} · Quê: ${esc(a.que_quan)}</p>
    ${a.giai_thoai
      .map((g) => `<p><b>${esc(g.ten)}.</b> ${esc(g.noi_dung)}</p>`)
      .join("")}
    <p class="giai-nghia">💡 ${esc(a.y_nghia)}</p>
    <details class="sources"><summary>📚 Nguồn</summary>${list(a.sources)}</details>
  </details>`;
}

function hcmPoemHtml(h: HcmPoem): string {
  return `<details class="profile-section featured-poem" open>
    <summary>⭐ «${esc(h.ten)}» — ${esc(h.tac_gia)} (${esc(h.nam)})</summary>
    <p class="giai-nghia">${esc(h.gioi_thieu)}</p>
    <blockquote class="poem hcm-poem">${h.cau_tho.map(esc).join("<br/>")}</blockquote>
    ${h.nhung_nam_quan_trong?.length ? `<details class="profile-section"><summary>📅 Những năm quan trọng (phụ lục nguyên bản)</summary><blockquote class="poem">${h.nhung_nam_quan_trong.map(esc).join("<br/>")}</blockquote>${h.chu_thich ? `<p class="muted">${esc(h.chu_thich)}</p>` : ""}</details>` : ""}
    <details class="sources"><summary>📚 Nguồn văn bản</summary>${list(h.sources)}</details>
  </details>`;
}

function caDaoHtml(c: CaDao): string {
  const icon = c.loai === "tuc-ngu" ? "🧭" : "🎵";
  const head = esc(c.noi_dung[0] ?? "") + (c.noi_dung.length > 1 ? "…" : "");
  return `<details class="profile-section"><summary>${icon} ${head}</summary>
    <blockquote class="poem">${c.noi_dung.map(esc).join("<br/>")}</blockquote>
    ${c.y_nghia ? `<p class="giai-nghia">💡 ${esc(c.y_nghia)}</p>` : ""}
    <details class="sources"><summary>📚 Nguồn</summary>${list(c.nguon)}</details>
  </details>`;
}

function baiHatHtml(b: BaiHat): string {
  const tacGia = [
    b.tac_gia_nhac ? `Nhạc: ${b.tac_gia_nhac}` : "",
    b.tac_gia_loi && b.tac_gia_loi !== b.tac_gia_nhac ? `Lời: ${b.tac_gia_loi}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  // Chỉ nhúng khi youtube_id đúng dạng 11 ký tự hợp lệ (chặn placeholder
  // "chưa xác thực"). Dùng youtube-nocookie để bảo vệ quyền riêng tư.
  const embeddable = /^[A-Za-z0-9_-]{11}$/.test(b.youtube_id);
  return `<details class="profile-section"><summary>🎶 ${esc(b.ten)}${
    b.the_loai ? ` — <span class="muted">${esc(b.the_loai)}</span>` : ""
  }</summary>
    <p class="muted">${esc(tacGia)}${b.nam ? ` · ${esc(String(b.nam))}` : ""}${
      b.kenh_youtube ? ` · Kênh: ${esc(b.kenh_youtube)}` : ""
    }</p>
    ${b.gioi_thieu ? `<p class="giai-nghia">${esc(b.gioi_thieu)}</p>` : ""}
    ${
      embeddable
        ? `<div class="yt-embed"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(
            b.youtube_id,
          )}" title="${esc(
            b.ten,
          )}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`
        : `<p class="muted">⚠️ Chưa xác thực video từ kênh chính chủ — chưa nhúng để tránh vi phạm bản quyền.</p>`
    }
    ${b.ban_quyen ? `<p class="draft-badge">©️ ${esc(b.ban_quyen)} — chỉ nhúng, không chép lời.</p>` : ""}
    <details class="sources"><summary>📚 Nguồn</summary>${list(b.nguon)}</details>
  </details>`;
}

// ---------------------------------------------------------------------------
// 🖼️ R2 — Thư viện ảnh theo tỉnh (public/data/media/images.json).
// Chỉ ảnh tự do (PD/CC0/CC-BY/CC-BY-SA hotlink) hoặc minh hoạ AI gắn nhãn;
// cổng license media ép trong CI (scripts/validate_media.mjs).
// ---------------------------------------------------------------------------
interface MediaImage {
  id: string;
  slug: string;
  muc: string;
  ten: string;
  mo_ta?: string;
  url: string;
  nguon?: string[];
  tac_gia?: string;
  giay_phep: string;
  ghi_chu?: string;
}

const MUC_LABEL: Record<string, string> = {
  "dac-san": "🍜 Đặc sản",
  "kien-truc": "🏛️ Kiến trúc",
  "trang-phuc": "👘 Trang phục",
  "danh-thang": "🏞️ Danh thắng",
  "le-hoi": "🎏 Lễ hội",
  "san-vat": "🧺 Sản vật",
};

const LICENSE_LABEL: Record<string, string> = {
  "public-domain": "Phạm vi công cộng",
  cc0: "CC0",
  "cc-by": "CC BY",
  "cc-by-sa": "CC BY-SA",
  "ai-generated": "Minh hoạ AI",
};

let mediaCache: MediaImage[] | null = null;

async function loadMedia(): Promise<MediaImage[]> {
  if (mediaCache) return mediaCache;
  const data = await fetchJson<{ items: MediaImage[] }>("data/media/images.json");
  mediaCache = data?.items ?? [];
  return mediaCache;
}

function mediaImgHtml(m: MediaImage): string {
  const lic = LICENSE_LABEL[m.giay_phep] ?? m.giay_phep;
  const credit =
    m.giay_phep === "ai-generated"
      ? `Minh hoạ AI (không dựa trên tác phẩm có bản quyền cụ thể)`
      : `${m.tac_gia ? `${esc(m.tac_gia)} · ` : ""}${lic}${
          m.nguon?.length ? ` · ${m.nguon.map(esc).join(" · ")}` : ""
        }`;
  return `<figure class="media-fig">
    <img loading="lazy" src="${esc(m.url)}" alt="${esc(m.ten)}" />
    <figcaption>${MUC_LABEL[m.muc] ?? ""} <b>${esc(m.ten)}</b>${
      m.mo_ta ? ` — ${esc(m.mo_ta)}` : ""
    }<br/><span class="muted">${credit}</span></figcaption>
  </figure>`;
}

// ---------------------------------------------------------------------------
// 🗿 R5 — Nhân vật lịch sử (mô hình 3D low-poly theo tượng đài đã công bố).
// KHÔNG chân dung xác thực — hình dung nghệ thuật, gắn nhãn minh bạch + nguồn
// chính sử. figures3d.ts (Three.js) nạp lười khi người dùng mở từng mục.
// ---------------------------------------------------------------------------
interface HistFigure {
  id: string;
  ten: string;
  thoi_dai: string;
  cong_trang: string;
  tuong_dai_tham_chieu: string;
  nhan_hinh_dung: string;
  lien_quan_tinh: string[];
  trang_thai: string;
  nguon: string[];
}

let figuresCache: HistFigure[] | null = null;
const activeFigureDisposers: Array<() => void> = [];

async function loadFigures(): Promise<HistFigure[]> {
  if (figuresCache) return figuresCache;
  const data = await fetchJson<{ items: HistFigure[] }>("data/figures/figures-3d.json");
  figuresCache = data?.items ?? [];
  return figuresCache;
}

function disposeFigures(): void {
  while (activeFigureDisposers.length) activeFigureDisposers.pop()?.();
}

async function mountFigureInto(host: HTMLElement, id: string): Promise<void> {
  if (host.dataset.ready === "1") return;
  host.dataset.ready = "1";
  try {
    const { mountFigure3D } = await import("./figures3d");
    const handle = mountFigure3D(host, id);
    activeFigureDisposers.push(() => handle.dispose());
  } catch {
    host.innerHTML = `<p class="muted">Không tải được mô hình 3D.</p>`;
  }
}

function figureCardHtml(f: HistFigure): string {
  return `<details class="profile-section fig-card">
    <summary>🗿 ${esc(f.ten)} <span class="muted">— ${esc(f.thoi_dai)}</span></summary>
    <p>${esc(f.cong_trang)}</p>
    <p class="fig-disclaimer">⚠️ ${esc(f.nhan_hinh_dung)} <br/>Tham chiếu: ${esc(f.tuong_dai_tham_chieu)}.</p>
    <details class="fig3d" data-figure="${esc(f.id)}">
      <summary>🧊 Xem mô hình 3D</summary>
      <div class="fig3d-stage model3d-stage"><p class="muted">Đang tải mô hình…</p></div>
    </details>
    <details class="sources"><summary>📚 Nguồn</summary>${list(f.nguon)}</details>
  </details>`;
}

// ---------------------------------------------------------------------------
// 🏷️ Tra cứu niên hiệu (public/data/timeline/nien-hieu.json)
// ---------------------------------------------------------------------------
interface NienHieuItem {
  trieu_dai: string;
  vua?: string;
  nien_hieu: string | null;
  tu_nam: number;
  den_nam: number;
  ghi_chu?: string;
}

let nienHieuCache: { items: NienHieuItem[]; nguon?: string[] } | null | undefined;

function nienHieuSectionHtml(): string {
  return `
    <h3>🏷️ Tra cứu niên hiệu theo năm</h3>
    <div id="nh-box">
      <p><label>Nhập năm dương lịch (năm âm = trước Công nguyên, ví dụ −200; tới 1945):
        <input id="nh-year" type="number" min="-2879" max="1945" style="width:6rem"/></label>
        <button id="nh-btn" type="button">Tra cứu</button></p>
      <div id="nh-result" aria-live="polite"></div>
    </div>`;
}

function wireNienHieuLookup(): void {
  const btn = document.getElementById("nh-btn");
  const result = document.getElementById("nh-result");
  if (!btn || !result) return;
  const lookup = async (): Promise<void> => {
    const input = document.getElementById("nh-year") as HTMLInputElement | null;
    const year = Number(input?.value);
    if (!Number.isInteger(year) || year === 0 || year < -2879 || year > 1945) {
      result.innerHTML = `<p class="muted">Vui lòng nhập một năm từ −2879 (2879 TCN) đến 1945 (không có năm 0).</p>`;
      return;
    }
    if (nienHieuCache === undefined)
      nienHieuCache = await fetchJson<{ items: NienHieuItem[]; nguon?: string[] }>(
        "data/timeline/nien-hieu.json",
      );
    if (!nienHieuCache) {
      result.innerHTML = `<p class="muted">⚠️ Chưa tải được dữ liệu niên hiệu — vui lòng thử lại sau.</p>`;
      return;
    }
    const all = nienHieuCache.items.filter(
      (i) => year >= i.tu_nam && year <= i.den_nam,
    );
    // Mục "thời kỳ" (không niên hiệu) chỉ hiện khi năm đó không có niên hiệu thật
    const named = all.filter((i) => i.nien_hieu);
    const hits = named.length ? named : all;
    const fmtYear = (y: number) => (y < 0 ? `${-y} TCN` : String(y));
    result.innerHTML = hits.length
      ? `<table class="facts">${hits
          .map(
            (i) =>
              `<tr><th>${esc(i.nien_hieu ?? "(không niên hiệu)")}</th><td>${esc(i.trieu_dai)}${
                i.vua ? ` · ${esc(i.vua)}` : ""
              } · ${fmtYear(i.tu_nam)}–${fmtYear(i.den_nam)}${i.ghi_chu ? `<br/><span class="muted">${esc(i.ghi_chu)}</span>` : ""}</td></tr>`,
          )
          .join("")}</table>
        <p class="muted">Nguồn: ${(nienHieuCache.nguon ?? []).map(esc).join(" · ")}</p>`
      : `<p class="muted">Không tìm thấy niên hiệu cho năm ${fmtYear(year)}.</p>`;
  };
  btn.addEventListener("click", () => void lookup());
  document.getElementById("nh-year")?.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") void lookup();
  });
}

async function openLibrary(): Promise<void> {
  const panel = document.getElementById("library-panel");
  const content = document.getElementById("library-content");
  if (!panel || !content) return;
  for (const id of ["game-panel", "quiz-panel", "story-panel"]) {
    const other = document.getElementById(id);
    if (other) other.hidden = true;
  }
  panel.hidden = false;
  content.innerHTML = `<p class="muted">Đang tải thư viện…</p>`;
  const lib = await loadLiterature();
  content.innerHTML = `
    <h2>📖 Thư viện</h2>
    ${lib.hcm ? hcmPoemHtml(lib.hcm) : ""}
    <h3>🎋 Thơ văn Hồ Chí Minh</h3>
    ${lib.hcmWorks.map(poemHtml).join("")}
    <h3>🌸 Thơ viết về Bác <span class="muted">(xếp theo mức hiện diện trong SGK & phê bình — có tính chủ quan)</span></h3>
    ${lib.aboutHcm.map(poemHtml).join("")}
    <h3>🇻🇳 Thơ yêu nước qua các thời đại</h3>
    ${lib.poems.map(poemHtml).join("")}
    <h3>🎓 Giai thoại Trạng nguyên – khoa bảng</h3>
    ${lib.anecdotes.map(anecdoteHtml).join("")}
    <h3>🎵 Ca dao & tục ngữ về quê hương, con người</h3>
    ${lib.caDao.length ? lib.caDao.map(caDaoHtml).join("") : `<p class="muted">Đang biên soạn…</p>`}
    <h3>🎶 Bài hát về quê hương đất nước <span class="muted">(nhúng từ kênh YouTube chính chủ)</span></h3>
    ${lib.baiHat.length ? lib.baiHat.map(baiHatHtml).join("") : `<p class="muted">Đang biên soạn…</p>`}
    ${nienHieuSectionHtml()}
    <h3>🗺️ Bản đồ cổ</h3>
    <details class="profile-section">
      <summary>「An Nam Đại Quốc Họa Đồ」 — Giám mục Jean-Louis Taberd, 1838</summary>
      <p class="giai-nghia">Bản đồ Việt Nam khắc in năm 1838, ghi chú song ngữ Hán – Quốc ngữ – Latinh.
      Trên Biển Đông, bản đồ ghi rõ <b>«Paracel seu Cát Vàng»</b> (Paracel tức Cát Vàng — Hoàng Sa),
      một tư liệu phương Tây quan trọng khẳng định chủ quyền lâu đời của Việt Nam đối với quần đảo Hoàng Sa.</p>
      <img class="old-map" loading="lazy" alt="An Nam Đại Quốc Họa Đồ (Taberd, 1838)"
        src="https://upload.wikimedia.org/wikipedia/commons/d/dd/An_Nam_Dai_Quoc_Hoa_Do_by_Jean_Louis_Taberd_1838.jpg" />
      <p class="muted">Tác phẩm thuộc phạm vi công cộng ·
        <a href="https://commons.wikimedia.org/wiki/File:An_Nam_Dai_Quoc_Hoa_Do_by_Jean_Louis_Taberd_1838.jpg"
           target="_blank" rel="noopener">Xem bản độ phân giải đầy đủ trên Wikimedia Commons</a></p>
      <details class="sources"><summary>📚 Nguồn</summary><ul>
        <li>Jean-Louis Taberd, Dictionarium Latino-Anamiticum (phụ bản bản đồ), 1838</li>
        <li>Wikimedia Commons — tệp scan gốc 3500×6111</li>
        <li>Trần Đức Anh Sơn (chủ biên), Tư liệu về chủ quyền của Việt Nam đối với quần đảo Hoàng Sa — NXB Văn hóa – Văn nghệ</li>
      </ul></details>
    </details>`;
  wireNienHieuLookup();
}

document.getElementById("library-btn")?.addEventListener("click", () => void openLibrary());
document.getElementById("library-close")?.addEventListener("click", () => {
  const panel = document.getElementById("library-panel");
  if (panel) panel.hidden = true;
});
