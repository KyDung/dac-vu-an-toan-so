# Danh sách asset và prompt tạo ảnh

File này chứa toàn bộ những gì cần để làm ảnh cho web: quy trình, 5 prompt truyện tranh Chương 1, và 10 asset còn lại (nhân vật, giao diện, một ảnh mở đầu Chương 2). Cơ chế hoạt động của mã độc ở Chương 2 đã được thay bằng mô phỏng canvas nên không phải vẽ.

Phong cách chung cho mọi ảnh: minh họa editorial công nghệ dành cho học sinh THPT, hiện đại, rõ nét, sắc thái điều tra số, nền sáng xanh xám, một điểm nhấn cam đỏ, không trẻ con, không quá tối, không chứa logo thương mại. Nếu công cụ tạo ảnh tự sinh văn bản thì phải kiểm tra lại chữ trong ảnh.

**Mục lục**

- [Quy trình tạo 1 trang truyện](#quy-trình-tạo-1-trang-truyện)
- [Prompt 5 trang truyện Chương 1](#prompt-5-trang-truyện-chương-1)
- [Asset khác](#asset-khác)

---

## Quy trình tạo 1 trang truyện

Mỗi tình huống chỉ cần **một ảnh duy nhất**, trong ảnh chia sẵn 6 khung kể trọn câu chuyện. Cả Chương 1 chỉ có 5 ảnh.

### Bước 1 — Lấy prompt

Cuộn xuống mục [Prompt 5 trang truyện Chương 1](#prompt-5-trang-truyện-chương-1), tìm tiêu đề có tên file bạn muốn làm, ví dụ `friend-request.png`.

Ngay dưới nó là một khối prompt. **Copy toàn bộ khối đó** (không cần thêm gì) rồi dán vào công cụ tạo ảnh (ChatGPT/DALL·E, Midjourney, Gemini, Canva AI...).

Mỗi khối prompt đã tự chứa đủ thông tin: kích thước, phong cách, màu sắc, mô tả 6 khung. Không cần đọc phần quy cách chung.

### Bước 2 — Xuất ảnh, đặt đúng tên

Lưu ảnh nhận được thành PNG, **tên file đúng y như tiêu đề prompt**, ví dụ `friend-request.png`.

Tên file là bắt buộc phải khớp, web dò theo tên. Sai một ký tự là không hiện.

### Bước 3 — Bỏ vào folder

Kéo file PNG vào thư mục `assets/chapter1/`. Xong. Mở lại web là ảnh tự hiện.

Không cần sửa code, không cần khai báo ở đâu cả.

### Danh sách 5 ảnh cần làm

Tất cả đều nằm trong `assets/chapter1/`, ảnh 1600x1200 (tỉ lệ 4:3), chia 6 khung thành 2 hàng.

| # | Tên file | Tình huống |
|---|---|---|
| 1 | `friend-request.png` | Người bạn mới |
| 2 | `fake-news.png` | Tin nóng đang lan truyền |
| 3 | `urgent-money.png` | Tin nhắn cần tiền gấp |
| 4 | `cyberbullying.png` | Nhóm chat lớp |
| 5 | `late-gaming.png` | Chỉ chơi thêm một trận |

Làm được bao nhiêu ảnh thì web hiện bấy nhiêu, chưa đủ 5 cũng không lỗi. Tình huống chưa có ảnh sẽ tự dùng bản truyện dạng chữ.

### Ba mẹo quan trọng

**Bắt công cụ chia khung cho đúng:** nếu ảnh trả về bị dính liền hoặc lộn xộn thứ tự, thêm vào cuối prompt câu "vẽ đường viền đen rõ giữa các khung, đánh số 1 đến 6 ở góc trên bên trái mỗi khung".

**Chữ tiếng Việt bị sai chính tả:** đây là lỗi phổ biến của mọi công cụ AI, và ảnh 6 khung thì càng nhiều chữ càng dễ sai. Cách xử lý chắc ăn: thêm câu "để trống toàn bộ bóng thoại và màn hình điện thoại" vào cuối prompt, lấy ảnh về rồi tự gõ lời thoại bằng Canva trước khi xuất PNG.

**Khung quá nhỏ khi chiếu:** nếu 6 khung bị chật, giảm xuống 4 khung bằng cách bỏ bớt khung 2 và khung 5 trong prompt. Câu chuyện vẫn đủ hiểu.

---

## Prompt 5 trang truyện Chương 1

Mỗi khối bên dưới là một prompt hoàn chỉnh, tự chứa đủ thông tin. Sao chép từng khối để tạo một ảnh riêng, xuất PNG đúng tên ghi ở tiêu đề rồi đặt vào `assets/chapter1`.

Quy cách áp dụng cho cả 5 ảnh, đã được nhắc lại sẵn trong từng prompt nên không cần ghép thêm:

- Kích thước: 1600 x 1200 px, tỉ lệ 4:3.
- Một ảnh gồm 6 khung, xếp 2 hàng x 3 khung, đọc từ trái sang phải rồi xuống hàng dưới.
- Phong cách: truyện tranh editorial hiện đại dành cho học sinh THPT Việt Nam, đường nét sạch, biểu cảm tự nhiên, không hoạt hình trẻ con.
- Bảng màu: xanh xám sáng, trắng, xanh than; cam đỏ chỉ dùng làm điểm cảnh báo.
- Giao diện điện thoại phải là giao diện giả lập, không dùng logo hoặc thiết kế của mạng xã hội thật.
- Không ghi sẵn tên loại nguy cơ, đáp án hoặc lời khuyên kết luận. Khung cuối luôn dừng ở lúc nhân vật phải quyết định.

### `friend-request.png`

```text
Tạo một trang truyện tranh giáo dục khổ 1600x1200, tỉ lệ 4:3, gồm 6 khung xếp 2 hàng x 3 khung, có đường viền rõ giữa các khung, đọc từ trái sang phải rồi xuống hàng dưới. Phong cách editorial comic hiện đại dành cho học sinh THPT Việt Nam, nét sạch, ánh sáng lớp học tự nhiên, bảng màu xanh xám sáng và xanh than, điểm nhấn cam đỏ vừa phải, không trẻ con, không logo thương mại.

Nhân vật chính giữ nguyên trong cả 6 khung: Minh, nam sinh Việt Nam 16 tuổi, tóc đen ngắn hơi rẽ ngôi, gương mặt hiền và tỉnh táo, áo sơ mi trắng đồng phục có viền xanh than, quần xanh đậm, đồng hồ dây đen. Bối cảnh là giờ nghỉ trong lớp học Việt Nam hiện đại.

Khung 1: Minh ngồi ở bàn học, điện thoại báo có lời mời kết bạn mới. Màn hình giả lập hiển thị tài khoản “Hải Nam”, ảnh đại diện nam sinh mơ hồ và dòng “14 bạn chung”.
Khung 2: Cận cảnh Minh xem hồ sơ có ảnh bóng rổ, vài bài đăng rất chung chung, không có thông tin xác minh rõ ràng.
Khung 3: Tin nhắn đầu tiên xuất hiện: “Chào bạn! Mình cũng thích bóng rổ. Kết bạn nhé?” Minh hơi tò mò.
Khung 4: Cuộc trò chuyện đã mở, tài khoản Hải Nam hỏi: “Bạn học trường nào, lớp nào vậy?”
Khung 5: Các câu hỏi dồn dập hiện lên: “Nhà bạn ở khu nào? Cho mình xin số điện thoại nhé.” và “Gửi mình một tấm ảnh riêng được không?” Các câu hỏi riêng tư được nhấn nhẹ bằng màu cam đỏ. Minh ngừng tay phía trên bàn phím, nét mặt chuyển từ tò mò sang băn khoăn.
Khung 6: Cảnh quyết định mở, Minh cầm điện thoại với ba biểu tượng giao diện giả lập ở phía dưới: tiếp tục trò chuyện, kiểm tra danh tính, hoặc đóng cuộc trò chuyện. Ba lựa chọn có độ nổi bật ngang nhau. Kết thúc bằng vẻ mặt cân nhắc.

Không mô tả người gửi như quái vật hay hacker. Không ghi “người lạ”, “nguy hiểm”, “lộ thông tin” hoặc bất kỳ đáp án nào. Chữ tiếng Việt phải rõ, đúng chính tả. Xuất PNG tên friend-request.png.
```

### `fake-news.png`

```text
Tạo một trang truyện tranh giáo dục khổ 1600x1200, tỉ lệ 4:3, gồm 6 khung xếp 2 hàng x 3 khung, có đường viền rõ giữa các khung, đọc từ trái sang phải rồi xuống hàng dưới. Phong cách editorial comic hiện đại cho học sinh THPT Việt Nam, bố cục rõ khi trình chiếu, màu xanh xám sáng và xanh than, cam đỏ cho chi tiết gây chú ý, không logo mạng xã hội thật.

Nhân vật chính giữ nguyên trong cả 6 khung: Hà, nữ sinh Việt Nam 16 tuổi, tóc đen ngang vai buộc nửa đầu, kính gọng tròn mảnh, áo sơ mi trắng và áo khoác đồng phục xanh than. Bối cảnh ở hành lang trường vào giờ ra chơi.

Khung 1: Điện thoại của Hà hiện bài đăng từ trang giả lập “Tin Nóng Học Đường”, tiêu đề lớn: “KHẨN: Ngày mai toàn bộ học sinh được nghỉ học!”
Khung 2: Bài đăng có ảnh cổng trường chung chung, dòng “Chia sẻ ngay để mọi người biết”, nhưng không có tên người ra thông báo, ngày tháng hoặc liên kết nguồn.
Khung 3: Cận cảnh bài đăng hiển thị “8.742 lượt chia sẻ trong 35 phút”, số liệu lớn nhưng không có nguồn chính thức.
Khung 4: Nhóm bạn trong hành lang chuyền tay nhau điện thoại và bàn tán. Một bong bóng thoại nói: “Nhiều người chia sẻ thế này chắc là đúng rồi.”
Khung 5: Hà mở song song bài đăng giật gân và một trang thông tin nhà trường giả lập có thiết kế nghiêm túc. Trang nhà trường chỉ có các thông báo cũ và chưa có thông báo nghỉ học. Gương mặt Hà chuyển sang nghi ngờ.
Khung 6: Cảnh quyết định mở, ngón tay Hà dừng giữa ba thao tác giao diện trung tính: chia sẻ bài đang lan truyền, tiếp tục đọc bình luận, hoặc kiểm tra thêm nguồn. Không làm lựa chọn nào sáng hơn lựa chọn khác.

Không ghi “tin giả”, không kết luận thật hay giả, không viết lời khuyên hoặc đáp án. Chữ Việt rõ, chính xác. Xuất PNG tên fake-news.png.
```

### `urgent-money.png`

```text
Tạo một trang truyện tranh giáo dục khổ 1600x1200, tỉ lệ 4:3, gồm 6 khung xếp 2 hàng x 3 khung, có đường viền rõ giữa các khung, đọc từ trái sang phải rồi xuống hàng dưới. Phong cách editorial comic hiện đại dành cho học sinh THPT Việt Nam, màu xanh xám sáng và xanh than, điểm cam đỏ tiết chế, không dùng logo ứng dụng thật.

Nhân vật chính giữ nguyên trong cả 6 khung: Lan, nữ sinh Việt Nam 16 tuổi, tóc đen dài buộc đuôi ngựa thấp, áo sơ mi trắng, áo gile xanh than, vòng tay vải màu cam. Bối cảnh tại bàn học ở nhà vào đầu buổi tối.

Khung 1: Điện thoại Lan nhận tin nhắn từ tài khoản mang tên “Mai Anh” với ảnh đại diện quen thuộc. Tin nhắn: “Lan ơi, mình đang có việc gấp.”
Khung 2: Lan nhìn ảnh đại diện và nhận ra đó giống bạn thân, nét mặt vừa quan tâm vừa bất ngờ.
Khung 3: Tin nhắn thứ hai hiện lên: “Chuyển giúp mình 500.000 đồng vào số tài khoản này nhé, tối mình gửi lại.” Không hiển thị số tài khoản thật.
Khung 4: Lan đọc lại và thấy người gửi xưng hô khác cách Mai Anh thường nói. Lan nhấn biểu tượng gọi thoại, người gửi lập tức nhắn: “Đừng gọi, mình đang họp.”
Khung 5: Tin nhắn mới với sắc thái thúc ép: “Chuyển ngay giúp mình!” Bên cạnh là danh bạ có số điện thoại quen thuộc của Mai Anh, không hiển thị số thật. Lan giữ điện thoại nhưng chưa mở ứng dụng ngân hàng.
Khung 6: Cảnh quyết định mở, Lan cân nhắc giữa tiếp tục trả lời trong cuộc trò chuyện, thực hiện chuyển tiền, hoặc liên hệ Mai Anh qua một kênh khác. Ba lựa chọn có độ nổi bật ngang nhau.

Không ghi “lừa đảo”, “giả mạo”, “đáp án đúng” hoặc lời khuyên kết luận. Chữ Việt phải rõ và đúng, đặc biệt là số tiền. Xuất PNG tên urgent-money.png.
```

### `cyberbullying.png`

```text
Tạo một trang truyện tranh giáo dục khổ 1600x1200, tỉ lệ 4:3, gồm 6 khung xếp 2 hàng x 3 khung, có đường viền rõ giữa các khung, đọc từ trái sang phải rồi xuống hàng dưới. Phong cách editorial comic hiện đại cho học sinh THPT Việt Nam, nghiêm túc, tôn trọng nhân vật, không biến sự việc thành trò đùa. Màu xanh xám sáng, xanh than và cam đỏ tiết chế, không logo ứng dụng thật.

Nhân vật giữ nguyên trong cả 6 khung: Phương, nữ sinh Việt Nam 16 tuổi, tóc bob đen ngang cằm, kính chữ nhật nhỏ, áo sơ mi trắng có huy hiệu hình học giả lập; Nam, nam sinh 16 tuổi tóc ngắn, áo trắng, là người chứng kiến. Bối cảnh sau giờ học.

Khung 1: Nhóm chat lớp giả lập xuất hiện tin: “Lại làm sai nữa à? Đúng là chậm thật.”
Khung 2: Một ảnh chế về Phương được gửi vào nhóm, chỉ thể hiện bằng hình thu nhỏ đã làm mờ, không tái hiện nội dung làm nhục.
Khung 3: Phương nhìn điện thoại với vẻ tổn thương và thu mình; Nam ở bàn gần đó cũng thấy cuộc trò chuyện và trở nên lo lắng.
Khung 4: Nhiều biểu tượng phản ứng vây quanh ảnh đã làm mờ. Một bình luận viết: “Ai cũng biết chuyện này rồi, đừng đi học nữa.” Phương nhận thêm tin nhắn riêng: “Nếu mách người lớn thì sẽ còn nhiều ảnh khác.”
Khung 5: Nam nhìn nhóm chat, thấy một số bạn im lặng, một số tiếp tục gửi biểu tượng cười. Màn hình Nam hiển thị các thao tác giao diện trung tính như chụp lại màn hình, xóa cuộc trò chuyện, trả lời gay gắt, báo cáo.
Khung 6: Cảnh quyết định mở, Nam nhìn về phía Phương đang ngồi một mình và cửa phòng giáo viên ở cuối hành lang, đồng thời vẫn cầm điện thoại. Kết thúc bằng vẻ mặt nghiêm túc, chưa cho thấy lựa chọn cuối cùng.

Không dùng lời lẽ thô tục, không dùng hình ảnh gây sốc. Không ghi “bắt nạt mạng”, không ghi “hãy báo giáo viên” hoặc đáp án. Chữ Việt chính xác. Xuất PNG tên cyberbullying.png.
```

### `late-gaming.png`

```text
Tạo một trang truyện tranh giáo dục khổ 1600x1200, tỉ lệ 4:3, gồm 6 khung xếp 2 hàng x 3 khung, có đường viền rõ giữa các khung, đọc từ trái sang phải rồi xuống hàng dưới. Phong cách editorial comic hiện đại cho học sinh THPT Việt Nam, ánh sáng và thời gian rõ ràng, màu chuyển dần từ xanh xám sáng sang xanh đêm rồi sáng trở lại, điểm nhấn cam đỏ, không logo hoặc nhân vật game có bản quyền.

Nhân vật chính giữ nguyên trong cả 6 khung: Hoàng, nam sinh Việt Nam 16 tuổi, tóc đen hơi xoăn ngắn, áo thun xanh than mặc ở nhà, quần thể thao xám, tai nghe chụp tai màu đen. Phòng học tại nhà gọn gàng, có bàn học, sách bài tập và đồng hồ. Mỗi khung hiển thị rõ mốc giờ.

Khung 1: 17:00, Hoàng về nhà, đặt cặp cạnh bàn và mở một trò chơi giả lập sau khi tự nhủ nghỉ một lát.
Khung 2: 19:30, bữa tối đã để bên cạnh, sách bài tập vẫn đóng, Hoàng tiếp tục chơi và màn hình hiện nút “Trận tiếp theo”.
Khung 3: 22:30, phòng tối hơn, điện thoại có lời nhắc làm bài nhưng Hoàng bấm bỏ qua, vẻ mặt mệt nhưng vẫn tập trung vào game.
Khung 4: 00:15, Hoàng nói nhỏ “Chỉ thêm một trận nữa”, mắt đã mỏi. 01:10, màn hình báo thua và lại mời chơi tiếp.
Khung 5: 06:30 sáng hôm sau, chuông báo thức reo, Hoàng ngủ gục và khó mở mắt. Trong lớp buổi sáng, Hoàng buồn ngủ, vở bài tập còn trống.
Khung 6: Cảnh quyết định mở vào buổi chiều, Hoàng ngồi trước bàn với sách bài tập, điện thoại và tay cầm game. Trên điện thoại có các lựa chọn trung tính như chơi ngay, đặt hẹn giờ, hoặc hoàn thành việc cần làm trước. Không làm nổi bật lựa chọn đúng.

Không ghi “nghiện game”, “nghiện Internet”, không đưa lời khuyên hoặc đáp án. Chữ Việt và các mốc giờ phải rõ. Xuất PNG tên late-gaming.png.
```

### Kiểm tra trước khi chép ảnh vào web

1. Tên tệp phải khớp hoàn toàn, không thừa số thứ tự và không thừa khoảng trắng.
2. Đủ 6 khung, có viền rõ và đúng thứ tự đọc từ trái sang phải rồi xuống hàng dưới.
3. Kiểm tra lại toàn bộ chữ tiếng Việt, đặc biệt là dấu, số tiền và các mốc giờ.
4. Nhân vật phải giữ cùng tóc, khuôn mặt và đồng phục ở cả 6 khung.
5. Không để công cụ tự thêm logo mạng xã hội, watermark hoặc chữ ký.
6. Khung cuối không được tiết lộ đáp án, chỉ dừng ở thời điểm nhân vật phải quyết định.
7. Chép 5 tệp PNG vào `assets/chapter1`, sau đó tải lại web bằng `Ctrl + F5`.

---

## Asset khác

Ngoài 5 trang truyện Chương 1 ở trên, web chỉ còn **1 ảnh tùy chọn**.

| Tên file | Thư mục | Bắt buộc? | Màn hình | Prompt gợi ý |
|---|---|---|---|---|
| `agent-badge.png` | `assets/ui` | Không | Màn khởi động | Huy hiệu đặc vụ an toàn số hình khiên tối giản, chữ S rõ, xanh xám và cam đỏ, phù hợp học sinh THPT, không giống biểu trưng cơ quan thật, tỉ lệ 1:1, 1024x1024, nền trong suốt |

Không có ảnh này web vẫn chạy: màn khởi động tự vẽ một huy hiệu bằng CSS.

### Những ảnh trước đây cần, nay không cần nữa

- **9 ảnh mã độc Chương 2** (virus, worm, trojan, spyware, keylogger, backdoor, rootkit và sơ đồ) đã được thay bằng mô phỏng canvas trong [js/sim.js](js/sim.js). Đường dẫn tới chúng vẫn được khai báo trong `js/data.js` nhưng chỉ là bản dự phòng, web chỉ dùng nếu `js/sim.js` không tải được.
- **`computer-warning.png`** ở màn cảnh báo cũng chỉ là tùy chọn, không có thì web vẽ khối cảnh báo bằng CSS.
- **4 ảnh nhân vật và 4 icon giao diện** (`student-boy`, `student-girl`, `digital-safety-specialist`, `online-stranger`, `case-folder`, `warning-icon`, `shield`, `malware-icon`) đã được gỡ khỏi `js/data.js` vì không màn hình nào hiển thị chúng. Nếu muốn đưa nhân vật vào web thì cần thêm chỗ hiển thị trong `js/game.js` trước.

Tóm lại: **chỉ cần vẽ 4 trang truyện còn lại của Chương 1 là đủ dùng.**
