/**
 * ============================================================================
 * TÌM KIẾM TOÀN CỤC — src/search.ts
 * ============================================================================
 * Giải quyết khoảng trống lớn nhất tìm thấy ở docs/lich-su/ux-audit-plan.md (§3): 1921
 * điểm / 32 lớp phủ không có cách nào gõ tên để nhảy thẳng tới. Module này
 * tự chứa — không phụ thuộc bất kỳ hàm nội bộ nào của main.ts.
 *
 * MAIN CHỈ CẦN THÊM ĐÚNG 2 DÒNG SAU VÀO `main.ts` (sau khi `map` và
 * `OVERLAYS` đã khai báo, ví dụ ngay trong `map.on("load", ...)` cạnh
 * `buildLayerControl()`):
 *
 *   import { initSearch } from "./search";
 *   ...
 *   initSearch(map, OVERLAYS, (id) => toggleOverlay(id, true));
 *
 * `toggleOverlay(id, true)` đã có sẵn trong main.ts — theo đọc code, hàm này
 * tự return sớm nếu lớp đã bật (idempotent), nên an toàn gọi lại kể cả khi
 * người dùng chọn 1 kết quả thuộc lớp đang bật sẵn. Nếu hành vi thực tế khác
 * vậy, main cần tự bọc lại thành 1 hàm idempotent trước khi truyền vào.
 *
 * ⚠️ MỘT QUYẾT ĐỊNH THIẾT KẾ LỆCH VỚI YÊU CẦU GỐC — cần main duyệt lại:
 * Yêu cầu gốc là "tự gắn vào document.body". Tôi chọn gắn vào `#topbar`
 * (chèn giữa <h1> và <nav id="topbar-nav">) thay vì body, vì lý do cụ thể:
 * bất kỳ phần tử position:fixed/absolute nào gắn thẳng vào body đều có nguy
 * cơ đè lên `#layer-control` — panel này LUÔN mở sẵn (không có nút ẩn/hiện)
 * và ở màn 360-390px chiếm tới ~80vw chiều ngang (xem docs/lich-su/ux-audit-plan.md, phát
 * hiện 🔴#2: NavigationControl của MapLibre từng bị đúng lỗi này vì đặt sai
 * góc). Gắn vào `#topbar` loại bỏ hoàn toàn nguy cơ đó vì `#topbar` luôn vẽ
 * TRÊN mọi panel (z-index:30, xem style.css) và luôn nằm phía trên toạ độ
 * bắt đầu của `#layer-control`/`#province-panel` theo đúng bố cục hiện có.
 * `#topbar` và `#topbar-nav` đã có id tĩnh sẵn trong `index.html` — gắn vào
 * đây KHÔNG cần sửa `index.html`, vẫn giữ đúng tinh thần "main không phải
 * sửa gì ngoài main.ts". Nếu main vẫn muốn đúng `document.body`, chỉ cần sửa
 * hàm `mount()` bên dưới (1 chỗ duy nhất).
 *
 * NẠP LƯỜI: KHÔNG fetch bất kỳ file overlay nào khi module này được import.
 * Chỉ khi người dùng chạm vào ô tìm kiếm lần đầu (`focus`) mới fetch song
 * song 32 file JSON và giữ lại đúng {key, ten, norm, lon, lat, diaDiem,
 * overlayId/Label/Icon} — bỏ hẳn mo_ta/nguon/anh/... để giảm bộ nhớ. Số đo
 * thật (kích thước, thời gian) nằm trong báo cáo gửi kèm, không đo được từ
 * trong file này vì cần chạy trong trình duyệt thật.
 * ============================================================================
 */
import { moPopup } from "./popup";
import type { Map as MlMap } from "maplibre-gl";
import { esc } from "./util/html";
import { fetchJson } from "./util/fetch";
import { str, num, rec, itemsOf } from "./types/parse";

/** Cấu hình tối thiểu 1 lớp phủ mà module này cần — main truyền OVERLAYS
 * (kiểu rộng hơn, có thêm circleColor/nguon/popup) vào đây vẫn khớp vì
 * TypeScript so khớp theo cấu trúc (structural typing). */
export interface SearchOverlayConf {
  id: string;
  label: string;
  icon: string;
  file: string;
}

/** Mục lớp phủ ở dạng THÔ — chỉ 5 trường mà chỉ mục tìm kiếm cần. `lon`/`lat`
 *  để `number | null` vì mục thiếu toạ độ là chuyện bình thường trong dữ liệu
 *  (nhân vật chỉ biết cấp tỉnh), và null lọc được, còn NaN thì không. */
interface RawOverlayItem {
  id: string;
  ten: string;
  lon: number | null;
  lat: number | null;
  dia_diem: string;
}

const parseRawOverlayItem = (raw: unknown): RawOverlayItem => {
  const r = rec(raw);
  return {
    id: str(r.id),
    ten: str(r.ten),
    lon: num(r.lon),
    lat: num(r.lat),
    dia_diem: str(r.dia_diem),
  };
};

interface SearchIndexItem {
  key: string;
  ten: string;
  norm: string;
  lon: number;
  lat: number;
  diaDiem: string;
  overlayId: string;
  overlayLabel: string;
  overlayIcon: string;
}

/** Chuẩn hoá chuỗi tiếng Việt về không dấu + chữ thường để so khớp tìm kiếm.
 * "đ/Đ" KHÔNG tách được bằng NFD (là chữ cái gốc riêng, không phải tổ hợp),
 * nên phải thay riêng sau khi đã tách các dấu tổ hợp còn lại. */
export function normalizeVi(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/đ/g, "d")
    .trim();
}


let indexPromise: Promise<SearchIndexItem[]> | null = null;

/** Nạp lười + xây chỉ mục — chỉ chạy 1 lần / phiên (cache trong indexPromise),
 * bất kể initSearch() có được gọi lại hay không. */
function buildIndex(overlays: SearchOverlayConf[]): Promise<SearchIndexItem[]> {
  if (indexPromise) return indexPromise;
  indexPromise = Promise.all(
    overlays.map(async (conf) => {
      const data = await fetchJson(conf.file, itemsOf(parseRawOverlayItem));
      if (!data) return [];
      const out: SearchIndexItem[] = [];
      data.items.forEach((it, i) => {
        if (!it.ten || it.lon == null || it.lat == null) return;
        const ten = it.ten;
        out.push({
          key: it.id || `${conf.id}#${i}`,
          ten,
          norm: normalizeVi(ten),
          lon: it.lon,
          lat: it.lat,
          diaDiem: it.dia_diem || conf.label,
          overlayId: conf.id,
          overlayLabel: conf.label,
          overlayIcon: conf.icon,
        });
      });
      return out;
    }),
  ).then((groups) => groups.flat());
  return indexPromise;
}

/** Xếp hạng: khớp đầu chuỗi > khớp đầu 1 từ trong chuỗi > khớp chuỗi con.
 * Trong cùng hạng, tên ngắn hơn / theo abc tiếng Việt lên trước. */
export function rankAndFilter(
  index: SearchIndexItem[],
  query: string,
  limit = 20,
): SearchIndexItem[] {
  const q = normalizeVi(query);
  if (!q) return [];
  const scored: Array<{ item: SearchIndexItem; score: number }> = [];
  for (const item of index) {
    let score: number | null = null;
    if (item.norm.startsWith(q)) score = 0;
    else if (item.norm.split(/\s+/).some((w) => w.startsWith(q))) score = 1;
    else if (item.norm.includes(q)) score = 2;
    if (score !== null) scored.push({ item, score });
  }
  scored.sort(
    (a, b) =>
      a.score - b.score ||
      a.item.ten.length - b.item.ten.length ||
      a.item.ten.localeCompare(b.item.ten, "vi"),
  );
  return scored.slice(0, limit).map((s) => s.item);
}

export function initSearch(
  map: MlMap,
  overlays: SearchOverlayConf[],
  onNeedLayer: (id: string) => void | Promise<void>,
): void {
  const topbar = document.getElementById("topbar");
  const topbarNav = document.getElementById("topbar-nav");
  if (!topbar) return; // phòng thủ — không có #topbar thì bỏ qua, không throw

  const wrap = document.createElement("div");
  wrap.id = "vn-search";
  wrap.innerHTML = `
    <input
      id="vn-search-input"
      type="text"
      role="combobox"
      aria-expanded="false"
      aria-controls="vn-search-listbox"
      aria-autocomplete="list"
      aria-activedescendant=""
      autocomplete="off"
      placeholder="🔍 Tìm địa danh, nhân vật… ( / hoặc Ctrl+K )"
    />
    <ul id="vn-search-listbox" role="listbox" hidden></ul>
    <span id="vn-search-status" class="vn-sr-only" aria-live="polite"></span>
  `;
  if (topbarNav) topbar.insertBefore(wrap, topbarNav);
  else topbar.appendChild(wrap);

  const input = wrap.querySelector<HTMLInputElement>("#vn-search-input");
  const listbox = wrap.querySelector<HTMLUListElement>("#vn-search-listbox");
  const status = wrap.querySelector<HTMLSpanElement>("#vn-search-status");
  if (!input || !listbox || !status) return; // không thể xảy ra (vừa tự tạo ở trên), chỉ để thoả strict null-check

  let allItems: SearchIndexItem[] = [];
  let results: SearchIndexItem[] = [];
  let activeIdx = -1;
  let debounceTimer: number | undefined;

  function openDropdown(): void {
    listbox!.hidden = false;
    input!.setAttribute("aria-expanded", "true");
  }
  function closeDropdown(): void {
    listbox!.hidden = true;
    input!.setAttribute("aria-expanded", "false");
    input!.setAttribute("aria-activedescendant", "");
    activeIdx = -1;
  }

  function renderResults(): void {
    if (!results.length) {
      listbox!.innerHTML = `<li class="vn-search-empty">Không tìm thấy kết quả</li>`;
      status!.textContent = "Không tìm thấy kết quả";
      openDropdown();
      return;
    }
    listbox!.innerHTML = results
      .map(
        (r, i) => `
        <li id="vn-search-opt-${i}" role="option" class="vn-search-opt${i === activeIdx ? " active" : ""}" aria-selected="${i === activeIdx}">
          <span class="vn-search-icon">${esc(r.overlayIcon)}</span>
          <span class="vn-search-name">${esc(r.ten)}</span>
          <span class="vn-search-loc">${esc(r.diaDiem)}</span>
        </li>`,
      )
      .join("");
    status!.textContent = `${results.length} kết quả`;
    openDropdown();
    listbox!.querySelectorAll<HTMLLIElement>("li.vn-search-opt").forEach((li, i) => {
      li.addEventListener("mousedown", (e) => {
        e.preventDefault(); // giữ focus ở input, tránh blur chạy trước click
        void selectResult(results[i]);
      });
    });
  }

  function setActive(i: number): void {
    if (!results.length) return;
    activeIdx = (i + results.length) % results.length;
    input!.setAttribute("aria-activedescendant", `vn-search-opt-${activeIdx}`);
    renderResults();
  }

  async function selectResult(item: SearchIndexItem): Promise<void> {
    closeDropdown();
    input!.value = item.ten;
    map.flyTo({ center: [item.lon, item.lat], zoom: Math.max(map.getZoom(), 11), essential: true });
    await onNeedLayer(item.overlayId);
    // Popup riêng, đơn giản — KHÔNG dùng lại popup HTML đầy đủ của từng lớp
    // (OverlayConf.popup) vì chỉ mục tìm kiếm cố tình bỏ mo_ta/anh/nguon để
    // nhẹ bộ nhớ (yêu cầu bắt buộc), nên không còn đủ dữ liệu để dựng lại
    // popup gốc. Người dùng cần xem đầy đủ thì bấm thẳng vào điểm trên bản đồ.
    moPopup(
      map,
      [item.lon, item.lat],
      `<strong>${esc(item.overlayIcon)} ${esc(item.ten)}</strong><br/>` +
        `<span style="font-size:0.82em;color:#57534e">${esc(item.diaDiem)}</span>`,
      { maxWidth: "280px" },
    );
  }

  async function ensureIndex(): Promise<void> {
    if (allItems.length) return;
    status!.textContent = "Đang tải chỉ mục…";
    allItems = await buildIndex(overlays);
  }

  input.addEventListener("focus", () => {
    void ensureIndex();
  });

  input.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      void (async () => {
        await ensureIndex();
        const q = input!.value.trim();
        if (!q) {
          closeDropdown();
          status!.textContent = "";
          return;
        }
        results = rankAndFilter(allItems, q, 20);
        activeIdx = -1;
        renderResults();
      })();
    }, 100);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(activeIdx + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(activeIdx - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = activeIdx >= 0 ? results[activeIdx] : results[0];
      if (pick) void selectResult(pick);
    } else if (e.key === "Escape") {
      // Chặn không cho nổi bọt lên listener Escape-đóng-panel toàn cục (nếu
      // main có thêm ở main.ts) — Escape ở đây chỉ nên đóng dropdown tìm
      // kiếm, không đóng nhầm panel khác đang mở phía sau.
      e.stopPropagation();
      closeDropdown();
      input!.blur();
    }
  });

  input.addEventListener("blur", () => {
    // Trễ 1 nhịp để "mousedown" chọn kết quả (đã preventDefault ở trên) kịp
    // chạy trước khi dropdown đóng do mất focus.
    window.setTimeout(() => closeDropdown(), 120);
  });

  document.addEventListener("keydown", (e) => {
    const active = document.activeElement as HTMLElement | null;
    const tag = (active?.tagName ?? "").toLowerCase();
    const inEditable = tag === "input" || tag === "textarea" || tag === "select" || !!active?.isContentEditable;
    if (e.key === "/" && !inEditable) {
      e.preventDefault();
      input!.focus();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      input!.focus();
    }
  });
}
