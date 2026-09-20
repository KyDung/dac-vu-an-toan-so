# Đặc vụ An toàn số

Web game giáo dục tương tác cho hoạt động hình thành kiến thức Bài 9: An toàn trên không gian mạng. Dự án là website tĩnh, không backend, không đăng nhập và không gửi dữ liệu học sinh ra Internet.

## 1. Cách chạy web

Cách đơn giản nhất là mở `index.html` bằng trình duyệt hiện đại. Để tránh giới hạn của trình duyệt khi chạy trực tiếp từ tệp, nên chạy một máy chủ tĩnh trong thư mục dự án:

```powershell
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`.

## 2. Cách thay hình ảnh

Ảnh được kiểm tra và hiển thị tự động. Khi chưa có tệp, web hiện placeholder; khi tệp tồn tại đúng tên, placeholder tự biến mất và ảnh được hiển thị.

Cách nhanh nhất:

1. Xem tên ảnh cần dùng trong `ASSETS.md`.
2. Đặt ảnh vào đúng thư mục trong `assets/`.
3. Đổi tên ảnh đúng với tên đã quy định, ví dụ `fake-news.png`.
4. Tải lại trang bằng `Ctrl+F5`.

Chương 1 dùng một trang truyện cho mỗi tình huống, trong đó chia sẵn 6 khung. Ví dụ, tình huống tin giả chỉ cần:

```text
assets/chapter1/fake-news.png
```

Web tự hiện ảnh khi tệp tồn tại, tình huống chưa có ảnh vẫn chạy bằng bản truyện dạng chữ. Prompt hoàn chỉnh để tạo đủ 5 trang nằm trong `ASSETS.md`.

Không cần sửa `js/game.js` hoặc `js/data.js` nếu giữ đúng tên tệp. Nếu muốn dùng tên hoặc định dạng khác, chỉ sửa đường dẫn tương ứng trong đối tượng `ASSETS` ở đầu `js/data.js`.

Ví dụ:

```js
chapter1: {
  fakeNews: "assets/chapter1/fake-news.png"
}
```

Danh sách đầy đủ và thông số ảnh đề xuất nằm trong `ASSETS.md`.

Chương 2 không dùng ảnh mã độc. Bảy loại mã độc được thể hiện bằng mô phỏng canvas trong `js/sim.js`: học sinh bấm **Chạy mô phỏng** để xem từng bước cơ chế hoạt động, kèm câu mô tả bằng chữ và mục **Xem mô tả bằng chữ** cho người dùng trình đọc màn hình. Nếu `js/sim.js` không tải được, web tự quay về hiển thị ảnh tĩnh như trước.

Muốn sửa nội dung mô phỏng, mở `js/sim.js` và tìm đối tượng `SIMS`. Mỗi loại mã độc là một mảng `steps`, mỗi bước có `note` là câu mô tả và `draw` là hàm vẽ. Thêm hoặc bớt bước chỉ cần sửa mảng này, không cần đụng tới `js/game.js`.

Sau khi sửa hình vẽ, nên chạy hai công cụ kiểm tra (cần Node.js, riêng công cụ thứ hai cần thêm Python và thư viện Pillow):

```powershell
node tools/check-sim-layout.js
```

Công cụ này dò xem có hình nào chồng lên nhau hoặc tràn ra ngoài khung không, không cần mở trình duyệt.

```powershell
node tools/dump-sim-ops.js .tmp/ops
python tools/render-sim-preview.py .tmp/ops .tmp/preview
```

Hai lệnh này dựng toàn bộ khung hình của mọi mô phỏng thành ảnh PNG trong `.tmp/preview` để xem nhanh bố cục bằng mắt.

## 3. Cách sửa tình huống

Mở mảng `scenarios` trong `js/data.js`. Mỗi phần tử có:

- `id`, `title`, `lead`: định danh và phần giới thiệu.
- `story`: 3-5 khung quan sát.
- `question`: câu hỏi tự luận ngắn.
- `riskType`: loại nguy cơ đúng.
- `options`, `correctAnswer`: các cách xử lí và chỉ số đáp án phù hợp, bắt đầu từ 0.
- `hint`, `feedbackByOption`, `explanation`, `knowledge`: phản hồi và kiến thức mở khóa.
- `narrative`: truyện kể dạng văn xuôi hiện ở mục Đọc truyện dạng chữ. Mỗi phần tử là một đoạn văn.
- `story`: các khung dữ kiện dạng ngắn, hiện thay cho `narrative` nếu tình huống chưa có `narrative`.
- `comicPages`, `points`, `skippable`: ảnh truyện tranh, điểm và quyền bỏ qua.

Tình huống thay thế cho bắt nạt mạng có thể được gán trực tiếp vào `CONFIG.replaceScenario4`. Object thay thế cần giữ `id: 4` và đúng schema; game sẽ tự dùng dữ liệu mới mà không cần sửa logic.

## 4. Cách thêm câu hỏi hoặc tình huống

Thêm một object đúng schema vào `scenarios`. Dùng `id` mới không trùng. Tình huống mới sẽ tự xuất hiện trong luồng.

Với hồ sơ mã độc, thêm object vào `malwareCases`. Nếu tăng số hồ sơ, cập nhật nhãn đếm và luồng kiểm thử trong `js/game.js`.

Các câu phản tư nằm trong `reflectionQuestions`. Bảng phân biệt nằm trong `malwareComparison`. Hành động phòng tuyến nằm trong `defenseActions`.

## 5. Bản đáp án cho giáo viên

Toàn bộ đáp án nằm trong `DAP_AN.md`: loại nguy cơ đúng và cách xử lí đúng của 5 tình huống, bản đồ nguy cơ, 3 hồ sơ mã độc, bảng ghép hồ sơ mật, bảng phân biệt Virus/Worm/Trojan và 8 hành động phòng tuyến. Mỗi phương án sai đều kèm phản hồi mà học sinh sẽ nhận được.

File này **được sinh tự động** từ `js/data.js`, đừng sửa tay. Sau khi đổi câu hỏi hoặc đáp án trong `js/data.js`, chạy lại:

```powershell
node tools/make-answer-key.js
```

Nếu máy không có Node.js, vẫn có thể mở `js/data.js` đọc trực tiếp: `correctAnswer` là chỉ số đáp án đúng, đếm từ 0.

## 6. Cách thay đáp án

- Tình huống Chương 1: sửa `riskType` và `correctAnswer`.
- Hồ sơ Virus/Worm/Trojan: sửa `correctAnswer`.
- Bản đồ nguy cơ: sửa `correct` trong `riskProtections`.
- Phòng tuyến: sửa `category` thành `An toàn` hoặc `Nguy hiểm`.
- Bảng phân biệt: sửa các giá trị trong `malwareComparison`.

Sau khi đổi đáp án, cần đọc lại `hint`, `feedbackByOption`, `explanation` và `knowledge` để bảo đảm phản hồi vẫn nhất quán.

## 7. Xuất PDF và Word

### PDF

Nút **Tải PDF** mở hộp thoại in của trình duyệt. Chọn **Lưu dưới dạng PDF**. CSS in tự động ẩn thanh điều hướng và nút, chuyển sang chữ đen nền trắng và ngắt trang theo từng phần hồ sơ.

Tên gợi ý: `HoSoAnToanSo_HoTen_Lop.pdf`. Tên học sinh được bỏ dấu và thay khoảng trắng bằng gạch dưới ở tên tệp, còn nội dung tiếng Việt trong hồ sơ vẫn giữ nguyên.

### Nộp bài trên Padlet

Điền đường dẫn Padlet của lớp trong `CONFIG` tại đầu `js/data.js`:

```js
padletUrl: "https://padlet.com/duong-dan-cua-lop"
```

Khi có đường dẫn, cuối Hồ sơ sẽ xuất hiện nút **Mở Padlet để nộp bài**. Học sinh tải PDF, mở Padlet, tạo bài đăng có họ tên và lớp, rồi tải tệp PDF lên. Web không tự gửi tệp lên Padlet và không gửi dữ liệu học sinh ra Internet.

### Word

Nút **Tải Word** dùng docx.js để tạo `.docx` với font Times New Roman và bảng có viền. Nếu CDN không tải được, web hiển thị thông báo và học sinh có thể dùng **Sao chép nội dung Hồ sơ** hoặc xuất PDF.

## 8. Thư viện CDN

Dự án chỉ dùng một thư viện ngoài:

- `docx.js 8.5.0`: `https://unpkg.com/docx@8.5.0/build/index.umd.js`

Game, lưu tiến trình, phản hồi, chế độ giáo viên và PDF không phụ thuộc thư viện ngoài.

## 9. Cách chạy offline hoàn toàn

1. Tải tệp `index.umd.js` của docx.js về, ví dụ đặt tại `js/vendor/docx.umd.js`.
2. Trong `index.html`, thay URL CDN bằng:

```html
<script src="js/vendor/docx.umd.js" defer></script>
```

3. Giữ nguyên thứ tự: `data.js`, `sim.js`, docx.js, `export.js`, `game.js`.

Nếu không cần Word, có thể bỏ script docx.js. Các chức năng còn lại vẫn hoạt động.

## 10. Chế độ giáo viên

Mở trực tiếp tệp `teacher.html`. Tệp này sẽ chuyển sang trang chính và bật cổng đăng nhập giáo viên. Khi chạy bằng máy chủ cục bộ, cũng có thể dùng:

```text
http://localhost:8000/?teacher=1
```

Trang sẽ yêu cầu mã PIN. PIN hiện tại là `2004`. Có thể đổi bằng cách sửa:

```js
teacherPin: "ma-pin-moi"
```

trong `CONFIG` ở đầu `js/data.js`.

Thanh công cụ giáo viên cho phép:

- Nhảy tới từng tình huống và mọi màn hình chính bằng các nút chuyển nhanh hoặc danh sách đầy đủ.
- Trên máy tính, bảng điều khiển luôn mở sau khi đăng nhập. Trên điện thoại, bảng tự thu gọn sau khi chuyển để không che nội dung.
- Nhấn nhãn **CHẾ ĐỘ GIÁO VIÊN** trên thanh đầu trang để mở lại bảng điều khiển bất cứ lúc nào.
- Bật gợi ý đáp án đúng bằng đường viền ở lựa chọn.
- Bật chế độ chiếu lớp với chữ và nút lớn hơn, ẩn phần nhập thông tin học sinh.
- Dùng **Điền nhanh** để tạo dữ liệu mẫu, kiểm tra Hồ sơ và xuất file.
- Dùng **Thu gọn** hoặc **Mở công cụ** để ẩn và hiện bảng điều khiển.
- Dùng **Thoát chế độ giáo viên** để xóa quyền của phiên hiện tại và quay về giao diện học sinh.

PIN được lưu quyền theo từng phiên tab bằng `sessionStorage`. Đây là website tĩnh nên PIN chỉ ngăn truy cập thông thường. Học sinh có kiến thức kỹ thuật vẫn có thể xem mã nguồn. Muốn bảo vệ tuyệt đối cần đặt bản giáo viên sau hệ thống đăng nhập của trường hoặc một máy chủ có xác thực.

## Lưu dữ liệu

Tiến trình lưu bằng một khóa duy nhất `ansoso_v1` trong `localStorage`. Nếu trình duyệt chặn lưu, game vẫn hoạt động và hiện cảnh báo. Nút **Bắt đầu lại** luôn yêu cầu xác nhận trước khi xóa dữ liệu.
