import maplibregl from "maplibre-gl";
import type {
  ExpressionSpecification,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import { apCheDoDaLuu, initCheDo, cheDoHienTai, SU_KIEN_DOI_CHE_DO } from "./chedo";
import type { CheDo } from "./chedo";
import { gomNutTopbar } from "./topbar";
import { registerPanel, showOnly, hidePanel, hideAllPanels, datNhanPanel } from "./panels";
import { moPopup, dongPopup } from "./popup";
import { FONT_LABEL, FONT_SYMBOL, textFont } from "./map-fonts";
// Chỉ nhập hàm phân loại (không kéo Three.js) — xem ghi chú trong mohinh-diem.ts.
import { phanLoaiDiem } from "./mohinh-diem";
import type { DiemMoHinh } from "./mohinh-diem";
import { CUM_TRE_EM, LOP_TRE_EM, NHAN_TRE_EM } from "./tu-vung-tre-em";
import { initSearch } from "./search";
import { initGame } from "./game";
import { initQuiz } from "./quiz";
import { initStory } from "./story";
import { initOlympia } from "./olympia";
import { initBattle } from "./battle";
import { initJourney } from "./journey";
import { initQuocGia } from "./quocgia";
import { initTimeline } from "./timeline";
import { initMocLichSu, capNhatMoc } from "./moc-lich-su";
import { initThuVien, loadLiterature, htmlVanThoTinh } from "./thuvien";
import { esc } from "./util/html";
import { fetchJson } from "./util/fetch";
import { str, num, strs, rec, arr, itemsOf } from "./types/parse";
import {
  OVERLAYS,
  OVERLAY_GROUPS,
  parseOverlayItem,
  type OverlayConf,
} from "./overlays-config";
import { initChipBar } from "./chip-bar";
import { initLienKetTrangThai } from "./lien-ket-trang-thai";
import { initHuongDan } from "./huong-dan";
import { initTuKho } from "./tu-kho-tre-em";
// escVanKho = escKho + lớp typo: dấu « » thành chữ nghiêng thay vì hiện nguyên
// hai mũi tên trên màn hình. Xem popup-noi-dung.ts.
import { dungPopup, escVanKho } from "./popup-noi-dung";

// Đặt chế độ xem đã lưu trước mọi thứ khác, nếu không trang sẽ nháy sang chế độ
// mặc định rồi mới đổi.
apCheDoDaLuu();

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

// --- Dòng thời gian HỢP NHẤT (Xích Quỷ → nay): gom «Cương vực Việt cổ» + các mốc
// hành chính vào MỘT model thời kỳ, hiện TÊN NƯỚC theo từng thời kỳ (Iron Man #5 + #1).
//   kind "cuongvuc" = polygon phỏng dựng có sẵn (ref = feature id trong co-truong-viet-co.json)
//   kind "admin"    = ranh giới hành chính có sẵn   (ref = chỉ số trong ERAS)
//   kind "ten"      = chỉ hiện TÊN NƯỚC + năm (đường biên chính xác đang tra nguồn — Phase 2b)
interface Period {
  /** Khoá ỔN ĐỊNH nối với `ky_id` của dữ liệu đơn vị hành chính xưa.
   *  Cố ý KHÔNG dùng chỉ số mảng: thêm/bớt một thời kỳ là lệch toàn bộ dữ liệu. */
  id: string;
  ten_nuoc: string;
  nhan: string;
  kind: "cuongvuc" | "admin" | "ten";
  ref?: string | number;
}
const PERIODS: Period[] = [
  { id: "xich-quy", ten_nuoc: "Xích Quỷ", nhan: "Xích Quỷ · huyền sử (~2879 TCN)", kind: "cuongvuc", ref: "xich-quy" },
  { id: "van-lang", ten_nuoc: "Văn Lang", nhan: "Văn Lang · Hùng Vương (~700–258 TCN)", kind: "ten" },
  { id: "au-lac", ten_nuoc: "Âu Lạc", nhan: "Âu Lạc · An Dương Vương (257–179 TCN)", kind: "cuongvuc", ref: "au-lac" },
  { id: "nam-viet", ten_nuoc: "Nam Việt", nhan: "Nam Việt · nhà Triệu (204–111 TCN)", kind: "ten" },
  { id: "bac-thuoc", ten_nuoc: "Giao Chỉ – Giao Châu", nhan: "Bắc thuộc I–II · Giao Chỉ (111 TCN–544)", kind: "ten" },
  { id: "van-xuan", ten_nuoc: "Vạn Xuân", nhan: "Vạn Xuân · Lý Nam Đế (544–602)", kind: "ten" },
  { id: "tinh-hai-quan", ten_nuoc: "Tĩnh Hải quân", nhan: "Bắc thuộc III → Tự chủ (602–938)", kind: "ten" },
  { id: "dai-co-viet", ten_nuoc: "Đại Cồ Việt", nhan: "Đại Cồ Việt · Đinh–Tiền Lê–Lý (968–1054)", kind: "ten" },
  { id: "dai-viet-1490", ten_nuoc: "Đại Việt", nhan: "Đại Việt · Lê sơ — cương vực ~1490 (Hồng Đức)", kind: "ten" },
  { id: "dai-nam-1838", ten_nuoc: "Đại Nam", nhan: "Đại Nam · nhà Nguyễn — cương vực ~1838", kind: "ten" },
  { id: "phap-thuoc", ten_nuoc: "Việt Nam thời Pháp thuộc", nhan: "Pháp thuộc · Bắc–Trung–Nam Kỳ (1887–1945)", kind: "admin", ref: 0 },
  { id: "vn-63", ten_nuoc: "CHXHCN Việt Nam", nhan: "Việt Nam · 63 tỉnh (1976–30/6/2025)", kind: "admin", ref: 1 },
  { id: "vn-34", ten_nuoc: "CHXHCN Việt Nam", nhan: "Việt Nam · 34 tỉnh (từ 1/7/2025)", kind: "admin", ref: 2 },
];

// Năm mở đầu ĐOẠN RÃNH của từng thời kỳ, dùng để đặt mốc lịch sử vào đúng chỗ
// trên thanh trượt (xem moc-lich-su.ts).
//
// 🔴 Đây KHÔNG phải niên đại của từng nhà nước — niên đại thật nằm ở
// PERIODS[i].nhan. Niên đại thật có chỗ chồng lấn (Âu Lạc mất năm 179 TCN
// nhưng Nam Việt lập từ 204 TCN) và có chỗ đứt quãng (938→968, 1490→1802,
// 1945→1976). Thanh trượt thì không được có khoảng trống, nếu không mốc năm
// 1288 hay 1789 sẽ rơi vào chỗ không thuộc thời kỳ nào và không đặt được.
// Vì vậy bảng này lấy RANH GIỚI CHUYỂN TIẾP làm mốc chia đoạn, phủ liền mạch
// 4000 năm. Sửa PERIODS thì phải sửa bảng này cho khớp số phần tử.
const NAM_MOC_KY: number[] = [
  -2879, -700, -257, -204, -111, 544, 602, 968, 1054, 1802, 1887, 1945, 2025,
];
const NAM_KET_MOC = 2026;

// Khai TRƯỚC setPeriod: setPeriod được gọi từ vài chỗ chạy sớm trong lúc bản
// đồ nạp, để `let` xuống dưới là dính vùng chết (TDZ).
/** Người dùng đã tự đổi thời kỳ chưa — quyết định note mốc có bung ra không. */
let daDoiThoiKy = false;

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
//
// ⚠️ PHẢI CO THEO ZOOM. Bản đầu ghim cứng 25–40 km ở MỌI mức phóng, và ở mức
// nhìn cả nước thì trông đúng — nhưng độ cao tính bằng MÉT còn màn hình tính
// bằng PIXEL, mà số mét trên mỗi pixel giảm một nửa sau mỗi nấc zoom. Ở zoom
// 12 (~37 m/px) khối 40 km cao 1.090px trên khung 700px: máy ảnh chui vào
// trong tường, cả màn hình thành một mảng nâu đặc, không thấy landmark, không
// thấy điểm di tích, không thấy gì. Đó chính là "bản đồ 3D bị lỗi".
//
// Mốc dưới đây giữ chiều cao BIỂU KIẾN gần như cố định (~10–15px): mỗi 2 nấc
// zoom thì chia 4, đúng nhịp mét-trên-pixel. Biểu thức ["zoom"] BẮT BUỘC nằm
// ngoài cùng, nên phải lặp lại nhánh case/match ở từng mốc thay vì nhân hệ số.
const khoi = (heSo: number): ExpressionSpecification => [
  "case",
  ["boolean", ["feature-state", "hover"], false],
  [
    "match",
    ["get", "loai"],
    "quan-dao",
    45000 * heSo,
    "dao",
    45000 * heSo,
    75000 * heSo,
  ],
  [
    "match",
    ["get", "loai"],
    "quan-dao",
    25000 * heSo,
    "dao",
    25000 * heSo,
    40000 * heSo,
  ],
];

const HEIGHT_3D: ExpressionSpecification = [
  "interpolate",
  ["linear"],
  ["zoom"],
  4,
  khoi(1),
  6,
  khoi(0.25),
  8,
  khoi(0.0625),
  10,
  khoi(0.0156),
  13,
  khoi(0.002),
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
    // Glyph TỰ HOST. Trước đây trỏ demotiles.maplibre.org — máy chủ DEMO của
    // MapLibre, không cam kết dịch vụ. Nó chết là mất MỌI nhãn tự render, kể cả
    // nhãn chủ quyền «Quần đảo Hoàng Sa (Việt Nam)»: rủi ro chủ quyền, không
    // chỉ rủi ro kỹ thuật. Cũng bỏ được một request bên thứ ba mỗi lượt xem.
    //
    // public/fonts/ giữ 9 dải Unicode mà nhãn bản đồ thật sự dùng (879 KB), quét
    // từ `ten` của mọi mục overlay + tên tỉnh trong geojson + "▲". KHÔNG gồm chữ
    // Hán của thư viện văn học — chúng render bằng HTML, không qua glyph.
    // ⚠️ Thêm nhãn có ký tự ngoài 9 dải này sẽ 404, và một range 404 làm hỏng
    // TOÀN BỘ tile của source đó (xem bug lớp sông núi). Smoke S1 gác chỗ này:
    // nó đỏ nếu có bất kỳ request /font/ nào trả ≥400.
    glyphs: `${import.meta.env.BASE_URL}fonts/{fontstack}/{range}.pbf`,
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
  // Ghi công thu gọn: mặc định MapLibre trải nguyên câu «© OpenStreetMap
  // contributors © CARTO» dọc mép dưới, luôn nằm đó suốt phiên. Dạng compact
  // rút về một nút ⓘ, bấm ra vẫn đủ chữ — đây là dạng ODbL/CARTO chấp nhận,
  // KHÔNG được bỏ hẳn ghi công.
  attributionControl: { compact: true },
});

// Nút zoom/la bàn ở góc PHẢI-DƯỚI — góc duy nhất không panel nào chiếm.
// Trái-trên: #layer-control luôn mở, rộng 280px, top = topbar-h + 12px, trong khi
// ctrl MapLibre neo ở map-top + 10px ⇒ lệch 2px, panel đè kín nút.
// Phải-trên: #province-panel. Trái-dưới: ScaleControl. Phải-dưới chỉ có attribution,
// mà MapLibre xếp chồng dọc trong cùng một góc nên không che nhau.
map.addControl(new maplibregl.NavigationControl(), "bottom-right");
// Thước tỉ lệ chuyển từ trái-dưới sang phải-dưới (2026-08-04). Bảng lớp bản đồ
// cao gần hết cột trái nên thước nằm lọt phía sau nó, đo được trên ảnh chụp:
// chỉ thò ra vài pixel mép dưới. Phải-dưới MapLibre xếp chồng dọc nên thước
// nằm ngay dưới cụm zoom, không đè lên gì.
map.addControl(new maplibregl.ScaleControl(), "bottom-right");

// Chỉ ở chế độ dev: mở `map` ra ngoài để smoke test (scripts/smoke.mjs) đọc được
// map.getStyle()/queryRenderedFeatures qua CDP — tức kiểm được lớp có VẼ RA THẬT
// không, thay vì chỉ kiểm code biên dịch được. Vite loại bỏ nhánh này khi build.
if (import.meta.env.DEV) (window as unknown as { __map: maplibregl.Map }).__map = map;

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

let currentEra = ERAS.length - 1; // era hành chính đang hiện (hoặc -1 = ẩn hết)
let currentPeriod = PERIODS.length - 1; // thời kỳ đang chọn trong dòng thời gian (mặc định: 34 tỉnh)
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
    // to-color BẮT BUỘC: nếu không, style-spec suy kiểu literal thành array<string>
    // và từ chối cả biểu thức fill-color (màu tỉnh «tất cả 1 màu»).
    ["to-color", ["at", ["%", ["id"], pal.length], ["literal", pal]]],
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
  for (const id of ["song-lines", "song-labels", "nui-markers", "nui-labels"]) {
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
      // Đường sông (LineString) — vẽ nét xanh, dày dần theo zoom để «thấy» dòng chảy.
      map.addLayer(
        {
          id: "song-lines",
          type: "line",
          source: "song-nui",
          filter: ["==", ["get", "loai"], "song"],
          layout: { visibility: "none", "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#2563eb",
            "line-opacity": 0.85,
            "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1, 7, 2.4, 10, 4],
          },
        } as never,
        before,
      );
      map.addLayer(
        {
          id: "song-labels",
          type: "symbol",
          source: "song-nui",
          filter: ["==", ["get", "loai"], "song"],
          // Đặt nhãn theo ĐIỂM, không theo "line": các LineString sông ở đây là
          // waypoint sơ đồ hoá (ít đỉnh, gấp khúc mạnh) và bị cắt theo ô tile, nên
          // ở zoom toàn quốc (mặc định ~4.6) MapLibre không tìm đủ đoạn thẳng để
          // đặt chữ — đo được 0/38 nhãn, kể cả khi nới symbol-spacing 80 và
          // text-max-angle 90. Point placement đặt nhãn ở giữa sông và luôn hiện.
          layout: {
            ...textFont(FONT_LABEL),
            visibility: "none",
            "text-field": ["get", "ten"],
            "text-size": size,
            "text-max-width": 8,
          },
          paint: { "text-color": "#1d4ed8", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
        } as never,
        before,
      );
      // Điểm núi (▲) LUÔN hiện — allow-overlap để mọi đỉnh đều thấy dù zoom xa.
      // Fontstack BẮT BUỘC là FONT_SYMBOL: trong hai stack tự host chỉ Noto Sans
      // Regular có ▲ (U+25B2). Chọn sai stack → glyph range 404 → MapLibre gom
      // mọi fontstack của CÙNG một source vào một lượt getGlyphs, một 404 làm
      // Promise.all trong worker_tile vỡ ⇒ TOÀN BỘ tile của source "song-nui"
      // hỏng, mất luôn cả đường sông (line) lẫn nhãn. Xem `map-fonts.ts`.
      map.addLayer(
        {
          id: "nui-markers",
          type: "symbol",
          source: "song-nui",
          filter: ["==", ["get", "loai"], "nui"],
          layout: {
            ...textFont(FONT_SYMBOL),
            visibility: "none",
            "text-field": "▲",
            "text-size": ["interpolate", ["linear"], ["zoom"], 4, 11, 8, 16, 12, 20],
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: { "text-color": "#7c2d12", "text-halo-color": "#ffffff", "text-halo-width": 1.4 },
        } as never,
        before,
      );
      // Nhãn tên núi — đặt dưới ▲, va chạm thì ẩn tên (giữ marker).
      map.addLayer(
        {
          id: "nui-labels",
          type: "symbol",
          source: "song-nui",
          filter: ["==", ["get", "loai"], "nui"],
          layout: {
            ...textFont(FONT_LABEL),
            visibility: "none",
            "text-field": ["get", "ten"],
            "text-size": size,
            "text-max-width": 8,
            "text-offset": [0, 0.9],
            "text-anchor": "top",
            "text-optional": true,
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

// --- Cương vực Việt cổ. Văn Lang / Âu Lạc / Vạn Xuân = POLYGON phỏng dựng học thuật
// (phạm vi Đông Sơn + «15 bộ», Bắc Bộ → Đèo Ngang) — nét ĐỨT + tô mờ, nhấn «phỏng
// dựng có nguồn, không phải chủ quyền». Xích Quỷ = huyền sử → ĐIỂM (layer circle) nơi
// thờ Kinh Dương Vương, không có lãnh thổ. Dữ liệu: co-truong-viet-co.json. ---
function initCuongVuc(): void {
  const url = `${import.meta.env.BASE_URL}data/geo/co-truong-viet-co.json`;
  void fetch(url)
    .then((r) => (r.ok ? (r.json() as Promise<GeoJSON.FeatureCollection>) : null))
    .then((geo) => {
      if (!geo || map.getSource("cuong-vuc")) return;
      map.addSource("cuong-vuc", { type: "geojson", data: geo });
      const color = [
        "match",
        ["get", "id"],
        "xich-quy", "#9333ea",
        "van-lang", "#dc2626",
        "au-lac", "#ea580c",
        "au-lac-co-loa", "#eab308",
        "van-xuan", "#0d9488",
        "dai-viet-1490", "#16a34a",
        "dai-nam-1838", "#2563eb",
        "#dc2626",
      ] as unknown as ExpressionSpecification;
      const before = map.getLayer("chu-quyen-labels") ? "chu-quyen-labels" : undefined;
      map.addLayer(
        {
          id: "cuong-vuc-fill",
          type: "fill",
          source: "cuong-vuc",
          filter: ["==", ["get", "id"], "__none__"],
          layout: { visibility: "none" },
          paint: { "fill-color": color, "fill-opacity": 0.16 },
        } as never,
        before,
      );
      map.addLayer(
        {
          id: "cuong-vuc-line",
          type: "line",
          source: "cuong-vuc",
          filter: ["==", ["get", "id"], "__none__"],
          layout: { visibility: "none", "line-join": "round" },
          paint: { "line-color": color, "line-width": 2, "line-dasharray": [3, 2], "line-opacity": 0.9 },
        } as never,
        before,
      );
      // Điểm huyền sử (Xích Quỷ): feature dạng Point — fill/line không vẽ được nên
      // dùng layer circle riêng, cùng cơ chế lọc theo thời kỳ như polygon.
      map.addLayer(
        {
          id: "cuong-vuc-diem",
          type: "circle",
          source: "cuong-vuc",
          filter: ["==", ["get", "id"], "__none__"],
          layout: { visibility: "none" },
          paint: {
            "circle-radius": 7,
            "circle-color": color,
            "circle-opacity": 0.85,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        } as never,
        before,
      );
      map.on("click", "cuong-vuc-fill", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as Record<string, string>;
        let nguon = p.nguon ?? "";
        try {
          const arr = JSON.parse(p.nguon);
          if (Array.isArray(arr)) nguon = arr.join(" · ");
        } catch {
          /* giữ nguyên chuỗi */
        }
        moPopup(
          map,
          e.lngLat,
          `<strong>${esc(p.ten)}</strong><br/><span style="color:#78716c">${esc(p.nien_dai)}</span><br/>🏛️ Kinh đô: ${esc(p.kinh_do)}<br/><span style="color:#57534e;font-size:0.8rem">${esc(p.ghi_chu)}</span><br/><span style="color:#b45309;font-size:0.72rem">⚠️ Phỏng dựng học thuật có nguồn — KHÔNG phải bản đồ chủ quyền</span><br/><span style="color:#78716c;font-size:0.72rem">Nguồn: ${esc(nguon)}</span>`,
        );
      });
      // Popup cho điểm huyền sử (Xích Quỷ) — nhấn rõ KHÔNG phải sử thật.
      map.on("click", "cuong-vuc-diem", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as Record<string, string>;
        let nguon = p.nguon ?? "";
        try {
          const arr = JSON.parse(p.nguon);
          if (Array.isArray(arr)) nguon = arr.join(" · ");
        } catch {
          /* giữ nguyên chuỗi */
        }
        moPopup(
          map,
          e.lngLat,
          `<strong>${esc(p.ten)}</strong><br/><span style="color:#78716c">${esc(p.nien_dai)}</span><br/>🏛️ ${esc(p.kinh_do)}<br/><span style="color:#57534e;font-size:0.8rem">${esc(p.ghi_chu)}</span><br/><span style="color:#b45309;font-size:0.72rem">⚠️ Huyền sử / biểu tượng — KHÔNG phải sử thật, KHÔNG phải bản đồ chủ quyền</span><br/><span style="color:#78716c;font-size:0.72rem">Nguồn: ${esc(nguon)}</span>`,
        );
      });
      for (const lyr of ["cuong-vuc-fill", "cuong-vuc-diem"]) {
        map.on("mouseenter", lyr, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", lyr, () => {
          map.getCanvas().style.cursor = "";
        });
      }
    })
    .catch(() => {});
}
function applyCuongVuc(eraId: string): void {
  const on = eraId !== "off";
  const v = on ? "visible" : "none";
  // Âu Lạc hiện kèm lõi khảo cổ Cổ Loa (feature phụ chồng lên polygon lãnh thổ).
  const ids = eraId === "au-lac" ? ["au-lac", "au-lac-co-loa"] : [eraId];
  // Xích Quỷ là feature dạng Point (huyền sử) → dùng layer circle; các nước còn
  // lại là polygon. Lọc riêng để không vẽ nhầm chấm lên đỉnh polygon.
  const isPoint = eraId === "xich-quy";
  const polyFilt = ["in", ["get", "id"], ["literal", on && !isPoint ? ids : []]];
  const pointFilt = ["in", ["get", "id"], ["literal", on && isPoint ? ids : []]];
  for (const id of ["cuong-vuc-fill", "cuong-vuc-line"]) {
    if (map.getLayer(id)) {
      map.setFilter(id, polyFilt as never);
      map.setLayoutProperty(id, "visibility", v);
    }
  }
  if (map.getLayer("cuong-vuc-diem")) {
    map.setFilter("cuong-vuc-diem", pointFilt as never);
    map.setLayoutProperty("cuong-vuc-diem", "visibility", v);
  }
}

// --- Đơn vị hành chính qua các thời kỳ (quận · châu · phủ · thừa tuyên · tỉnh)
//
// ĐIỂM chứ không phải VÙNG, và đó là quyết định SỬ LIỆU chứ không phải giới hạn
// kỹ thuật: chính sử và địa chí ghi rõ TÊN đơn vị, LỴ SỞ và vùng tương ứng ngày
// nay, nhưng KHÔNG ghi đường biên. Vẽ vùng là bịa ra một độ chính xác không tồn
// tại — đúng cái kết luận đã rút ra cho đường biên 1887 trong
// docs/ranh-gioi-1887-1895-phan-quyet.md, nay áp cho mọi thời kỳ trước đó.
//
// Lớp này thay chỗ các polygon cương vực phỏng dựng đã gỡ bỏ.
interface DonViXua {
  id: string;
  ten: string;
  cap: string;
  ky_id: string;
  thoi_ky: string;
  ly_so: string;
  lat: number;
  lon: number;
  nay_la: string;
  ghi_chu: string;
  do_tin_cay: string;
  nguon: string[];
  /** Tỉnh NGÀY NAY mà đơn vị này phủ lên — rỗng nghĩa là chưa tra được nguồn. */
  tinh_nay: string[];
  khop: string;
  nguon_anh_xa: string[];
}

const parseDonViXua = (raw: unknown): DonViXua => {
  const r = rec(raw);
  return {
    id: str(r.id),
    ten: str(r.ten),
    cap: str(r.cap),
    ky_id: str(r.ky_id),
    thoi_ky: str(r.thoi_ky),
    ly_so: str(r.ly_so),
    lat: num(r.lat) ?? 0,
    lon: num(r.lon) ?? 0,
    nay_la: str(r.nay_la),
    ghi_chu: str(r.ghi_chu),
    do_tin_cay: str(r.do_tin_cay),
    nguon: strs(r.nguon),
    tinh_nay: strs(goSerialize(r.tinh_nay)),
    khop: str(r.khop),
    nguon_anh_xa: strs(goSerialize(r.nguon_anh_xa)),
  };
};

/**
 * Gỡ một vòng serialize của MapLibre.
 *
 * Mảng lồng trong `properties` bị chuỗi hoá thành JSON khi trả về từ sự kiện
 * click, nên cùng một trường đi qua parse ở hai trạng thái khác nhau. Không gỡ
 * thì `strs()` trả mảng rỗng, popup mất phần phạm vi — KHÔNG lỗi console,
 * `tsc` vẫn xanh. Đã dính đúng bẫy này một lần với `ban_do_ghi`.
 */
function goSerialize(v: unknown): unknown {
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}

/** Chữ giải thích mức khớp — hiện thẳng cho người đọc, không giấu trong mã. */
const NHAN_KHOP: Record<string, string> = {
  "gan-dung": "nguồn nói thẳng vùng tương ứng, sai số ở mức huyện",
  "mot-phan": "nguồn chỉ chép MỘT PHẦN tỉnh đó thuộc đơn vị này",
  "toi-thieu": "mới chắc được phần lõi; nguồn khác còn kể thêm đất chưa đối chiếu xong",
};

/** Màu theo CẤP đơn vị — nhìn màu là biết đang xem quận, thừa tuyên hay tỉnh. */
const MAU_CAP_DON_VI: ExpressionSpecification = [
  "match",
  ["get", "cap"],
  "kinh đô",
  "#b45309",
  "nơi thờ",
  "#a16207",
  "quận",
  "#7c3aed",
  "phủ",
  "#0f766e",
  "thừa tuyên",
  "#b02020",
  "tỉnh",
  "#1d4ed8",
  "mốc cương vực",
  "#57534e",
  "#78716c",
];

/** Bộ lọc rỗng: không thời kỳ nào mang ky_id này, dùng làm trạng thái «tắt». */
const LOC_TAT_DON_VI = ["==", ["get", "ky_id"], "__khong-thoi-ky-nao__"];

let donViXuaDangNap: Promise<void> | null = null;

const donViXuaPopup = (o: DonViXua): string =>
  dungPopup({
    ten: o.ten,
    meta: [o.cap, o.thoi_ky],
    hang: [
      { icon: "🏛️", nhan: "Lỵ sở", gia_tri: o.ly_so },
      { icon: "📍", nhan: "Nay là", gia_tri: o.nay_la },
      { icon: "🗺️", nhan: "Phủ lên", gia_tri: o.tinh_nay.join(" · ") },
    ],
    than: escVanKho(o.ghi_chu),
    canh_bao:
      o.do_tin_cay !== "cao"
        ? `⚠️ Vị trí độ tin cậy ${o.do_tin_cay} — lý do nêu trong ghi chú`
        : "",
    nguon: o.nguon.join(" · "),
  });

/**
 * Popup khi bấm vào VÙNG tô.
 *
 * Câu đầu tiên phải nói rõ đang nhìn thấy cái gì. Người đọc thấy một mảng màu
 * ôm trọn hình tỉnh thì phản xạ tự nhiên là hiểu «đường biên xưa nó thế» —
 * mà đó đúng là điều dự án KHÔNG khẳng định.
 */
const vungXuaPopup = (
  o: { don_vi_ten: string; cap: string; tinh_63: string; khop: string },
  dv: DonViXua | undefined,
): string =>
  dungPopup({
    ten: o.don_vi_ten,
    meta: [o.cap, dv?.thoi_ky ?? ""],
    hang: [
      { icon: "🗺️", nhan: "Vùng này", gia_tri: `Đất tỉnh ${o.tinh_63} ngày nay` },
      { icon: "🏛️", nhan: "Lỵ sở", gia_tri: dv?.ly_so ?? "" },
    ],
    than: escVanKho(dv?.ghi_chu ?? ""),
    canh_bao:
      "🔴 Đường viền bạn thấy là ranh giới tỉnh NGÀY NAY, không phải đường biên xưa. " +
      "Chính sử chép tên đơn vị và lỵ sở, KHÔNG chép đường biên — dự án tô lên tỉnh nay " +
      "để thấy phạm vi mà không bịa ra một mét ranh giới nào." +
      (NHAN_KHOP[o.khop] ? ` Mức khớp «${o.khop}»: ${NHAN_KHOP[o.khop]}.` : ""),
    nguon: (dv?.nguon_anh_xa ?? []).join(" · "),
  });

function ensureDonViXua(): Promise<void> {
  if (donViXuaDangNap) return donViXuaDangNap;
  donViXuaDangNap = (async () => {
    const data = await fetchJson(
      "data/geo/don-vi-hanh-chinh-xua.json",
      itemsOf(parseDonViXua),
    );
    if (!data) {
      // Nạp hỏng thì cho phép thử lại ở lần đổi thời kỳ sau.
      donViXuaDangNap = null;
      return;
    }
    // 🔴 beforeId BẮT BUỘC. Lớp thêm sau chèn LÊN TRÊN và phủ mất nhãn Hoàng Sa
    //    / Trường Sa — không lỗi console, không cổng dữ liệu nào bắt được, chỉ
    //    `npm run verify:chuquyen` mới thấy. Xem bẫy landmarks3d.ts trong PLAN.
    const duoiNhanChuQuyen = map.getLayer("chu-quyen-labels")
      ? "chu-quyen-labels"
      : undefined;

    // Lớp VÙNG dựng TRƯỚC lớp điểm để điểm nằm đè lên và vẫn bấm được.
    // Nạp hỏng thì bỏ qua vùng, KHÔNG kéo theo cả lớp điểm — lớp điểm mới là
    // phần có nguồn cho cả 54 đơn vị, vùng chỉ có cho những đơn vị đã tra
    // được nguồn ánh xạ (một tập con, xem ghi_chu_anh_xa trong file dữ liệu).
    const vung = await fetch(`${import.meta.env.BASE_URL}data/geo/vung-don-vi-xua.geojson`)
      .then((r) => (r.ok ? (r.json() as Promise<GeoJSON.FeatureCollection>) : null))
      .catch(() => null);
    if (vung) {
      map.addSource("vung-don-vi-xua", { type: "geojson", data: vung });
      map.addLayer(
        {
          id: "vung-don-vi-xua-nen",
          type: "fill",
          source: "vung-don-vi-xua",
          filter: LOC_TAT_DON_VI as never,
          paint: { "fill-color": MAU_CAP_DON_VI, "fill-opacity": 0.22 },
        },
        duoiNhanChuQuyen,
      );
      map.addLayer(
        {
          id: "vung-don-vi-xua-vien",
          type: "line",
          source: "vung-don-vi-xua",
          filter: LOC_TAT_DON_VI as never,
          paint: {
            "line-color": MAU_CAP_DON_VI,
            "line-width": 1.4,
            // Nét ĐỨT là lời cảnh báo bằng hình: đường liền đọc như một ranh
            // giới đã được khẳng định, mà đây là ranh giới của hôm nay đứng
            // thay cho một phạm vi chỉ chép bằng chữ.
            "line-dasharray": [3, 2],
          },
        },
        duoiNhanChuQuyen,
      );
      map.on("click", "vung-don-vi-xua-nen", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = rec(f.properties);
        const dv = data.items.find((x) => x.id === str(p.don_vi_id));
        moPopup(
          map,
          e.lngLat,
          vungXuaPopup(
            {
              don_vi_ten: str(p.don_vi_ten),
              cap: str(p.cap),
              tinh_63: str(p.tinh_63),
              khop: str(p.khop),
            },
            dv,
          ),
        );
      });
    }

    map.addSource("don-vi-xua", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: data.items.map((it) => ({
          type: "Feature" as const,
          properties: { ...it },
          geometry: {
            type: "Point" as const,
            coordinates: tachDiemTrung(it.lon, it.lat),
          },
        })),
      },
    });
    map.addLayer(
      {
        id: "don-vi-xua-diem",
        type: "circle",
        source: "don-vi-xua",
        filter: LOC_TAT_DON_VI as never,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 6, 8, 9] as ExpressionSpecification,
          "circle-color": MAU_CAP_DON_VI,
          "circle-opacity": 0.9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      },
      duoiNhanChuQuyen,
    );
    map.addLayer(
      {
        id: "don-vi-xua-nhan",
        type: "symbol",
        source: "don-vi-xua",
        filter: LOC_TAT_DON_VI as never,
        layout: {
          ...textFont(FONT_LABEL),
          "text-field": ["get", "ten"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 8, 13],
          "text-offset": [0, 1.1],
          "text-anchor": "top",
          "text-max-width": 9,
          "text-optional": true,
        },
        paint: {
          "text-color": "#292524",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.6,
        },
      },
      duoiNhanChuQuyen,
    );
    map.on("click", "don-vi-xua-diem", (e) => {
      const f = e.features?.[0];
      if (!f) return;
      moPopup(map, e.lngLat, donViXuaPopup(parseDonViXua(f.properties)));
    });
    // Áp lại thời kỳ mà setPeriod() đã chọn từ trước khi lớp kịp tồn tại.
    if (kyDonViXua) apDonViXua(kyDonViXua);
  })();
  return donViXuaDangNap;
}

/**
 * Thời kỳ đang chọn. NHỚ LẠI chứ không chỉ áp ngay, vì `setPeriod()` chạy từ
 * lúc khởi tạo — TRƯỚC `map.on("load")`, khi lớp còn chưa tồn tại. Bản trước
 * tôi cho `ensureDonViXua()` tự chờ `map.once("load")`; cách đó có ĐUA TRANH:
 * style nạp xong đúng giữa lúc kiểm `isStyleLoaded()` và lúc đăng ký listener
 * thì `load` đã bắn rồi, promise treo vĩnh viễn và lớp không bao giờ hiện —
 * console vẫn sạch. Nhớ trạng thái rồi áp lại trong `load` thì không đua.
 */
let kyDonViXua = "";

/** Hiện đúng những đơn vị hành chính thuộc thời kỳ `kyId`. */
function apDonViXua(kyId: string): void {
  kyDonViXua = kyId;
  const loc = ["==", ["get", "ky_id"], kyId];
  for (const id of [
    "vung-don-vi-xua-nen",
    "vung-don-vi-xua-vien",
    "don-vi-xua-diem",
    "don-vi-xua-nhan",
  ])
    if (map.getLayer(id)) map.setFilter(id, loc as never);
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

/** `buoc` giữ kiểu SỐ: nó là khoá sắp xếp và khoá của slug2step, không hiển thị. */
const parseNamTienMoc = (raw: unknown): NamTienMoc => {
  const r = rec(raw);
  return {
    buoc: num(r.buoc) ?? 0,
    nam: str(r.nam),
    ten: str(r.ten),
    mo_ta: str(r.mo_ta),
    tinh_moi: strs(r.tinh_moi),
    nguon: strs(r.nguon),
  };
};
let namTienMoc: NamTienMoc[] = [];
let namTienStep = -1;
let namTienGeoReady = false;
let namTienTimer: number | null = null;
const namTienMax = (): number => namTienMoc.length - 1;

function initNamTien(): void {
  void fetchJson("data/journey/nam-tien.json", (raw) => ({
    moc: arr(rec(raw).moc, parseNamTienMoc),
  })).then((data) => {
    if (!data?.moc?.length) return;
    namTienMoc = data.moc.slice().sort((a, b) => a.buoc - b.buoc);
    buildNamTienUI();
  });
}

/**
 * Nạp LƯỜI polygon 34 tỉnh (1,16 MB) cho lớp Nam tiến — chỉ chạy ở lần đầu
 * người dùng mở panel. Trước đây fetch vô điều kiện ngay lúc bản đồ load, tức
 * MỌI người dùng đều tải 1,16 MB cho một tính năng nằm sau nút bấm, và đó là
 * bản sao thứ hai của cùng file mà lớp era đã nạp.
 */
function ensureNamTienGeo(): void {
  if (namTienGeoReady || !namTienMoc.length || map.getSource("nam-tien")) return;
  namTienGeoReady = true;
  {
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
              // Giảm mạnh opacity (0.72 → 0.4) để KHÔNG đè kín bản đồ nền; vùng đã
              // mở cõi vẫn nhận ra qua sắc độ Bắc→Nam nhưng thấy xuyên địa hình.
              "fill-opacity": 0.4,
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
            paint: { "line-color": "#7c2d12", "line-width": 0.8, "line-opacity": 0.7 },
          } as never,
          beforeId,
        );
        // «Mặt trận» — viền sáng nổi bật CHỈ các tỉnh mở ở bước hiện tại, để mắt
        // dõi theo hướng Nam tiến mà không cần tô đậm toàn bộ.
        map.addLayer(
          {
            id: "nam-tien-front",
            type: "line",
            source: "nam-tien",
            layout: { visibility: "none", "line-cap": "round", "line-join": "round" },
            filter: ["==", ["get", "nt_step"], -1],
            paint: { "line-color": "#fbbf24", "line-width": 3, "line-blur": 0.6 },
          } as never,
          beforeId,
        );
        // Source về SAU khi panel đã mở → phải áp lại bước hiện tại, nếu không
        // người dùng mở panel ra mà bản đồ không đổi gì.
        setNamTienStep(Math.max(0, namTienStep));
      });
  }
}

function setNamTienStep(step: number): void {
  namTienStep = Math.max(0, Math.min(step, namTienMax()));
  const f = ["<=", ["get", "nt_step"], namTienStep];
  for (const id of ["nam-tien-fill", "nam-tien-line"])
    if (map.getLayer(id)) map.setFilter(id, f as never);
  // Viền «mặt trận» chỉ khoanh các tỉnh mở đúng ở bước hiện tại.
  if (map.getLayer("nam-tien-front"))
    map.setFilter("nam-tien-front", ["==", ["get", "nt_step"], namTienStep] as never);
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
  if (on) ensureNamTienGeo();
  const v = on ? "visible" : "none";
  for (const id of ["nam-tien-fill", "nam-tien-line", "nam-tien-front"])
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", v);
  // Ẩn panel lớp bản đồ khi Nam tiến mở (cả hai đều neo trái, tránh chồng nhau).
  const lc = document.getElementById("layer-control");
  if (lc) lc.style.display = on ? "none" : "";
  if (on) {
    if (namTienStep < 0) namTienStep = 0;
    // Chừa lề trái để bản đồ Việt Nam nằm gọn bên phải panel Nam tiến.
    map.fitBounds(VIETNAM_BOUNDS, {
      padding: { top: 40, right: 40, bottom: 40, left: 360 },
      duration: 600,
    });
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
  // Nam tiến trước đây chỉ bật/tắt chính nó, không ẩn panel nào khác — mở nó
  // khi đang mở Dòng thời gian là hai panel chồng nhau (smoke S3a bắt được).
  registerPanel("namtien-panel", () => {
    activateNamTien(false);
    btn.classList.remove("active");
  });
  btn.addEventListener("click", () => {
    const opening = panel.hidden;
    if (opening) showOnly("namtien-panel");
    else hidePanel("namtien-panel");
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
    <p>${escVanKho(m.mo_ta)}</p>
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


// ---------------------------------------------------------------------------
// Nạp LƯỜI ranh giới một era. Trước đây map.on("load") addSource cho cả 3 era
// vô điều kiện — 4,70 MB GeoJSON tải ngay lúc mở trang khi chỉ cần 1,17 MB.
//
// 🔴 beforeId là chuyện chủ quyền, không phải thứ tự vẽ cho đẹp: lớp era phải
// nằm DƯỚI "chu-quyen-labels". Bản cũ tạo mọi era TRƯỚC nhãn chủ quyền nên
// đúng thứ tự một cách tình cờ. Nạp lười thì era sinh ra SAU, và nếu thêm
// không có beforeId thì MapLibre chèn lên trên cùng — nhãn Hoàng Sa và Trường
// Sa bị lớp tỉnh phủ mất.
// ---------------------------------------------------------------------------
const eraDaNap = new Set<string>();

function ensureEra(era: Era): void {
  if (eraDaNap.has(era.id)) return;
  eraDaNap.add(era.id);

  map.addSource(era.id, {
    type: "geojson",
    data: `${import.meta.env.BASE_URL}${era.file}`,
    generateId: true,
  });

  const duoiNhanChuQuyen = map.getLayer("chu-quyen-labels") ? "chu-quyen-labels" : undefined;
  const themLop = (spec: maplibregl.LayerSpecification): void => {
    map.addLayer(spec, duoiNhanChuQuyen);
  };

  themLop({
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
  themLop({
    id: `${era.id}-line`,
    type: "line",
    source: era.id,
    layout: { visibility: "none" },
    paint: { "line-color": "#92400e", "line-width": 1 },
  });
  themLop({
    id: `${era.id}-3d`,
    type: "fill-extrusion",
    source: era.id,
    layout: { visibility: "none" },
    paint: {
      "fill-extrusion-color": eraColorExpr(era),
      "fill-extrusion-height": HEIGHT_3D,
      "fill-extrusion-base": 0,
      // Đặc ở tầm cả nước (cảnh diorama, không có nền bản đồ nên không che gì),
      // trong dần khi phóng sâu. Trước đây cố định 0,85 và lớp khối bị TẮT HẲN
      // từ zoom 7,5 — bật 3D rồi phóng vào thì bản đồ lặng lẽ thành 2D. Nguyên
      // do có thật: mặt trên của khối là tấm phẳng đục kín cả tỉnh, che hết
      // đường sá bên dưới. Nhưng cách chữa đúng là cho nhìn xuyên qua, không
      // phải bỏ hẳn 3D.
      "fill-extrusion-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        6,
        0.85,
        7.5,
        0.7,
        9,
        0.4,
        11,
        0.28,
      ] as ExpressionSpecification,
    },
  });
  // Nhãn tên tỉnh — TỰ RENDER từ GeoJSON của dự án (không mở nhãn basemap để
  // giữ chủ quyền). Ẩn mặc định, bật qua điều khiển bản đồ. Đặt DƯỚI nhãn
  // chủ quyền (thêm trước lớp chu-quyen-labels bên dưới).
  themLop({
    id: `${era.id}-label`,
    type: "symbol",
    source: era.id,
    layout: {
      ...textFont(FONT_LABEL),
      visibility: "none",
      "text-field": ["coalesce", ["get", era.nameKey], ["get", "ten"]],
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

map.on("load", () => {
  // Đăng ký icon emoji cho các lớp phủ ngay khi bản đồ sẵn sàng, độc lập với
  // việc bật/tắt lớp phủ nào (lazy-load dữ liệu vẫn xảy ra riêng trong toggleOverlay).
  registerOverlayIcons();


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
      ...textFont(FONT_LABEL),
      "text-field": ["get", "ten"],
      "text-size": 12.5,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#b91c1c",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.6,
    },
  });

  // MapLibre mở sẵn ghi công ở dạng compact rồi mới thu lại khi người dùng chạm
  // vào bản đồ lần đầu. Nghĩa là câu «© OpenStreetMap contributors © CARTO» vẫn
  // nằm chình ình suốt lúc xem — thu ngay để chỉ còn nút ⓘ. Ghi công KHÔNG mất:
  // bấm ⓘ ra đủ chữ, và NGUON_DU_LIEU trong hồ sơ tỉnh cũng liệt kê lại nguồn nền.
  document
    .querySelector(".maplibregl-ctrl-attrib")
    ?.classList.remove("maplibregl-compact-show");

  initSongNui();
  initCuongVuc();
  initNamTien();
  // Nam tiến thêm nút BÊN TRONG map.on("load") — gọi lại để hút nốt vào «Khám phá».
  gomNutTopbar();
  setPeriod(currentPeriod);
  buildTimeline();
  buildLayerControl();
  // Chip bar phải mount SAU buildLayerControl: nó tra checkbox trong
  // #layer-control để tái dùng đường toggleOverlay có sẵn.
  initChipBar();
  // Permalink cũng mô phỏng thao tác lên control có sẵn — phải sau cả hai.
  initLienKetTrangThai(map);
  // Ô tìm kiếm toàn cục: 2005 mục trải 33 lớp thì duyệt tay không nổi. Chỉ mục
  // nạp LƯỜI (lần đầu chạm ô tìm) để không cộng thêm vào lượt tải đầu trang.
  initSearch(map, OVERLAYS, (id) => void toggleOverlay(id, true));

  // Escape đóng mọi panel đang mở. Đi qua sổ đăng ký nên hàm dọn của từng panel
  // vẫn chạy: gỡ `kid-mode`, dừng đồng hồ Olympia, dispose mô hình 3D, tắt hoạt
  // ảnh Nam tiến. Trước đây mỗi panel chỉ đóng được bằng nút × của chính nó.
  // search.ts đã stopPropagation cho Escape của riêng nó, nên ô tìm kiếm đang mở
  // sẽ đóng dropdown trước, không kéo theo cả panel.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideAllPanels();
  });

  document
    .getElementById("threed-btn")
    ?.addEventListener("click", () => setMode3D(!is3D));

  // Nền bản đồ phải theo kịp mức phóng, không chỉ theo lúc bấm nút 3D.
  // moveend gồm cả zoom lẫn kéo — mô hình điểm phải dựng lại cho vùng mới.
  map.on("moveend", capNhatNenBanDo);
  troChuotTrenLopPhu();
  // Dựng lớp «đơn vị hành chính xưa» Ở ĐÂY chứ không ở setPeriod: cần
  // `chu-quyen-labels` đã tồn tại để chèn XUỐNG DƯỚI nó.
  void ensureDonViXua();
});

// Lớp landmark 3D (Three.js) nạp lười ở lần bật 3D đầu tiên để không phình
// bundle chính cho người dùng không mở chế độ 3D.
let landmarks3d: import("./landmarks3d").Landmarks3D | null = null;
let landmarks3dLoading = false;

async function ensureLandmarks3D(): Promise<void> {
  if (landmarks3d || landmarks3dLoading) return;
  landmarks3dLoading = true;
  try {
    const { createLandmarks3D } = await import("./landmarks3d");
    landmarks3d = createLandmarks3D(map);
    landmarks3d.setVisible(is3D);
    // Mặt biển mặc định bật; nếu người dùng bấm 3D khi đang phóng sâu thì phải
    // tắt ngay, không đợi tới lần zoom kế tiếp.
    capNhatNenBanDo();
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
  setPeriod(currentPeriod);
  map.easeTo({ pitch: on ? 55 : 0, bearing: on ? -12 : 0, duration: 1200 });
  document.getElementById("threed-btn")?.classList.toggle("active", on);
  capNhatNenBanDo();
  if (on) void ensureLandmarks3D();
  landmarks3d?.setVisible(on);
}

/** Trên mức này, chế độ 3D trả nền bản đồ về để còn thấy mặt đất. */
const ZOOM_TRA_NEN_3D = 7.5;

/**
 * Đang ở cảnh "diorama" hay không: 3D bật VÀ còn đang nhìn ở tầm cả nước.
 * Dưới ngưỡng này 3D là mô hình sa bàn (khối tỉnh nổi giữa biển động); trên
 * ngưỡng, 3D chỉ nên là góc nghiêng trên bản đồ thật + landmark.
 */
function dangDiorama(): boolean {
  return is3D && map.getZoom() < ZOOM_TRA_NEN_3D;
}

let dioramaTruoc = false;

/**
 * Chế độ 3D = diorama nên ẩn nền bản đồ, cho Việt Nam nổi khối giữa biển động.
 * Nhưng khi phóng sâu thì diorama hết ý nghĩa: không còn nhìn thấy hình chữ S,
 * chỉ còn một mảng màu phẳng không có đường sá, sông ngòi hay bờ biển nào để
 * định vị. Trả nền lại từ zoom 7,5 — vẫn giữ được cảnh diorama ở mức toàn quốc.
 */
function capNhatNenBanDo(): void {
  const dio = dangDiorama();
  if (map.getLayer("basemap")) {
    const dang = map.getLayoutProperty("basemap", "visibility") ?? "visible";
    const moi = dio ? "none" : "visible";
    if (dang !== moi) map.setLayoutProperty("basemap", "visibility", moi);
  }
  // Mặt biển đi CÙNG cảnh diorama: bật đúng lúc nền bản đồ tắt. Để nó sống khi
  // đã phóng sâu thì mặt phẳng nước phủ kín cả khung nhìn (xem setBienHien).
  landmarks3d?.setBienHien(dio);
  // Vượt ngưỡng thì đổi cả bộ lớp era (khối ↔ tô phẳng + nhãn tỉnh).
  if (dio !== dioramaTruoc) {
    dioramaTruoc = dio;
    setEra(currentEra);
  }
  capNhatMoHinhDiem();
}

/**
 * Trần số mô hình dựng cùng lúc. Vẽ bằng InstancedMesh nên chi phí gần như chỉ
 * phụ thuộc số LOẠI hình (5), không phụ thuộc số điểm — trần này chỉ để chặn
 * trường hợp bật cùng lúc mấy chục lớp ở mức nhìn cả nước.
 */
const TRAN_MO_HINH_DIEM = 400;

/** Các lớp phủ đang bật — đọc từ lớp vòng tròn, thứ luôn theo đúng trạng thái. */
function lopPhuDangBat(): string[] {
  return [...overlayLoaded].filter(
    (id) =>
      map.getLayer(`overlay-${id}`) &&
      (map.getLayoutProperty(`overlay-${id}`, "visibility") ?? "visible") !==
        "none",
  );
}

/**
 * Dựng mô hình 3D cho các điểm di tích ĐANG HIỆN trong khung nhìn, và giấu
 * icon phẳng của chính những lớp đó khi 3D bật.
 *
 * Hai việc phải đi cùng nhau, vì đây là chỗ chủ dự án chỉ ra: bật 3D mà biểu
 * tượng vẫn là chấm bẹt dán trên mặt đất. Lớp vòng tròn ở lại — nó vừa là chân
 * đế của mô hình, vừa là vùng bấm (mô hình Three.js không nhận sự kiện bấm của
 * MapLibre). Điểm vượt quá trần vẫn còn vòng tròn nên không mục nào biến mất.
 */
/**
 * Chữ ký khung nhìn — dùng để bỏ qua lượt dựng lại mô hình khi người dùng chỉ
 * nhích bản đồ vài pixel. `capNhatMoHinhDiem()` quét `queryRenderedFeatures`
 * qua MỌI lớp phủ đang bật (có thể là 34 lớp) rồi dựng tới 400 mô hình; chạy
 * lại nguyên bộ đó sau từng cú kéo chuột là nguồn giật rõ nhất trong tay ta.
 */
let vetKhungNhin = "";

/** Tâm + mức phóng của lượt quét gần nhất — dùng để nhận ra một "cú nhảy xa". */
let tamQuetTruoc: [number, number, number] | null = null;
/** Hẹn giờ quét bù sau cú nhảy xa — xem ghi chú ở chỗ đặt nó. */
let henQuetLai = 0;

function capNhatMoHinhDiem(): void {
  const bat = lopPhuDangBat();
  for (const id of overlayLoaded) {
    const icon = `overlay-${id}-icon`;
    if (!map.getLayer(icon)) continue;
    const hien = !is3D && bat.includes(id) ? "visible" : "none";
    if ((map.getLayoutProperty(icon, "visibility") ?? "visible") !== hien)
      map.setLayoutProperty(icon, "visibility", hien);
    // Ở 3D vòng tròn tụt xuống vai trò chân đế + VÙNG BẤM. Bản trước đặt bán
    // kính 3 (đường kính 6 px) cho khỏi to hơn mô hình — và thế là không bấm
    // trúng được nữa: người dùng nhắm vào khối 3D, còn vùng bấm là cái chấm
    // 6 px dưới chân nó. Đo ngày 2026-08-05: bấm đúng tâm thì popup vẫn mở,
    // tức cơ chế không hỏng, chỉ là đích quá nhỏ.
    //
    // WCAG 2.5.8 đòi đích thao tác tối thiểu 24×24 px ⇒ bán kính ≥ 12. Giữ
    // được cả hai yêu cầu bằng cách tách vai trò: phần TÔ trong suốt gần hết
    // (chỉ còn là bóng đổ dưới chân mô hình), phần VIỀN mảnh vẽ đúng chân đế.
    // Vùng bấm của MapLibre tính theo bán kính, không theo độ trong — nên đích
    // vẫn là 24 px dù mắt chỉ thấy một vòng nhạt.
    const ban = is3D ? 12 : 5;
    if (map.getPaintProperty(`overlay-${id}`, "circle-radius") !== ban) {
      map.setPaintProperty(`overlay-${id}`, "circle-radius", ban);
      map.setPaintProperty(`overlay-${id}`, "circle-stroke-width", is3D ? 1.5 : 2);
      map.setPaintProperty(`overlay-${id}`, "circle-opacity", is3D ? 0.18 : 1);
      map.setPaintProperty(`overlay-${id}`, "circle-stroke-opacity", is3D ? 0.55 : 1);
    }
  }
  if (!landmarks3d) return;
  if (!is3D || !bat.length) {
    landmarks3d.capNhatDiem([]);
    vetKhungNhin = "";
    return;
  }
  // Làm tròn tâm về ~0,01° và zoom về 0,25 bậc: nhích nhẹ thì chữ ký không đổi
  // và cả lượt quét được bỏ qua. Đổi thời kỳ hay bật/tắt lớp vẫn dựng lại vì
  // danh sách lớp nằm trong chữ ký.
  const c = map.getCenter();
  const vet = `${c.lng.toFixed(2)},${c.lat.toFixed(2)},${(Math.round(map.getZoom() * 4) / 4).toFixed(2)},${bat.join()}`;
  if (vet === vetKhungNhin) return;
  vetKhungNhin = vet;
  const ds: DiemMoHinh[] = [];
  const daCo = new Set<string>();
  for (const f of map.queryRenderedFeatures({
    layers: bat.map((id) => `overlay-${id}`),
  })) {
    if (ds.length >= TRAN_MO_HINH_DIEM) break;
    if (f.geometry.type !== "Point") continue;
    const [lon, lat] = f.geometry.coordinates as [number, number];
    // Nhiều lớp phủ chồng nhau tại cùng một di tích (vd. vừa QGĐB vừa UNESCO)
    // — dựng hai mô hình chồng khít chỉ tốn tam giác, không thêm thông tin.
    const khoa = `${lon.toFixed(5)},${lat.toFixed(5)}`;
    if (daCo.has(khoa)) continue;
    daCo.add(khoa);
    // Lớp phủ là căn cứ chính để chọn mô hình — tên mục chỉ đủ dùng ở các lớp
    // di tích, còn lớp nhân vật thì `ten` là tên người. Xem mohinh-diem.ts.
    const lop = f.layer.id.replace(/^overlay-/, "");
    ds.push({
      lon,
      lat,
      ...phanLoaiDiem(
        lop,
        String(f.properties?.ten ?? ""),
        String(f.properties?.loai ?? ""),
      ),
    });
  }
  landmarks3d.capNhatDiem(ds);

  // `queryRenderedFeatures` chỉ thấy thứ ĐÃ VẼ. Sau một cú nhảy xa (bấm kết quả
  // tìm kiếm, chọn tỉnh, đổi mức phóng), `moveend` nổ khi khung nhìn mới còn
  // trống, nên lượt quét trên trả về gần như rỗng và cả vùng đó không có mô
  // hình nào — đo bằng ảnh chụp lúc nhảy Hà Nội → Huế: 38 điểm có vòng tròn, 0
  // mô hình; nhích bản đồ 3 px là đủ hiện hết.
  //
  // `map.areTilesLoaded()` KHÔNG dùng được để bắt ca này: ngay sau `jumpTo` nó
  // vẫn trả về true vì các ô ĐANG GIỮ (của vùng cũ) đều đã tải xong.
  //
  // Chỉ quét bù sau cú nhảy xa, không sau mỗi lần nhích — kéo chuột liên tục mà
  // quét hai lượt mỗi khung nhìn thì đúng là thứ gây giật đang phải chữa.
  const z = map.getZoom();
  const nhayXa =
    !tamQuetTruoc ||
    Math.abs(z - tamQuetTruoc[2]) >= 0.75 ||
    Math.hypot(c.lng - tamQuetTruoc[0], c.lat - tamQuetTruoc[1]) > 0.25;
  tamQuetTruoc = [c.lng, c.lat, z];
  if (nhayXa && !henQuetLai)
    henQuetLai = window.setTimeout(() => {
      henQuetLai = 0;
      vetKhungNhin = ""; // buộc quét lại đúng một lượt, khi ô đã về
      capNhatMoHinhDiem();
    }, 600);
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
              <p class="model3d-attr">Mô hình «${esc(def.ten)}» của <a href="${url}" target="_blank" rel="noopener noreferrer">${esc(sf.author)}</a> — giấy phép ${esc(LIC_TEN[sf.license] ?? sf.license)} (Sketchfab).</p>`;
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
// Ba panel này khai trong index.html và không có tài nguyên phải dọn nên chưa
// module nào đăng ký. Vẫn phải đăng ký: sổ đăng ký giờ còn gắn ngữ nghĩa hộp
// thoại và phím Esc, không riêng việc dọn tài nguyên nữa.
for (const id of ["library-panel", "game-panel", "quiz-panel"] as const)
  registerPanel(id);
// Chèn CUỐI cùng nhưng nút nằm ĐẦU #topbar-nav (insertBefore) — chuyển chế độ
// xem là hành động khung, không cùng hạng với các nút mở panel nội dung.
initCheDo();
// SAU initCheDo(): lời mời lần đầu chỉ hiện ở chế độ trẻ em, nên phải biết
// chế độ đã. Trước gomNutTopbar() thì nút 🧭 mới kịp vào danh sách giữ ngoài.
initHuongDan();
// Uỷ nhiệm trên document — không phụ thuộc nút nào đã dựng, đặt ở đâu cũng
// được, để cạnh đây cho cùng một cụm «chữ cho trẻ em».
initTuKho();
// Phải chạy SAU mọi init* — nó gom những nút đã có mặt.
gomNutTopbar();

// Hiện ranh giới hành chính của 1 era (index = chỉ số ERAS) hoặc ẨN HẾT (index = -1).
// KHÔNG tự đặt nhãn/thanh trượt — điều phối bởi setPeriod().
function setEra(index: number): void {
  currentEra = index;
  // Nạp era đang bật (nếu chưa). index = -1 nghĩa là ẩn hết, không nạp gì.
  if (index >= 0 && ERAS[index]) ensureEra(ERAS[index]);
  ERAS.forEach((era, i) => {
    // Era chưa nạp thì chưa có lớp nào để ẩn/hiện — bỏ qua, không phải lỗi.
    if (!eraDaNap.has(era.id)) return;
    const active = i === index;
    // Bật 3D thì khối SỐNG Ở MỌI MỨC ZOOM. Bản cũ tắt khối từ zoom 7,5 nên
    // phóng vào là bản đồ tự trở về 2D — đúng thứ chủ dự án báo lỗi ngày
    // 2026-08-05. Vấn đề thật (mặt khối che mặt đất) chữa bằng độ trong theo
    // zoom ở `fill-extrusion-opacity`, không phải bằng cách bỏ 3D.
    //
    // Ba lớp phẳng thì ngược lại: ở tầm diorama chúng thừa (không có nền bản
    // đồ, khối đã kể hết), phóng sâu mới cần — đường biên và tên tỉnh là thứ
    // giúp định vị khi khối đã trong suốt.
    const dio = dangDiorama();
    map.setLayoutProperty(`${era.id}-fill`, "visibility", active && !is3D ? "visible" : "none");
    map.setLayoutProperty(`${era.id}-line`, "visibility", active && !dio ? "visible" : "none");
    map.setLayoutProperty(`${era.id}-3d`, "visibility", active && is3D ? "visible" : "none");
    map.setLayoutProperty(`${era.id}-label`, "visibility", active && !dio && showLabels ? "visible" : "none");
  });
}

// Chọn 1 thời kỳ trong DÒNG THỜI GIAN HỢP NHẤT: hiện đúng lớp địa lý (cương vực
// phỏng dựng / ranh giới hành chính / hoặc chỉ TÊN NƯỚC) + cập nhật nhãn + đồng bộ
// thanh trượt & radio. Gom «Cương vực Việt cổ» + mốc hành chính về 1 điều khiển.
function setPeriod(i: number): void {
  if (i !== currentPeriod && focusMode) clearFocusFilters();
  currentPeriod = i;
  const p = PERIODS[i];
  setEra(p.kind === "admin" ? (p.ref as number) : -1);
  applyCuongVuc(p.kind === "cuongvuc" ? (p.ref as string) : "off");
  apDonViXua(p.id);
  const label = document.getElementById("period-label");
  if (label) label.textContent = p.nhan;
  const slider = document.getElementById("timeline") as HTMLInputElement | null;
  if (slider) {
    slider.value = String(i);
    // Trình đọc màn hình đọc thanh trượt là "3 trên 12" — một con số không nói
    // lên điều gì. aria-valuetext thay số bằng chính tên thời kỳ.
    slider.setAttribute("aria-valuetext", p.nhan);
    // Phần rãnh ĐÃ ĐI QUA tô sáng (xem #timeline::-webkit-slider-runnable-track).
    const het = PERIODS.length - 1;
    slider.style.setProperty("--tien-do", `${het ? (i / het) * 100 : 0}%`);
  }
  document
    .querySelectorAll<HTMLInputElement>("#layer-control input[name=period]")
    .forEach((r) => (r.checked = Number(r.value) === i));
  // Ô chọn thời kỳ là <select>, KHÔNG khớp bộ chọn `input[name=period]` ở trên.
  // Vì thế kéo thanh trượt dưới đáy đổi bản đồ nhưng ô chọn vẫn đứng nguyên ở
  // thời kỳ cũ — hai bộ điều khiển cùng một thứ mà chỉ đồng bộ một chiều.
  const oChon = document.getElementById("lc-period") as HTMLSelectElement | null;
  if (oChon && Number(oChon.value) !== i) oChon.value = String(i);
  // Note mốc chỉ bung ra khi NGƯỜI DÙNG đổi thời kỳ. Lúc khởi động setPeriod
  // cũng chạy, mà một hộp tự hiện lên che bản đồ ngay khi mở trang thì phiền.
  capNhatMoc(i, daDoiThoiKy);
}

function buildTimeline(): void {
  const slider = document.getElementById("timeline") as HTMLInputElement | null;
  if (!slider) return;
  slider.min = "0";
  slider.max = String(PERIODS.length - 1);
  slider.step = "1";
  slider.disabled = false;
  slider.value = String(currentPeriod);
  slider.addEventListener("input", () => {
    daDoiThoiKy = true;
    setPeriod(Number(slider.value));
  });
  void initMocLichSu({
    namKy: NAM_MOC_KY,
    tenKy: PERIODS.map((p) => p.nhan),
    namKet: NAM_KET_MOC,
    datPeriod: (i) => {
      daDoiThoiKy = true;
      setPeriod(i);
    },
  });
}

// ---------------------------------------------------------------------------
// Lớp phủ (overlays) — bật/tắt độc lập với thời kỳ
// ---------------------------------------------------------------------------

// Vẽ 1 emoji ra canvas offscreen rồi trả về ImageData — dùng để đăng ký
// icon-image cho MapLibre mà không cần sprite sheet/asset ngoài (self-contained).
function emojiToImageData(emoji: string, sizePx = 64): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, sizePx, sizePx);
  ctx.font = `${Math.round(sizePx * 0.78)}px "Noto Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, sizePx / 2, sizePx / 2 + sizePx * 0.04);
  return ctx.getImageData(0, 0, sizePx, sizePx);
}

// Đăng ký ảnh icon cho từng emoji dùng trong OVERLAYS (1 lần duy nhất — nhiều
// lớp phủ cùng chủ đề dùng chung 1 emoji nên số ảnh thực tế < 69). Gọi ngay khi
// bản đồ "load", độc lập với việc lớp phủ nào được bật/tắt sau đó.
function registerOverlayIcons(): void {
  const emojis = new Set(OVERLAYS.map((o) => o.icon));
  emojis.add(DUONG_DANH_NHAN_ICON);
  for (const emoji of emojis) {
    if (map.hasImage(emoji)) continue;
    map.addImage(emoji, emojiToImageData(emoji), { pixelRatio: 2 });
  }
}

const overlayLoaded = new Set<string>();

// Gắn cùng 1 bộ handler click/hover cho cả lớp circle (halo) lẫn lớp icon của
// 1 lớp phủ — để bấm trúng emoji hay trúng vòng tròn màu đều mở popup như nhau.
function bindOverlayInteractions(layerId: string, conf: OverlayConf): void {
  map.on("click", layerId, (e) => {
    const f = e.features?.[0];
    if (!f) return;
    // Parse LẠI ở đây chứ không cast: properties do MapLibre trả về đã đi qua
    // một vòng serialize, và cast chỉ là lời khai. parse thì có ép kiểu thật.
    const p = parseOverlayItem(f.properties);
    // Nguồn cấp LỚP đi vào trong popup chứ không nối đuôi vào sau nữa. Lối cũ
    // vừa nhét một dòng xám không cấp bậc xuống cuối mọi popup, vừa chèn
    // `conf.nguon` vào HTML KHÔNG escape. Nay nó là tham số, và mục nào có
    // `sources[]` riêng thì nguồn riêng thắng — 2.584/2.599 mục có.
    moPopup(map, e.lngLat, conf.popup(p, conf.nguon), { maxWidth: "360px" });
  });
  // CỐ Ý KHÔNG gắn mouseenter/mouseleave theo từng lớp ở đây — xem
  // `troChuotTrenLopPhu` bên dưới.
}

// 🔴 Vì sao con trỏ dùng MỘT handler chung thay vì mouseenter/mouseleave theo
// từng lớp: MapLibre phải dò trúng đích RIÊNG cho mỗi lượt đăng ký, trên MỌI
// sự kiện `mousemove`. Đo ngày 2026-08-05 (đếm lời gọi queryRenderedFeatures,
// 30 lần rê chuột):
//     không lớp phủ  →  240 lời gọi  (8 mỗi lần rê)
//     bật 33 lớp phủ → 4.200 lời gọi (140 mỗi lần rê)
// mà `mousemove` bắn khoảng 60 lần mỗi giây khi người dùng chỉ di con trỏ.
// Kéo bản đồ thì 0 lời gọi — chốt chữ ký khung nhìn đã chặn tốt. Nghĩa là chỗ
// giật nằm ở RÊ CHUỘT, không phải ở kéo bản đồ.
// Một handler + một lượt dò cho toàn bộ lớp phủ đưa 140 về 1.
// `click` giữ nguyên theo từng lớp: nó chỉ dò khi có cú bấm, không tốn gì khi
// rê chuột, và nó cần `conf` riêng của lớp để dựng popup.
function troChuotTrenLopPhu(): void {
  map.on("mousemove", (e) => {
    const lop: string[] = [];
    for (const id of overlayLoaded) {
      for (const l of [`overlay-${id}`, `overlay-${id}-icon`])
        if (map.getLayer(l) && map.getLayoutProperty(l, "visibility") !== "none") lop.push(l);
    }
    if (!lop.length) return;
    const co = map.queryRenderedFeatures(e.point, { layers: lop }).length > 0;
    const canvas = map.getCanvas();
    // Chỉ ghi khi ĐỔI: gán style mỗi khung hình cũng là một lượt việc thừa.
    const muon = co ? "pointer" : "";
    if (canvas.style.cursor !== muon) canvas.style.cursor = muon;
  });
}

// ── Tách điểm trùng toạ độ khi RENDER ───────────────────────────────────────
// 34% CSDL nằm trong cụm <500 m, trong đó nhiều cặp trùng KHÍT: điểm sau đè
// điểm trước → không bấm được, và mô hình 3D khử trùng theo khoá toạ độ làm
// tròn 5 chữ số nên mục sau âm thầm mất mô hình (PLAN.md mục 10). Đây là dịch
// chuyển HIỂN THỊ thuần tuý: chỉ hình học GeoJSON dời ≤~65 m theo vòng xoáy
// góc vàng quanh điểm gốc; properties (lat/lon nguồn) giữ nguyên từng chữ số.
// KHÔNG phải "sửa toạ độ" trong dữ liệu — nguyên tắc "không bịa toạ độ chính
// xác hơn nguồn" không bị đụng vì file dữ liệu không đổi.
const oChiemCho = new Map<string, number>();
function tachDiemTrung(lon: number, lat: number): [number, number] {
  const khoa = `${lon.toFixed(4)},${lat.toFixed(4)}`; // lưới ~11 m
  const n = oChiemCho.get(khoa) ?? 0;
  oChiemCho.set(khoa, n + 1);
  if (n === 0) return [lon, lat];
  // Góc vàng: các điểm tách không bao giờ thẳng hàng/chồng nhau lại.
  const goc = n * 2.399963;
  // Vòng đầu ~60 m, cứ đủ 8 điểm thì nở thêm một vành.
  const r = 0.00055 * (1 + Math.floor((n - 1) / 8) * 0.6);
  return [lon + (r * Math.cos(goc)) / Math.cos((lat * Math.PI) / 180), lat + r * Math.sin(goc)];
}

// Thuật toán va chạm nhãn của MapLibre làm việc khử rối thay ta: dưới zoom
// 9,5 icon nào chồng lấn sẽ tự ẩn (vòng tròn màu vẫn vẽ, vùng bấm vẫn còn);
// từ 9,5 trở lên hiện đủ 100% như trước. Trước đây allow-overlap:true nghĩa
// là 2.300+ icon vẽ đè nhau thành một đám rối ở mức zoom toàn quốc.
const ICON_VA_CHAM_THEO_ZOOM: ExpressionSpecification = [
  "step",
  ["zoom"],
  false,
  9.5,
  true,
];

async function toggleOverlay(id: string, on: boolean): Promise<void> {
  const layerId = `overlay-${id}`;
  const iconLayerId = `${layerId}-icon`;
  if (overlayLoaded.has(id)) {
    // Chỉ đặt lớp vòng tròn ở đây. Lớp icon do capNhatMoHinhDiem() quyết định,
    // vì ở chế độ 3D icon phẳng phải nhường chỗ cho mô hình khối.
    map.setLayoutProperty(layerId, "visibility", on ? "visible" : "none");
    capNhatMoHinhDiem();
    return;
  }
  if (!on) return;
  const conf = OVERLAYS.find((o) => o.id === id);
  if (!conf) return;
  const data = await fetchJson(conf.file, itemsOf(parseOverlayItem));
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
        // Hình học có thể dời ≤~65 m để tách điểm trùng khít (bấm được từng
        // mục, mô hình 3D không nuốt nhau); lat/lon THẬT vẫn trong properties.
        geometry: { type: "Point", coordinates: tachDiemTrung(it.lon, it.lat) },
      })),
    },
  });
  map.addLayer({
    id: layerId,
    type: "circle",
    source: layerId,
    paint: {
      // Bán kính co lại một chút & giảm nhẹ opacity vì icon phủ lên trên —
      // vòng tròn giờ chỉ còn vai trò halo màu theo chủ đề + giữ vùng bấm.
      "circle-radius": 5,
      "circle-color": conf.circleColor,
      "circle-opacity": 0.85,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
  map.addLayer({
    id: iconLayerId,
    type: "symbol",
    source: layerId,
    layout: {
      "icon-image": conf.icon,
      "icon-size": 0.5,
      "icon-allow-overlap": ICON_VA_CHAM_THEO_ZOOM,
      "icon-ignore-placement": ICON_VA_CHAM_THEO_ZOOM,
    },
  });
  bindOverlayInteractions(layerId, conf);
  bindOverlayInteractions(iconLayerId, conf);
  overlayLoaded.add(id);
  // Lớp phủ vừa thêm nằm TRÊN lớp landmark 3D (thêm sau thì vẽ sau), nên vòng
  // tròn phẳng sẽ đè lên chân mô hình. Đẩy lớp 3D lên trên cùng lần nữa.
  if (map.getLayer("landmarks-3d")) map.moveLayer("landmarks-3d");
  // Lớp mới bật thì mô hình 3D của nó phải dựng ngay, không đợi tới lần người
  // dùng dời bản đồ (moveend là chỗ gọi còn lại).
  capNhatMoHinhDiem();
}

// --- Lớp «Tên đường theo danh nhân» (thí điểm HN·HCM·ĐN) ---------------------
// Dữ liệu: public/data/streets/danh-nhan-duong-pilot.json (Phương án A) —
// mỗi đường đặt theo danh nhân → 1 điểm centroid. Nguồn tên đường: OSM/Overpass
// (ODbL). Lazy-load lần bật đầu tiên; các lần sau chỉ đổi visibility.
interface StreetLink {
  danh_nhan_id: string;
  ten: string;
  thanh_pho: Array<{
    ten_tp: string;
    ten_duong_osm: string;
    so_doan: number;
    centroid: [number, number];
    osm_sai_dau?: boolean;
  }>;
}

const parseStreetLink = (raw: unknown): StreetLink => {
  const r = rec(raw);
  return {
    danh_nhan_id: str(r.danh_nhan_id),
    ten: str(r.ten),
    thanh_pho: arr(r.thanh_pho, (x) => {
      const t = rec(x);
      // centroid phải là CẶP SỐ thật — nó đi thẳng vào hình học GeoJSON, không
      // vào HTML. Sai kiểu ở đây là marker nhảy ra giữa Thái Bình Dương chứ
      // không phải chữ hiển thị xấu, nên trả [0,0] rồi để nơi gọi lọc bỏ.
      const c = Array.isArray(t.centroid) ? t.centroid : [];
      const lon = num(c[0]);
      const lat = num(c[1]);
      return {
        ten_tp: str(t.ten_tp),
        ten_duong_osm: str(t.ten_duong_osm),
        so_doan: num(t.so_doan) ?? 0,
        centroid: (lon != null && lat != null ? [lon, lat] : [0, 0]) as [number, number],
        osm_sai_dau: t.osm_sai_dau === true,
      };
    }),
  };
};
// Icon riêng cho lớp thí điểm này — registerOverlayIcons() cũng đăng ký icon
// này (an toàn dù const nằm sau vì hàm đó chỉ thực thi lúc map "load", sau khi
// toàn bộ module đã chạy xong phần khai báo cấp module).
const DUONG_DANH_NHAN_ICON = "🛣️";
let streetsLoaded = false;
async function applyStreets(on: boolean): Promise<void> {
  const layerId = "duong-danh-nhan";
  const iconLayerId = `${layerId}-icon`;
  if (streetsLoaded) {
    const visibility = on ? "visible" : "none";
    map.setLayoutProperty(layerId, "visibility", visibility);
    map.setLayoutProperty(iconLayerId, "visibility", visibility);
    return;
  }
  if (!on) return;
  const data = await fetchJson("data/streets/danh-nhan-duong-pilot.json", (raw) => ({
    lien_ket: arr(rec(raw).lien_ket, parseStreetLink),
  }));
  const cb = document.querySelector<HTMLInputElement>(
    "#layer-control input[name=duong]",
  );
  if (!data?.lien_ket?.length) {
    if (cb) cb.checked = false;
    return;
  }
  const features: GeoJSON.Feature[] = [];
  for (const lk of data.lien_ket) {
    for (const tp of lk.thanh_pho) {
      if (!Array.isArray(tp.centroid) || tp.centroid.length !== 2) continue;
      features.push({
        type: "Feature",
        properties: {
          ten_duong: tp.ten_duong_osm,
          danh_nhan: lk.ten,
          ten_tp: tp.ten_tp,
          so_doan: tp.so_doan,
          osm_sai_dau: tp.osm_sai_dau ? 1 : 0,
        },
        geometry: { type: "Point", coordinates: tp.centroid },
      });
    }
  }
  map.addSource(layerId, {
    type: "geojson",
    data: { type: "FeatureCollection", features },
  });
  map.addLayer({
    id: layerId,
    type: "circle",
    source: layerId,
    paint: {
      "circle-radius": 3.5,
      "circle-color": "#7e22ce",
      "circle-opacity": 0.85,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#ffffff",
    },
  });
  map.addLayer({
    id: iconLayerId,
    type: "symbol",
    source: layerId,
    layout: {
      "icon-image": DUONG_DANH_NHAN_ICON,
      "icon-size": 0.4,
      "icon-allow-overlap": ICON_VA_CHAM_THEO_ZOOM,
      "icon-ignore-placement": ICON_VA_CHAM_THEO_ZOOM,
    },
  });
  const onStreetClick = (e: MapLayerMouseEvent) => {
    const f = e.features?.[0];
    if (!f) return;
    const p = f.properties as Record<string, unknown>;
    const sai =
      Number(p.osm_sai_dau) === 1
        ? `<br/><span style="color:#b45309;font-size:0.72rem">⚠ OSM gõ sai dấu — đã nối theo nguồn đã xác minh</span>`
        : "";
    moPopup(
      map,
      e.lngLat,
      `<strong>Đường ${esc(str(p.ten_duong))}</strong><br/>` +
        `Đặt theo danh nhân: <b>${esc(str(p.danh_nhan))}</b><br/>` +
        `<span style="color:#57534e;font-size:0.8rem">${esc(str(p.ten_tp))} · ${Number(p.so_doan)} đoạn</span>${sai}<br/>` +
        `<span style="color:#78716c;font-size:0.72rem">Nguồn tên đường: © OpenStreetMap contributors (ODbL)</span>`,
      { maxWidth: "300px" },
    );
  };
  for (const lid of [layerId, iconLayerId]) {
    map.on("click", lid, onStreetClick);
    map.on("mouseenter", lid, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", lid, () => {
      map.getCanvas().style.cursor = "";
    });
  }
  streetsLoaded = true;
}


function buildLayerControl(): void {
  const el = document.createElement("div");
  el.id = "layer-control";
  // Cụm hiển thị + lớp chưa gán nhóm dồn về "Khác" (không để lớp nào biến mất).
  const groupedIds = new Set(OVERLAY_GROUPS.flatMap((g) => g.ids));
  const leftover = OVERLAYS.filter((o) => !groupedIds.has(o.id));
  const groups = leftover.length
    ? [...OVERLAY_GROUPS, { id: "khac", nhan: "Khác", icon: "📦", ids: leftover.map((o) => o.id) }]
    : OVERLAY_GROUPS;
  // Chữ nào đổi theo chế độ thì bọc trong .lc-ten kèm khoá tra cứu — đổi chế độ
  // chỉ cần ghi lại textContent, không dựng lại cả bảng (dựng lại sẽ gập hết
  // các cụm người dùng đang mở và xoá trạng thái tick).
  const ten = (khoa: string, chu: string) =>
    `<span class="lc-ten" data-tu="${khoa}">${chu}</span>`;
  const overlayLabel = (id: string) => {
    const o = OVERLAYS.find((ov) => ov.id === id);
    return o
      ? `<label><input type="checkbox" name="overlay" value="${o.id}"/> ${ten(`lop:${o.id}`, o.label)}</label>`
      : "";
  };
  // Các nhóm gập được (details) để panel không tràn khỏi màn hình khi
  // số lớp phủ tăng dần (#1). "Lớp phủ" mặc định mở, phần còn lại gập lại.
  el.innerHTML = `
    <div class="lc-head">
      <strong>${ten("nhan:lc-tieu-de", "Lớp bản đồ")}</strong>
      <button id="lc-thu-gon" type="button" aria-expanded="true" aria-controls="lc-than"
              title="Thu gọn bảng lớp bản đồ">‹</button>
    </div>
    <div id="lc-than">
    <div class="lc-sec lc-thoi-ky">
      <label class="lc-nhan-chon" for="lc-period">${ten("nhan:lc-nhan-thoi-ky", "Thời kỳ")}</label>
      <select id="lc-period" name="period">
        ${PERIODS.map(
          (p, i) => `<option value="${i}"${i === currentPeriod ? " selected" : ""}>${p.nhan}</option>`,
        ).join("")}
      </select>
      <p class="lc-note" id="lc-ghi-chu"></p>
    </div>
    <details class="lc-sec" open>
      <summary>📌 ${ten("nhan:lc-lop-phu", "Lớp phủ")} <span class="lc-badge">${OVERLAYS.length}</span></summary>
      <div class="lc-overlays">
        ${groups
          .map((g, gi) => {
            const items = g.ids.filter((id) => OVERLAYS.some((o) => o.id === id));
            if (!items.length) return "";
            return `<details class="lc-sec lc-group"${gi === 0 ? " open" : ""}>
              <summary>${g.icon} ${ten(`cum:${g.id}`, g.nhan)} <span class="lc-badge">${items.length}</span></summary>
              <div class="group">${items.map(overlayLabel).join("")}</div>
            </details>`;
          })
          .join("")}
      </div>
    </details>
    <details class="lc-sec">
      <summary>🖼️ ${ten("nhan:lc-muc-anh", "Mức tư liệu ảnh")}</summary>
      <div class="group">
        <div>📷 Có ảnh chân dung</div>
        <div>📄 Có tư liệu/hồ sơ</div>
        <div>📍 Vị trí theo nơi cư trú</div>
      </div>
    </details>
    <details class="lc-sec">
      <summary>🎨 ${ten("nhan:lc-kieu-ban-do", "Kiểu bản đồ")}</summary>
      <div class="group">
        <label><input type="radio" name="palette" value="default" checked/> Mặc định</label>
        <label><input type="radio" name="palette" value="ruc-ro"/> Tô màu phân biệt tỉnh</label>
        <label><input type="radio" name="palette" value="pastel"/> Tô màu pastel</label>
        <label><input type="checkbox" name="labels"/> Hiện tên tỉnh</label>
        <label><input type="checkbox" name="songnui"/> Hiện sông &amp; núi</label>
        <label><input type="checkbox" name="duong"/> Tên đường theo danh nhân <span class="lc-tag">HN·HCM·ĐN</span></label>
      </div>
    </details>
    <details class="lc-sec">
      <summary>🗺️ ${ten("nhan:lc-ban-do-co", "Bản đồ cổ")}</summary>
      <div class="group">
        <label><input type="checkbox" name="taberd"/> Taberd 1838 «Cát Vàng» (xấp xỉ)</label>
        <label class="taberd-op">Độ mờ <input type="range" name="taberd-opacity" min="0" max="1" step="0.05" value="0.6"/></label>
      </div>
    </details>
    </div>`;
  // Thu gọn bảng lớp — bảng này chiếm 1/5 bản đồ và trước đây không tắt được.
  el.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("#lc-thu-gon");
    if (!b) return;
    const mo = el.classList.toggle("lc-gon") === false;
    b.setAttribute("aria-expanded", String(mo));
    b.textContent = mo ? "‹" : "›";
    b.setAttribute("title", mo ? "Thu gọn bảng lớp bản đồ" : "Mở bảng lớp bản đồ");
  });
  el.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "period") {
      daDoiThoiKy = true;
      setPeriod(Number(t.value));
    }
    if (t.name === "overlay") void toggleOverlay(t.value, t.checked);
    if (t.name === "palette") applyColorMode(t.value as "default" | "ruc-ro" | "pastel");
    if (t.name === "labels") applyLabels(t.checked);
    if (t.name === "songnui") applySongNui(t.checked);
    if (t.name === "duong") void applyStreets(t.checked);
    if (t.name === "taberd") applyTaberd(t.checked);
  });
  el.addEventListener("input", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "taberd-opacity") setTaberdOpacity(Number(t.value));
  });
  document.getElementById("app")?.appendChild(el);
  apTuVungTheoCheDo();
  document.addEventListener(SU_KIEN_DOI_CHE_DO, apTuVungTheoCheDo);
}

/**
 * Đổi cách gọi các nhãn trong bảng lớp bản đồ theo chế độ xem.
 *
 * Nhãn người lớn được giữ nguyên trong `data-goc` ngay lần chạy đầu, nên chuyển
 * qua chuyển lại giữa hai chế độ không làm mất bản gốc. Khoá nào chưa có bản
 * trẻ em thì giữ nguyên bản người lớn — thiếu bản dịch còn hơn dịch sai.
 */
function apTuVungTheoCheDo(): void {
  capNhatGhiChuCuongVuc();
  const treEm = cheDoHienTai() === "tre-em";
  for (const el of document.querySelectorAll<HTMLElement>("#layer-control .lc-ten")) {
    if (el.dataset.goc === undefined) el.dataset.goc = el.textContent ?? "";
    const khoa = el.dataset.tu ?? "";
    const [loai, id] = [khoa.slice(0, khoa.indexOf(":")), khoa.slice(khoa.indexOf(":") + 1)];
    const bang =
      loai === "lop" ? LOP_TRE_EM : loai === "cum" ? CUM_TRE_EM : NHAN_TRE_EM;
    let chu = treEm ? bang[id] : undefined;
    // Nhãn người lớn của lớp phủ đã nhúng sẵn emoji trong chuỗi label, còn bản
    // trẻ em thì không — thay thẳng sẽ làm cả cột mất hết biểu tượng.
    if (chu && loai === "lop") {
      const icon = OVERLAYS.find((o) => o.id === id)?.icon;
      if (icon) chu = `${icon} ${chu}`;
    }
    el.textContent = chu ?? el.dataset.goc;
  }
}

// Ghi chú pháp lý về cương vực cổ. Bản cho người lớn dùng đúng ngôn ngữ hồ sơ
// ("phỏng dựng xấp xỉ", "bản đồ chủ quyền") — trẻ em đọc không ra nghĩa gì, mà
// đây lại là câu KHÔNG được phép hiểu sai. Nên viết hẳn hai bản, giữ nguyên hai
// điều bắt buộc: đây là phỏng dựng, và nó KHÔNG phải bản đồ chủ quyền.
const GHI_CHU_CUONG_VUC: Record<CheDo, string> = {
  "nguoi-lon":
    "⚠️ Cương vực cổ là phỏng dựng xấp xỉ — KHÔNG phải bản đồ chủ quyền. Nam Việt→Đại Nam hiện mới có TÊN NƯỚC (đường biên chính xác đang tra nguồn).",
  "tre-em":
    "⚠️ Hình nước ta thời xưa chỉ là bản vẽ phỏng đoán cho dễ hình dung, KHÔNG phải bản đồ biên giới chính thức. Từ Nam Việt đến Đại Nam mới có tên nước thôi — đường biên giới thật thế nào thì các nhà sử học vẫn đang tra cứu.",
};

function capNhatGhiChuCuongVuc(): void {
  const p = document.getElementById("lc-ghi-chu");
  if (p) p.textContent = GHI_CHU_CUONG_VUC[cheDoHienTai()];
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

const list = (items: string[] | undefined) =>
  items?.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";

// Bản `list` có chú giải từ khó cho chế độ trẻ em. TÁCH RIÊNG chứ không sửa
// thẳng `list` vì cùng hàm đó còn dựng danh sách NGUỒN — gạch chân chú giải
// giữa một dòng trích dẫn là làm hỏng chính cái đang được trích.
const listKho = (items: string[] | undefined) =>
  items?.length ? `<ul>${items.map((i) => `<li>${escVanKho(i)}</li>`).join("")}</ul>` : "";

function profileHtml(p: ProvinceProfile): string {
  const vh = p.van_hoa ?? {};
  const section = (title: string, body: string, open = false) =>
    body
      ? `<details class="profile-section"${open ? " open" : ""}><summary>${title}</summary>${body}</details>`
      : "";
  return `
    ${p.trang_thai === "draft" ? `<p class="draft-badge">📝 Bản nháp — đang kiểm chứng nguồn</p>` : ""}
    <p class="tong-quan">${escVanKho(p.tong_quan)}</p>
    <p class="giai-nghia">💡 <em>${escVanKho(p.giai_nghia_ten)}</em></p>
    ${section(
      "🕰️ Tên gọi qua các thời kỳ",
      `<table class="facts">${p.ten_thoi_ky
        .map((t) => `<tr><th>${esc(t.ten)}</th><td>${esc(t.thoi_ky)}</td></tr>`)
        .join("")}</table>`,
      true,
    )}
    ${section("📜 Dấu mốc lịch sử", listKho(p.lich_su))}
    ${section(
      "🏺 Di chỉ khảo cổ",
      listKho(p.khao_co?.map((k) => `${k.ten} — ${k.mo_ta}`)),
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
      listKho(p.danh_nhan.map((d) => `${d.ten}: ${d.ghi_chu}`)),
    )}
    ${section(
      "🐉 Truyền thuyết & giai thoại",
      listKho(p.truyen_thuyet?.map((t) => `${t.ten} — ${t.tom_tat}`)),
    )}
    ${p.bien_so_xe?.length ? `<p><b>🚗 Biển số xe:</b> ${esc(p.bien_so_xe.join(", "))}</p>` : ""}
    ${p.sap_nhap_2025 ? `<p><b>🔀 Sắp xếp 2025:</b> ${esc(p.sap_nhap_2025)}</p>` : ""}
    <details class="sources"><summary>📚 Nguồn hồ sơ</summary>${list(p.sources)}</details>`;
}

// --- Căn cứ pháp lý của lần hợp nhất tỉnh 2025 ------------------------------
// public/data/timeline/events.json có đủ 34 sự kiện kèm số nghị quyết, ngày
// hiệu lực và đường dẫn cổng Chính phủ — nhưng trước nay KHÔNG module nào đọc
// tới. Panel tỉnh chỉ liệt kê tên các tỉnh cũ lấy từ thuộc tính GeoJSON, tức là
// nói "hợp thành từ A và B" mà không nói theo văn bản nào, trong khi bất biến
// của dự án là mọi mục đều dẫn được về nguồn chính thống.
interface SuKienHanhChinh {
  date: string;
  type: string;
  to: string;
  from: string[];
  phap_ly?: string;
  nguon?: string;
}

const parseSuKienHanhChinh = (raw: unknown): SuKienHanhChinh => {
  const r = rec(raw);
  return {
    date: str(r.date),
    type: str(r.type),
    to: str(r.to),
    from: strs(r.from),
    phap_ly: str(r.phap_ly),
    nguon: str(r.nguon),
  };
};
let sapNhapCache: SuKienHanhChinh[] | null = null;

/** "2025-07-01" → "1/7/2025". Dữ liệu ISO, hiển thị theo lối Việt. */
function ngayVi(iso: string): string {
  const [n, t, g] = iso.split("-");
  return g && t && n ? `${Number(g)}/${Number(t)}/${n}` : iso;
}

async function napCanCuSapNhap(tenTinh: string): Promise<void> {
  if (!sapNhapCache) {
    const d = await fetchJson("data/timeline/events.json", (raw) => ({
      events: arr(rec(raw).events, parseSuKienHanhChinh),
    }));
    sapNhapCache = d?.events ?? [];
  }
  const sk = sapNhapCache.find((e) => e.to === tenTinh);
  const slot = document.getElementById("sapnhap-slot");
  // Panel có thể đã đóng hoặc chuyển sang tỉnh khác trong lúc chờ fetch.
  if (!sk || !slot || document.getElementById("province-panel")?.hidden) return;
  // Tỉnh giữ nguyên tên và không nhập với ai thì không có gì để kể.
  const cu = sk.from.filter((x) => x !== sk.to);
  if (!cu.length) return;
  slot.innerHTML = `<p class="can-cu-sapnhap">📜 Hợp nhất <strong>${esc(
    sk.from.join(" + "),
  )}</strong> — ${esc(sk.phap_ly ?? "chưa rõ văn bản")}, hiệu lực ${esc(
    ngayVi(sk.date),
  )}.${
    sk.nguon
      ? ` <a href="${esc(sk.nguon)}" target="_blank" rel="noopener">Nguồn</a>`
      : ""
  }</p>`;
}

function showProvincePanel(f: MapGeoJSONFeature, era: Era): void {
  const p = f.properties as Record<string, string | number>;
  const panel = document.getElementById("province-panel");
  const content = document.getElementById("panel-content");
  if (!panel || !content) return;

  // Dọn mô hình 3D của tỉnh trước đó (nếu có) trước khi dựng lại panel.
  disposeProvince3D();

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
    <div id="sapnhap-slot"></div>
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
  // Bấm vào tỉnh mở hồ sơ, nhưng cú bấm đó rơi vào lớp era chứ không phải lớp
  // phủ nên popup của điểm vừa xem vẫn treo trên bản đồ, đè lên chính tỉnh đó.
  dongPopup();
  panel.hidden = false;

  // Bấm sang tỉnh khác khi panel ĐANG mở thì `hidden` không đổi ⇒ observer của
  // panels.ts không chạy ⇒ nhãn hộp thoại vẫn là tên tỉnh trước. Đặt lại tay.
  datNhanPanel("province-panel", name);

  if (!isIsland && era.nameKey === "Tỉnh thành mới") void napCanCuSapNhap(name);

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
    // HAI PHA. Trước đây một Promise.all gộp cả 4 nguồn, nên nội dung chính của
    // trang tỉnh phải ĐỢI 8 file văn thơ (~540 KB) tải xong mới hiện — đúng chỗ
    // người dùng thấy lag khi mở mục. Giờ hồ sơ + ảnh lên màn ngay; văn thơ và
    // nhân vật 3D nối vào sau, cùng chạy song song nên tổng thời gian không tăng.
    const pha1 = Promise.all([loadProfile(name), loadMedia()]);
    const pha2 = Promise.all([loadLiterature(), loadFigures()]);

    void pha1.then(([profile, media]) => {
      const slot = document.getElementById("profile-slot");
      if (!slot) return;
      const imgs = media.filter((m) => m.slug === slug);
      const gallery = imgs.length
        ? `<details class="profile-section" open><summary>🖼️ Hình ảnh (${imgs.length})</summary>
            <div class="media-gallery">${imgs.map(mediaImgHtml).join("")}</div>
           </details>`
        : "";
      slot.innerHTML =
        (profile
          ? profileHtml(profile)
          : `<p class="muted coming-soon">Hồ sơ bách khoa đầy đủ của tỉnh này đang được biên soạn.</p>`) +
        gallery +
        `<div id="profile-them" class="profile-them" aria-live="polite"></div>`;
    });

    // Chờ CẢ pha 1 để chắc chắn #profile-them đã có trong DOM — pha 2 về trước
    // pha 1 là chuyện hoàn toàn có thể xảy ra khi văn thơ đã nằm trong cache.
    void Promise.all([pha1, pha2]).then(([, [lib, figures]]) => {
      const them = document.getElementById("profile-them");
      if (!them) return;
      const figs = figures.filter((f) => f.lien_quan_tinh.includes(slug));
      const figuresSection = figs.length
        ? `<details class="profile-section" open><summary>🗿 Nhân vật lịch sử — mô hình 3D (${figs.length})</summary>
            ${figs.map(figureCardHtml).join("")}
           </details>`
        : "";
      // Thư viện tự lọc và dựng khối này (thuvien.ts) — main.ts không còn phải
      // biết lược đồ của 5 loại tác phẩm để ghép HTML.
      them.innerHTML = figuresSection + htmlVanThoTinh(lib, slug);
      // Nạp lười mô hình 3D nhân vật khi người dùng mở từng thẻ.
      them.querySelectorAll<HTMLDetailsElement>("details.fig3d").forEach((d) => {
        d.addEventListener("toggle", () => {
          const host = d.querySelector<HTMLElement>(".fig3d-stage");
          const id = d.dataset.figure;
          if (d.open && host && id) void mountFigureInto(host, id);
        });
      });
    });
  } else {
    const slot = document.getElementById("profile-slot");
    if (slot) slot.innerHTML = "";
  }
}

// Trả WebGL context của mô hình 3D và nhân vật 3D trong hồ sơ tỉnh.
function disposeProvince3D(): void {
  activeModel3DDispose?.();
  activeModel3DDispose = null;
  disposeFigures();
}

// `province-panel` nằm trong PANEL_IDS nhưng chưa bao giờ được registerPanel,
// nên observer của panels.ts không chạy cho nó. Hệ quả: khi một module KHÁC ẩn
// panel này qua showOnly(), không chỗ nào dọn — mô hình Three.js giữ nguyên
// context cho tới khi trình duyệt thu hồi. Hai chỗ dọn viết tay bên dưới chỉ
// phủ đường đóng bằng nút × và đường đổi tỉnh. Đây là nửa còn lại của lỗi rò
// context đã vá cho journey/battle/olympia.
registerPanel("province-panel", disposeProvince3D);

document.getElementById("panel-close")?.addEventListener("click", () => {
  const panel = document.getElementById("province-panel");
  if (panel) panel.hidden = true;
  if (focusMode) exitFocus();
  disposeProvince3D();
});

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

const parseMediaImage = (raw: unknown): MediaImage => {
  const r = rec(raw);
  return {
    id: str(r.id),
    slug: str(r.slug),
    muc: str(r.muc),
    ten: str(r.ten),
    mo_ta: str(r.mo_ta),
    url: str(r.url),
    nguon: strs(r.nguon),
    tac_gia: str(r.tac_gia),
    giay_phep: str(r.giay_phep),
    ghi_chu: str(r.ghi_chu),
  };
};

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
  const data = await fetchJson("data/media/images.json", itemsOf(parseMediaImage));
  mediaCache = data?.items ?? [];
  return mediaCache;
}

function mediaImgHtml(m: MediaImage): string {
  const lic = esc(LICENSE_LABEL[m.giay_phep] ?? String(m.giay_phep ?? ""));
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

const parseHistFigure = (raw: unknown): HistFigure => {
  const r = rec(raw);
  return {
    id: str(r.id),
    ten: str(r.ten),
    thoi_dai: str(r.thoi_dai),
    cong_trang: str(r.cong_trang),
    tuong_dai_tham_chieu: str(r.tuong_dai_tham_chieu),
    nhan_hinh_dung: str(r.nhan_hinh_dung),
    lien_quan_tinh: strs(r.lien_quan_tinh),
    trang_thai: str(r.trang_thai),
    nguon: strs(r.nguon),
  };
};

let figuresCache: HistFigure[] | null = null;
const activeFigureDisposers: Array<() => void> = [];

async function loadFigures(): Promise<HistFigure[]> {
  if (figuresCache) return figuresCache;
  const data = await fetchJson("data/figures/figures-3d.json", itemsOf(parseHistFigure));
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
// 📚 Thư viện — toàn bộ mã nằm ở src/thuvien.ts. main.ts chỉ cấp đúng một việc
// mà thư viện không tự làm được: mở hồ sơ tỉnh từ slug trong `lien_quan_tinh`.
// ---------------------------------------------------------------------------
let geo34: GeoJSON.FeatureCollection | null = null;

/**
 * Mở hồ sơ một tỉnh y như đường bấm trên bản đồ.
 *
 * Kéo dòng thời gian về thời kỳ «34 tỉnh» trước — đứng ở thời kỳ khác thì tỉnh
 * vừa mở không có trên bản đồ phía sau. `setPeriod` → `setEra` đã gọi
 * `ensureEra()` sẵn, nên KHÔNG addSource lần hai.
 */
async function moTinhTheoSlug(slug: string): Promise<void> {
  const i34 = PERIODS.findIndex((p) => p.kind === "admin" && p.ref === 2);
  if (i34 >= 0 && currentPeriod !== i34) setPeriod(i34);
  if (!geo34) {
    const res = await fetch(`${import.meta.env.BASE_URL}${ERAS[2].file}`);
    geo34 = res.ok ? ((await res.json()) as GeoJSON.FeatureCollection) : null;
  }
  const f = geo34?.features.find(
    (x) => slugify(String(x.properties?.["Tỉnh thành mới"] ?? "")) === slug,
  );
  if (!f) return;
  hidePanel("library-panel");
  // Ép kiểu có chủ đích: showProvincePanel chỉ đọc `properties` và `geometry`.
  // Lấy feature qua map.querySourceFeatures() thì phụ thuộc khung nhìn — tỉnh
  // nằm ngoài màn hình không có trong tile đã nạp, nút sẽ im lặng không làm gì.
  showProvincePanel(f as unknown as MapGeoJSONFeature, ERAS[2]);
}

initThuVien((slug) => void moTinhTheoSlug(slug));

