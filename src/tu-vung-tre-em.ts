// Từ vựng chế độ trẻ em.
//
// Chữ trên giao diện đang viết bằng ngôn ngữ hồ sơ di sản: "cương vực", "khoa
// bảng", "bảo vật quốc gia", "công viên địa chất". Người lớn đọc là hiểu; trẻ
// em thì không, mà chế độ trẻ em hiện mới chỉ đổi màu và cỡ chữ — nội dung vẫn
// nguyên như cũ.
//
// Ở đây chỉ đổi CÁCH GỌI, không đổi cái được gọi: "Bảo vật quốc gia" thành
// "Báu vật của đất nước" vẫn trỏ đúng lớp đó, đúng dữ liệu đó. Chỗ nào đổi chữ
// làm sai nghĩa pháp lý thì KHÔNG đưa vào đây — ghi chú cương vực là ví dụ, nó
// có hẳn hai bản viết riêng trong main.ts thay vì một phép thay chuỗi.
//
// Khoá KHÔNG có trong bảng thì giữ nguyên nhãn người lớn: thiếu bản trẻ em còn
// hơn có một bản dịch sai.

/** Tên cụm chủ đề trong bảng lớp bản đồ. Khoá = id cụm trong OVERLAY_GROUPS. */
export const CUM_TRE_EM: Record<string, string> = {
  "di-san": "Đền chùa và thành cổ",
  "quan-su": "Trận đánh và tướng giỏi",
  "vua-khoa-bang": "Vua chúa và ông trạng",
  "nu-dan-toc": "Phụ nữ tài giỏi và các dân tộc",
  "tin-nguong": "Thần, nhà sư và ông tổ nghề",
  "van-hoa-khoa-hoc": "Nhà văn, nhà khoa học, vận động viên",
  "cach-mang": "Anh hùng cách mạng",
  "huyen-su": "Chuyện xưa tích cũ",
  "ban-do-co": "Bản đồ vẽ từ đời xưa",
  khac: "Thứ khác",
};

/** Nhãn lớp phủ. Khoá = id lớp trong OVERLAYS. */
export const LOP_TRE_EM: Record<string, string> = {
  unesco: "Kỳ quan được cả thế giới công nhận",
  "di-tich-qgdb": "Di tích đặc biệt của cả nước",
  "di-tich-quoc-gia": "Đền, chùa, thành, hang cổ",
  "bao-vat-quoc-gia": "Báu vật của đất nước",
  "di-tich-cach-mang": "Nhà tù và căn cứ kháng chiến",
  "chien-dich-tran-danh": "Những trận đánh lớn",
  "danh-nhan-quan-su-co-trung-dai": "Tướng giỏi thời xưa",
  "nghia-si-can-vuong": "Nghĩa sĩ chống Pháp",
  "vua-hoang-de": "Các vua nước ta",
  "khoa-bang-danh-nhan": "Ông trạng, ông nghè",
  "su-than-ngoai-giao": "Người đi sứ nước ngoài",
  "danh-nhan-cac-trieu": "Người tài các đời vua",
  "danh-nhan-dan-toc-thieu-so": "Người tài của các dân tộc",
  "thanh-hoang-danh-than": "Thần giữ làng",
  "thien-su-cao-tang": "Các nhà sư nổi tiếng",
  "to-nghe-danh-than": "Ông tổ các nghề",
  "le-hoi-truyen-thong": "Lễ hội",
  "danh-y-luong-y": "Thầy thuốc giỏi ngày xưa",
  "danh-nhan-van-hoa-can-hien-dai": "Nhà văn, nhạc sĩ, hoạ sĩ",
  "tri-thuc-khoa-hoc-tk20": "Nhà khoa học",
  "nha-the-thao-lich-su": "Vận động viên nổi tiếng",
  "nghe-nhan-di-san": "Nghệ nhân giữ nghề xưa",
  "anh-hung-can-hien-dai": "Anh hùng",
  "chi-si-cach-mang": "Người làm cách mạng",
  "me-vnah": "Mẹ Việt Nam anh hùng",
  "thieu-nien-anh-hung": "Bạn nhỏ anh hùng",
  "nghia-trang-liet-si": "Nghĩa trang liệt sĩ",
  "huyen-su-khai-quoc": "Chuyện dựng nước thuở xưa",
  "truyen-thuyet-dan-gian": "Truyện truyền thuyết",
  "ban-do-co": "Ngày xưa chỗ này gọi là gì",
};

/** Tiêu đề và nhãn cố định trong bảng lớp bản đồ. Khoá = id phần tử/mục. */
export const NHAN_TRE_EM: Record<string, string> = {
  "lc-tieu-de": "Xem gì trên bản đồ",
  "lc-nhan-thoi-ky": "Thời nào?",
  "lc-lop-phu": "Các thứ trên bản đồ",
  "lc-muc-anh": "Có ảnh hay không",
  "lc-kieu-ban-do": "Màu bản đồ",
  "lc-ban-do-co": "Bản đồ vẽ ngày xưa",
};
