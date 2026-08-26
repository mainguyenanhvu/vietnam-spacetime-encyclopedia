// Bản đồ cổ TƯƠNG TÁC — phủ ảnh scan đã căn lưới toạ độ (georef) lên bản đồ
// hiện tại, chỉnh được độ mờ, kèm điểm neo «tên xưa ↔ tên nay» bấm ra popup.
//
// Trước: một tấm Taberd 1838 gắn cứng trong main.ts (URL + 4 góc là hằng số
// TS). Nay: danh sách tấm phủ được đọc từ media/ban-do-co.json — tấm nào có
// khối `georef` (4 góc [lon,lat], cổng validate_media.mjs kiểm) là tự xuất
// hiện trong bảng lớp, thêm tấm mới chỉ còn là việc dữ liệu.
//
// Ràng buộc chủ quyền: mọi lớp ở đây chèn DƯỚI lớp nhãn đầu tiên của style
// (raster — xem `truocLopNhan`) và dưới `chu-quyen-labels` (điểm neo) — nhãn
// Hoàng Sa / Trường Sa luôn nằm trên cùng. Bẫy `beforeId` ghi ở PLAN mục 5 đã
// vấp thật một lần ở đây, chi tiết trong doc của `truocLopNhan`.

import type { Map as MlMap } from "maplibre-gl";
import { moPopup } from "./popup";
import { FONT_LABEL, textFont } from "./map-fonts";
import { esc } from "./util/html";
import { fetchJson } from "./util/fetch";
import { str, num, arr, rec } from "./types/parse";

interface DiemNeo {
  ten_xua: string;
  ten_nay: string;
  lat: number;
  lon: number;
  ghi_chu: string;
  do_tin_cay: string;
}

interface TamGeoref {
  id: string;
  ten: string;
  nam_hien_thi: string;
  anh: string;
  /** [Tây-Bắc, Đông-Bắc, Đông-Nam, Tây-Nam] — mỗi góc [lon, lat]. */
  goc: [[number, number], [number, number], [number, number], [number, number]];
  ghi_chu_georef: string;
  neo: DiemNeo[];
}

function parseGoc(v: unknown): TamGeoref["goc"] | null {
  if (!Array.isArray(v) || v.length !== 4) return null;
  const goc: [number, number][] = [];
  for (const c of v) {
    if (!Array.isArray(c)) return null;
    const lon = num(c[0]);
    const lat = num(c[1]);
    if (lon === null || lat === null) return null;
    goc.push([lon, lat]);
  }
  return goc as TamGeoref["goc"];
}

function parseTam(raw: unknown): TamGeoref | null {
  const o = rec(raw);
  const g = rec(o["georef"]);
  const goc = parseGoc(g["goc"]);
  const anh = str(o["anh"]);
  if (!goc || !anh) return null;
  return {
    id: str(o["id"]),
    ten: str(o["ten"]),
    nam_hien_thi: str(o["nam_hien_thi"], str(o["nam"])),
    anh,
    goc,
    ghi_chu_georef: str(g["ghi_chu"]),
    neo: arr(o["diem_neo"], (n) => {
      const d = rec(n);
      return {
        ten_xua: str(d["ten_xua"]),
        ten_nay: str(d["ten_nay"]),
        lat: num(d["lat"]) ?? 0,
        lon: num(d["lon"]) ?? 0,
        ghi_chu: str(d["ghi_chu"]),
        do_tin_cay: str(d["do_tin_cay"], "trung"),
      };
    }).filter((d) => d.lat !== 0 && d.lon !== 0),
  };
}

interface KhoBdc {
  tam: TamGeoref[];
  tongSoTam: number;
}

function parseKho(raw: unknown): KhoBdc {
  const items = arr(rec(raw)["items"], (x) => x);
  return {
    tam: items.map(parseTam).filter((t): t is TamGeoref => t !== null),
    tongSoTam: items.length,
  };
}

// ── Trạng thái ───────────────────────────────────────────────────────────
let kho: KhoBdc | null = null;
let dangTai = false;
const dangBat = new Set<string>();
const doMo = new Map<string, number>();
let neoBat = true;
let mapRef: MlMap | null = null;

const DO_MO_MAC_DINH = 0.6;
const TIN_CAY_CHU: Record<string, string> = {
  cao: "khớp chắc chắn",
  trung: "khớp tương đối",
  thap: "khớp dè dặt",
};

// ── Lớp trên bản đồ ──────────────────────────────────────────────────────

/**
 * Lớp mà ảnh phủ phải chèn TRƯỚC: lớp NHÃN đầu tiên của style hiện tại. Nền
 * bản đồ của dự án không có nhãn nào (ràng buộc chủ quyền), nên lớp symbol đầu
 * tiên luôn là nhãn do dự án tự vẽ — chèn trước nó thì mọi nhãn (tỉnh, sông–núi,
 * chủ quyền) nằm trên ảnh, còn ảnh vẫn phủ lên mảng tô ranh giới.
 *
 * 🔴 Bản đầu hỏi đích danh `${ERAS[0].id}-label`. Lớp đó SINH LƯỜI: lúc mở
 * trang chỉ era-34 tồn tại, nên hàm trả `undefined` và MapLibre chèn raster
 * LÊN TRÊN CÙNG. Đo được ở Chrome thật: raster @20–21 còn `chu-quyen-labels`
 * @19 — tức ảnh scan phủ mất nhãn Hoàng Sa / Trường Sa. Đây là bất biến #1,
 * không phải thứ tự vẽ cho đẹp.
 */
function truocLopNhan(map: MlMap): string | undefined {
  for (const l of map.getStyle().layers ?? []) if (l.type === "symbol") return l.id;
  return map.getLayer("chu-quyen-labels") ? "chu-quyen-labels" : undefined;
}

function apDungTam(t: TamGeoref, bat: boolean): void {
  const map = mapRef;
  if (!map) return;
  const id = `bdc-${t.id}`;
  if (bat && !map.getSource(id)) {
    map.addSource(id, { type: "image", url: t.anh, coordinates: t.goc });
    map.addLayer(
      {
        id,
        type: "raster",
        source: id,
        paint: { "raster-opacity": doMo.get(t.id) ?? DO_MO_MAC_DINH },
      },
      truocLopNhan(map),
    );
  }
  if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", bat ? "visible" : "none");
}

/** GeoJSON điểm neo của các tấm ĐANG BẬT — nguồn dựng lại mỗi lần đổi. */
function neoGeojson(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (const t of kho?.tam ?? []) {
    if (!dangBat.has(t.id)) continue;
    for (const n of t.neo)
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [n.lon, n.lat] },
        properties: {
          ten_xua: n.ten_xua,
          ten_nay: n.ten_nay,
          ghi_chu: n.ghi_chu,
          do_tin_cay: n.do_tin_cay,
          ban_do: t.ten,
          nam: t.nam_hien_thi,
        },
      });
  }
  return { type: "FeatureCollection", features };
}

function capNhatNeo(): void {
  const map = mapRef;
  if (!map) return;
  const data = neoGeojson();
  const src = map.getSource("bdc-neo") as { setData?: (d: unknown) => void } | undefined;
  if (!map.getSource("bdc-neo")) {
    map.addSource("bdc-neo", { type: "geojson", data });
    const before = map.getLayer("chu-quyen-labels") ? "chu-quyen-labels" : undefined;
    map.addLayer(
      {
        id: "bdc-neo-diem",
        type: "circle",
        source: "bdc-neo",
        paint: {
          "circle-radius": 6,
          "circle-color": "#7c5c34",
          "circle-opacity": 0.9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      } as never,
      before,
    );
    map.addLayer(
      {
        id: "bdc-neo-nhan",
        type: "symbol",
        source: "bdc-neo",
        layout: {
          "text-field": ["get", "ten_xua"],
          ...textFont(FONT_LABEL),
          "text-size": 12,
          "text-offset": [0, 1.1],
          "text-anchor": "top",
          "text-optional": true,
        },
        paint: {
          "text-color": "#7c5c34",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.4,
        },
      } as never,
      before,
    );
    map.on("click", "bdc-neo-diem", (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = rec(f.properties);
      const tinCay = str(p["do_tin_cay"]);
      moPopup(
        map,
        e.lngLat,
        `<div class="bdc-popup">
          <p class="bdc-popup-xua">«${esc(str(p["ten_xua"]))}»</p>
          <p class="bdc-popup-nay">nay là <b>${esc(str(p["ten_nay"]))}</b></p>
          <p class="bdc-popup-ghi-chu">${esc(str(p["ghi_chu"]))}</p>
          <p class="bdc-popup-nguon">Ghi trên: ${esc(str(p["ban_do"]))} (${esc(str(p["nam"]))}) · ${esc(TIN_CAY_CHU[tinCay] ?? tinCay)}</p>
        </div>`,
      );
    });
    map.on("mouseenter", "bdc-neo-diem", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "bdc-neo-diem", () => {
      map.getCanvas().style.cursor = "";
    });
  } else {
    src?.setData?.(data);
  }
  const hien = neoBat && data.features.length > 0 ? "visible" : "none";
  for (const id of ["bdc-neo-diem", "bdc-neo-nhan"])
    if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", hien);
}

// ── UI trong bảng lớp ────────────────────────────────────────────────────

function dungHang(t: TamGeoref): string {
  return `<label><input type="checkbox" data-bdc="${esc(t.id)}"/> ${esc(t.ten)} — ${esc(t.nam_hien_thi)} (xấp xỉ)</label>
    <label class="taberd-op bdc-op" data-bdc-op-cua="${esc(t.id)}" hidden>Độ mờ <input type="range" data-bdc-op="${esc(t.id)}" min="0" max="1" step="0.05" value="${DO_MO_MAC_DINH}"/></label>`;
}

function dungKhu(khu: HTMLElement): void {
  if (!kho) return;
  if (kho.tam.length === 0) {
    khu.innerHTML = `<p class="muted">Chưa tấm nào căn được lưới toạ độ.</p>`;
    return;
  }
  const conLai = kho.tongSoTam - kho.tam.length;
  khu.innerHTML = `${kho.tam.map(dungHang).join("")}
    <label><input type="checkbox" data-bdc-neo checked/> ⚓ Điểm neo địa danh của tấm đang bật</label>
    <p class="muted bdc-ghi-chu">Ảnh phủ căn XẤP XỈ theo lưới toạ độ trên tờ — để đối chiếu, không phải trắc địa.${
      conLai > 0
        ? ` ${conLai} tấm chưa căn được lưới nằm ở lớp phủ «Bản đồ cổ» và Thư viện.`
        : ""
    }</p>`;

  khu.addEventListener("change", (e) => {
    const el = e.target as HTMLInputElement;
    if (el.dataset["bdc"] !== undefined) {
      const t = kho?.tam.find((x) => x.id === el.dataset["bdc"]);
      if (!t) return;
      if (el.checked) dangBat.add(t.id);
      else dangBat.delete(t.id);
      apDungTam(t, el.checked);
      const op = khu.querySelector<HTMLElement>(`[data-bdc-op-cua="${t.id}"]`);
      if (op) op.hidden = !el.checked;
      capNhatNeo();
    }
    if (el.dataset["bdcNeo"] !== undefined) {
      neoBat = el.checked;
      capNhatNeo();
    }
  });
  khu.addEventListener("input", (e) => {
    const el = e.target as HTMLInputElement;
    const id = el.dataset["bdcOp"];
    if (id === undefined) return;
    const v = Number(el.value);
    doMo.set(id, v);
    if (mapRef?.getLayer(`bdc-${id}`)) mapRef.setPaintProperty(`bdc-${id}`, "raster-opacity", v);
  });
}

/**
 * Gọi một lần từ main.ts sau khi bảng lớp đã vào DOM. Vị trí chèn lớp do
 * `truocLopNhan()` tự tra ở thời điểm bật tấm — main.ts không cần biết.
 */
export function initBanDoCo(map: MlMap): void {
  mapRef = map;
  const chiTiet = document.getElementById("lc-bdc");
  const khu = document.getElementById("bdc-khu");
  if (!chiTiet || !khu) return;
  // Nạp lười: chỉ fetch khi người dùng mở mục «Bản đồ cổ» lần đầu.
  chiTiet.addEventListener("toggle", () => {
    if (!(chiTiet as HTMLDetailsElement).open || kho || dangTai) return;
    dangTai = true;
    void fetchJson("data/media/ban-do-co.json", parseKho).then((k) => {
      dangTai = false;
      if (!k) {
        khu.innerHTML = `<p class="muted">Không tải được danh sách bản đồ cổ.</p>`;
        return;
      }
      kho = k;
      dungKhu(khu);
    });
  });
}
