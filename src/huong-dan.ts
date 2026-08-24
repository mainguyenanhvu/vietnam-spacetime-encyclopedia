// ═══════════════════════════════════════════════════════════════════════════
// 🧭 HƯỚNG DẪN THAO TÁC — «Cầm tay chỉ việc» + «Sổ tay thám hiểm»
// ═══════════════════════════════════════════════════════════════════════════
//
// Vấn đề đang giải: chế độ trẻ em cho tới nay chỉ đổi MÀU và CỠ CHỮ. Đứa trẻ mở
// trang lên vẫn đối diện đúng cái bản đồ của người lớn — 33 lớp phủ, một thanh
// trượt 4000 năm, mười mấy nút — và không ai chỉ cho nó bắt đầu từ đâu.
//
// Hai màn, chung một bảng dữ liệu VIỆC:
//   1. Cầm tay chỉ việc — khoét sáng đúng nút thật trên màn hình, bong bóng lời
//      của Lạc & Âu, và CHỜ đứa trẻ tự làm. Không có nút «Tiếp» để bấm cho qua.
//   2. Sổ tay thám hiểm — bảng nhiệm vụ tự do, tự đánh dấu khi việc xảy ra.
//
// 🔴 Nguyên tắc nền: module này KHÔNG tự bấm hộ và KHÔNG chặn thao tác.
//   · Lớp phủ tối mang `pointer-events: none` — nó chỉ để nhìn. Mọi cú bấm vẫn
//     rơi thẳng xuống bản đồ. Khoét lỗ bằng cách chặn sự kiện là cách làm quen
//     thuộc của các thư viện tour, nhưng ở đây bản đồ kéo–thả–zoom được, chặn
//     sự kiện là bẻ gãy chính thứ đang dạy.
//   · Mọi bước đều nghe SỰ KIỆN THẬT của ứng dụng (thanh trượt đổi giá trị,
//     panel tỉnh mở ra, checkbox lớp phủ bật). Không mô phỏng, không giả lập —
//     nên bước nào đã qua nghĩa là đứa trẻ làm được thật.
//
// Điểm nối với phần còn lại: chỉ đọc DOM và nghe sự kiện, không import module
// tính năng nào. Đổi lại, id trong bảng VIEC phải khớp id thật — xem chú thích
// «Điểm nối JS↔CSS» trong PLAN.md, danh sách này thuộc cùng loại rủi ro.

import { registerPanel, showOnly, hidePanel } from "./panels";
import { normalizeVi } from "./search";
import { cheDoHienTai, SU_KIEN_DOI_CHE_DO } from "./chedo";
import type { CheDo } from "./chedo";
import { esc } from "./util/html";

// ═══════════════════════════════════════════════════════════════════════════
// 1. Ghi nhớ tiến độ
// ═══════════════════════════════════════════════════════════════════════════

const KHOA_XONG = "bkvn.huong-dan.xong";
const KHOA_MOI = "bkvn.huong-dan.da-moi";

function docXong(): Set<string> {
  try {
    const v = JSON.parse(localStorage.getItem(KHOA_XONG) ?? "[]") as unknown;
    return new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  } catch {
    // localStorage bị chặn (cửa sổ riêng tư, cookie khoá) — tiến độ chỉ sống
    // trong phiên này. Không phải lỗi chặn, đừng báo cho người dùng.
    return new Set();
  }
}

function ghiXong(ids: Set<string>): void {
  try {
    localStorage.setItem(KHOA_XONG, JSON.stringify([...ids]));
  } catch {
    /* xem giải thích ở docXong() */
  }
}

let daXong = docXong();

// ═══════════════════════════════════════════════════════════════════════════
// 2. Bảng VIỆC — nguồn sự thật duy nhất cho cả hai màn
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @param neo      phần tử được khoét sáng. Trả `null` khi nút chưa tồn tại
 *                 (Hành trình, Sa đồ… dựng nút sau một lượt fetch) — bước đó
 *                 tự chuyển sang khoét sáng thanh điều hướng thay vì vỡ.
 * @param moTruoc  mở sẵn thứ đang che đích (menu «Khám phá», bảng lớp thu gọn).
 * @param nghe     đăng ký nghe SỰ KIỆN THẬT; gọi `xong()` đúng một lần, trả về
 *                 hàm gỡ đăng ký. Đây là chỗ quyết định «làm được thật hay chưa».
 */
interface Viec {
  id: string;
  icon: string;
  nhan: string;
  loiBe: string;
  loiNguoiLon: string;
  goiY: string;
  trongTour: boolean;
  neo: () => HTMLElement | null;
  moTruoc?: () => void;
  nghe: (xong: () => void) => () => void;
}

const el = (sel: string): HTMLElement | null => document.querySelector<HTMLElement>(sel);

// ── Bộ cảm biến dùng chung ─────────────────────────────────────────────────

/**
 * MỘT observer cho toàn bộ 11 panel, phát lại thành sự kiện `bkvn:panel-mo`.
 *
 * Vì sao không mỗi nhiệm vụ một observer: sáu panel (Sa đồ, Hành trình, Quốc
 * gia, Olympia, Nam tiến, Niên biểu) do module khác `appendChild` vào `#app`
 * SAU khi trang chạy, có cái sau một lượt fetch. Bắt từng cái một là phải đi
 * dò–chờ–gắn sáu lần. Quan sát `#app` với `attributeFilter: ["hidden"]` bắt
 * được cả panel chưa ra đời, chỉ tốn một observer.
 */
const SK_PANEL_MO = "bkvn:panel-mo";
let daTheoDoiPanel = false;

function theoDoiPanel(): void {
  if (daTheoDoiPanel) return;
  const app = document.getElementById("app");
  if (!app) return;
  daTheoDoiPanel = true;
  new MutationObserver((ds) => {
    for (const d of ds) {
      const n = d.target as HTMLElement;
      if (n.id && n.tagName === "ASIDE" && !n.hidden)
        document.dispatchEvent(new CustomEvent(SK_PANEL_MO, { detail: n.id }));
    }
  }).observe(app, { attributes: true, subtree: true, attributeFilter: ["hidden"] });
}

/** Nghe một panel mở ra, kể cả panel chưa có trong DOM lúc đăng ký. */
const khiPanelMo =
  (panelId: string) =>
  (xong: () => void): (() => void) => {
    theoDoiPanel();
    const h = (e: Event): void => {
      if ((e as CustomEvent<string>).detail === panelId) xong();
    };
    document.addEventListener(SK_PANEL_MO, h);
    // Panel đang mở sẵn lúc nhận nhiệm vụ thì tính luôn, khỏi bắt đóng rồi mở.
    if (document.getElementById(panelId)?.hidden === false) xong();
    return () => document.removeEventListener(SK_PANEL_MO, h);
  };

/** Nghe một cú bấm vào nút theo id, dùng uỷ quyền nên nút đến muộn vẫn bắt được. */
const khiBamNut =
  (nutId: string) =>
  (xong: () => void): (() => void) => {
    const h = (e: Event): void => {
      if ((e.target as HTMLElement | null)?.closest(`#${nutId}`)) xong();
    };
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  };

/** Nút do module khác dựng sau một lượt fetch — thiếu thì khoét sáng thanh nav. */
const neoNut =
  (nutId: string) =>
  (): HTMLElement | null =>
    document.getElementById(nutId) ?? document.getElementById("topbar-nav");

/** Nút đã bị gomNutTopbar() dồn vào menu «Khám phá» — phải bung menu ra đã. */
function moMenuKhamPha(): void {
  const menu = document.getElementById("nav-kham-pha");
  if (menu instanceof HTMLDetailsElement) menu.open = true;
}

const VIEC: Viec[] = [
  {
    id: "bam-tinh",
    icon: "📍",
    nhan: "Bấm vào một vùng trên bản đồ",
    loiBe: "Bấm thử vào một vùng bất kỳ trên bản đồ đi! Chỗ nào cũng có chuyện để kể.",
    loiNguoiLon: "Bấm một vùng trên bản đồ — ra hồ sơ tỉnh, hoặc popup cương vực nếu đang ở thời kỳ cổ.",
    goiY: "Bấm thẳng vào vùng đất có màu trên bản đồ, chỗ nào cũng được.",
    trongTour: true,
    neo: () => document.getElementById("map"),
    // Hai kết quả đều TÍNH LÀ LÀM ĐƯỢC: ở thời kỳ 34 tỉnh thì ra hồ sơ tỉnh,
    // ở thời kỳ cổ thì ra popup cương vực vì thời ấy chưa có tỉnh nào. Chỉ
    // nghe panel tỉnh là khoá bước này lại ở mọi thời kỳ trước 1976.
    nghe: (xong) => {
      const goPanel = khiPanelMo("province-panel")(xong);
      const map = document.getElementById("map");
      if (!map) return goPanel;
      const ob = new MutationObserver(() => {
        if (map.querySelector(".maplibregl-popup")) xong();
      });
      ob.observe(map, { childList: true, subtree: true });
      return () => {
        goPanel();
        ob.disconnect();
      };
    },
  },
  {
    id: "thoi-gian",
    icon: "🕰️",
    nhan: "Kéo thanh thời gian về ngày xưa",
    loiBe: "Thanh dài phía dưới là cỗ máy thời gian đó! Kéo nó sang trái để xem nước ta hồi xưa trông thế nào nhé.",
    loiNguoiLon: "Kéo thanh dòng thời gian — ranh giới hành chính đổi theo thời kỳ.",
    goiY: "Thanh trượt nằm ở đáy màn hình, ngay cạnh chữ «Dòng thời gian».",
    trongTour: true,
    neo: () => el("#timeline-wrap") ?? el("#timeline"),
    nghe: (xong) => {
      const inp = document.getElementById("timeline") as HTMLInputElement | null;
      const nhan = document.getElementById("period-label");
      if (!inp || !nhan) return () => {};
      const banDau = inp.value;
      // `input` chứ không phải `change`: trẻ kéo bằng ngón tay, `change` chỉ bắn
      // lúc thả tay nên lời khen đến muộn tới cả giây.
      const h = (): void => {
        if (inp.value !== banDau) xong();
      };
      inp.addEventListener("input", h);
      // Đo trên Chrome thật: bấm một VẠCH MỐC đổi được thời kỳ mà KHÔNG bắn
      // `input` — moc-lich-su.ts gán thẳng `.value` rồi tự gọi setPeriod. Trẻ con
      // bấm vạch nhiều hơn kéo thanh, nên chỉ nghe input là bước này treo.
      // Nhãn thời kỳ đổi chữ là bằng chứng chung của MỌI đường đổi thời kỳ.
      let chuDau = nhan.textContent;
      const ob = new MutationObserver(() => {
        const nay = nhan.textContent;
        if (nay === chuDau) return;
        // Lúc mới nạp, nhãn còn là chỗ giữ chỗ «Đang tải dữ liệu…»; lần đổi chữ
        // đầu tiên là DỮ LIỆU VỀ chứ không phải người dùng kéo thanh. Đo trên
        // Chrome thật: không có nhánh này thì nhiệm vụ «kéo thanh thời gian» tự
        // tick ngay khi mở trang, huy hiệu nhảy 1/17 mà chưa ai làm gì.
        if (!chuDau || /Đang tải/.test(chuDau)) {
          chuDau = nay;
          return;
        }
        xong();
      });
      ob.observe(nhan, { childList: true, characterData: true, subtree: true });
      return () => {
        inp.removeEventListener("input", h);
        ob.disconnect();
      };
    },
  },
  {
    id: "chip-lop",
    icon: "🏯",
    nhan: "Bật một nhóm trên thanh chip",
    loiBe: "Hàng nút tròn phía trên là các kho báu trên bản đồ. Bấm một cái — «Đền chùa và thành cổ» chẳng hạn — xem chuyện gì xảy ra!",
    loiNguoiLon: "Bấm một chip nhóm để bật cả cụm lớp phủ lên bản đồ.",
    goiY: "Hàng chip nằm ngay dưới ô tìm kiếm, cuộn ngang được nếu màn hình hẹp.",
    trongTour: true,
    neo: () => document.getElementById("chip-bar"),
    nghe: (xong) => {
      // Nghe chính checkbox lớp phủ chứ không nghe cú bấm chip: chip-bar bật cụm
      // bằng cách dispatch `change` vào đúng những checkbox này, nên nghe ở đây
      // bắt được CẢ hai đường — bấm chip và tự tick trong bảng lớp.
      const h = (e: Event): void => {
        const t = e.target as HTMLInputElement | null;
        if (t?.name === "overlay" && t.checked) xong();
      };
      document.addEventListener("change", h, true);
      return () => document.removeEventListener("change", h, true);
    },
  },
  {
    id: "tim-kiem",
    icon: "🔎",
    nhan: "Tìm một địa danh bằng ô tìm kiếm",
    loiBe: "Gõ tên một nơi bạn thích vào ô tìm kiếm — «Hà Nội», «Điện Biên», hay tên quê bạn.",
    loiNguoiLon: "Gõ ít nhất hai chữ vào ô tìm kiếm để mở gợi ý.",
    goiY: "Ô có hình kính lúp ở thanh trên cùng. Bấm phím «/» cũng nhảy thẳng vào đó.",
    trongTour: true,
    neo: () => document.getElementById("vn-search"),
    nghe: (xong) => {
      const inp = document.getElementById("vn-search-input") as HTMLInputElement | null;
      if (!inp) return () => {};
      const h = (): void => {
        if (inp.value.trim().length >= 2) xong();
      };
      inp.addEventListener("input", h);
      return () => inp.removeEventListener("input", h);
    },
  },
  {
    id: "nien-bieu",
    icon: "📜",
    nhan: "Mở niên biểu 4000 năm",
    loiBe: "Bấm vào tên thời kỳ ở góc dưới bên phải, cả bốn nghìn năm sẽ mở ra trước mắt bạn.",
    loiNguoiLon: "Bấm nhãn thời kỳ để mở niên biểu đầy đủ.",
    goiY: "Nút chữ nằm cuối thanh dòng thời gian, cạnh thanh trượt.",
    trongTour: true,
    neo: () => document.getElementById("period-label"),
    nghe: khiPanelMo("timeline-panel"),
  },
  {
    id: "truyen",
    icon: "🐉",
    nhan: "Đi cùng Lạc và Âu",
    loiBe: "Đây là chỗ của mình đó! Bấm nút 🐉 Thiếu nhi để nghe chuyện Con Rồng Cháu Tiên và nhặt hạt ngọc.",
    loiNguoiLon: "Mở «Thiếu nhi» — hành trình Con Rồng Cháu Tiên có thử thách từng chương.",
    goiY: "Nút 🐉 nằm trong menu «Khám phá» trên thanh trên cùng.",
    trongTour: true,
    neo: neoNut("story-btn"),
    moTruoc: moMenuKhamPha,
    nghe: khiPanelMo("story-panel"),
  },
  {
    id: "thu-vien",
    icon: "📖",
    nhan: "Mở Thư viện",
    loiBe: "Thư viện có hơn bảy trăm bài thơ, bài hát và câu chuyện. Bấm 📖 Thư viện xem thử!",
    loiNguoiLon: "Mở Thư viện — hơn 700 tác phẩm chia theo 15 chủ đề.",
    goiY: "Nút 📖 Thư viện ở thanh trên cùng.",
    trongTour: true,
    neo: neoNut("library-btn"),
    nghe: khiPanelMo("library-panel"),
  },
  {
    id: "doc-tho",
    icon: "🪶",
    nhan: "Đọc một bài thơ trong sách học ngày xưa",
    loiBe: "Trong Thư viện có ngăn «Sách học ngày xưa» — thơ mà ông bà ta học hồi bé. Chọn một bài và mở ra đọc nhé!",
    loiNguoiLon: "Vào tab «Sách học ngày xưa» và mở một tác phẩm trong khung đọc.",
    goiY: "Bấm tab «Sách học ngày xưa» trong Thư viện, rồi bấm tên một bài thơ.",
    trongTour: true,
    neo: () => document.getElementById("library-panel"),
    nghe: (xong) => {
      const goc = document.getElementById("library-content");
      if (!goc) return () => {};
      const kiem = (): void => {
        if (goc.querySelector(".lib-doc")) xong();
      };
      const ob = new MutationObserver(kiem);
      ob.observe(goc, { childList: true, subtree: true });
      kiem();
      return () => ob.disconnect();
    },
  },
  {
    id: "tro-choi",
    icon: "🎮",
    nhan: "Chơi «Đoán Tỉnh Xưa»",
    loiBe: "Thử tài nào! Trò «Đoán Tỉnh Xưa» đưa cho bạn một cái tên cũ, bạn đoán xem nay là tỉnh nào.",
    loiNguoiLon: "Mở trò chơi «Đoán Tỉnh Xưa».",
    goiY: "Nút 🎮 nằm trong menu «Khám phá».",
    trongTour: true,
    neo: neoNut("game-btn"),
    moTruoc: moMenuKhamPha,
    nghe: khiPanelMo("game-panel"),
  },
  {
    id: "ba-chieu",
    icon: "⛰️",
    nhan: "Bật bản đồ 3D",
    loiBe: "Bấm nút ⛰️ 3D, núi non và đền đài sẽ nhô hẳn lên khỏi mặt bản đồ!",
    loiNguoiLon: "Bật chế độ 3D — địa hình và mô hình khối hiện lên trên bản đồ.",
    goiY: "Nút ⛰️ 3D ở thanh trên cùng, cạnh nút đổi chế độ xem.",
    trongTour: true,
    neo: neoNut("threed-btn"),
    nghe: khiBamNut("threed-btn"),
  },

  // ── Nhiệm vụ tự do: KHÔNG nằm trong 10 bước cầm tay chỉ việc ──────────────
  {
    id: "hoang-sa",
    icon: "🇻🇳",
    nhan: "Tìm cho ra quần đảo Hoàng Sa",
    loiBe: "Hoàng Sa và Trường Sa là của Việt Nam mình. Gõ «Hoàng Sa» vào ô tìm kiếm để tới thăm nhé!",
    loiNguoiLon: "Tìm «Hoàng Sa» hoặc «Trường Sa» trong ô tìm kiếm.",
    goiY: "Gõ vào ô tìm kiếm ở thanh trên cùng — không cần gõ dấu cũng ra.",
    trongTour: false,
    neo: () => document.getElementById("vn-search"),
    nghe: (xong) => {
      const inp = document.getElementById("vn-search-input") as HTMLInputElement | null;
      if (!inp) return () => {};
      const h = (): void => {
        const q = normalizeVi(inp.value);
        if (q.includes("hoang sa") || q.includes("truong sa")) xong();
      };
      inp.addEventListener("input", h);
      return () => inp.removeEventListener("input", h);
    },
  },
  {
    id: "on-tap",
    icon: "🧠",
    nhan: "Làm một lượt ôn tập",
    loiBe: "Ôn lại xem nhớ được bao nhiêu — mỗi lượt chỉ mười câu thôi.",
    loiNguoiLon: "Mở «Ôn tập» — bộ thẻ theo phương pháp lặp lại ngắt quãng.",
    goiY: "Nút 🧠 Ôn tập nằm trong menu «Khám phá».",
    trongTour: false,
    neo: neoNut("quiz-btn"),
    moTruoc: moMenuKhamPha,
    nghe: khiPanelMo("quiz-panel"),
  },
  {
    id: "sa-do",
    icon: "⚔️",
    nhan: "Xem một sa đồ trận đánh",
    loiBe: "Hơn hai trăm trận đánh đều có sơ đồ vẽ lại từng bước. Mở một trận xem quân ta đánh thế nào!",
    loiNguoiLon: "Mở một sa đồ chiến dịch — 240 trận dựng theo diễn biến chính sử.",
    goiY: "Bấm một điểm trận đánh trên bản đồ, hoặc mở nút sa đồ trong menu «Khám phá».",
    trongTour: false,
    neo: neoNut("battle-btn"),
    moTruoc: moMenuKhamPha,
    nghe: khiPanelMo("battle-panel"),
  },
  {
    id: "hanh-trinh",
    icon: "🏛️",
    nhan: "Đi hết một chặng Hành trình lịch sử",
    loiBe: "Hành trình lịch sử dẫn bạn đi qua hai mươi hai chặng, từ vua Hùng tới ngày nay.",
    loiNguoiLon: "Mở «Hành trình lịch sử» — 22 chặng, đủ 5 nhóm phân kỳ.",
    goiY: "Nút 🏛️ Hành trình lịch sử trong menu «Khám phá».",
    trongTour: false,
    neo: neoNut("journey-btn"),
    moTruoc: moMenuKhamPha,
    nghe: khiPanelMo("journey-panel"),
  },
  {
    id: "quoc-gia",
    icon: "🇻🇳",
    nhan: "Mở «Việt Nam trong tôi»",
    loiBe: "Xem tổng thể đất nước mình: bao nhiêu tỉnh, bao nhiêu dân tộc, bao nhiêu di sản.",
    loiNguoiLon: "Mở trang tổng quan quốc gia.",
    goiY: "Nút 🇻🇳 Việt Nam trong tôi nằm trong menu «Khám phá».",
    trongTour: false,
    neo: neoNut("quocgia-btn"),
    moTruoc: moMenuKhamPha,
    nghe: khiPanelMo("quocgia-panel"),
  },
  {
    id: "olympia",
    icon: "🏔️",
    nhan: "Leo một câu Olympia",
    loiBe: "Thử sức với câu đố kiểu Đường lên đỉnh Olympia xem sao!",
    loiNguoiLon: "Mở phần câu đố Olympia.",
    goiY: "Nút Olympia nằm trong menu «Khám phá».",
    trongTour: false,
    neo: neoNut("olympia-btn"),
    moTruoc: moMenuKhamPha,
    nghe: khiPanelMo("olympia-panel"),
  },
  {
    id: "doi-che-do",
    icon: "🎨",
    nhan: "Đổi qua lại hai chế độ xem",
    loiBe: "Nút ở góc trái đổi giữa chế độ trẻ em và chế độ người lớn. Thử xem trang đổi kiểu thế nào!",
    loiNguoiLon: "Chuyển giữa chế độ người lớn và chế độ trẻ em.",
    goiY: "Nút đầu tiên bên trái trong thanh nút trên cùng.",
    trongTour: false,
    neo: neoNut("che-do-btn"),
    nghe: (xong) => {
      document.addEventListener(SU_KIEN_DOI_CHE_DO, xong);
      return () => document.removeEventListener(SU_KIEN_DOI_CHE_DO, xong);
    },
  },
];

const VIEC_TOUR = VIEC.filter((v) => v.trongTour);

// ═══════════════════════════════════════════════════════════════════════════
// 3. Cảm biến chạy nền — nhiệm vụ tự đánh dấu kể cả khi không mở sổ tay
// ═══════════════════════════════════════════════════════════════════════════

const goBo = new Map<string, () => void>();

/** Phát ra mỗi khi một việc chuyển sang «xong», để hai màn tự vẽ lại. */
const SK_XONG = "bkvn:huong-dan-xong";

function danhDauXong(id: string): void {
  if (daXong.has(id)) return;
  daXong.add(id);
  ghiXong(daXong);
  goBo.get(id)?.();
  goBo.delete(id);
  document.dispatchEvent(new CustomEvent(SK_XONG, { detail: id }));
}

/**
 * Gắn cảm biến cho MỌI việc chưa xong, ngay từ lúc nạp trang.
 *
 * Cố ý nghe cả khi sổ tay đang đóng: đứa trẻ mò ra cách bật lớp phủ trước khi
 * biết có sổ tay thì việc đó vẫn phải được tính. Bảng nhiệm vụ ghi lại cái nó
 * ĐÃ LÀM, không phải cái nó làm trong lúc bảng đang mở.
 */
function ganCamBien(): void {
  for (const v of VIEC) {
    if (daXong.has(v.id) || goBo.has(v.id)) continue;
    let daBan = false;
    const go = v.nghe(() => {
      if (daBan) return; // vài cảm biến bắn liên tiếp (mỗi phím gõ một lần)
      daBan = true;
      danhDauXong(v.id);
    });
    goBo.set(v.id, go);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Màn 1 — Cầm tay chỉ việc (khoét sáng + bong bóng)
// ═══════════════════════════════════════════════════════════════════════════

let buocHienTai = -1;
let goBuoc: (() => void) | null = null;
let hen: number | undefined;
let nhipTheoDoi: number | undefined;

function dungLopPhu(): { lop: HTMLElement; vong: HTMLElement; bong: HTMLElement } {
  let lop = document.getElementById("hd-lop");
  if (!lop) {
    lop = document.createElement("div");
    lop.id = "hd-lop";
    lop.setAttribute("aria-hidden", "true"); // nội dung thật nằm ở bong bóng
    lop.innerHTML = `<div id="hd-vong"></div>`;
    document.body.appendChild(lop);
  }
  let bong = document.getElementById("hd-bong");
  if (!bong) {
    bong = document.createElement("div");
    bong.id = "hd-bong";
    bong.setAttribute("role", "dialog");
    bong.setAttribute("aria-live", "polite");
    bong.setAttribute("aria-label", "Hướng dẫn từng bước");
    document.body.appendChild(bong);
  }
  return { lop, vong: document.getElementById("hd-vong")!, bong };
}

/**
 * Đặt vòng sáng trùm lên phần tử đích và ghim bong bóng cạnh nó.
 *
 * Tính lại theo nhịp thay vì tính một lần: `--topbar-h` co giãn khi hàng chip
 * xuống dòng, panel mở ra đẩy bố cục, bản đồ đổi kích thước khi xoay máy. Ghim
 * một lần là bong bóng trôi khỏi đích ngay ở thao tác thứ hai.
 */
function ghimVao(dich: HTMLElement | null, vong: HTMLElement, bong: HTMLElement): void {
  if (!dich || !dich.isConnected) {
    vong.style.opacity = "0";
    bong.style.left = "50%";
    bong.style.top = "auto";
    bong.style.bottom = "12vh";
    bong.style.transform = "translateX(-50%)";
    return;
  }
  const r = dich.getBoundingClientRect();
  const dem = 8;
  vong.style.opacity = "1";
  vong.style.left = `${Math.max(4, r.left - dem)}px`;
  vong.style.top = `${Math.max(4, r.top - dem)}px`;
  vong.style.width = `${Math.min(window.innerWidth - 8, r.width + dem * 2)}px`;
  vong.style.height = `${Math.min(window.innerHeight - 8, r.height + dem * 2)}px`;

  // Bong bóng nằm phía đối diện đích so với tâm màn hình, để không che chính
  // thứ vừa chỉ vào. Đích cao quá nửa màn (bản đồ) thì bám mép dưới.
  const bongR = bong.getBoundingClientRect();
  const cao = bongR.height || 180;
  const rong = bongR.width || 320;
  const duoi = r.bottom + 16;
  const tren = r.top - cao - 16;
  const chuiVuaDuoi = duoi + cao < window.innerHeight - 8;
  const y = chuiVuaDuoi ? duoi : Math.max(8, tren);
  const x = Math.min(
    Math.max(8, r.left + r.width / 2 - rong / 2),
    Math.max(8, window.innerWidth - rong - 8),
  );
  bong.style.left = `${x}px`;
  bong.style.top = `${y}px`;
  bong.style.bottom = "auto";
  bong.style.transform = "none";
}

function ketThucTour(): void {
  goBuoc?.();
  goBuoc = null;
  buocHienTai = -1;
  window.clearTimeout(hen);
  window.clearInterval(nhipTheoDoi);
  document.getElementById("hd-lop")?.remove();
  document.getElementById("hd-bong")?.remove();
  window.removeEventListener("resize", veLaiGhim);
  capNhatHuyHieu();
}

let ghimLai: (() => void) | null = null;
const veLaiGhim = (): void => ghimLai?.();

function veBuoc(i: number): void {
  const v = VIEC_TOUR[i];
  if (!v) return xongTour();
  buocHienTai = i;
  goBuoc?.();
  goBuoc = null;
  window.clearTimeout(hen);

  const { vong, bong } = dungLopPhu();
  v.moTruoc?.();

  const treEm = cheDoHienTai() === "tre-em";
  const loi = treEm ? v.loiBe : v.loiNguoiLon;
  const nguoiKe = i % 2 === 0 ? "👦 Lạc" : "👧 Âu";
  bong.classList.remove("hd-bong-thang");
  bong.innerHTML = `
    <div class="hd-dau">
      <span class="hd-buoc">Bước ${i + 1}/${VIEC_TOUR.length}</span>
      <button type="button" class="hd-dong" data-hd="thoat" aria-label="Đóng hướng dẫn">×</button>
    </div>
    <p class="hd-loi">${treEm ? `<b>${nguoiKe}:</b> ` : ""}${esc(loi)}</p>
    <p class="hd-goi-y">💡 ${esc(v.goiY)}</p>
    <div class="hd-cham">${VIEC_TOUR.map(
      (_, k) => `<i class="${k < i ? "hd-cham-xong" : k === i ? "hd-cham-nay" : ""}"></i>`,
    ).join("")}</div>
    <div class="hd-nut">
      <button type="button" data-hd="bo-qua">Bỏ qua bước này →</button>
      <button type="button" data-hd="thoat">Để lúc khác</button>
    </div>`;

  ghimLai = () => ghimVao(v.neo(), vong, bong);
  ghimLai();
  window.clearInterval(nhipTheoDoi);
  // 250 ms: đủ nhanh để mắt không thấy bong bóng lệch, đủ chậm để không tốn gì.
  // rAF ở đây là lãng phí — đích chỉ dịch khi bố cục đổi, không phải mỗi khung.
  nhipTheoDoi = window.setInterval(veLaiGhim, 250);
  window.addEventListener("resize", veLaiGhim);

  let daBan = false;
  goBuoc = v.nghe(() => {
    if (daBan) return;
    daBan = true;
    danhDauXong(v.id);
    khenRoiSang(i, bong);
  });
}

function khenRoiSang(i: number, bong: HTMLElement): void {
  bong.classList.add("hd-bong-thang");
  bong.innerHTML = `<p class="hd-thang">🎉 Giỏi quá! Bạn làm được rồi.</p>`;
  hen = window.setTimeout(() => veBuoc(i + 1), 1100);
}

function xongTour(): void {
  const { vong, bong } = dungLopPhu();
  ghimVao(null, vong, bong);
  window.clearInterval(nhipTheoDoi);
  goBuoc?.();
  goBuoc = null;
  bong.classList.add("hd-bong-thang");
  bong.innerHTML = `
    <p class="hd-huy-hieu">🏅</p>
    <p class="hd-thang">Bạn đã là <b>Nhà thám hiểm nhí</b>!</p>
    <p class="hd-loi">Còn ${VIEC.length - VIEC_TOUR.length} nhiệm vụ nữa trong Sổ tay thám hiểm — bạn tự đi tiếp nhé.</p>
    <div class="hd-nut">
      <button type="button" data-hd="so-tay" class="hd-chinh">📔 Mở sổ tay</button>
      <button type="button" data-hd="thoat">Đóng</button>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Màn 2 — Sổ tay thám hiểm
// ═══════════════════════════════════════════════════════════════════════════

function veSoTay(): void {
  const goc = document.getElementById("huongdan-content");
  if (!goc) return;
  const treEm = cheDoHienTai() === "tre-em";
  const soXong = VIEC.filter((v) => daXong.has(v.id)).length;
  const phanTram = Math.round((soXong / VIEC.length) * 100);
  goc.innerHTML = `
    <h2>📔 Sổ tay thám hiểm</h2>
    <p class="hd-tien-do-so">Đã xong <b>${soXong}/${VIEC.length}</b> nhiệm vụ</p>
    <div class="hd-thanh" role="progressbar" aria-valuemin="0" aria-valuemax="100"
         aria-valuenow="${phanTram}" aria-label="Tiến độ nhiệm vụ">
      <i style="width:${phanTram}%"></i>
    </div>
    <button type="button" class="hd-chay-tour" data-hd="chay-tour">
      ${soXong ? "🧭 Chạy lại phần cầm tay chỉ việc" : "🧭 Bắt đầu: cầm tay chỉ việc 10 bước"}
    </button>
    <ul class="hd-danh-sach">${VIEC.map((v) => {
      const xong = daXong.has(v.id);
      return `<li class="${xong ? "hd-xong" : ""}">
        <span class="hd-tick" aria-hidden="true">${xong ? "✅" : "⭕"}</span>
        <div>
          <b>${v.icon} ${esc(v.nhan)}</b>
          ${xong ? "" : `<span class="hd-goi-y">💡 ${esc(treEm ? v.loiBe : v.goiY)}</span>`}
        </div>
      </li>`;
    }).join("")}</ul>
    <p class="hd-chan">Tiến độ lưu ngay trên máy bạn, không gửi đi đâu cả.</p>`;
}

function moSoTay(): void {
  showOnly("huongdan-panel");
  veSoTay();
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Nút, lời mời lần đầu, và dây nối sự kiện
// ═══════════════════════════════════════════════════════════════════════════

function capNhatHuyHieu(): void {
  const btn = document.getElementById("huongdan-btn");
  if (!btn) return;
  const soXong = VIEC.filter((v) => daXong.has(v.id)).length;
  btn.dataset.dem = soXong ? `${soXong}/${VIEC.length}` : "";
  btn.title = soXong
    ? `Sổ tay thám hiểm — đã xong ${soXong}/${VIEC.length} nhiệm vụ`
    : "Tập khám phá — hướng dẫn từng bước";
  btn.setAttribute("aria-label", btn.title);
}

/**
 * Lời mời lần đầu. CHỈ hiện ở chế độ trẻ em: người lớn mở trang lên mà bị một
 * hướng dẫn nhảy ra chắn giữa màn hình là phiền, họ đã có nút 🧭 rồi.
 */
function moiLanDau(): void {
  if (cheDoHienTai() !== "tre-em") return;
  try {
    if (localStorage.getItem(KHOA_MOI)) return;
    localStorage.setItem(KHOA_MOI, "1");
  } catch {
    return; // không nhớ được thì đừng mời, kẻo lần nào vào cũng bị hỏi
  }
  const { vong, bong } = dungLopPhu();
  ghimVao(null, vong, bong);
  bong.innerHTML = `
    <p class="hd-loi"><b>👦 Lạc:</b> Chào bạn! Mình là Lạc, còn đây là Âu.
      Bọn mình dẫn bạn đi một vòng cho quen nhé — chỉ mười bước thôi.</p>
    <div class="hd-nut">
      <button type="button" data-hd="chay-tour" class="hd-chinh">Đi thôi! 🚀</button>
      <button type="button" data-hd="thoat">Để lúc khác</button>
    </div>`;
}

export function initHuongDan(): void {
  if (document.getElementById("huongdan-btn")) return; // chống khởi tạo 2 lần

  daXong = docXong();
  ganCamBien();

  const nav = document.getElementById("topbar-nav");
  if (nav) {
    const btn = document.createElement("button");
    btn.id = "huongdan-btn";
    btn.type = "button";
    btn.innerHTML = `<span aria-hidden="true">🧭</span> <span class="hd-nhan-nut">Tập khám phá</span>`;
    btn.addEventListener("click", moSoTay);
    nav.appendChild(btn);
  }

  registerPanel("huongdan-panel");
  document.getElementById("huongdan-close")?.addEventListener("click", () => {
    hidePanel("huongdan-panel");
  });

  // Một handler uỷ quyền cho cả bong bóng lẫn sổ tay: hai màn vẽ lại liên tục
  // nên gắn listener vào từng nút là gắn đi gắn lại mỗi bước.
  document.addEventListener("click", (e) => {
    const nut = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-hd]");
    if (!nut) return;
    switch (nut.dataset.hd) {
      case "chay-tour":
        hidePanel("huongdan-panel");
        veBuoc(0);
        break;
      case "bo-qua":
        veBuoc(buocHienTai + 1);
        break;
      case "so-tay":
        ketThucTour();
        moSoTay();
        break;
      case "thoat":
        ketThucTour();
        break;
    }
  });

  // Sổ tay đang mở mà việc vừa xong thì phải tick ngay trước mắt người dùng.
  document.addEventListener(SK_XONG, () => {
    capNhatHuyHieu();
    if (document.getElementById("huongdan-panel")?.hidden === false) veSoTay();
  });

  // Đổi chế độ giữa chừng thì lời thoại phải đổi theo — chữ cho trẻ và chữ cho
  // người lớn là hai bản viết riêng, không phải một bản đổi cỡ chữ.
  document.addEventListener(SU_KIEN_DOI_CHE_DO, (e) => {
    const che = (e as CustomEvent<CheDo>).detail;
    if (document.getElementById("huongdan-panel")?.hidden === false) veSoTay();
    if (buocHienTai >= 0 && che) veBuoc(buocHienTai);
  });

  // Escape đóng lớp hướng dẫn. KHÔNG stopPropagation: main.ts cũng dùng Escape
  // để đóng panel, và người bấm Escape muốn thoát khỏi CẢ hai lớp che — cùng lý
  // lẽ đã ghi ở gomNutTopbar().
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("hd-bong")) ketThucTour();
  });

  capNhatHuyHieu();
  // Chờ một nhịp: nút của các module khác còn đang được dựng, mời ngay thì
  // bước «Mở Thư viện» khoét sáng vào chỗ trống.
  window.setTimeout(moiLanDau, 1200);
}
