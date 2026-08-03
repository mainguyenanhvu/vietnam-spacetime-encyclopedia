// MỘT popup sống tại một thời điểm.
//
// Trước đây 5 chỗ trong mã tự gọi `new maplibregl.Popup(...).addTo(map)`. Hệ quả
// đo được:
//  1. `closeOnClick` của MapLibre chỉ đóng khi bấm vào CANVAS bản đồ. Bấm vào
//     bảng lớp, nút topbar, hay mở hồ sơ tỉnh thì popup cũ nằm lại lơ lửng trên
//     bản đồ — đúng chỗ chủ dự án chỉ ra.
//  2. Mỗi lớp phủ đăng ký handler click cho CẢ lớp vòng tròn lẫn lớp icon
//     (bindOverlayInteractions gọi hai lần). Bấm trúng chỗ cả hai cùng vẽ thì
//     hai popup chồng khít lên nhau — nhìn như một cái nhưng đóng một lần chỉ
//     mất một cái.
//
// Giữ tham chiếu ở đây rồi gỡ cái cũ trước khi mở cái mới xử lý cả hai.

import maplibregl from "maplibre-gl";
import type { LngLatLike, Map as MlMap, PopupOptions } from "maplibre-gl";

let dangMo: maplibregl.Popup | null = null;

/** Đóng popup đang mở (nếu có). An toàn khi gọi nhiều lần. */
export function dongPopup(): void {
  const p = dangMo;
  dangMo = null; // xoá trước: remove() phát sự kiện "close" chạy lại vào đây
  p?.remove();
}

/**
 * Mở popup, tự đóng cái đang mở.
 *
 * @param map     bản đồ đích.
 * @param lngLat  vị trí neo.
 * @param html    nội dung — người gọi PHẢI tự escape dữ liệu người dùng.
 * @param tuyChon ghi đè tuỳ chọn MapLibre (offset, maxWidth…).
 */
export function moPopup(
  map: MlMap,
  lngLat: LngLatLike,
  html: string,
  tuyChon: PopupOptions = {},
): maplibregl.Popup {
  dongPopup();
  const p = new maplibregl.Popup({ offset: 10, maxWidth: "320px", ...tuyChon })
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(map);
  p.on("close", () => {
    if (dangMo === p) dangMo = null;
  });
  dangMo = p;
  return p;
}
