import maplibregl from "maplibre-gl";
import type { ExpressionSpecification, MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import { initGame } from "./game";
import { initQuiz } from "./quiz";
import { initStory } from "./story";

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
    layers: [{ id: "basemap", type: "raster", source: "basemap" }],
  },
  bounds: VIETNAM_BOUNDS,
  fitBoundsOptions: { padding: 24 },
});

map.addControl(new maplibregl.NavigationControl(), "top-left");
map.addControl(new maplibregl.ScaleControl(), "bottom-left");

let currentEra = ERAS.length - 1; // mặc định: 34 tỉnh hiện hành
let hoveredId: number | string | undefined;
let is3D = false;

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

  setEra(currentEra);
  buildTimeline();
  buildLayerControl();

  document
    .getElementById("threed-btn")
    ?.addEventListener("click", () => setMode3D(!is3D));
});

/**
 * Chế độ 3D: tỉnh thành nổi khối (fill-extrusion), camera nghiêng,
 * hover nhô cao, click bay tới — lấy cảm hứng từ holetexvn/vietnam-3d-map.
 */
function setMode3D(on: boolean): void {
  is3D = on;
  setEra(currentEra);
  map.easeTo({ pitch: on ? 55 : 0, bearing: on ? -12 : 0, duration: 1200 });
  document.getElementById("threed-btn")?.classList.toggle("active", on);
}

initGame(`${import.meta.env.BASE_URL}${ERAS[ERAS.length - 1].file}`);
initQuiz(`${import.meta.env.BASE_URL}${ERAS[ERAS.length - 1].file}`);
initStory(`${import.meta.env.BASE_URL}data/story/chapters.json`);

function setEra(index: number): void {
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
    </div>`;
  el.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "era") setEra(Number(t.value));
    if (t.name === "overlay") void toggleOverlay(t.value, t.checked);
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
    <table class="facts">${rows
      .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
      .join("")}</table>
    ${
      isPhapThuoc
        ? `<p class="muted">Ranh giới ba Kỳ thể hiện xấp xỉ theo địa giới tỉnh hiện đại; Liên bang Đông Dương thành lập theo sắc lệnh 17/10/1887.</p>`
        : ""
    }
    <div id="profile-slot"><p class="muted coming-soon">Đang tải hồ sơ bách khoa…</p></div>
    <details class="sources">
      <summary>📚 Nguồn dữ liệu bản đồ</summary>
      <ul>${NGUON_DU_LIEU.map((s) => `<li>${s}</li>`).join("")}</ul>
    </details>`;
  panel.hidden = false;

  if (!isIsland) {
    const slug = slugify(name);
    void Promise.all([loadProfile(name), loadLiterature()]).then(
      ([profile, lib]) => {
        const slot = document.getElementById("profile-slot");
        if (!slot) return;
        const poems = [...lib.poems, ...lib.hcmWorks, ...lib.aboutHcm].filter(
          (p) => p.lien_quan_tinh.includes(slug),
        );
        const anecdotes = lib.anecdotes.filter((a) =>
          a.lien_quan_tinh.includes(slug),
        );
        const related =
          poems.length || anecdotes.length
            ? `<details class="profile-section" open><summary>📖 Văn thơ & giai thoại gắn với vùng đất này</summary>
                ${poems.map(poemHtml).join("")}${anecdotes.map(anecdoteHtml).join("")}
               </details>`
            : "";
        slot.innerHTML =
          (profile
            ? profileHtml(profile)
            : `<p class="muted coming-soon">Hồ sơ bách khoa đầy đủ của tỉnh này đang được biên soạn.</p>`) +
          related;
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

let literatureCache: {
  poems: Poem[];
  hcmWorks: Poem[];
  aboutHcm: Poem[];
  anecdotes: Anecdote[];
  hcm: HcmPoem | null;
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
  const [poems, hcmWorks, aboutHcm, anecdotes, hcm] = await Promise.all([
    fetchJson<{ items: Poem[] }>("data/literature/tho-yeu-nuoc.json"),
    fetchJson<{ items: Poem[] }>("data/literature/tac-pham-ho-chi-minh.json"),
    fetchJson<{ items: Poem[] }>("data/literature/tho-ve-bac.json"),
    fetchJson<{ items: Anecdote[] }>("data/literature/giai-thoai-khoa-bang.json"),
    fetchJson<HcmPoem>("data/literature/lich-su-nuoc-ta.json"),
  ]);
  literatureCache = {
    poems: poems?.items ?? [],
    hcmWorks: hcmWorks?.items ?? [],
    aboutHcm: (aboutHcm?.items ?? []).sort(
      (a, b) => (a.xep_hang ?? 99) - (b.xep_hang ?? 99),
    ),
    anecdotes: anecdotes?.items ?? [],
    hcm,
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
