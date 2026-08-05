// Tiện ích dựng HTML dùng chung.
//
// Gom 9 bản sao `esc()` y hệt nhau rải khắp src/. Nối xong cả 9 ngày 2026-08-05
// (5 file đợt đầu: journey, quocgia, timeline, game, quiz — 4 file còn lại:
// main, battle, olympia, story — cộng `escHtml` của search.ts, cùng thân hàm
// nhưng khác tên nên các lượt dò trùng trước đều bỏ sót).
//
// CHỮ KÝ HẸP LÀ CỐ Ý: `esc(s: string)` từ chối `number`. Nhờ vậy khi lớp
// parse dữ liệu ra đời (B13b), trường nào khai nhầm kiểu số sẽ bị `tsc` chặn
// ngay tại chỗ gọi thay vì lọt xuống HTML thành lỗ XSS.

/** Escape 5 ký tự nguy hiểm trước khi nhét chuỗi vào HTML. */
export const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Khối «📚 Nguồn» có thể gập.
 *
 * @param nguon Danh sách nguồn; rỗng/undefined thì trả chuỗi rỗng.
 * @param cls   Tên class của `<details>`. Mỗi màn dùng class riêng để giữ
 *              nguyên CSS sẵn có (`sources`, `tl-sources`, `qg-sources`).
 */
export const sourcesHtml = (nguon: string[] | undefined, cls = "sources"): string =>
  nguon?.length
    ? `<details class="${cls}"><summary>📚 Nguồn</summary><ul>${nguon
        .map((n) => `<li>${esc(n)}</li>`)
        .join("")}</ul></details>`
    : "";
