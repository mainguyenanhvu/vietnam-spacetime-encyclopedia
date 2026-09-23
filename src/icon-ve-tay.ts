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
