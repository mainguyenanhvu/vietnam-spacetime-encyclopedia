import maplibregl from "maplibre-gl";
import type { MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";

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

const NGUON_DU_LIEU = [
  "Ranh giới 63/34 tỉnh: Lê Quang Tuệ — github.com/lqtue/LacaProvinceMap",
  "Quần đảo Hoàng Sa & Trường Sa: Free-GIS-Data — github.com/nguyenduy1133/Free-GIS-Data",
  "Danh sách sáp nhập: Nghị quyết 202/2025/QH15 — chinhphu.vn",
  "Nền bản đồ: © OpenStreetMap contributors",
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
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
  },
  bounds: VIETNAM_BOUNDS,
  fitBoundsOptions: { padding: 24 },
});

map.addControl(new maplibregl.NavigationControl(), "top-left");
map.addControl(new maplibregl.ScaleControl(), "bottom-left");

let currentEra = ERAS.length - 1; // mặc định: 34 tỉnh hiện hành
let hoveredId: number | string | undefined;

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
        "fill-color": [
          "match",
          ["get", "loai"],
          "quan-dao",
          "#dc2626",
          "dao",
          "#ea580c",
          "#f59e0b",
        ],
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

    map.on("mousemove", `${era.id}-fill`, (e) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features?.[0];
      if (!f) return;
      if (hoveredId !== undefined)
        map.setFeatureState({ source: era.id, id: hoveredId }, { hover: false });
      hoveredId = f.id;
      map.setFeatureState({ source: era.id, id: hoveredId }, { hover: true });
    });
    map.on("mouseleave", `${era.id}-fill`, () => {
      map.getCanvas().style.cursor = "";
      if (hoveredId !== undefined)
        map.setFeatureState({ source: era.id, id: hoveredId }, { hover: false });
      hoveredId = undefined;
    });
    map.on("click", `${era.id}-fill`, (e) => {
      const f = e.features?.[0];
      if (f) showProvincePanel(f, era);
    });
  }

  setEra(currentEra);
  buildTimeline();
  buildLayerControl();
});

function setEra(index: number): void {
  currentEra = index;
  ERAS.forEach((era, i) => {
    const vis = i === index ? "visible" : "none";
    map.setLayoutProperty(`${era.id}-fill`, "visibility", vis);
    map.setLayoutProperty(`${era.id}-line`, "visibility", vis);
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
    <div class="group muted">
      Sắp ra mắt: di sản UNESCO · làng nghề · trận đánh lịch sử · lễ hội ·
      ẩm thực · trang phục dân tộc · di chỉ khảo cổ
    </div>`;
  el.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "era") setEra(Number(t.value));
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
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

  const rows: Array<[string, string]> = isIsland
    ? [
        ["Chủ quyền", "Việt Nam"],
        ["Trực thuộc (34 tỉnh)", String(p["thuoc_tinh_34"] ?? "—")],
        ["Trực thuộc (63 tỉnh)", String(p["thuoc_tinh_63"] ?? "—")],
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
    <h2>${name}</h2>
    <table class="facts">${rows
      .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
      .join("")}</table>
    <div id="profile-slot"><p class="muted coming-soon">Đang tải hồ sơ bách khoa…</p></div>
    <details class="sources">
      <summary>📚 Nguồn dữ liệu bản đồ</summary>
      <ul>${NGUON_DU_LIEU.map((s) => `<li>${s}</li>`).join("")}</ul>
    </details>`;
  panel.hidden = false;

  if (!isIsland) {
    void loadProfile(name).then((profile) => {
      const slot = document.getElementById("profile-slot");
      if (!slot) return;
      slot.innerHTML = profile
        ? profileHtml(profile)
        : `<p class="muted coming-soon">Hồ sơ bách khoa đầy đủ của tỉnh này đang được biên soạn.</p>`;
    });
  } else {
    const slot = document.getElementById("profile-slot");
    if (slot) slot.innerHTML = "";
  }
}

document.getElementById("panel-close")?.addEventListener("click", () => {
  const panel = document.getElementById("province-panel");
  if (panel) panel.hidden = true;
});
