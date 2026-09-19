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
 * Đổi URL ảnh GỐC trên Wikimedia Commons sang bản thu nhỏ do chính Wikimedia sinh.
 *
 * VÌ SAO CẦN: bản quét bản đồ cổ là ảnh khổng lồ — đo thật trong popup Hoàng Sa
 * ngày 2026-09-19: Vandermaelen 10100×6906, Hondius 7689×5952, Taberd 3500×6111.
 * Một popup liệt 5 tấm là kéo về vài chục MB cho một khung cao 180px. Sau 6 giây
 * tấm Vandermaelen vẫn chưa tải xong.
 *
 * VÌ SAO ĐỔI LÚC RENDER CHỨ KHÔNG SỬA DỮ LIỆU: trường `anh` trong tệp phải giữ
 * URL bản gốc — đó là xuất xứ, và cổng `validate_media.mjs` kiểm chính chuỗi đó.
 * Kích cỡ là chuyện trình bày, không phải chuyện tư liệu.
 *
 * Bản thu nhỏ vẫn nằm trên `upload.wikimedia.org` nên KHÔNG phải nới CSP.
 *
 * 🔴 `rong` CHỈ ĐƯỢC LÀ 960 HOẶC 1280 — đo thật trong Chrome ngày 2026-09-19 trên
 * cả 7 tấm có ảnh: hai mốc đó nạp được 7/7, còn 320 · 480 · 640 · 800 · 1024 thì
 * HỎNG 7/7. Wikimedia chỉ phục vụ bản thu nhỏ ở một số mốc dựng sẵn; mốc ngoài
 * danh sách trả lỗi chứ không tự dựng. Suy một con số "nghe hợp lý" là ra ô ảnh vỡ.
 * ⚠️ Đừng đo bằng `curl`: tầng chống bot của Wikimedia trả 400/429 cho mọi mốc,
 * kể cả mốc đúng — phép đo duy nhất tin được là nạp `new Image()` trong trình duyệt.
 *
 * Trả nguyên URL vào khi: không phải ảnh Commons, hoặc đã là URL `/thumb/` rồi
 * (đổi hai lần thì hỏng đường dẫn, và lỗi đó không có dấu hiệu nào trên console —
 * chỉ là một ô ảnh vỡ).
 */
export const anhCommonsNho = (url: string, rong: 960 | 1280): string => {
  const m = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+\/)([0-9a-f])\/([0-9a-f]{2})\/([^/]+)$/.exec(url);
  if (!m || url.includes("/thumb/")) return url;
  const [, goc, a, ab, ten] = m;
  return `${goc}thumb/${a}/${ab}/${ten}/${rong}px-${ten}`;
};

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
