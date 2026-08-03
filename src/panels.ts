// Sổ đăng ký panel — MỘT danh sách thay cho 9 danh sách hard-code rải rác.
//
// Vấn đề đang giải:
//  1. Mỗi module tự giữ một mảng id panel để ẩn. 9 mảng, không mảng nào đủ 11
//     panel → mở «Dòng thời gian» rồi mở «Nam tiến» thì hai panel chồng nhau.
//  2. Nặng hơn: panel bị ẩn bằng `hidden = true` từ module KHÁC sẽ không chạy
//     hàm dọn của chính nó. journey.ts mount một WebGLRenderer cho mô hình 3D;
//     bị battle.ts ẩn hộ thì renderer không bao giờ được dispose. Đo thật: 20
//     lượt chuyển Hành trình↔Sa đồ tạo 22 context, Chrome mất 6 context và in
//     «Too many active WebGL contexts» 6 lần — canvas bản đồ có thể là nạn nhân.
//
// Vì sao dùng MutationObserver chứ không chỉ gọi callback trong showOnly():
// main.ts / battle.ts / olympia.ts / story.ts CHƯA di trú sang module này và
// vẫn ẩn panel trực tiếp. Không thể trông chờ chúng hợp tác. Quan sát thuộc
// tính `hidden` thì bắt được MỌI đường ẩn, kể cả code chưa di trú và cả
// `el.hidden = true` gõ tay trong DevTools. Khi các module kia di trú xong,
// cơ chế này vẫn đúng, không phải gỡ bỏ.

import { dongPopup } from "./popup";

/**
 * Danh sách CHÍNH THỨC mọi panel nổi. Kiểu union bên dưới khiến gõ sai id bị
 * `tsc` bắt ngay lúc biên dịch thay vì âm thầm không ẩn được panel nào.
 */
export const PANEL_IDS = [
  "province-panel",
  "library-panel",
  "game-panel",
  "quiz-panel",
  "story-panel",
  "namtien-panel",
  "olympia-panel",
  "battle-panel",
  "journey-panel",
  "quocgia-panel",
  "timeline-panel",
] as const;

export type PanelId = (typeof PANEL_IDS)[number];

/** id → hàm dọn tài nguyên, chạy mỗi khi panel chuyển sang ẩn. */
const cleanups = new Map<PanelId, () => void>();
const observed = new Set<PanelId>();

const el = (id: PanelId): HTMLElement | null => document.getElementById(id);

/**
 * Khai báo một panel và (tuỳ chọn) hàm dọn tài nguyên của nó.
 *
 * `onHide` chạy mỗi lần panel chuyển từ hiện sang ẩn — bất kể ai ẩn nó. Hàm
 * này PHẢI idempotent vì có thể bị gọi thêm một lần từ chính nút đóng.
 *
 * @param id     id panel, phải nằm trong {@link PANEL_IDS}.
 * @param onHide Dọn tài nguyên (dispose WebGL, clearInterval, gỡ class…).
 */
export function registerPanel(id: PanelId, onHide?: () => void): void {
  if (onHide) cleanups.set(id, onHide);
  if (observed.has(id)) return;
  const node = el(id);
  if (!node) return;
  observed.add(id);
  new MutationObserver(() => {
    if (node.hidden) cleanups.get(id)?.();
  }).observe(node, { attributes: true, attributeFilter: ["hidden"] });
}

/** Ẩn một panel (kéo theo `onHide` của nó qua observer). */
export function hidePanel(id: PanelId): void {
  const node = el(id);
  if (node && !node.hidden) node.hidden = true;
}

/**
 * Ẩn TẤT CẢ panel rồi hiện đúng một panel.
 *
 * Đóng luôn popup bản đồ: `closeOnClick` của MapLibre chỉ bắt cú bấm rơi vào
 * canvas, nên mở panel bằng nút topbar sẽ để popup cũ nằm lại đè lên bản đồ.
 */
export function showOnly(id: PanelId): void {
  dongPopup();
  for (const other of PANEL_IDS) if (other !== id) hidePanel(other);
  const node = el(id);
  if (node) node.hidden = false;
}

/** Ẩn tất cả panel — dùng khi mở một màn không có panel riêng. */
export function hideAllPanels(): void {
  dongPopup();
  for (const id of PANEL_IDS) hidePanel(id);
}
