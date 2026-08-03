// Phân loại hình khối cho điểm di tích trên bản đồ 3D.
//
// Tách khỏi landmarks3d.ts CÓ CHỦ Ý: file kia import Three.js (~600 KB) và được
// nạp lười ở lần bật 3D đầu tiên. main.ts cần gọi kieuTheoTen() để gom điểm, mà
// import thẳng từ landmarks3d.ts sẽ kéo cả Three.js vào bundle chính — mất sạch
// tác dụng của việc nạp lười, kể cả với người không bao giờ mở chế độ 3D.

export type KieuMoHinh = "chua" | "thap" | "thanh" | "bia" | "nui";

export interface DiemMoHinh {
  lon: number;
  lat: number;
  kieu: KieuMoHinh;
}

/**
 * Đoán loại công trình từ tên mục. Dữ liệu di tích không có trường "kiến trúc"
 * riêng, nhưng tên gọi tiếng Việt gần như luôn mở đầu bằng loại hình.
 *
 * Thứ tự kiểm tra có ý nghĩa: "Tháp" đứng trước vì «Tháp Chăm Po Nagar» cũng
 * chứa chữ «đền» ở tên đầy đủ; "thành" đứng sau "chùa/đền" vì «Đền thờ … thành
 * hoàng» không phải một toà thành.
 *
 * Không khớp gì thì về "bia": bia/đài là hình trung tính nhất cho một điểm được
 * đánh dấu, không gợi sai kiến trúc như việc mặc định dựng một ngôi chùa.
 */
export function kieuTheoTen(ten: string): KieuMoHinh {
  const t = ten.toLowerCase();
  if (/\btháp\b|chăm|chàm|po nagar|pô nagar/.test(t)) return "thap";
  if (/chùa|đền|đình|miếu|thiền viện|văn miếu|lăng|nhà thờ|thánh thất/.test(t)) return "chua";
  if (/thành|cổ loa|hoàng thành|kinh thành|luỹ|lũy|đồn|pháo đài|nhà tù|nhà lao|căn cứ/.test(t))
    return "thanh";
  if (/núi|hang|động|đèo|hòn|đảo|vịnh|thác|suối|rừng|hồ /.test(t)) return "nui";
  return "bia";
}
