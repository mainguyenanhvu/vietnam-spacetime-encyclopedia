// ═══════════════════════════════════════════════════════════════════════
// LIÊN KẾT TRẠNG THÁI — permalink kiểu Google Maps: copy URL là giữ nguyên
// thời kỳ + lớp phủ đang bật + vị trí camera. Dạng hash:
//   #tk=<chỉ số thời kỳ>&lop=<id1.id2>&cam=<zoom>/<lat>/<lon>
//
// Cùng triết lý với chip-bar: KHÔNG gọi thẳng hàm nội bộ của main.ts —
// khôi phục trạng thái bằng cách mô phỏng thao tác người dùng lên chính
// các control có sẵn (#lc-period, checkbox name=overlay) rồi dispatch
// "change", nên mọi logic nạp lười / 3D / chip đều chạy y như người bấm.
//
// Ghi hash bằng history.replaceState — không đẻ thêm mục lịch sử trình
// duyệt mỗi lần kéo bản đồ.
// ═══════════════════════════════════════════════════════════════════════

import type maplibregl from "maplibre-gl";

function docHash(): URLSearchParams {
  return new URLSearchParams(location.hash.replace(/^#/, ""));
}

export function initLienKetTrangThai(map: maplibregl.Map): void {
  const chon = document.getElementById("lc-period") as HTMLSelectElement | null;

  // ── Khôi phục từ hash (một lần, lúc mở trang) ─────────────────────────
  const p = docHash();
  const cam = p.get("cam");
  if (cam) {
    const [z, lat, lon] = cam.split("/").map(Number);
    // Chỉ nhảy khi cả ba số hợp lệ và nằm quanh Việt Nam — hash rác không
    // được phép quăng người dùng ra giữa Đại Tây Dương.
    if ([z, lat, lon].every(Number.isFinite) && lat > 4 && lat < 25 && lon > 100 && lon < 120) {
      map.jumpTo({ center: [lon, lat], zoom: Math.min(Math.max(z, 3), 18) });
    }
  }
  const tk = p.get("tk");
  if (tk !== null && chon && chon.querySelector(`option[value="${tk}"]`)) {
    chon.value = tk;
    chon.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const lop = p.get("lop");
  if (lop) {
    for (const id of lop.split(".")) {
      const cb = document.querySelector<HTMLInputElement>(
        `#layer-control input[name=overlay][value="${id}"]`,
      );
      if (cb && !cb.checked) {
        cb.checked = true;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  // ── Đồng bộ hash theo thao tác (debounce — kéo bản đồ bắn moveend dày) ──
  let hen: number | undefined;
  const ghi = (): void => {
    window.clearTimeout(hen);
    hen = window.setTimeout(() => {
      const c = map.getCenter();
      const phan = new URLSearchParams();
      if (chon) phan.set("tk", chon.value);
      const bat = [
        ...document.querySelectorAll<HTMLInputElement>(
          "#layer-control input[name=overlay]:checked",
        ),
      ].map((cb) => cb.value);
      if (bat.length) phan.set("lop", bat.join("."));
      phan.set(
        "cam",
        `${map.getZoom().toFixed(2)}/${c.lat.toFixed(4)}/${c.lng.toFixed(4)}`,
      );
      history.replaceState(null, "", `#${phan.toString()}`);
    }, 350);
  };

  map.on("moveend", ghi);
  document.getElementById("layer-control")?.addEventListener("change", ghi);
  // Kéo thanh thời gian không đi qua #layer-control — bắt riêng.
  document.getElementById("timeline")?.addEventListener("input", ghi);
}
