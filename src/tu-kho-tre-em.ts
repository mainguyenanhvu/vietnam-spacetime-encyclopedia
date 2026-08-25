// Từ khó trong `mo_ta` — chú giải bấm-ra-xem cho chế độ trẻ em.
//
// `tu-vung-tre-em.ts` đã đổi NHÃN lớp phủ sang tiếng trẻ em, nhưng phần chữ
// nặng nhất vẫn nguyên: `mo_ta` của 5.111 khối văn viết bằng ngôn ngữ hồ sơ di
// sản ("sắc phong", "tiết độ sứ", "khu dự trữ sinh quyển"). Viết lại 5.111 khối
// là việc của nhiều tháng; chú giải TỪ thì làm được ngay và không đụng một chữ
// nào của bản gốc — người lớn vẫn đọc đúng câu văn cũ.
//
// Mẫu chép từ `giai_nghia[]` của `sgk-xua-tho.json` (từ khó → nghĩa, hiện ra
// khi bấm). Khác một điểm: ở đó từ khó do người biên tập ghi cho TỪNG bài, ở
// đây một bảng dùng chung cho cả kho, nên phải tự dò trong câu.
//
// ── Ba luật chọn từ, đã đo trên dữ liệu thật, đừng nới ─────────────────────
//
// 1. CHỈ NHẬN CỤM ĐA ÂM TIẾT. Những từ hành chính xưa một âm tiết — "phủ"
//    (285 lần), "châu" (273), "tổng" (247), "trấn" (163), "lộ" (98), "đạo" —
//    đều là từ khó thật, nhưng cũng đều là từ thường ngày mang nghĩa khác
//    ("tổng số", "châu Á", "con đường"). Chú giải sai còn tệ hơn không chú
//    giải, đúng như luật đã ghi ở đầu `tu-vung-tre-em.ts`. Cùng lý do loại
//    "then" (51), "chèo" (21), "nghê" (3).
//
// 2. NGHĨA PHẢI ĐÚNG TRONG MỌI NGỮ CẢNH CỦA KHO. "Duy tân" vừa là phong trào
//    đầu thế kỷ XX vừa là niên hiệu một đời vua, nên lời chú viết bao được cả
//    hai. Từ nào không viết bao được thì bỏ hẳn.
//
// 3. CÓ MẶT THẬT ≥2 LẦN. Bảng này đo từ chính `mo_ta`/`cong_trang`/`loi_binh`
//    của kho ngày 2026-08-25, không phải liệt kê theo trí nhớ. Thêm từ mới thì
//    đo lại, đừng đoán.
//
// Không đặt trong `public/data/` mà để trong `src/`, cùng chỗ với
// `tu-vung-tre-em.ts`: đây là TỪ VỰNG GIAO DIỆN (cách gọi), không phải mục từ
// điển bách khoa, nên không thuộc phạm vi bất biến "mọi mục phải có nguồn".

import { esc } from "./util/html";
import { cheDoHienTai, SU_KIEN_DOI_CHE_DO } from "./chedo";

/** Khoá viết thường, không dấu câu. Giá trị = một câu, viết cho trẻ 8–12 tuổi. */
export const TU_KHO: Record<string, string> = {
  // ── Học hành, thi cử ──────────────────────────────────────────────────
  "khoa bảng": "Chuyện học và thi ngày xưa. Người thi đỗ kỳ thi của nhà vua gọi là người khoa bảng.",
  "khoa thi": "Kỳ thi lớn do nhà vua mở để chọn người giỏi ra làm quan.",
  "thi hương": "Kỳ thi vòng đầu, mở ở tỉnh. Ai đỗ thì được gọi là Cử nhân.",
  "thi hội": "Kỳ thi vòng hai, mở ở kinh đô cho những người đã đỗ thi Hương.",
  "thi đình": "Kỳ thi cuối cùng, do chính nhà vua ra đề và chấm ngay trong cung.",
  "trạng nguyên": "Người đỗ đầu cả nước trong kỳ thi của nhà vua.",
  "bảng nhãn": "Người đỗ thứ nhì cả nước, chỉ sau Trạng nguyên.",
  "thám hoa": "Người đỗ thứ ba cả nước, sau Trạng nguyên và Bảng nhãn.",
  "hoàng giáp": "Bậc đỗ cao trong kỳ thi Đình, xếp ngay dưới ba người đứng đầu.",
  "đình nguyên": "Người đỗ đầu kỳ thi Đình.",
  "tiến sĩ":
    "Ngày xưa là người thi đỗ kỳ thi cao nhất của nhà vua. Ngày nay là bậc học cao nhất ở trường đại học.",
  "phó bảng": "Bậc đỗ ngay dưới Tiến sĩ, có từ thời nhà Nguyễn.",
  "cử nhân": "Người đỗ kỳ thi Hương.",
  "quốc tử giám": "Trường học lớn nhất nước ngày xưa, ở kinh đô, dạy con vua quan và người học giỏi.",
  "văn miếu": "Nơi thờ Khổng Tử và người học giỏi; cũng là chỗ dựng bia khắc tên người thi đỗ.",
  "nho học": "Lối học theo sách của Khổng Tử — môn học chính của người đi thi ngày xưa.",
  "hàn lâm": "Cơ quan của triều đình gồm những người chữ nghĩa giỏi, lo soạn giấy tờ cho vua.",
  "đốc học": "Ông quan trông coi việc học của cả một tỉnh.",
  "chữ nôm": "Thứ chữ người Việt tự đặt ra từ chữ Hán để ghi tiếng Việt của mình.",
  "hán nôm": "Chữ Hán và chữ Nôm — hai loại chữ cha ông ta dùng trước khi có chữ quốc ngữ.",

  // ── Di tích, di sản ───────────────────────────────────────────────────
  "xếp hạng": "Nhà nước công nhận một nơi là di tích quý và phải giữ gìn.",
  "di tích lịch sử": "Nơi từng xảy ra chuyện quan trọng thời trước, nay được nhà nước giữ gìn.",
  "di tích kiến trúc nghệ thuật": "Công trình cũ đẹp và quý về cách xây, cách chạm trổ.",
  "di tích khảo cổ": "Nơi tìm thấy dấu vết người xưa còn nằm dưới lòng đất.",
  "danh lam thắng cảnh": "Nơi có cảnh đẹp nổi tiếng, thường có chùa hoặc đền.",
  "di sản văn hoá phi vật thể": "Những thứ quý mà không cầm nắm được: câu hát, lễ hội, nghề, tiếng nói.",
  "di sản văn hóa phi vật thể": "Những thứ quý mà không cầm nắm được: câu hát, lễ hội, nghề, tiếng nói.",
  "bảo vật quốc gia": "Đồ vật quý nhất nước, độc đáo, không được mang ra nước ngoài.",
  "hiện vật": "Đồ vật thật của người xưa còn giữ lại được.",
  "cổ vật": "Đồ vật đã trên trăm tuổi, quý và hiếm.",
  "khảo cổ": "Việc đào đất tìm dấu vết người xưa để hiểu ngày trước sống ra sao.",
  "di chỉ": "Chỗ người xưa từng ở hoặc từng làm việc, nay còn dấu vết dưới đất.",
  "quần thể": "Nhiều công trình đứng gần nhau, tính chung thành một.",
  "cụm di tích": "Nhiều di tích ở gần nhau, được xếp chung vào một hồ sơ.",
  "vùng lõi": "Phần trong cùng và quý nhất của khu di sản, được giữ nghiêm ngặt nhất.",
  "vùng đệm": "Vành đai bao quanh vùng lõi để che chắn cho nó.",
  "trùng tu": "Sửa lại công trình cũ đã hỏng, cố giữ đúng dáng như xưa.",
  "tôn tạo": "Sửa sang và làm đẹp thêm cho di tích.",
  "phục dựng": "Dựng lại công trình đã mất, dựa theo ảnh và sách cũ.",
  "niên đại": "Tuổi của một vật hay một công trình — nó có từ năm nào.",
  "bia đá": "Tấm đá dựng đứng, khắc chữ để ghi nhớ chuyện xưa.",
  "văn bia": "Bài chữ khắc trên bia đá để ghi lại chuyện đáng nhớ.",
  "hoành phi": "Tấm gỗ nằm ngang treo trên cao trong đền chùa, khắc mấy chữ lớn.",
  "câu đối": "Hai câu chữ đối nhau, treo hai bên cột hoặc hai bên cửa.",
  "đại tự": "Chữ thật lớn khắc hoặc viết trên hoành phi.",
  "sắc phong": "Tờ giấy vua ban để phong chức cho quan hoặc phong thần cho một vị thần.",
  "thần tích": "Sách chép chuyện về vị thần được thờ trong làng.",
  "gia phả": "Quyển sổ ghi tên các đời trong một dòng họ.",
  "chạm khắc": "Dùng dao đục vào gỗ hay đá cho thành hình.",
  "chạm trổ": "Chạm khắc thật tỉ mỉ, nhiều hoa lá hình thù.",
  "hoa văn": "Những hình trang trí lặp đi lặp lại trên đồ vật.",
  "tam quan": "Cổng chùa có ba lối đi.",
  "tiền đường": "Toà nhà phía trước trong đền hoặc chùa.",
  "đại bái": "Toà nhà rộng ở giữa đền, nơi mọi người vào lễ.",
  "hậu cung": "Gian trong cùng của đền, nơi đặt tượng hoặc bài vị vị thần chính.",
  "thượng điện": "Gian cao và trong nhất của chùa, nơi đặt tượng Phật lớn.",
  "gác chuông": "Cái gác dựng cao trong chùa để treo chuông.",
  "tháp chuông": "Tháp xây cao để treo chuông.",
  "bài vị": "Tấm gỗ nhỏ ghi tên người đã mất, đặt trên bàn thờ.",
  "thờ tự": "Việc thờ cúng.",
  "tế lễ": "Lễ cúng lớn có nhạc, có người đọc văn, thường mở ở đình làng.",
  "rước kiệu": "Khiêng kiệu có tượng hoặc bài vị thần đi quanh làng trong ngày hội.",
  "hội làng": "Ngày hội của cả làng, phần nhiều mở vào mùa xuân.",
  "thành hoàng": "Vị thần trông coi và che chở cho một làng.",
  "phúc thần": "Vị thần hiền, mang điều lành đến cho dân.",
  "tổ nghề": "Người đầu tiên dạy một nghề cho dân làng, sau được dân lập đền thờ.",
  "nghề truyền thống": "Nghề cha ông truyền lại qua nhiều đời.",
  "tín ngưỡng": "Niềm tin và cách thờ cúng của một vùng hay một dân tộc.",
  "thiền sư": "Nhà sư tu theo lối ngồi thiền, thường rất giỏi chữ nghĩa.",
  "quốc sư": "Nhà sư được vua mời làm thầy dạy cho cả nước.",
  "tăng thống": "Chức cao nhất trông coi việc của các nhà sư trong nước.",
  "thiền phái": "Một dòng tu riêng của đạo Phật.",
  "trúc lâm": "Dòng thiền do vua Trần Nhân Tông lập ra trên núi Yên Tử.",
  "tứ bất tử":
    "Bốn vị thần không bao giờ chết trong truyện dân gian: Tản Viên, Thánh Gióng, Chử Đồng Tử và Bà Chúa Liễu.",

  // ── Vua quan, nhà nước ────────────────────────────────────────────────
  "triều đại": "Một dòng vua nối nhau cai trị, ví dụ nhà Lý, nhà Trần.",
  "vương triều": "Một dòng vua nối nhau cai trị.",
  "phong kiến": "Thời có vua đứng đầu, đất đai và quyền hành nằm trong tay vua quan và nhà giàu.",
  "hoàng đế": "Ông vua lớn, đứng đầu cả nước.",
  "thái thượng hoàng": "Vua cha đã nhường ngôi cho con nhưng vẫn ở bên giúp con trị nước.",
  "hoàng thái hậu": "Mẹ của vua.",
  "công thần": "Người có công lớn giúp vua dựng nước hoặc giữ nước.",
  "khai quốc công thần": "Người có công lớn nhất trong việc lập ra một triều đại mới.",
  "tể tướng": "Ông quan to nhất, giúp vua trông coi mọi việc trong nước.",
  "thượng thư": "Ông quan đứng đầu một bộ, giống bộ trưởng ngày nay.",
  "ngự sử": "Ông quan chuyên xem xét, can vua và vạch lỗi quan lại.",
  "tổng đốc": "Ông quan cai quản một tỉnh lớn, có khi hai tỉnh.",
  "tuần phủ": "Ông quan cai quản một tỉnh nhỏ.",
  "tri phủ": "Ông quan cai quản một phủ — vùng gồm nhiều huyện.",
  "tri huyện": "Ông quan cai quản một huyện.",
  "đề đốc": "Ông quan võ chỉ huy quân trong một vùng.",
  "thái thú": "Chức quan cai trị một quận thời nước ta bị phương Bắc đô hộ.",
  "thứ sử": "Chức quan cai trị một châu thời nước ta bị phương Bắc đô hộ.",
  "tiết độ sứ": "Chức quan lớn cai quản cả một vùng biên, có quân riêng trong tay.",
  "thái y":
    "Thầy thuốc riêng của vua. «Thái y viện» là cơ quan lo việc thuốc thang trong cung.",
  "lương y": "Thầy thuốc vừa giỏi nghề vừa có lòng tốt.",
  "đông y": "Cách chữa bệnh bằng cây cỏ, học theo sách thuốc phương Đông.",
  "dược liệu": "Cây cỏ dùng để làm thuốc.",
  "đơn vị hành chính": "Cách chia đất nước thành tỉnh, huyện, xã cho dễ trông coi.",
  "sáp nhập": "Gộp hai nơi lại làm một.",
  "hợp nhất": "Gộp lại thành một.",
  "đồn điền": "Vùng đất rộng trồng một loại cây, có nhiều người làm thuê.",
  "khẩn hoang": "Khai phá đất hoang thành ruộng để cấy trồng.",
  "lập ấp": "Lập ra một xóm mới cho dân đến ở.",
  "nam tiến": "Cuộc đi dần về phương Nam của người Việt qua nhiều đời để mở mang đất đai.",
  "đô hộ": "Nước ngoài chiếm lấy và cai trị nước mình.",
  "bắc thuộc": "Hơn nghìn năm nước ta bị các triều đại phương Bắc cai trị.",

  // ── Đánh giặc, giữ nước ───────────────────────────────────────────────
  "khởi nghĩa": "Dân nổi dậy cầm vũ khí chống lại kẻ đang cai trị mình.",
  "tổng khởi nghĩa": "Cuộc nổi dậy cùng lúc ở khắp cả nước.",
  "nghĩa quân": "Đoàn quân do dân tự lập ra để đánh giặc.",
  "nghĩa sĩ": "Người dám hy sinh vì việc nghĩa.",
  "cần vương": "Phong trào giúp vua đánh Pháp cuối thế kỷ XIX, theo lời kêu gọi của vua Hàm Nghi.",
  "văn thân": "Những người có học ngày xưa đứng ra kêu gọi dân đánh Pháp.",
  "duy tân":
    "Đổi mới. Đầu thế kỷ XX có phong trào Duy Tân kêu gọi đổi mới đất nước bằng học hành và làm ăn.",
  "đông du": "Phong trào đưa thanh niên sang Nhật học, để về cứu nước.",
  "tuẫn tiết": "Tự kết liễu đời mình để giữ khí tiết, không chịu hàng giặc.",
  "căn cứ địa": "Vùng đất an toàn dùng làm chỗ đứng chân của quân cách mạng.",
  "chiến khu": "Vùng rừng núi dùng làm căn cứ để đánh giặc.",
  "an toàn khu": "Vùng được giữ kín và bảo vệ để cơ quan lãnh đạo ở và làm việc.",
  "tù chính trị": "Người bị bắt giam vì chống lại kẻ cai trị, không phải vì phạm tội thường.",
  "binh vận": "Việc vận động lính bên kia bỏ hàng ngũ hoặc quay về với dân.",
  "tập kết": "Việc bộ đội và cán bộ miền Nam ra Bắc sau năm 1954, theo Hiệp định Genève.",
  "phòng tuyến": "Dãy công sự chăng ngang để chặn giặc lại.",
  "thành lũy": "Tường thành đắp cao để giữ giặc ở bên ngoài.",
  "đồn binh": "Chỗ đóng quân có tường rào bao quanh.",
  "thuỷ quân": "Quân đánh nhau trên sông và trên biển.",
  "thủy quân": "Quân đánh nhau trên sông và trên biển.",
  "bộ binh": "Quân đi bộ.",
  "kỵ binh": "Quân cưỡi ngựa. Ngày nay còn dùng để gọi những đơn vị cơ động thật nhanh.",
  "tượng binh": "Quân cưỡi voi.",
  "chiến thuyền": "Thuyền đóng riêng để đánh nhau.",
  "cọc gỗ": "Cọc lớn đóng ngầm dưới lòng sông để đâm thủng thuyền giặc.",
  "mai phục": "Nấp sẵn chờ giặc đi qua rồi bất ngờ xông ra đánh.",
  "đại thắng": "Thắng thật lớn.",
  "liệt sĩ": "Người đã hy sinh khi chiến đấu hoặc khi làm việc cho đất nước.",

  // ── Sách vở, sử liệu ──────────────────────────────────────────────────
  "chính sử": "Bộ sử do triều đình soạn, được coi là đáng tin nhất.",
  "quốc sử": "Sử của cả nước, do nhà nước soạn ra.",
  "sử quán": "Cơ quan của triều đình chuyên lo việc chép sử.",
  "thực lục": "Bộ sử chép việc từng năm của các đời chúa và vua.",
  "toàn thư": "Nói tắt bộ «Đại Việt sử ký toàn thư» — bộ sử xưa quan trọng nhất của nước ta.",
  "mộc bản": "Tấm gỗ khắc ngược chữ, dùng để in sách ngày xưa.",
  "dư địa chí": "Sách chép về đất đai, núi sông và sản vật của một vùng.",
  "sử liệu": "Những tài liệu cũ dùng để tìm hiểu lịch sử.",
  "tương truyền": "Chuyện được người đời truyền miệng nhau, chưa chắc đã đúng hẳn.",
  "truyền thuyết": "Chuyện xưa kể về người và việc có thật, nhưng đã được thêm phần kỳ lạ.",
  "huyền thoại": "Chuyện kể rất xưa, phần lớn là tưởng tượng.",
  "giai thoại": "Mẩu chuyện vui hoặc lạ về một người nổi tiếng.",
  "sự tích": "Chuyện kể về gốc tích của một nơi, một vật hay một tục lệ.",
  "niên hiệu": "Tên vua đặt cho quãng thời gian mình ở ngôi, dùng để tính năm.",
  "âm lịch": "Lịch tính theo tuần trăng — lịch dùng để tính Tết và ngày giỗ.",
  "thế kỷ": "Quãng thời gian 100 năm. Thế kỷ XX là từ năm 1901 đến năm 2000.",

  // ── Đất nước, biển đảo ────────────────────────────────────────────────
  "cương vực": "Phần đất và phần biển thuộc về một nước.",
  "chủ quyền": "Quyền của một nước được tự mình quyết định mọi việc trên đất và biển của mình.",
  "lãnh thổ": "Toàn bộ đất, biển và bầu trời của một nước.",
  "lãnh hải": "Vùng biển sát bờ, thuộc chủ quyền của một nước.",
  "quần đảo": "Một nhóm nhiều hòn đảo nằm gần nhau.",
  "đội hoàng sa":
    "Đội thuyền do các chúa Nguyễn lập ra từ thế kỷ XVII, hằng năm ra quần đảo Hoàng Sa đo đạc và thu nhặt sản vật.",
  "biên giới": "Đường ranh phân chia nước này với nước khác.",

  // ── Thiên nhiên ───────────────────────────────────────────────────────
  "vườn quốc gia": "Khu rừng lớn được nhà nước giữ nguyên để bảo vệ cây và thú.",
  "khu bảo tồn": "Vùng được giữ gìn để cây cỏ và loài vật sống yên.",
  "khu dự trữ sinh quyển":
    "Vùng thiên nhiên rộng được thế giới công nhận, nơi con người sống hoà cùng cây cỏ và muông thú.",
  "công viên địa chất": "Vùng có nhiều đá và địa hình đặc biệt, được giữ lại để học và để tham quan.",
  "hệ sinh thái": "Cây cỏ, loài vật và nơi chúng sống, gắn với nhau thành một vòng.",
  "đa dạng sinh học": "Ở một nơi có thật nhiều loài cây và loài vật khác nhau.",
  "đặc hữu": "Loài chỉ sống ở đúng một vùng, nơi khác trên thế giới không có.",
  karst: "Vùng núi đá vôi bị nước bào mòn lâu năm thành hang động và những ngọn núi lởm chởm.",
  "thạch nhũ": "Những khối đá rủ xuống trong hang, do nước nhỏ giọt lâu năm tạo thành.",
  "phù sa": "Bùn đất mịn do sông mang về, làm cho ruộng đồng màu mỡ.",
  "đầm phá": "Vùng nước lợ rộng nằm sát biển, ngăn với biển bởi một dải cát.",
  "thượng nguồn": "Khúc đầu của con sông, ở vùng núi cao.",
  "hạ lưu": "Khúc cuối của con sông, gần chỗ đổ ra biển.",
  "cửa sông": "Chỗ con sông đổ ra biển.",
  "cao nguyên": "Vùng đất cao mà lại bằng phẳng, nằm trên núi.",

  // ── Hát xướng, nghề cổ ────────────────────────────────────────────────
  "cồng chiêng": "Bộ nhạc cụ bằng đồng của đồng bào Tây Nguyên, gõ lên nghe vang rất xa.",
  "đờn ca tài tử": "Lối đàn hát của người Nam Bộ, chơi trong nhà, trong vườn cho vui.",
  "quan họ": "Lối hát đối đáp của người Bắc Ninh, các liền anh liền chị hát giao duyên.",
  "ca trù": "Lối hát cổ có đàn đáy, phách và trống chầu.",
  "hát xoan": "Lối hát thờ vua Hùng ở Phú Thọ, hát vào mùa xuân.",
  "nhã nhạc": "Nhạc cung đình Huế, tấu trong những buổi lễ lớn của triều Nguyễn.",
  "bài chòi": "Trò chơi kèm hát của miền Trung, người chơi ngồi trong các chòi tre.",
  "cải lương": "Lối hát kịch của Nam Bộ, ra đời đầu thế kỷ XX.",
  tuồng: "Lối hát kịch cổ, mặt vẽ nhiều màu, kể chuyện vua quan và tướng lĩnh.",
  "dân ca": "Bài hát do dân tự đặt ra, truyền miệng qua nhiều đời.",
  "trống đồng": "Trống lớn đúc bằng đồng thời Đông Sơn, mặt trống có ngôi sao và hình chim Lạc.",
  "văn hoá đông sơn": "Nền văn hoá thời các vua Hùng, nổi tiếng nhất là trống đồng.",
  "văn hóa đông sơn": "Nền văn hoá thời các vua Hùng, nổi tiếng nhất là trống đồng.",

  // ── Khác ──────────────────────────────────────────────────────────────
  unesco: "Tổ chức của Liên hợp quốc lo về giáo dục, khoa học và văn hoá.",
  "kinh đô": "Nơi vua ở và làm việc — thủ đô của ngày xưa.",
  "cố đô": "Kinh đô cũ, nay không còn là thủ đô nữa.",
};

/** Escape cho regex — cụm trong bảng chỉ có chữ và dấu cách, nhưng đừng tin. */
const thoat = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let mau: RegExp | null = null;

/**
 * Một mẫu duy nhất dò mọi cụm, dựng lười ở lần gọi đầu.
 *
 * Sắp DÀI TRƯỚC vì `|` của regex ăn nhánh khớp sớm nhất chứ không phải nhánh
 * dài nhất: để "di tích" trước "di tích khảo cổ" là mất luôn cụm dài.
 *
 * Chặn hai đầu bằng lớp không-chữ-không-số thay vì `\b` — `\b` của JS coi chữ
 * có dấu là ranh giới từ, nên "hoà" trong "văn hoá" sẽ khớp bậy.
 */
function layMau(): RegExp {
  if (mau) return mau;
  const nhanh = Object.keys(TU_KHO)
    .sort((a, b) => b.length - a.length)
    .map(thoat)
    .join("|");
  mau = new RegExp(`(^|[^\\p{L}\\p{N}])(${nhanh})(?![\\p{L}\\p{N}])`, "giu");
  return mau;
}

/**
 * Cụm khớp có nằm giữa một chuỗi chữ hoa không — tức là tên riêng chứ không
 * phải từ chung.
 *
 * Đo trên kho thật bắt được ba ca: «Nhà thơ Nguyễn Thế Kỷ» (tên người),
 * «châu Nam Bố Chính» (tên đất), «Vân Nam tiến đánh» (hai từ dính nhau thành
 * một cụm không có thật). Chú giải "Thế Kỷ" trong tên người là 100 năm thì
 * sai trắng.
 *
 * Chỉ nhận dấu cách, phẩy và gạch nối làm chỗ nối — CỐ Ý không nhận dấu chấm.
 * Sau dấu chấm là câu mới, chữ hoa ở đó là hoa đầu câu chứ không phải tên
 * riêng, bỏ qua sẽ mất chú giải đúng.
 */
function hoaLienTruoc(s: string, dau: number): boolean {
  const m = /([\p{L}\p{N}]+)[ \u00A0,\-–—]*$/u.exec(s.slice(0, dau));
  return !!m && m[1][0] !== m[1][0].toLowerCase();
}

const boc = (tu: string, nghia: string): string =>
  `<span class="tk-boc"><button type="button" class="tk-tu" aria-expanded="false">${esc(
    tu,
  )}</button><span class="tk-nghia" hidden>${esc(nghia)}</span></span>`;

/**
 * Thay cho `esc()` ở những khối chữ dài trẻ em phải đọc.
 *
 * Chế độ người lớn: trả đúng như `esc()`, không thêm một byte nào — người lớn
 * không cần chú giải, và như vậy thì đổi sink là việc KHÔNG rủi ro.
 *
 * Chế độ trẻ em: mỗi cụm chỉ đánh dấu LẦN ĐẦU trong khối. Đánh dấu mọi lần
 * xuất hiện làm đoạn văn thành một rừng gạch chân, đọc còn khó hơn lúc chưa
 * chú giải.
 *
 * An toàn XSS: dò trên chuỗi THÔ rồi mới `esc()` từng đoạn, nên không có
 * chuyện một cụm khớp vào giữa chuỗi thực thể HTML (`&amp;`) mà cắt vỡ nó.
 */
export function escKho(s: string): string {
  if (!s) return "";
  if (cheDoHienTai() !== "tre-em") return esc(s);

  const daDung = new Set<string>();
  const r = layMau();
  r.lastIndex = 0;
  let ra = "";
  let cuoi = 0;
  for (let m = r.exec(s); m; m = r.exec(s)) {
    const tu = m[2];
    const khoa = tu.toLowerCase();
    const nghia = TU_KHO[khoa];
    if (!nghia || daDung.has(khoa)) continue;
    const dau = m.index + m[1].length;
    if (tu[0] !== tu[0].toLowerCase() && hoaLienTruoc(s, dau)) continue;
    daDung.add(khoa);
    ra += esc(s.slice(cuoi, dau)) + boc(tu, nghia);
    cuoi = dau + tu.length;
  }
  return ra + esc(s.slice(cuoi));
}

/**
 * Một handler uỷ nhiệm cho cả trang.
 *
 * Phải là uỷ nhiệm chứ không gắn vào từng nút: popup MapLibre dựng bằng
 * `setHTML` sau mỗi cú bấm bản đồ, nút chú giải trong đó chưa hề tồn tại lúc
 * trang khởi tạo.
 */
export function initTuKho(): void {
  // Panel đang mở KHÔNG tự vẽ lại khi đổi chế độ, nên khối chữ dựng lúc còn ở
  // chế độ trẻ em sẽ mang chú giải sang cả chế độ người lớn. Gỡ tại chỗ, đúng
  // lối `apTuVungTheoCheDo` của main.ts đã làm với nhãn lớp phủ.
  //
  // Chỉ gỡ chứ KHÔNG dựng ngược: chiều người-lớn → trẻ-em phải chờ lần vẽ sau.
  // Đó là hướng hỏng an toàn — thiếu chú giải thì vẫn còn nguyên câu gốc, thừa
  // chú giải mới là hiện sai chế độ.
  document.addEventListener(SU_KIEN_DOI_CHE_DO, (e) => {
    if ((e as CustomEvent<string>).detail === "tre-em") return;
    for (const b of document.querySelectorAll<HTMLElement>(".tk-boc"))
      b.replaceWith(document.createTextNode(b.querySelector(".tk-tu")?.textContent ?? ""));
  });

  document.addEventListener("click", (e) => {
    const nut = (e.target as Element | null)?.closest?.(".tk-tu");
    if (!nut) return;
    const o = nut.parentElement?.querySelector<HTMLElement>(".tk-nghia");
    if (!o) return;
    const dangDong = o.hidden;
    o.hidden = !dangDong;
    nut.setAttribute("aria-expanded", String(dangDong));
  });
}
