# Trình bày để nhớ — thiết kế theo bằng chứng cho bách khoa lịch sử

**Câu hỏi:** mỗi loại thông tin trong kho dữ liệu của dự án nên trình bày thế nào để học sinh phổ thông nhớ được lâu?
**Ngày soạn:** 2026-08-28. Mọi nguồn đều truy cập ngày này.

> ⚠️ **Số dòng mã trong bảng D đo ngày 2026-08-28** và đúng vào lúc đo (`src/quiz.ts` 39/94/240 · `src/main.ts` 1887 · `src/battle.ts` 1286 — đã kiểm lại từng cái). Các file này đang được sửa, nên số dòng sẽ trôi. **Tìm theo tên hàm, đừng nhảy theo số dòng.**

## 0. Cách đọc tài liệu này

| Quy ước | Nghĩa |
|---|---|
| `[n]` | Nguồn số n ở mục G. **Chỉ liệt kê tài liệu đã mở được trang và đọc.** |
| Cỡ hiệu ứng | Giữ nguyên dấu chấm thập phân như bản gốc (`g = 0.499`). Số đếm và phần trăm theo lối Việt (`48.478`, `74,70%`). |
| «một nguồn» | Chỉ một nghiên cứu chống lưng. Đừng xây quyết định lớn lên nó. |
| «không mở được» | Tài liệu tồn tại nhưng không đọc được toàn văn — **không trích số từ nó**. Danh sách ở mục F.2. |

Ba loại bằng chứng dùng trong tài liệu: **phân tích tổng hợp** (mạnh nhất), **thí nghiệm gốc**, **tổng quan hệ thống**. Không dùng blog, trang bán khoá học, tài liệu tiếp thị.

---

## A. Nền khoa học

### A.1 Bảy cơ chế, số đo và chỗ yếu

| Cơ chế | Số đo mạnh nhất mở được | Quy mô bằng chứng | Chỗ yếu phải nói ra |
|---|---|---|---|
| **Hiệu ứng kiểm tra** (tự truy xuất rồi mới xem đáp án) | `g = 0.499` trong lớp học thật [1] | 222 nghiên cứu, 48.478 học sinh [1] | Cỡ hiệu ứng đổi theo: đối chứng học kiểu gì, có phản hồi đúng/sai không, số lần lặp, định dạng câu hỏi khớp bài kiểm tra cuối hay không [1] |
| Cùng cơ chế, đo trong phòng thí nghiệm | `g = 0.50` [3] dẫn lại Rowland 2014 [2] | Bản tóm tắt Rowland [2] **không in con số** — số lấy từ bản tổng quan [3] | Bài truy xuất tự do lợi hơn bài nhận diện [2] |
| Cùng cơ chế, đo trên trẻ 8–12 tuổi học **địa lý mới** | 74,70% so với 66,23% sau 4 ngày; hiệu lực còn sau 1 tuần và 5 tuần [5] | 109 và 209 học sinh tiểu học Anh [5] | Tài liệu là bản dữ kiện ngắn, không phải trang bách khoa dày |
| **Hiệu ứng giãn cách** | Khoảng cách ôn tối ưu ≈ 20% của quãng chờ khi kiểm tra sau vài tuần, tụt còn ≈ 5% khi kiểm tra sau 1 năm [7] | Hơn 1.350 người [7]; nền là 839 phép đo trong 317 thí nghiệm thuộc 184 bài [6] | Áp vào giáo dục thật rất khó: «một cỡ không vừa mọi môn», tài liệu khó cần lặp nhiều hơn [8] |
| **Mã hoá kép / đa phương tiện** | 11 nguyên tắc thiết kế có hiệu ứng dương lên học tập; lớn nhất là phụ đề video ngoại ngữ, **đặt chữ kề hình về không gian và thời gian**, và **signaling** (chỉ dấu hướng mắt) [10] | 29 tổng quan, 1.189 nghiên cứu, 78.177 người [10] | Thiết kế đáng giá **hơn** khi tài liệu phức tạp và khi nhịp do hệ thống điều khiển; ít đáng giá hơn khi người học tự bấm [10] |
| Đồ hoạ so với chữ và bảng | Đồ hoạ thắng ở **nhớ xu hướng sau 2 giờ**; **không** thắng ở nhớ tức thì, cũng không thắng ở nhớ từng số [25] | N = 92 và N = 80, sinh viên [25] | Chỉ đo xu hướng của 5–6 điểm dữ liệu. Một nghiên cứu |
| **Tải nhận thức** | Ba loại tải: nội tại, ngoại lai, liên đới. Chiến lược giảm tải ngoại lai: hợp nhất chữ vào hình (chống **chia tách chú ý**), bỏ thông tin lặp (**dư thừa**), ví dụ mẫu, signaling [11] | Tổng quan hệ thống hoá trong đào tạo y khoa [11] | Đo tải nhận thức vẫn là chỗ yếu của chính lý thuyết; ba loại tải tương quan yếu với nhau [11] |
| **Đảo ngược do chuyên môn** | Cách trình bày giúp người mới lại làm hại người đã biết [11] | Nêu trong [11] | Ta phục vụ người mới, nên phần lớn khuyến nghị ở đây nghiêng về «hướng dẫn nhiều» |
| **Vị trí không gian / cung điện ký ức** | `d = 0.88` so với nhẩm lại [12] | 83 nghiên cứu đủ điều kiện, 68 vào phân tích chính [12] | **Khoảng 89% nghiên cứu trên người trẻ có nguy cơ thiên lệch cao; xếp hạng GRADE «rất thấp»** [12]. Số đẹp, nền yếu |
| Cung điện ký ức trong thực tế ảo | Kính đội đầu nhớ tốt hơn màn hình bàn [26] | Một nghiên cứu [26] | Không áp được cho web tĩnh chạy trên máy phổ thông |
| **Hiệu ứng tự sinh** | `d = 0.40` — người tự sinh ra đáp án nhớ hơn người chỉ đọc [13] | 445 cỡ hiệu ứng trong 86 nghiên cứu [13] | Biến thiên theo loại thao tác rất lớn [13] |
| Đọc thành tiếng (biến thể của tự sinh) | 46,2% so với 19,8% khi **chỉ 20%** số mục được đọc to; **đảo chiều** khi 80% đọc to: thầm 31,8% thắng to 20,9% [14] | 60 sinh viên [14] | Lợi ích đến từ **sự khác biệt so với xung quanh**, không từ bản thân thao tác. Làm gì cũng vậy thì mất tác dụng |
| **Khó khăn mong muốn** | Truy xuất tốn công hơn dự báo nhớ lâu hơn; đo bằng thời gian phản hồi [9] | 182 và 48 người, hai nhóm tuổi [9] | Tổng quan 2026 cảnh báo: **đừng đồng nhất «khó hơn» hay «trúc trắc hơn» với «học tốt hơn»** [15] |
| **Phân đoạn sự kiện** | Đánh dấu ranh giới bước: nhớ lại 0,29 so với 0,26; nhận diện 0,80 so với 0,77 [18] | 98 và 80 người, hai thí nghiệm [18] | Mức tăng nhỏ. Đánh dấu cả **giữa** đoạn cũng có ích, tức là áp một cấu trúc bất kỳ đã giúp phần nào [18] |
| **Lối kể chuyện** | Truyện hơn văn thuyết minh: chung `g = 0.55`; riêng trí nhớ `g = 0.72` [17] | 78 mẫu, 33.078 người [17] | `I² = 98%`, có dấu hiệu thiên lệch xuất bản, chỉ 4 nghiên cứu đo sau độ trễ. **Chính tác giả nói đừng ép mọi thứ thành truyện** [17] |
| **Hỏi trước khi đọc** | `g = 0.54` cho đúng phần đã hỏi; `g = 0.04` cho phần còn lại [24] | Phân tích tổng hợp [24] | Hỏi trước **không** làm người ta nhớ hơn phần không hỏi. Chọn câu hỏi tức là chọn cái sẽ được nhớ |

### A.2 Bốn giới hạn áp cho toàn bộ tài liệu

| Giới hạn | Cụ thể |
|---|---|
| Phòng thí nghiệm ≠ sản phẩm | Số đo lớn nhất trong bảng đến từ tài liệu ngắn, người tham gia bị buộc học. Người vào web bách khoa tự chọn đọc gì, đọc bao lâu, có quay lại hay không. Không nghiên cứu nào mở được đo tình huống đó |
| Độ trễ ngắn | [25] đo sau 2 giờ; [18] đo trong một buổi; [5] đo xa nhất — 5 tuần. «Nhớ lâu» trong tài liệu này nhiều nhất là **5 tuần**, không phải một năm |
| Thiên lệch xuất bản | Nêu rõ trong [17]; nguy cơ thiên lệch cao và GRADE «rất thấp» trong [12] |
| Người học Việt Nam | Không nghiên cứu nào mở được làm trên học sinh Việt Nam hay tiếng Việt. Xem F.1 |

### A.3 Một thứ đã bị bác — đừng thiết kế theo

**Phong cách học tập (VAK, «người học bằng hình», «người học bằng tiếng»).** Trong 109 bài báo giáo dục đại học được rà (54 từ ERIC, 57 từ PubMed), **89% ủng hộ phong cách học tập**, trong khi **chỉ một bài kiểm tra giả thuyết ghép đôi — và không thấy lợi ích** [16]. Đừng làm chế độ «học bằng hình / học bằng chữ» rồi bắt người dùng tự chọn.

---

## B. Mười loại thông tin trong kho

Ký hiệu bố cục dùng lại đúng khung `RuotPopup` trong `src/popup-noi-dung.ts`: `anh → ten → meta[] → hang[] → than → them → nguon`.

### B.1 Người (~2.081 mục qua 20 lớp phủ)

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | **Một cảnh + một hành động** thay cho chuỗi chức danh. «Ngồi tù Côn Đảo 9 năm, ra tù viết tiếp» nhớ hơn «nhà cách mạng, nhà văn, đại biểu Quốc hội khoá II» | Truyện thắng văn thuyết minh ở trí nhớ `g = 0.72` [17] |
| Trình bày | Ảnh chân dung có giấy phép, đặt trên tên | Nguyên tắc đa phương tiện [10]. ⚠️ Bằng chứng riêng cho cặp mặt–tên **không** tìm được cho lứa học sinh — xem F.1 |
| Bố cục, thứ tự đọc | `anh` → `ten` → `meta` gọn ba phần (năm sinh–mất · quê · vai trò) → `hang[]` tối đa 4 dòng nhãn–giá trị → `than` 2–4 câu → `nguon` gập lại | Cắt tải ngoại lai [11]; nhãn kề giá trị, không bắt mắt nhảy [10] |
| Tương tác | Nút **«Bạn có nhớ?»** cuối popup: 1 câu hỏi sinh từ chính mục đó (quê ở đâu / gắn với trận nào), trả lời rồi mới hiện đáp án | Truy xuất `g = 0.499` [1]; tự sinh `d = 0.40` [13] |
| Tương tác | Ghim mục vào ngân hàng ôn giãn cách sẵn có | Khoảng ôn tối ưu theo quãng chờ [7] |
| Cạm bẫy | Danh sách 415 anh hùng cuộn dọc, mỗi dòng một tên | Không có gì để bám: không cảnh, không hình, không truy xuất |
| Cạm bẫy | Nhồi giai thoại ly kỳ nhưng lạc trọng tâm vào `mo_ta` | Chi tiết hấp dẫn lạc đề kéo nhớ lại xuống: 1,77 so với 2,56 [19] |

**Số đo hiện trạng trong repo (đếm ngày 2026-08-28):** 20 lớp phủ về người có **2.081 mục**, trong đó **358 mục có trường `anh`** — **17,2%**. `me-vnah.json` 159 mục: **0 ảnh**. `thieu-nien-anh-hung.json` 50 mục: **1 ảnh**.

### B.2 Trận đánh, chiến dịch (290 mục lớp phủ, sa đồ có `buoc[]`)

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | Giữ đúng lối hiện tại: **các bước rời, người học tự bấm sang bước sau**. Mỗi bước một câu chốt + nhóm phần tử hiện thêm | Phân đoạn có đánh dấu ranh giới cải thiện nhớ [18]; chia đoạn là một trong 11 nguyên tắc có hiệu ứng dương [10] |
| Trình bày | Tự chạy phải là **nút bật, không phải mặc định**. ✅ Mã hiện tại đã đúng: `▶ Phát` là tuỳ chọn và mọi thao tác tay đều dừng nó | Thiết kế trong môi trường nhịp do hệ thống điều khiển gánh nhiều rủi ro hơn [10] |
| Bố cục, thứ tự đọc | Tương quan lực lượng (`luc_luong`) **trước** bước 1 → từng bước → kết quả → tổn thất → ý nghĩa. Số bước 6–8, đúng mức đã chốt ở lược đồ mở rộng | Cấu trúc trước, chi tiết sau: giảm tải nội tại [11] |
| Bố cục | **Nhãn dán thẳng cạnh khối quân trên hình**, không để bảng chú giải rời ở dưới | Chống chia tách chú ý; đặt chữ kề hình nằm trong nhóm hiệu ứng lớn nhất [10][11] |
| Tương tác | Trước bước cuối, hỏi **«bước tiếp theo bên ta làm gì?»** với 3 lựa chọn, rồi mới hiện | Hỏi trước `g = 0.54` cho đúng phần được hỏi [24]; tự sinh [13] |
| Tương tác | Cuối sa đồ: kéo–thả 3 mốc vào đúng thứ tự | Truy xuất + tự sinh [1][13] |
| Cạm bẫy | Hoạt hình chạy mượt thay cho các bước tĩnh bấm tay | Bằng chứng mở được nghiêng về **chia đoạn do người học điều khiển** [10][18]. Phân tích tổng hợp riêng về hoạt hình **không mở được** — xem F.2 |
| Cạm bẫy | Mũi tên chồng mũi tên trong một khung | Tải ngoại lai [11] |
| Cạm bẫy | Lặp nguyên văn `buoc[].mo_ta` thành chú thích dưới hình | Hiệu ứng dư thừa [11] |

### B.3 Di tích, địa điểm (~1.400 mục)

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | Neo vào **bản đồ trước, chữ sau**: pin nhấp nháy tại vị trí → popup mở | Nhớ theo vị trí không gian [12]; bản đồ tương tác hơn bản đồ giấy trong một thí nghiệm lớp 7 (66,0% so với 47,9%) [23] |
| Trình bày | Một câu **«vì sao xếp hạng»** đứng trước số quyết định | Quyết định là mã số, không bám vào đâu; lý do thì có |
| Bố cục | `anh` → `ten` → `meta` (loại · niên đại · tỉnh) → `hang[]`: **niên đại → xếp hạng → quyết định** → `than` | Đưa cái cụ thể lên trước cái hành chính |
| Tương tác | **«Nó ở đâu?»** — hiện tên, người học bấm vào bản đồ, chấm khoảng cách | Truy xuất [1] + tự sinh [13] |
| Tương tác | ⚠️ Hỏi **cả hai chiều**: tên → vị trí, và vị trí → tên | Kiểm tra khi học bản đồ giúp chiều xuôi (+1,68 nút) nhưng **làm hỏng chiều ngược (−0,85)** [21] |
| Cạm bẫy | 435 pin cùng màu bật một lượt | Không phân biệt được gì để mà nhớ; tải ngoại lai [11] |
| Cạm bẫy | Chỉ ghi số quyết định và ngày ký | Không có gì để nối vào kiến thức có sẵn |

### B.4 Ranh giới hành chính theo 13 thời kỳ

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | **Hai thời kỳ cạnh nhau**, không phải một thời kỳ rồi kéo thanh sang thời kỳ khác rồi nhớ lại thời kỳ trước | Người hiểu tốt phân biệt bằng **số lần chuyển qua lại giữa các bản đồ** (`d = 0.943`), không phải bằng số lần chuyển bản đồ ↔ chữ [22] |
| Trình bày | Tô đúng **phần đổi**, để phần không đổi mờ | Signaling nằm trong nhóm hiệu ứng lớn nhất [10] |
| Bố cục | Nhãn thời kỳ và nhãn thay đổi nằm **trên bản đồ**, không nằm ở panel bên | Chống chia tách chú ý [10][11] |
| Tương tác | «Năm 1831 tỉnh này tên gì?» → gõ hoặc chọn → hiện đáp án | Truy xuất [1] |
| Tương tác | Ngân hàng thẻ ôn hiện có (`src/quiz.ts`) sinh sẵn từ chính dữ liệu này — giữ nguyên | Giãn cách [6][7] |
| Cạm bẫy | Hoạt hình biến hình ranh giới chạy tự động | Xem B.2, cùng lý do [10] |
| Cạm bẫy | Bảng đối chiếu 63 → 34 tỉnh dài một trang | Xem B.10 |

### B.5 Tác phẩm văn học (~880 mục)

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | **Trích 2–4 dòng nguyên văn trước**, bình luận sau | Chữ của tác phẩm là cái đáng nhớ; phần bình là văn thuyết minh |
| Trình bày | Gắn tác phẩm vào **hoàn cảnh có cảnh**: ai viết, ở đâu, lúc nào, trong tình thế gì | Trí nhớ cho truyện `g = 0.72` [17] |
| Bố cục | `ten` → tác giả · năm → trích → hoàn cảnh → bình → `nguon`. Giữ nguyên `«»` trong dữ liệu, `nhamNhay()` lo phần hiển thị | |
| Tương tác | **Điền chỗ trống** một chữ trong câu thơ đã đọc, rồi hiện đáp án | Tự sinh `d = 0.40` [13] |
| Tương tác | Nút **«đọc to câu này»** cho đúng 1–2 câu mỗi trang | Đọc thành tiếng lợi **chỉ khi ít mục được đọc to**: 46,2% so với 19,8% ở tỉ lệ 20%, và **đảo chiều** ở tỉ lệ 80% [14] |
| Cạm bẫy | Đăng toàn văn dài rồi mới bình | Không ai truy xuất gì trong lúc cuộn |
| Cạm bẫy | Nhạc nền hoặc ảnh minh hoạ không liên quan đến câu thơ | Chi tiết hấp dẫn lạc đề [19] |

### B.6 Mốc sự kiện (201 mốc, `timeline/moc-lich-su.json`)

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | Mốc **có toạ độ thì hiện đồng thời trên bản đồ và trên thanh thời gian**, nối bằng một đường nhấp nháy khi chọn | Vị trí không gian [12]; ⚠️ nền bằng chứng của cơ chế này yếu (GRADE rất thấp) [12] |
| Trình bày | Gom mốc thành **cụm 5–7 mốc có tên** («Ba lần chống Nguyên–Mông»), thay vì 201 mốc phẳng | Phân đoạn có ranh giới được đánh dấu [18] |
| Bố cục | Nhãn cụm → mốc → `nam_hien_thi` → `mo_ta` 1–2 câu → `ghi_chu` khi hai nguồn vênh nhau | Bất biến nội dung số 4 của dự án |
| Tương tác | Kéo 4 mốc xáo trộn về đúng thứ tự | Tự sinh [13] + truy xuất [1] |
| Cạm bẫy | Thanh thời gian dày đặc nốt, mỗi nốt một dòng chữ nhỏ | Tải ngoại lai [11] |
| Cạm bẫy | Trình bày mốc truyền thuyết y hệt mốc có sử liệu | Sai về nội dung trước khi sai về trí nhớ |

### B.7 Niên hiệu, triều đại (146 mục)

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | **Dải ngang theo tỉ lệ thời gian**, độ dài dải = số năm trị vì | Đồ hoạ thắng chữ và bảng ở **nhớ xu hướng** sau độ trễ [25] |
| Trình bày | Mỗi triều đại một màu, giữ nguyên màu đó ở mọi màn hình | Signaling [10] |
| Bố cục | Triều đại → vua → niên hiệu → năm. Không đảo thứ tự giữa các màn hình | Nhất quán giảm tải [11] |
| Tương tác | «Niên hiệu này của vua nào?» hai chiều, xáo trộn | Truy xuất [1]; ⚠️ hai chiều là hai kỹ năng khác nhau [21] |
| Cạm bẫy | Bảng 146 dòng sắp theo bảng chữ cái | Mất luôn trục thời gian — thứ duy nhất cho dữ liệu này một hình dạng |

### B.8 Hiện vật, bảo vật quốc gia (196 mục)

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | **Ảnh lớn trước, chữ sau.** Loại dữ liệu này là loại duy nhất mà ảnh chính là nội dung | Nguyên tắc đa phương tiện [10] |
| Trình bày | **Số đo gắn vào vật thể ngay trên ảnh** («mặt trống 79,3 cm» đặt cạnh mép trống) | Chữ kề hình nằm trong nhóm hiệu ứng lớn nhất [10]; chống chia tách chú ý [11] |
| Bố cục | `anh` → `ten` → `meta` (loại · đợt công nhận · nơi lưu giữ) → 3 số đo → `than` → `nguon` | |
| Tương tác | «Vật này ở bảo tàng nào?» và «Trống Ngọc Lũ hay Hoàng Hạ?» — nhận diện hai vật gần giống nhau | Truy xuất [1]; phân biệt hai mục dễ lẫn là nơi truy xuất đáng giá nhất |
| Cạm bẫy | Ảnh nhỏ bằng biểu tượng, chữ chiếm 90% popup | Bỏ phí kênh mạnh nhất của loại này |
| Cạm bẫy | Dựng 3D chỉ để đẹp | Không bằng chứng nào mở được đỡ cho 3D trên web phổ thông. Xem F.1 |

**Hiện trạng:** `bao-vat-quoc-gia.json` có 196 mục, **13 mục có `anh`** — 6,6%. Đây là chỗ lệch lớn nhất giữa loại dữ liệu và cách trình bày trong toàn kho.

### B.9 Lễ hội, di sản phi vật thể (~230 mục)

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | **Lịch tròn trong năm** (âm lịch) + pin trên bản đồ. Hai trục: khi nào, ở đâu | Vị trí không gian [12]; nhóm theo cụm thời gian [18] |
| Trình bày | Một câu kể **cái người ta làm** ở lễ hội, không phải câu định nghĩa | Trí nhớ cho truyện [17] |
| Bố cục | `anh` → `ten` → thời điểm âm lịch (kèm dương lịch) → nơi → `than` → công nhận | Quy ước ngày của dự án |
| Tương tác | «Tháng Giêng có lễ hội nào?» — người học liệt kê trước, hệ thống chấm | Tự sinh [13] |
| Cạm bẫy | Xếp theo tỉnh thay vì theo thời gian | Mất trục dễ nhớ nhất của loại này |

### B.10 Số liệu hành chính (34 tỉnh, dân số, diện tích)

| Mục | Khuyến nghị | Cơ chế |
|---|---|---|
| Trình bày | **Biểu đồ khi cần nhớ xu hướng** (dân số theo thời gian, thứ hạng diện tích); **bảng khi cần tra một con số** | Đồ hoạ thắng ở nhớ xu hướng sau 2 giờ, **không thắng ở nhớ từng số** [25] |
| Trình bày | Neo số vào cái đã biết: «rộng gấp 1,8 lần tỉnh bạn đang xem» | Kiến thức nền là chỗ bám duy nhất cho con số trần |
| Bố cục | Số → đơn vị → năm → nguồn, trên cùng một dòng | Chống chia tách chú ý [11] |
| Tương tác | «Đoán dân số tỉnh này trước khi xem» — sai vẫn tính là học | Hỏi trước `g = 0.54` cho đúng phần đã hỏi [24] |
| Cạm bẫy | Bảng 34 dòng × 8 cột | Không loại bằng chứng nào đỡ cho việc nhớ 272 ô |
| Cạm bẫy | Đồ hoạ 3D, hiệu ứng đổ bóng, trang trí | Chi tiết hấp dẫn lạc đề [19]; tải ngoại lai [11] |

---

## C. Bản đồ và thời gian — lợi thế riêng của dự án

### C.1 Có bằng chứng gì cho việc đặt sự kiện lên bản đồ?

| Câu hỏi | Trả lời | Độ tin |
|---|---|---|
| Bản đồ tương tác có hơn bản đồ giấy không? | Một thí nghiệm hai nhóm ở lớp 7: điểm sau bài **66,0%** so với **47,9%** [23] | **Thấp — một nghiên cứu, năm 2006, chính tác giả nói «một số kết quả không kết luận được»** [23] |
| Nhìn bản đồ nhiều có hiểu hơn không? | Thời gian nhìn bản đồ tương quan với điểm hiểu `r = 0.559`; thời gian nhìn chữ **không** tương quan [22] | Vừa — tương quan, không phải nhân quả; 36 sinh viên |
| Cái gì phân biệt người hiểu tốt? | **Số lần chuyển mắt qua lại giữa các bản đồ** (`d = 0.943`, `r = 0.452`), không phải chuyển bản đồ ↔ chữ [22] | Vừa — một nghiên cứu, nhưng đo trực tiếp |
| Trí nhớ theo vị trí có thật không? | Có, `d = 0.88` cho phương pháp cung điện ký ức [12] | **Yếu về chất lượng: GRADE «rất thấp», ~89% nghiên cứu người trẻ nguy cơ thiên lệch cao** [12] |
| Kiểm tra khi học bản đồ có luôn tốt không? | **Không.** Giúp đi xuôi (+1,68 nút giao), **hại đi ngược (−0,85)** [21] | Vừa — ba thí nghiệm, 176 người tổng |

### C.2 Bốn quy tắc rút ra

| Quy tắc | Vì sao |
|---|---|
| **Cho so sánh hai lớp bản đồ cạnh nhau**, đừng bắt nhớ lớp vừa tắt | [22] |
| **Câu hỏi phải khớp chiều sẽ dùng.** Hỏi «Bạch Đằng ở đâu» thì học được vị trí; muốn học chiều ngược phải hỏi riêng chiều ngược | [21] |
| **Ranh giới bước phải được đánh dấu rõ**, cả trên sa đồ lẫn trên thanh thời gian | [18] |
| **Đừng quảng cáo bản đồ như cung điện ký ức.** Cơ chế có thật, chất lượng bằng chứng rất thấp | [12] |

### C.3 Trục thời gian

**Không tìm được** nghiên cứu thực nghiệm nào so sánh «sự kiện đặt trên trục thời gian» với «sự kiện trong danh sách chữ» về mặt trí nhớ. Kết quả tìm được chỉ là tài liệu hướng dẫn giảng dạy, không phải đo lường. Thứ gần nhất có số đo là hiệu ứng phân đoạn: đánh dấu ranh giới các đoạn của một chuỗi liên tục cải thiện nhớ lại và nhớ thứ tự, mức tăng nhỏ [18]. Xem F.1.

---

## D. Xếp hạng việc phải làm

Sắp theo tỉ lệ lợi ích trên công sức. «Bằng chứng» tính theo quy mô và chất lượng nguồn ở mục A.

| # | Khuyến nghị | Áp cho loại | Bằng chứng | Công sức | Đổi gì trong repo |
|---|---|---|---|---|---|
| 1 | **Mở ngân hàng thẻ ôn ra ngoài dữ liệu ranh giới.** Hiện `initQuiz()` chỉ nhận một tệp GeoJSON ranh giới, nên toàn bộ máy ôn giãn cách chỉ phục vụ 1 trong 10 loại | Người · di tích · hiện vật · mốc · niên hiệu | **Mạnh** [1][5][6][7] | **Vừa** | `src/quiz.ts` (`buildCards()`, `dataUrl`, `initQuiz()`); lời gọi `initQuiz` trong `src/main.ts` |
| 2 | **Nút «Bạn có nhớ?» ngay trong popup** — một câu hỏi sinh từ chính mục vừa đọc, trả lời trước rồi mới hiện đáp án | Cả 10 | **Mạnh** [1][13] | **Thấp** | `src/popup-noi-dung.ts` (thêm khối trước `nguon`), `src/popup.ts` |
| 3 | ~~Tắt tự chạy sa đồ~~ **— ĐÃ ĐÚNG SẴN, không phải việc.** Kiểm lại mã ngày 2026-08-28: tự chạy vốn đã là **tuỳ chọn**, người xem phải bấm nút `▶ Phát` mới khởi động (`src/battle.ts`, `#battle-play`), và mọi thao tác tay đều dừng nó. Mặc định là bấm từng bước — đúng điều bằng chứng đỡ | Trận đánh | Vừa [10][18] | **Không** | Không đổi gì |
| 4 | **Nhãn dán thẳng vào hình sa đồ**, bỏ chú giải rời | Trận đánh · ranh giới | **Mạnh** [10][11] | Vừa | `src/battle.ts` (dựng SVG `phan_tu`, khối chú giải) |
| 5 | **Hỏi trước khi mở** một mục lớn: 1 câu đoán, sai vẫn cho đi tiếp | Mốc · trận đánh · số liệu | Vừa [24] | **Thấp** | `src/story.ts`, `src/journey.ts` |
| 6 | **Gom 201 mốc thành cụm có tên** trên thanh thời gian | Mốc | Vừa [18] | Vừa | `public/data/timeline/moc-lich-su.json` (thêm trường cụm), `src/moc-lich-su.ts` |
| 7 | **Cắt chi tiết ly kỳ lạc trọng tâm khỏi `mo_ta`** | Cả 10 | Vừa [19] | **Thấp** (rà theo mẫu) | Dữ liệu `public/data/**` |
| 8 | **So sánh hai thời kỳ cạnh nhau** thay vì chỉ kéo thanh | Ranh giới | Vừa [22] | **Cao** | `src/timeline.ts`, `src/quocgia.ts`, `src/main.ts` |
| 9 | **Bổ ảnh cho lớp người và bảo vật.** Hiện 358/2.081 mục người có ảnh (17,2%); bảo vật 13/196 (6,6%) | Người · hiện vật | Vừa [10] | **Cao** (phải tra giấy phép từng ảnh) | `public/data/overlays/*.json` (`anh`, `anh_nguon`, `anh_giay_phep`), `public/data/media/images.json` |
| 10 | **Viết lại `mo_ta` mục người theo lối một cảnh + một hành động** | Người | Vừa [17] | **Cao** (2.081 mục) | Dữ liệu lớp phủ người |
| 11 | **Biểu đồ cho xu hướng, bảng cho tra cứu** | Số liệu · niên hiệu | Vừa [25] | Vừa | `src/panels.ts`, `public/data/provinces/*.json` |
| 12 | Bản đồ hoặc mô hình 3D làm «cung điện ký ức» | — | **Yếu** [12][26] | Cao | **Bỏ** |
| 13 | Hoạt hình tự chạy thay các bước tĩnh | Trận đánh · ranh giới | **Yếu** (xem F.2) | Cao | **Bỏ** |
| 14 | Chế độ theo phong cách học tập (hình / chữ / nghe) | — | **Đã bị bác** [16] | Vừa | **Bỏ** |

**Nói thẳng cái nên bỏ:** mục 12, 13, 14. Mục 12 dựa trên một cơ chế mà chính phân tích tổng hợp mới nhất xếp GRADE «rất thấp» [12]. Mục 13 không có bằng chứng nào mở được đỡ lưng, trong khi bằng chứng mở được lại nghiêng về phía ngược. Mục 14 đã bị bác nhiều lần [16].

---

## E. Năm mê tín thiết kế

| Mê tín | Vì sao người ta tin | Bằng chứng chống lại |
|---|---|---|
| **1. «Chiều theo phong cách học tập của từng em»** | Nghe công bằng, nghe cá nhân hoá; 89% bài báo trong một mẫu 109 bài vẫn ủng hộ | Chỉ **một** bài trong mẫu đó kiểm tra đúng giả thuyết ghép đôi, và **không thấy lợi ích** [16] |
| **2. «Sơ đồ tư duy giúp nhớ»** | Nhìn có tổ chức, vẽ xong thấy hiểu | Trên 109 rồi 209 học sinh 8–12 tuổi: **sơ đồ tư duy không có tác dụng chính**; chỉ truy xuất có tác dụng, và có tác dụng bất kể có sơ đồ hay không [5] |
| **3. «Truy xuất luôn thắng lập sơ đồ khái niệm»** (mê tín ngược của số 2) | Một nghiên cứu nổi tiếng năm 2011 nói vậy | Khi cho hai nhóm **cùng thời gian ghi nhớ và cùng hướng dẫn**, khác biệt **biến mất hoàn toàn**; 230 người, chờ 1 tuần [20]. Lợi thế cũ đến từ chênh lệch thời gian và câu chỉ dẫn |
| **4. «Thêm chi tiết ly kỳ cho dễ nhớ»** | Học sinh thích, thầy cô thấy lớp sôi nổi | Nhóm có chi tiết lạc đề nhớ lại **1,77** so với **2,56** của nhóm đối chứng; cơ chế là **kéo sự chú ý sang chỗ khác**, không phải làm gián đoạn [19] |
| **5. «Càng khó càng nhớ»** | «Khó khăn mong muốn» bị đọc thành «cứ làm khó lên» | Tổng quan 2026: **đừng đồng nhất khó hơn với học tốt hơn** [15]. Ví dụ đo được: đọc to lợi 46,2% so với 19,8% khi chỉ 20% mục được đọc to, nhưng **đảo chiều** khi 80% mục đọc to [14] — lợi ích đến từ sự khác biệt, không từ độ khó |

---

## F. Chưa trả lời được

### F.1 Câu hỏi bằng chứng không đủ để kết luận

| Câu hỏi | Tìm được gì | Vì sao chưa kết luận |
|---|---|---|
| Đặt sự kiện lên **trục thời gian** có nhớ hơn danh sách chữ không? | Chỉ tài liệu hướng dẫn giảng dạy, không có đo lường | Không nghiên cứu thực nghiệm nào mở được so sánh đúng hai cách này |
| **Ảnh chân dung + tên** có giúp học sinh nhớ nhân vật lịch sử không? | Chỉ nghiên cứu lâm sàng: người cao tuổi khoẻ mạnh, bệnh Alzheimer | Không suy ra được cho học sinh phổ thông. Khuyến nghị số 9 ở bảng D dựa trên nguyên tắc đa phương tiện chung [10], **không** dựa trên bằng chứng riêng cho cặp mặt–tên |
| Mô hình **3D** có giúp nhớ hiện vật, di tích không? | Một nghiên cứu về cung điện ký ức trong thực tế ảo bằng kính đội đầu [26] | Không áp được cho web tĩnh chạy trên máy phổ thông |
| Lịch **giãn cách tối ưu cho một web tự do** là bao nhiêu? | Tỉ lệ khoảng ôn trên quãng chờ [7]; cảnh báo khó áp dụng [8] | Mọi nghiên cứu đều giả định người học quay lại theo lịch. Người vào web bách khoa thì không |
| Số đo có giữ nguyên trên **học sinh Việt Nam**, tiếng Việt không? | Không tìm được nghiên cứu nào | Toàn bộ tài liệu này ngoại suy từ người học nói tiếng Anh, Đức, Trung, Do Thái |
| **Bao nhiêu câu hỏi là quá nhiều** trước khi trang bách khoa thành bài thi? | Không có số | Không nghiên cứu nào mở được đo ngưỡng chán hoặc bỏ trang |
| Trình bày thế nào cho **mục nhạy cảm** (T1–T6) mà vừa dễ nhớ vừa đúng mực? | Không có | Đây là câu hỏi biên tập, không phải câu hỏi khoa học nhận thức |

### F.2 Tài liệu tồn tại nhưng không mở được — không trích số từ chúng

| Tài liệu | Vì sao không mở được |
|---|---|
| Pashler, McDaniel, Rohrer & Bjork 2008, *Psychological Science in the Public Interest* (phong cách học tập) | Bản PDF tải về không đọc được chữ. Kết luận về phong cách học tập lấy từ [16], không từ bài này |
| Dunlosky et al. 2013 (xếp hạng 10 kỹ thuật học) | Không có bản HTML mở |
| Schroeder & Cenkci 2018 (đặt chữ kề hình) · Schneider et al. 2018 (signaling) · Rey et al. 2019 (chia đoạn) · Sundararajan & Adesope 2020 (chi tiết lạc đề) | Nhà xuất bản chặn cả toàn văn lẫn bản tóm tắt trong hai cơ sở dữ liệu đã thử |
| Höffler & Leutner 2007 (hoạt hình so với hình tĩnh) | Không có bản tóm tắt trong hồ sơ Crossref, không có bản mở |
| Dresler et al. 2017 · Wagner et al. 2021 (huấn luyện cung điện ký ức) | Nhà xuất bản trả lỗi 403 |

Ba nguyên tắc đa phương tiện trong danh sách trên (kề nhau, signaling, chia đoạn) vẫn được dùng trong tài liệu này, nhưng **chỉ qua bản tổng hợp cấp trên đã mở được** [10], và **không kèm cỡ hiệu ứng riêng**.

---

## G. Nguồn

Tất cả đều đã mở được trang và đọc, ngày truy cập **2026-08-28**.

[1] Yang C, Luo L, Vadillo MA, Yu R, Shanks DR (2021). *Testing (quizzing) boosts classroom learning: A systematic and meta-analytic review*. Psychological Bulletin 147(4):399–435. doi:10.1037/bul0000309 — Europe PMC: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:33683913&resultType=core&format=json

[2] Rowland CA (2014). *The effect of testing versus restudy on retention: a meta-analytic review of the testing effect*. Psychological Bulletin 140:1432–1463. doi:10.1037/a0037559 — Europe PMC: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:25150680&resultType=core&format=json

[3] Serra MJ, Kaminske AN, Nebel C, Coppola KM (2025). *The use of retrieval practice in the health professions: A state-of-the-art review*. Behavioral Sciences 15(7):974. doi:10.3390/bs15070974 — https://pmc.ncbi.nlm.nih.gov/articles/PMC12292765/

[4] Adesope OO, Trevisan DA, Sundararajan N (2017). *Rethinking the Use of Tests: A Meta-Analysis of Practice Testing*. Review of Educational Research 87(3):659–701. doi:10.3102/0034654316689306 — bản ghi Crossref: https://api.crossref.org/works/10.3102/0034654316689306

[5] Ritchie SJ, Della Sala S, McIntosh RD (2013). *Retrieval practice, with or without mind mapping, boosts fact learning in primary school children*. PLOS ONE 8(11):e78976. doi:10.1371/journal.pone.0078976 — https://pmc.ncbi.nlm.nih.gov/articles/PMC3827082/

[6] Cepeda NJ, Pashler H, Vul E, Wixted JT, Rohrer D (2006). *Distributed practice in verbal recall tasks: A review and quantitative synthesis*. Psychological Bulletin 132:354–380 — trang tác giả, Đại học York: https://www.yorku.ca/ncepeda/publications/CPVWR2006.html

[7] Cepeda NJ, Vul E, Rohrer D, Wixted JT, Pashler H (2008). *Spacing effects in learning: A temporal ridgeline of optimal retention*. Psychological Science 19:1095–1102 — trang tác giả, Đại học York: https://www.yorku.ca/ncepeda/publications/CVRWP2008.html

[8] Larsen DP (2014). *Picking the Right Dose: The Challenges of Applying Spaced Testing to Education*. Journal of Graduate Medical Education 6(2):349–350. doi:10.4300/JGME-D-14-00170.1 — https://pmc.ncbi.nlm.nih.gov/articles/PMC4054743/

[9] Maddox GB, Balota DA (2015). *Retrieval practice and spacing effects in young and older adults: An examination of the benefits of desirable difficulty*. Memory & Cognition 43(5):760–774. doi:10.3758/s13421-014-0499-6 — https://pmc.ncbi.nlm.nih.gov/articles/PMC4480221/

[10] Noetel M, Griffith S, Delaney O, Harris NR, Sanders T, Parker P, del Pozo Cruz B, Lonsdale C (2022). *Multimedia Design for Learning: An Overview of Reviews With Meta-Meta-Analysis*. Review of Educational Research 92(3):413–454. doi:10.3102/00346543211052329 — bản ghi Crossref: https://api.crossref.org/works/10.3102/00346543211052329

[11] Ghanbari S, Haghani F, Barekatain M, Jamali A (2020). *A systematized review of cognitive load theory in health sciences education and a perspective from cognitive neuroscience*. Journal of Education and Health Promotion 9:176. doi:10.4103/jehp.jehp_643_19 — https://pmc.ncbi.nlm.nih.gov/articles/PMC7482702/

[12] Ondřej J (2025). *The method of loci in the context of psychological research: A systematic review and meta-analysis*. British Journal of Psychology 116(4):930–986. doi:10.1111/bjop.12799 — https://pmc.ncbi.nlm.nih.gov/articles/PMC12514325/

[13] Bertsch S, Pesta BJ, Wiscott R, McDaniel MA (2007). *The generation effect: a meta-analytic review*. Memory & Cognition 35:201–210. doi:10.3758/bf03193441 — Europe PMC: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:17645161&resultType=core&format=json

[14] Icht M, Mama Y, Algom D (2014). *The production effect in memory: multiple species of distinctiveness*. Frontiers in Psychology 5:886. doi:10.3389/fpsyg.2014.00886 — https://pmc.ncbi.nlm.nih.gov/articles/PMC4128297/

[15] Binks S (2026). *Why Desirable Difficulties 'Work': A Review of the Evidence From Cognitive and Educational Psychology and Some Caveats for the Health Professions Education Field*. Journal of Evaluation in Clinical Practice. doi:10.1111/jep.70349 — Europe PMC: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:41508718&resultType=core&format=json

[16] Newton PM (2015). *The Learning Styles Myth is Thriving in Higher Education*. Frontiers in Psychology 6:1908. doi:10.3389/fpsyg.2015.01908 — https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2015.01908/full

[17] Mar RA, Li J, Nguyen ATP, Ta CP (2021). *Memory and comprehension of narrative versus expository texts: A meta-analysis*. Psychonomic Bulletin & Review 28(3):732–749. doi:10.3758/s13423-020-01853-1 — https://pmc.ncbi.nlm.nih.gov/articles/PMC8219577/

[18] Gold DA, Zacks JM, Flores S (2017). *Effects of cues to event segmentation on subsequent memory*. Cognitive Research: Principles and Implications 2:1. doi:10.1186/s41235-016-0043-2 — https://pmc.ncbi.nlm.nih.gov/articles/PMC5258781/

[19] Kienitz A, Krebs M-C, Eitel A (2023). *Seductive details hamper learning even when they do not disrupt*. Instructional Science 51:1–22. doi:10.1007/s11251-023-09632-w — https://pmc.ncbi.nlm.nih.gov/articles/PMC10176302/

[20] Mayrhofer R, Kuhbandner C, Frischholz K (2023). *Re-examining the testing effect as a learning strategy: the advantage of retrieval practice over concept mapping as a methodological artifact*. Frontiers in Psychology 14:1258359. doi:10.3389/fpsyg.2023.1258359 — https://pmc.ncbi.nlm.nih.gov/articles/PMC10783554/

[21] Liu S, Yang C (2025). *Practice testing facilitates forward navigation but undermines backward navigation during map learning*. Journal of Intelligence 13(4):49. doi:10.3390/jintelligence13040049 — https://pmc.ncbi.nlm.nih.gov/articles/PMC12028561/

[22] Morita A, Fukuya I (2025). *Integrative processing of text and multiple maps in multimedia learning: an eye-tracking study*. Frontiers in Psychology 16:1487439. doi:10.3389/fpsyg.2025.1487439 — https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1487439/full

[23] Taylor W, Plewe B (2006). *The Effectiveness of Interactive Maps in Secondary Historical Geography Education*. Cartographic Perspectives 55:16–33. doi:10.14714/CP55.325 — https://cartographicperspectives.org/index.php/journal/article/view/cp55-taylor-plewe

[24] St Hilaire KJ, Chan JCK, Ahn D (2024). *Guessing as a learning intervention: A meta-analytic review of the prequestion effect*. Psychonomic Bulletin & Review. doi:10.3758/s13423-023-02353-8 — Europe PMC: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3758/s13423-023-02353-8%22&resultType=core&format=json

[25] Ciccione L, Caroti D, Liu S, Giardino V, Pasquinelli E, Dehaene S (2025). *The superiority of graphics over text in long-term memory retention*. Psychonomic Bulletin & Review. doi:10.3758/s13423-025-02708-3 — Europe PMC: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%2210.3758/s13423-025-02708-3%22&resultType=core&format=json

[26] Krokos E, Plaisant C, Varshney A (2019). *Virtual memory palaces: immersion aids recall*. Virtual Reality 23:1–15. doi:10.1007/s10055-018-0346-3 — bản ghi Crossref: https://api.crossref.org/works/10.1007/s10055-018-0346-3

### Số liệu hiện trạng repo trong tài liệu này

Hai con số dùng ở B.1, B.8 và bảng D mục 9: **20 lớp phủ về người có 2.081 mục / 358 ảnh (17,2%)**; **`bao-vat-quoc-gia.json` 196 mục / 13 ảnh (6,6%)**.

Bản nháp đếm bằng khớp mẫu theo dòng (`"id":` và `"anh":`), cách đếm sai được nếu một tệp lồng `id` ở cấp khác. **Đã đếm lại ngày 2026-08-28 bằng cách phân tích JSON thật** — duyệt `items[]` của từng tệp, và chỉ tính `anh` khi giá trị bắt đầu bằng `https://` (đúng điều kiện `anhHopLe()` trong `src/overlays-config.ts` dùng để quyết định có hiện ảnh hay không). **Hai cách cho cùng kết quả.**
