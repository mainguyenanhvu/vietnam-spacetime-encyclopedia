// Fontstack HỢP LỆ của endpoint glyph đang dùng — chốt bằng kiểu, để `tsc` bắt
// thay vì phải mở trình duyệt mới thấy.
//
// Vì sao đáng một file riêng: xin một fontstack không tồn tại → range .pbf trả
// 404 → MapLibre gom MỌI fontstack của cùng một source vào một lượt getGlyphs
// rồi `await Promise.all`, nên một reject làm hỏng TOÀN BỘ tile của source đó —
// mất luôn những lớp không hề cần font (line, circle). Đây là nguyên nhân gốc
// của bug «lớp sông núi không hiển thị» đã lặp lại nhiều đợt.
//
// Danh sách dưới đây phải khớp đúng các thư mục có thật trong `public/fonts/`.
// Thêm font mới thì thêm cả thư mục glyph lẫn một nhánh vào union này.

/** Chỉ hai giá trị này có thư mục glyph trong `public/fonts/`. */
export type FontStack = ["Open Sans Semibold"] | ["Noto Sans Regular"];

/** Nhãn chữ: tên tỉnh, sông, núi, nhãn chủ quyền. */
export const FONT_LABEL: FontStack = ["Open Sans Semibold"];

/** Ký hiệu hình học (▲ đỉnh núi, U+25B2) — Open Sans Semibold không có glyph này. */
export const FONT_SYMBOL: FontStack = ["Noto Sans Regular"];

/**
 * Mảnh `{ "text-font": … }` để spread vào `layout` của lớp `symbol`.
 *
 * Vì sao là hàm chứ không phải hằng số trần: ba lời gọi `map.addLayer` trong
 * `main.ts` ép cả object literal bằng `as never`, mà `as never` nuốt sạch kiểm
 * tra kiểu bên trong. Đối số của một lời gọi hàm thì vẫn được kiểm bình thường,
 * nên gói fontstack vào tham số là cách duy nhất giữ được ràng buộc ở đúng chỗ
 * dễ gõ sai nhất.
 *
 * Vì sao spread chứ không bọc cả object `layout`: bọc cả object qua một generic
 * làm mất suy luận tuple của các biểu thức MapLibre — `["get", "ten"]` tụt
 * xuống `string[]` và style-spec từ chối. Spread giữ nguyên contextual typing
 * cho những khoá còn lại.
 */
export const textFont = (font: FontStack): { "text-font": FontStack } => ({
  "text-font": font,
});
