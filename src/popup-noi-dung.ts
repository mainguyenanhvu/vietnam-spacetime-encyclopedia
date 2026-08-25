// Ruột popup bản đồ — dựng theo KHỐI có nghĩa thay vì chuỗi <br/>.
//
// Vì sao cần file này (ba lỗi đo được trên mã cũ, không phải chuyện thẩm mỹ):
//
//  1. 40 thẻ <br/> và 23 lần `style="color:#78716c"` gõ thẳng vào chuỗi. Hex
//     gõ thẳng KHÔNG đọc biến của theme.css, nên popup hiện y hệt nhau ở chế
//     độ người lớn và chế độ trẻ em — hai bảng màu công phu dừng lại ở mép
//     popup. Ở đây mọi màu đi qua token, đổi chế độ là popup đổi theo.
//
//  2. <br/> nối mọi thứ thành một dòng chảy không cấp bậc: tên, loại, năm,
//     nơi chốn, mô tả, nguồn — cùng cỡ chữ, cùng khoảng cách, cùng sức nặng.
//     Mắt không có chỗ bám. Kindle giải bài này bằng KHOẢNG TRẮNG và CỠ CHỮ
//     chứ không bằng gạch đầu dòng hay in đậm: tiêu đề sát, dòng phụ nhỏ và
//     giãn chữ, thân bài giãn dòng rộng, nguồn lùi hẳn xuống và im tiếng.
//
//  3. Dấu « » hiện nguyên hình trên màn hình (1.054 lần chỉ riêng lớp phủ).
//     Đó là dấu nháy kép kiểu Pháp — ĐÚNG chính tả tiếng Việt, nên KHÔNG xoá
//     khỏi dữ liệu. Nhưng dấu nháy là việc của TYPO chứ không phải của mắt
//     người đọc: sách in nghiêng tên tác phẩm, không vẽ hai mũi tên. `nhamNhay`
//     đổi «X» thành chữ nghiêng ngay lúc dựng HTML — dữ liệu không suy suyển
//     một byte, và bỏ lớp CSS này ra thì dấu « » quay lại nguyên vẹn.
import { esc } from "./util/html";
import { escKho } from "./tu-kho-tre-em";

/**
 * Đổi «X» thành chữ nghiêng.
 *
 * Chạy TRÊN CHUỖI ĐÃ ESCAPE, và chuỗi đó có thể đã chứa thẻ do `escKho()` chèn
 * (nút chú giải từ khó của chế độ trẻ em). Điều đó an toàn vì:
 *  · `esc()` không sinh ra « hay » — hai ký tự này chỉ đến từ dữ liệu;
 *  · không thuộc tính HTML nào trong mã dự án chứa », nên biểu thức không thể
 *    cắt ngang một thuộc tính;
 *  · nếu một nút chú giải nằm giữa « và » thì cả cụm được in nghiêng — đúng
 *    ý, vì cụm đó là một tên tác phẩm.
 *
 * `[^«»]*` bắt buộc: một dấu « lẻ không có » đóng lại thì để nguyên, không
 * nuốt sạch phần còn lại của câu.
 */
export const nhamNhay = (html: string): string =>
  html.replace(/«([^«»]*)»/g, '<i class="pu-nhan">$1</i>');

/** `esc` + typo. Dùng cho chữ ngắn: tên, nơi chốn, chú thích. */
export const escVan = (s: string): string => nhamNhay(esc(s));

/** `escKho` + typo. Dùng cho khối chữ dài trẻ em phải đọc. */
export const escVanKho = (s: string): string => nhamNhay(escKho(s));

/** Một dòng sự kiện dạng nhãn – giá trị trong bảng thông tin của popup. */
export interface HangPopup {
  /** Nhãn ngắn, KHÔNG kèm dấu hai chấm — CSS lo phần trình bày. */
  nhan: string;
  /** Giá trị; rỗng thì cả hàng biến mất, không để lại nhãn trơ. */
  gia_tri: string;
  /** Biểu tượng đứng trước nhãn; để trống nếu không cần. */
  icon?: string;
}

export interface RuotPopup {
  /** URL ảnh https:// đã kiểm; rỗng thì không có ảnh. */
  anh?: string;
  /** Dòng ghi công ảnh. */
  anh_chu?: string;
  ten: string;
  /** Dòng phụ dưới tên: loại · năm · thời kỳ. Các phần rỗng tự rụng. */
  meta?: string[];
  hang?: HangPopup[];
  /** Thân bài — khối chữ dài nhất, đã đi qua escVanKho. */
  than?: string;
  /** Cảnh báo (độ tin cậy toạ độ, nguồn vênh nhau…). */
  canh_bao?: string;
  /** HTML thêm vào cuối, trước nguồn — ví dụ khối <details> của bản đồ cổ. */
  them?: string;
  /** Dòng nguồn; hiện trong khối gập lại. */
  nguon?: string;
}

/**
 * Dựng ruột popup.
 *
 * Người gọi PHẢI escape trước: hàm này nối HTML, không tự escape. Quy ước đó
 * giống hệt `moPopup()` và là thứ cho phép truyền vào chữ đã có nút chú giải.
 */
export function dungPopup(r: RuotPopup): string {
  const meta = (r.meta ?? []).filter(Boolean);
  const hang = (r.hang ?? []).filter((h) => h.gia_tri);
  return (
    `<article class="pu">` +
    (r.anh ? `<img class="pu-anh" src="${esc(r.anh)}" alt="${esc(r.ten)}" loading="lazy" referrerpolicy="no-referrer"/>` : "") +
    `<h3 class="pu-ten">${escVan(r.ten)}</h3>` +
    (meta.length ? `<p class="pu-meta">${meta.map(escVan).join("<span class='pu-cham'>·</span>")}</p>` : "") +
    (hang.length
      ? `<dl class="pu-hang">${hang
          .map(
            (h) =>
              `<div><dt>${h.icon ? `<span class="pu-icon" aria-hidden="true">${h.icon}</span>` : ""}${escVan(
                h.nhan,
              )}</dt><dd>${escVanKho(h.gia_tri)}</dd></div>`,
          )
          .join("")}</dl>`
      : "") +
    (r.than ? `<p class="pu-than">${r.than}</p>` : "") +
    (r.canh_bao ? `<p class="pu-canh-bao">${escVan(r.canh_bao)}</p>` : "") +
    (r.them ?? "") +
    (r.anh_chu ? `<p class="pu-anh-chu">${escVan(r.anh_chu)}</p>` : "") +
    (r.nguon
      ? `<details class="pu-nguon"><summary>Nguồn</summary><p>${escVan(r.nguon)}</p></details>`
      : "") +
    `</article>`
  );
}
