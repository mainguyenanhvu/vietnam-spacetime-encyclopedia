// Ranh giới giữa JSON (không kiểu) và ứng dụng (có kiểu).
//
// Không dùng thư viện validate (zod ~60 kB runtime cho một web tĩnh là không
// đáng): schema đã được 12 validator .mjs kiểm ở CI, chỗ này chỉ cần ÉP KIỂU
// AN TOÀN chứ không cần báo lỗi schema chi tiết.
//
// 🔴 QUY ƯỚC QUAN TRỌNG: mọi trường SẼ ĐI VÀO HTML đều khai là `string`, kể cả
// trường "vốn là số" (`nam`, `xep_hang`, `do_kho`). Lý do: `esc()` có chữ ký hẹp
// `(s: string)` nên `esc(o.nam)` không biên dịch được khi `nam: number` — người
// viết buộc phải bỏ `esc` hoặc gõ `esc(String(...))`, và bỏ `esc` chính là cách
// 7 sink XSS trước đây ra đời. Khai thành `string` ngay từ hàm parse thì
// `esc(o.nam)` chạy tự nhiên, còn ai khai trường mới kiểu `number` rồi định
// `esc()` nó sẽ bị `tsc` chặn ngay tại chỗ gọi.
//
// Đo trên dữ liệu thật ngày 2026-08-05: `nam` có 513 giá trị số và 35 giá trị
// chuỗi ("Thời Hùng Vương"); `xep_hang` có 22 số và 82 chuỗi, trong đó có cả câu
// văn dài. Lời khai `number` là sai với chính dữ liệu của dự án.

/**
 * Ép giá trị JSON bất kỳ về chuỗi an toàn để nhét vào HTML.
 * Số, boolean → chuỗi. null/undefined → `fallback`.
 */
export const str = (v: unknown, fallback = ""): string =>
  v == null ? fallback : typeof v === "string" ? v : String(v);

/** Số hữu hạn hoặc null — dùng cho lon/lat, KHÔNG dùng cho trường hiển thị. */
export const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/** Mảng đã map qua `item`; không phải mảng → []. */
export const arr = <T>(v: unknown, item: (x: unknown) => T): T[] =>
  Array.isArray(v) ? v.map(item) : [];

/** Mảng chuỗi — dạng hay gặp nhất (`sources`, `nguon`, `lien_quan_tinh`). */
export const strs = (v: unknown): string[] => arr(v, (x) => str(x));

/** Giá trị phải nằm trong tập cho trước, ngược lại lấy `fallback`. */
export const oneOf = <T extends string>(v: unknown, opts: readonly T[], fallback: T): T =>
  typeof v === "string" && (opts as readonly string[]).includes(v) ? (v as T) : fallback;

/** Ép về Record để đọc field mà không cần `as any`. */
export const rec = (v: unknown): Record<string, unknown> =>
  typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};

/**
 * Bọc một hàm parse mục thành hàm parse cả file dạng `{ items: [...] }` —
 * wrapper phổ biến nhất của dự án (xem `_index/catalog.json`).
 */
export const itemsOf =
  <T>(item: (raw: unknown) => T) =>
  (raw: unknown): { items: T[] } => ({ items: arr(rec(raw).items, item) });
