// Tiện ích dựng HTML dùng chung.
//
// Gom 9 bản sao `esc()` y hệt nhau rải khắp src/. Đợt này mới nối được 5 file
// (journey, quocgia, timeline, game, quiz); main.ts / battle.ts / olympia.ts /
// story.ts vẫn giữ bản cục bộ vì đang có agent khác sửa — xem
// scratchpad/esc-gom-ve-util.diff để nối nốt.
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
