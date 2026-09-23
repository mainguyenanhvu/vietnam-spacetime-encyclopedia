// Chế độ xem: «người lớn» (sang trọng, tối giản), «trẻ em» (vui nhộn, nhiều
// màu) và «ban đêm» (người lớn trên nền tối). Toàn bộ khác biệt nằm ở biến CSS
// trong theme.css — module này chỉ đặt thuộc tính `data-che-do` trên <html> và
// ghi nhớ lựa chọn.
//
// «Ban đêm» là chế độ NGƯỜI LỚN về lời văn: mọi chỗ đổi câu chữ theo chế độ
// hỏi `laTreEm()`, không so bằng "nguoi-lon" — so bằng "nguoi-lon" là ban đêm
// rơi nhầm sang lời văn trẻ em.
//
// Phải chạy TRƯỚC khi vẽ khung hình đầu tiên, nếu không trang sẽ nháy sang chế
// độ mặc định rồi mới đổi.

const KHOA = "bkvn.che-do";

/**
 * Phát ra mỗi lần đổi chế độ, `detail` là chế độ MỚI. Cần vì có chữ KHÔNG đổi
 * được bằng CSS: ghi chú pháp lý về cương vực viết cho người lớn thì trẻ em
 * không hiểu, phải thay hẳn câu chứ không phải đổi cỡ chữ hay màu.
 */
export const SU_KIEN_DOI_CHE_DO = "bkvn:doi-che-do";

export type CheDo = "nguoi-lon" | "tre-em" | "toi";

/** Thứ tự cũng là thứ tự nút xoay vòng. */
const HOP_LE: readonly CheDo[] = ["nguoi-lon", "tre-em", "toi"] as const;

const TEN: Record<CheDo, string> = {
  "nguoi-lon": "người lớn",
  "tre-em": "trẻ em",
  toi: "ban đêm",
};

/** Màu thanh trình duyệt trên di động — phải khớp topbar của từng chế độ. */
const MAU_THANH: Record<CheDo, string> = {
  "nguoi-lon": "#b02020", // khớp điểm đầu của --mat-nghich
  "tre-em": "#ea580c",
  toi: "#3d0e0e", // khớp điểm cuối của --mat-nghich chế độ tối
};

function doc(): CheDo {
  try {
    const v = localStorage.getItem(KHOA);
    if (v && (HOP_LE as readonly string[]).includes(v)) return v as CheDo;
  } catch {
    // localStorage bị chặn (chế độ riêng tư, cookie bị khoá) — dùng mặc định.
  }
  // Chưa chọn bao giờ thì theo hệ điều hành. Chỉ đọc MỘT lần lúc chưa có lựa
  // chọn: người đã bấm nút thì lựa chọn của họ thắng cài đặt máy.
  try {
    if (matchMedia("(prefers-color-scheme: dark)").matches) return "toi";
  } catch {
    // Trình duyệt cổ không có matchMedia — bỏ qua.
  }
  return "nguoi-lon";
}

function ghi(che: CheDo): void {
  try {
    localStorage.setItem(KHOA, che);
  } catch {
    // Không ghi được thì chế độ chỉ sống trong phiên này. Không phải lỗi chặn.
  }
}

/**
 * @param dangChay true khi đổi lúc trang đã chạy (người dùng bấm nút) — cần tắt
 *   transition một khung hình, xem giải thích ở `[data-dang-doi-che-do]` trong
 *   theme.css. false khi áp lần đầu lúc nạp trang, chưa có gì để chuyển tiếp.
 */
function ap(che: CheDo, dangChay: boolean): void {
  const goc = document.documentElement;
  if (dangChay) goc.dataset.dangDoiCheDo = "";
  goc.dataset.cheDo = che;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = MAU_THANH[che];
  document.dispatchEvent(new CustomEvent(SU_KIEN_DOI_CHE_DO, { detail: che }));
  if (!dangChay) return;
  // Hai khung hình để chắc chắn kiểu dáng mới đã được tính xong. setTimeout là
  // lưới an toàn: tab chạy nền bị hãm rAF, không có nó thì cờ kẹt lại vĩnh viễn
  // và mọi transition của trang tắt câm.
  let daGo = false;
  const go = (): void => {
    if (daGo) return;
    daGo = true;
    delete goc.dataset.dangDoiCheDo;
  };
  requestAnimationFrame(() => requestAnimationFrame(go));
  setTimeout(go, 200);
}

/**
 * Đặt chế độ đã lưu lên <html>. Gọi ở dòng đầu của main.ts, trước mọi thứ khác.
 * Tách khỏi initCheDo() vì nút bấm cần #topbar-nav đã có trong DOM, còn việc
 * đặt chế độ thì không — và càng sớm càng đỡ nháy.
 */
export function apCheDoDaLuu(): void {
  ap(doc(), false);
}

export function cheDoHienTai(): CheDo {
  return doc();
}

/** Lời văn trẻ em hay người lớn. Ban đêm đọc lời văn người lớn. */
export function laTreEm(che: CheDo = doc()): boolean {
  return che === "tre-em";
}

function keTiep(che: CheDo): CheDo {
  return HOP_LE[(HOP_LE.indexOf(che) + 1) % HOP_LE.length];
}

/** Dựng nút chuyển chế độ, chèn vào ĐẦU #topbar-nav. */
export function initCheDo(): void {
  if (document.getElementById("che-do-btn")) return; // chống khởi tạo 2 lần

  const nav = document.getElementById("topbar-nav");
  if (!nav) return;

  const btn = document.createElement("button");
  btn.id = "che-do-btn";
  btn.type = "button";
  // Nhãn nằm trong ::before của theme.css để đổi theo chế độ mà không cần JS
  // chạy lại — nhưng screen reader cần chữ thật, nên aria-label vẫn do JS ghi.
  btn.innerHTML = '<span class="che-do-nhan"></span>';

  const capNhatNhan = (): void => {
    const che = doc();
    // Không dùng aria-pressed: nút ba trạng thái không phải nút bật/tắt, đọc
    // «đã nhấn» ở chế độ ban đêm là nói sai. Nhãn đã nêu đủ trạng thái.
    btn.title = `Đang ở chế độ ${TEN[che]} — bấm để chuyển sang chế độ ${TEN[keTiep(che)]}`;
    btn.setAttribute("aria-label", btn.title);
  };

  btn.addEventListener("click", () => {
    const moi = keTiep(doc());
    ghi(moi);
    ap(moi, true);
    capNhatNhan();
  });

  capNhatNhan();
  nav.insertBefore(btn, nav.firstChild);
}
