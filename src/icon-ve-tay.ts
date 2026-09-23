// Icon vẽ tay cho lớp phủ: 7 lớp nhân vật (đặc tả I01–I06 trong
// docs/image-generation-spec.xml) và 8 lớp di sản · di tích · lễ hội. Thay emoji trên BẢN ĐỒ 2D; nhãn chữ ở bảng
// lớp và popup vẫn giữ emoji.
//
// Vẽ bằng Path2D thay vì nạp ảnh SVG: nạp ảnh là bất đồng bộ, lớp phủ bật sớm
// sẽ đòi icon-image trước khi ảnh kịp giải mã. Path2D đọc thẳng cú pháp `d`
// của SVG và vẽ ngay trong một lượt.
//
// Icon hiện ở 16px CSS — chi tiết nhỏ hơn ~1/12 khung là biến mất. Vì thế đặc
// tả «vương miện + rồng» chỉ còn vương miện, «ngôi sao + bóng súng» chỉ còn
// sao: thêm nữa thành một vệt nhoè.

/**
 * Một hình trong khung 24×24.
 * - `net`: độ dày nét — vẽ viền, không tô.
 * - `lo`: hình có lỗ khoét (tô evenodd). Mặc định nonzero, để các hình con
 *   chạm nhau trong cùng một path không tự khoét lẫn nhau.
 * - `khongVien`: bỏ viền trắng — cho nét trang trí màu trắng vẽ ĐÈ lên hình
 *   khác, có viền thì nét phình gấp ba.
 */
interface Hinh {
  d: string;
  net?: number;
  mau?: string;
  lo?: boolean;
  khongVien?: boolean;
}

interface IconVe {
  mau: string;
  hinh: Hinh[];
}

/** Khoá = id lớp phủ trong overlays-config.ts. */
export const ICON_VE_TAY: Record<string, IconVe> = {
  // I01 — vương miện
  "vua-hoang-de": {
    mau: "#a16207",
    hinh: [
      { d: "M3 17 L3.5 7.5 L8 11.5 L12 4.5 L16 11.5 L20.5 7.5 L21 17 Z" },
      { d: "M3 18.5 H21 V21 H3 Z" },
    ],
  },
  // I02 — cuộn giấy + bút lông
  "khoa-bang-danh-nhan": {
    mau: "#1d4ed8",
    hinh: [
      {
        d:
          "M4 6 H14 V18 H4 Z " +
          // Dòng chữ là lỗ khoét (evenodd), không phải nét vẽ thêm.
          "M6 8.5 H12 V9.7 H6 Z M6 11.4 H12 V12.6 H6 Z M6 14.3 H10 V15.5 H6 Z",
        lo: true,
      },
      { d: "M3 4.2 H15 V5.8 H3 Z" },
      { d: "M3 18.2 H15 V19.8 H3 Z" },
      { d: "M21 3.5 L18.6 14", net: 1.8 },
      { d: "M17.6 13.6 L19.6 14.1 L17.4 19.5 Z" },
    ],
  },
  // I03 — cối chày + lá thuốc
  "danh-y-luong-y": {
    mau: "#15803d",
    hinh: [
      { d: "M4.5 9.5 C4.5 5.5 7.5 3.5 11 3.5 C11 7.5 8 9.5 4.5 9.5 Z" },
      { d: "M13 12 L19 3.5", net: 2.4 },
      { d: "M3.5 11 H20.5 C20.5 16 16.5 19 12 19 C7.5 19 3.5 16 3.5 11 Z" },
      { d: "M8.5 19 H15.5 V21 H8.5 Z" },
    ],
  },
  // I04 — hoa sen + bát khất thực
  "thien-su-cao-tang": {
    mau: "#be185d",
    hinh: [
      { d: "M11 14.5 C8.5 11 5.5 9.5 2.8 9.5 C3.2 12.8 6.5 15 11 14.5 Z" },
      { d: "M13 14.5 C15.5 11 18.5 9.5 21.2 9.5 C20.8 12.8 17.5 15 13 14.5 Z" },
      { d: "M12 3.5 C14.8 6.5 14.8 11 12 14.5 C9.2 11 9.2 6.5 12 3.5 Z" },
      { d: "M5.5 16.2 H18.5 C18.5 19 15.5 21 12 21 C8.5 21 5.5 19 5.5 16.2 Z" },
    ],
  },
  // I05 — khung dệt + thoi
  "nghe-nhan-di-san": {
    mau: "#9a3412",
    hinh: [
      { d: "M4 3.5 V20.5 M20 3.5 V20.5 M4 5 H20 M4 18 H20", net: 1.8 },
      { d: "M8 5 V18 M12 5 V18 M16 5 V18", net: 0.9 },
      { d: "M3 11.5 L7 10 H17 L21 11.5 L17 13 H7 Z" },
    ],
  },

  // --- Nhóm Di sản & Di tích + lễ hội (thêm 2026-09-23). Trước đó UNESCO, di
  // tích quốc gia và danh nhân các triều dùng CHUNG emoji 🏛️ — trên bản đồ
  // không phân biệt được lớp nào với lớp nào.

  // UNESCO — mặt tiền đền cột
  unesco: {
    mau: "#0e7490",
    hinh: [
      { d: "M2.5 8.5 L12 3 L21.5 8.5 Z" },
      { d: "M4.4 10 H6.6 V17.5 H4.4 Z M8.7 10 H10.9 V17.5 H8.7 Z M13.1 10 H15.3 V17.5 H13.1 Z M17.4 10 H19.6 V17.5 H17.4 Z" },
      { d: "M2.5 18.5 H21.5 V21 H2.5 Z" },
    ],
  },
  // Di tích quốc gia đặc biệt — chùa hai tầng mái cong
  "di-tich-qgdb": {
    mau: "#881337",
    hinh: [
      { d: "M3.5 8 L8 7.5 L12 3.5 L16 7.5 L20.5 8 L18 9.8 H6 Z" },
      { d: "M8 10.5 H16 V13 H8 Z" },
      { d: "M1.8 13.5 L7 13.2 H17 L22.2 13.5 L19.5 15.8 H4.5 Z" },
      { d: "M6 16.5 H18 V21 H6 Z M10.5 21 V18 H13.5 V21 Z", lo: true },
    ],
  },
  // Di tích quốc gia — cổng tam quan một mái
  "di-tich-quoc-gia": {
    mau: "#92400e",
    hinh: [
      { d: "M2 9 L7 8.3 L9.5 5 H14.5 L17 8.3 L22 9 L19 11 H5 Z" },
      { d: "M5.5 11.8 H8 V13 H16 V11.8 H18.5 V21 H16 V14.6 H8 V21 H5.5 Z" },
    ],
  },
  // Di tích cấp tỉnh — miếu nhỏ
  "di-tich-cap-tinh": {
    mau: "#4d7c0f",
    hinh: [
      { d: "M2.5 11.5 L12 4.5 L21.5 11.5 Z" },
      { d: "M5 12.5 H19 V20.5 H5 Z M10 20.5 V15.5 H14 V20.5 Z", lo: true },
    ],
  },
  // Bảo vật quốc gia — mặt trống đồng: vành + ngôi sao giữa
  "bao-vat-quoc-gia": {
    mau: "#b45309",
    hinh: [
      { d: "M12 2 A10 10 0 1 0 12.001 2 Z M12 5 A7 7 0 1 0 12.001 5 Z", lo: true },
      {
        d:
          "M12 6.8 L12.8 10.06 L15.68 8.32 L13.94 11.2 L17.2 12 L13.94 12.8 L15.68 15.68 " +
          "L12.8 13.94 L12 17.2 L11.2 13.94 L8.32 15.68 L10.06 12.8 L6.8 12 L10.06 11.2 L8.32 8.32 L11.2 10.06 Z",
      },
    ],
  },
  // Di tích cách mạng — lá cờ trên cán
  "di-tich-cach-mang": {
    mau: "#dc2626",
    hinh: [
      { d: "M5.5 3 V20.5", net: 1.6 },
      { d: "M6.8 4 H20 L17.5 8 L20 12 H6.8 Z" },
      { d: "M2.5 19.5 H8.5 V21.5 H2.5 Z" },
    ],
  },
  // Lễ hội truyền thống — đèn lồng
  "le-hoi-truyen-thong": {
    mau: "#ea580c",
    hinh: [
      { d: "M9 3 H15 V5 H9 Z" },
      {
        d: "M12 5.5 C18.5 5.5 19.5 9 19.5 11.5 C19.5 14 18.5 17.5 12 17.5 C5.5 17.5 4.5 14 4.5 11.5 C4.5 9 5.5 5.5 12 5.5 Z",
      },
      {
        d: "M12 6.5 V16.5 M8.6 7 C7.2 10 7.2 13 8.6 16 M15.4 7 C16.8 10 16.8 13 15.4 16",
        net: 0.8,
        mau: "#ffffff",
        khongVien: true,
      },
      { d: "M9 18 H15 V20 H9 Z" },
      { d: "M12 20 V22.2", net: 1.2 },
    ],
  },
  // Di sản phi vật thể — hai nốt móc đơn nối cầu
  "di-san-phi-vat-the": {
    mau: "#7c3aed",
    hinh: [
      {
        d:
          "M9 4 L20 2 V5 L9 7 Z " +
          "M9 7 H10.6 V17 H9 Z M18.4 4.7 H20 V15 H18.4 Z " +
          "M6.2 19.2 C6.2 17.4 8.3 16.2 10 16.4 C11 16.6 11.2 17.8 10.3 18.9 C9.3 20.1 6.8 20.8 6.2 19.2 Z " +
          "M15.4 17.2 C15.4 15.4 17.5 14.2 19.2 14.4 C20.2 14.6 20.4 15.8 19.5 16.9 C18.5 18.1 16 18.8 15.4 17.2 Z",
      },
    ],
  },

  // --- Năm lớp trước đó dùng chung emoji: ⚔️ ×3, 🐉 ×2 (thêm 2026-09-23).

  // Chiến dịch · trận đánh — hai kiếm bắt chéo
  "chien-dich-tran-danh": {
    mau: "#374151",
    hinh: [
      { d: "M4 4 L16.5 16.5", net: 2.2 },
      { d: "M20 4 L7.5 16.5", net: 2.2 },
      { d: "M14 19 L19 14 M5 14 L10 19", net: 2 },
      { d: "M18 18 L20.5 20.5 M6 18 L3.5 20.5", net: 2.4 },
    ],
  },
  // Danh tướng cổ–trung đại — khiên mang sao. KHÔNG dựng kiếm giữa khiên:
  // thử rồi, ở 16px nó đọc thành thánh giá.
  "danh-nhan-quan-su-co-trung-dai": {
    mau: "#1e3a8a",
    hinh: [
      { d: "M12 2.5 L20 5.5 V11.5 C20 16.5 16.5 19.8 12 21.5 C7.5 19.8 4 16.5 4 11.5 V5.5 Z" },
      {
        d: "M12 6.5 L13.3 10.2 L17.2 10.3 L14.1 12.7 L15.2 16.4 L12 14.2 L8.8 16.4 L9.9 12.7 L6.8 10.3 L10.7 10.2 Z",
        mau: "#ffffff",
        khongVien: true,
      },
    ],
  },
  // Cần Vương — cờ đuôi nheo trên cán giáo
  "nghia-si-can-vuong": {
    mau: "#a16207",
    hinh: [
      { d: "M6 5 V21.5", net: 1.6 },
      { d: "M6 1.8 L7.6 5 H4.4 Z" },
      { d: "M7.2 5.5 L20.5 9 L7.2 12.5 Z" },
    ],
  },
  // Huyền sử khai quốc — chim Lạc bay (hoa văn trống đồng)
  "huyen-su-khai-quoc": {
    mau: "#0f766e",
    hinh: [
      // cánh vươn lên
      { d: "M7.5 13 C8.5 8.5 11 5 15.5 2.5 C14.5 6.5 14 9.5 13.5 12.5 Z" },
      {
        // thân, đuôi xoè dưới trái, cổ + đầu bên phải, mỏ dài
        d:
          "M2.5 14.5 C6 12 10.5 11.3 14.5 12.3 L16.8 10.6 C17.8 10 19 10.2 19.4 11 L23 11.6 " +
          "L19.2 12.7 C18.2 15.3 14.2 17.3 9.8 17 L4 20.5 L5.8 16.3 Z",
      },
      // mào
      { d: "M17.2 10.4 L15.8 6.8 L18.6 9.9 Z" },
    ],
  },
  // Truyền thuyết dân gian — sách mở
  "truyen-thuyet-dan-gian": {
    mau: "#6d28d9",
    hinh: [
      { d: "M2.5 5.5 C5.5 4.5 9 4.8 11.3 6.5 V20 C9 18.5 5.5 18.3 2.5 19.2 Z" },
      { d: "M21.5 5.5 C18.5 4.5 15 4.8 12.7 6.5 V20 C15 18.5 18.5 18.3 21.5 19.2 Z" },
    ],
  },

  // --- 15 lớp còn lại (thêm 2026-09-23) — từ đây mọi lớp phủ đều có icon vẽ.
  // Tránh mọi hình đọc được thành biểu tượng tôn giáo ở 16px (xem khiên danh
  // tướng ở trên).

  // Danh nhân các triều — mũ cánh chuồn
  "danh-nhan-cac-trieu": {
    mau: "#0369a1",
    hinh: [
      { d: "M6.5 13 C6.5 4 17.5 4 17.5 13 Z" },
      { d: "M5.5 13.6 H18.5 V17 H5.5 Z" },
      { d: "M1.5 12.3 C1.5 9.8 5 9.6 6.2 12.6 C5 15.6 1.5 14.8 1.5 12.3 Z" },
      { d: "M22.5 12.3 C22.5 9.8 19 9.6 17.8 12.6 C19 15.6 22.5 14.8 22.5 12.3 Z" },
    ],
  },
  // Văn nghệ sĩ · báo chí — ngòi bút
  "danh-nhan-van-hoa-can-hien-dai": {
    mau: "#4338ca",
    hinh: [
      { d: "M12 2.5 L17.5 10 L14 18.5 H10 L6.5 10 Z M11.4 7.5 V13.5 H12.6 V7.5 Z", lo: true },
      { d: "M9.5 19.3 H14.5 V21.5 H9.5 Z" },
    ],
  },
  // Thành hoàng · danh thần — lư hương ba chân, ba nén nhang
  "thanh-hoang-danh-than": {
    mau: "#9f1239",
    hinh: [
      { d: "M9.5 9.5 V3.5 M12 9.5 V2.5 M14.5 9.5 V3.5", net: 1 },
      { d: "M4.5 10.5 H19.5 C19.5 14.8 16.5 17.5 12 17.5 C7.5 17.5 4.5 14.8 4.5 10.5 Z" },
      { d: "M7.5 16.5 L6.5 21 M16.5 16.5 L17.5 21 M12 17.5 V21", net: 1.8 },
    ],
  },
  // Mẹ Việt Nam Anh hùng — bông hoa năm cánh
  "me-vnah": {
    mau: "#be123c",
    hinh: [
      {
        d:
          "M12 2.5 C14.5 2.5 15 6 12 9 C9 6 9.5 2.5 12 2.5 Z " +
          "M21.1 9.1 C21.8 11.5 18.6 13 15 11.2 C16.2 7.4 20.3 6.7 21.1 9.1 Z " +
          "M17.6 19.7 C15.6 21.2 13.1 18.8 14 14.9 C18 14.9 19.6 18.2 17.6 19.7 Z " +
          "M6.4 19.7 C4.4 18.2 6 14.9 10 14.9 C10.9 18.8 8.4 21.2 6.4 19.7 Z " +
          "M2.9 9.1 C3.7 6.7 7.8 7.4 9 11.2 C5.4 13 2.2 11.5 2.9 9.1 Z",
      },
      { d: "M12 9.3 A2.8 2.8 0 1 0 12.001 9.3 Z", mau: "#fbbf24" },
    ],
  },
  // Tổ nghề · làng nghề — búa
  "to-nghe-danh-than": {
    mau: "#57534e",
    hinh: [
      { d: "M13.5 10.5 L4 20", net: 2.4 },
      { d: "M19.6 10.8 L16.8 13.6 L10.4 7.2 L13.2 4.4 Z" },
    ],
  },
  // Nghĩa trang liệt sĩ · đài tưởng niệm — đài tưởng niệm trên bệ
  "nghia-trang-liet-si": {
    mau: "#3f3f46",
    hinh: [
      { d: "M10.6 4.5 L12 2.5 L13.4 4.5 L14.4 16.8 H9.6 Z" },
      { d: "M7 17.5 H17 V19.5 H7 Z" },
      { d: "M4.5 20 H19.5 V21.8 H4.5 Z" },
    ],
  },
  // Công trình kỷ lục — cầu dây võng
  "cong-trinh-ky-luc": {
    mau: "#334155",
    hinh: [
      { d: "M2 12.5 Q4.5 7 6.5 3.5 Q12 14 17.5 3.5 Q19.5 7 22 12.5", net: 1.2 },
      { d: "M6.5 3.5 V20.5 M17.5 3.5 V20.5", net: 2.2 },
      { d: "M2 15.5 H22", net: 2.2 },
    ],
  },
  // Danh thắng thiên nhiên — núi và mặt trời
  "danh-thang-thien-nhien": {
    mau: "#047857",
    hinh: [
      { d: "M18 2.5 A2.6 2.6 0 1 0 18.001 2.5 Z" },
      { d: "M1.8 20.5 L8.5 8 L12.5 14 L15.5 10 L22.2 20.5 Z" },
    ],
  },
  // Bảo tàng — bình gốm
  "bao-tang": {
    mau: "#c2410c",
    hinh: [
      {
        d:
          "M9 2.5 H15 V4.5 C15 5.6 14 6 14 7.3 C18 8.8 19.2 12.5 17.7 16 C16.7 18.5 14.6 19.8 12 19.8 " +
          "C9.4 19.8 7.3 18.5 6.3 16 C4.8 12.5 6 8.8 10 7.3 C10 6 9 5.6 9 4.5 Z",
      },
      { d: "M9 20.5 H15 V22 H9 Z" },
    ],
  },
  // Sứ thần · ngoại giao — phong quốc thư có dấu niêm
  "su-than-ngoai-giao": {
    mau: "#0891b2",
    hinh: [
      { d: "M2.5 5.5 H21.5 V18.5 H2.5 Z" },
      { d: "M3.2 6.2 L12 12.8 L20.8 6.2", net: 1, mau: "#ffffff", khongVien: true },
      { d: "M12 11.2 A2.8 2.8 0 1 0 12.001 11.2 Z", mau: "#b91c1c" },
    ],
  },
  // Danh nhân dân tộc thiểu số — lông vũ
  "danh-nhan-dan-toc-thieu-so": {
    mau: "#a21caf",
    hinh: [
      { d: "M19.5 2.5 C12 3.5 6.8 9 6 17 L4.3 20.6 L5.4 21.4 L7.3 18.2 C14.5 17.4 19 11 19.5 2.5 Z" },
      { d: "M18.3 4.2 L7.3 18.2", net: 0.8, mau: "#ffffff", khongVien: true },
    ],
  },
  // Thiếu niên anh hùng — khăn quàng đỏ thắt nút
  "thieu-nien-anh-hung": {
    mau: "#dc2626",
    hinh: [
      { d: "M3.5 4 H20.5 L14.2 9.2 H9.8 Z" },
      { d: "M10.2 9.8 H13.8 V12.4 H10.2 Z" },
      { d: "M10.4 13 L6.8 20.6 L9.4 21.2 L12 14.6 L14.6 21.2 L17.2 20.6 L13.6 13 Z" },
    ],
  },
  // Nhà thể thao lịch sử — huy chương
  "nha-the-thao-lich-su": {
    mau: "#ca8a04",
    hinh: [
      { d: "M6.5 2.5 H10.3 L12.8 8.8 H9 Z" },
      { d: "M17.5 2.5 H13.7 L11.2 8.8 H15 Z" },
      {
        d:
          "M12 9 A6.2 6.2 0 1 0 12.001 9 Z " +
          "M12 11.8 L12.9 14.2 L15.4 14.3 L13.4 15.8 L14.1 18.2 L12 16.8 L9.9 18.2 L10.6 15.8 L8.6 14.3 L11.1 14.2 Z",
        lo: true,
      },
    ],
  },
  // Trí thức · khoa học — nguyên tử
  "tri-thuc-khoa-hoc-tk20": {
    mau: "#0284c7",
    hinh: [
      {
        d:
          "M21.5 12 A9.5 3.8 0 1 0 2.5 12 A9.5 3.8 0 1 0 21.5 12 Z " +
          "M16.75 20.23 A9.5 3.8 60 1 0 7.25 3.77 A9.5 3.8 60 1 0 16.75 20.23 Z " +
          "M16.75 3.77 A9.5 3.8 -60 1 0 7.25 20.23 A9.5 3.8 -60 1 0 16.75 3.77 Z",
        net: 1.4,
      },
      { d: "M12 9.9 A2.1 2.1 0 1 0 12.001 9.9 Z" },
    ],
  },
  // Bản đồ cổ — tờ bản đồ gấp ba
  "ban-do-co": {
    mau: "#854d0e",
    hinh: [
      { d: "M2.5 5 L8.5 3 L15.5 5 L21.5 3 V19 L15.5 21 L8.5 19 L2.5 21 Z" },
      { d: "M8.5 3.6 V18.4 M15.5 5.6 V20.4", net: 0.9, mau: "#ffffff", khongVien: true },
    ],
  },
};

// I06 — ngôi sao vàng trên nền đỏ, dùng chung cho hai lớp như đặc tả ghi.
const SAO: IconVe = {
  mau: "#da251d",
  hinh: [
    { d: "M12 1.5 A10.5 10.5 0 1 0 12.001 1.5 Z" },
    {
      d: "M12 5 L13.6 9.6 L18.5 9.7 L14.6 12.7 L16 17.4 L12 14.6 L8 17.4 L9.4 12.7 L5.5 9.7 L10.4 9.6 Z",
      mau: "#ffcd00",
    },
  ],
};
ICON_VE_TAY["chi-si-cach-mang"] = SAO;
ICON_VE_TAY["anh-hung-can-hien-dai"] = SAO;

/** Tên ảnh đăng ký với MapLibre — tiền tố tránh đụng tên emoji. */
export function tenIconVe(lopId: string): string {
  return `ve:${lopId}`;
}

/**
 * Vẽ icon ra ImageData để `map.addImage`.
 *
 * Mỗi hình vẽ viền trắng rồi tô ngay, theo thứ tự: viền của hình sau đè lên
 * hình trước thành đường tách trắng — không có nó, các cánh sen liền nhau
 * thành một mảng.
 */
export function veIconLop(ve: IconVe, sizePx = 64): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(sizePx / 24, sizePx / 24);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (const h of ve.hinh) {
    const p = new Path2D(h.d);
    const mau = h.mau ?? ve.mau;
    if (!h.khongVien) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = (h.net ?? 0) + 2.4;
      ctx.stroke(p);
    }
    if (h.net) {
      ctx.strokeStyle = mau;
      ctx.lineWidth = h.net;
      ctx.stroke(p);
    } else {
      ctx.fillStyle = mau;
      ctx.fill(p, h.lo ? "evenodd" : "nonzero");
    }
  }
  return ctx.getImageData(0, 0, sizePx, sizePx);
}
