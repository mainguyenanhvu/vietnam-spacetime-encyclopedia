// Icon vẽ tay cho các lớp phủ nhân vật (đặc tả I01–I06 trong
// docs/image-generation-spec.xml). Thay emoji trên BẢN ĐỒ 2D; nhãn chữ ở bảng
// lớp và popup vẫn giữ emoji.
//
// Vẽ bằng Path2D thay vì nạp ảnh SVG: nạp ảnh là bất đồng bộ, lớp phủ bật sớm
// sẽ đòi icon-image trước khi ảnh kịp giải mã. Path2D đọc thẳng cú pháp `d`
// của SVG và vẽ ngay trong một lượt.
//
// Icon hiện ở 16px CSS — chi tiết nhỏ hơn ~1/12 khung là biến mất. Vì thế đặc
// tả «vương miện + rồng» chỉ còn vương miện, «ngôi sao + bóng súng» chỉ còn
// sao: thêm nữa thành một vệt nhoè.

/** Một hình trong khung 24×24. `net` = độ dày nét (vẽ viền, không tô). */
interface Hinh {
  d: string;
  net?: number;
  mau?: string;
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
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = (h.net ?? 0) + 2.4;
    ctx.stroke(p);
    if (h.net) {
      ctx.strokeStyle = mau;
      ctx.lineWidth = h.net;
      ctx.stroke(p);
    } else {
      ctx.fillStyle = mau;
      ctx.fill(p, "evenodd");
    }
  }
  return ctx.getImageData(0, 0, sizePx, sizePx);
}
