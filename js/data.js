/* Nội dung bài học được tách khỏi logic để giáo viên có thể chỉnh sửa dễ dàng. */

const CONFIG = {
  replaceScenario4: null,
  teacherPin: "2004",
  padletUrl: "",
  storageKey: "ansoso_v1",
  points: { identify: 10, decide: 10, analysis: 5 },
};

/*
  Ảnh tự xuất hiện khi tệp tồn tại đúng đường dẫn bên dưới.
  Cách dễ nhất: đặt ảnh vào đúng thư mục và đổi tên theo tên tệp đã khai báo.
*/
const ASSETS = {
  /* Truyện tranh Chương 1: mỗi tình huống một ảnh 6 khung. */
  chapter1: {
    friendRequest: "assets/chapter1/friend-request.png",
    fakeNews: "assets/chapter1/fake-news.png",
    urgentMoney: "assets/chapter1/urgent-money.png",
    cyberbullying: "assets/chapter1/cyberbullying.png",
    lateGaming: "assets/chapter1/late-gaming.png",
  },
  /*
    Chương 2 dùng mô phỏng canvas trong js/sim.js. Các ảnh dưới đây chỉ là bản
    dự phòng, web chỉ hiển thị chúng nếu js/sim.js không tải được.
  */
  chapter2: {
    warningComputer: "assets/chapter2/computer-warning.png",
    virus: "assets/chapter2/virus-infected-file.png",
    worm: "assets/chapter2/worm-network.png",
    trojan: "assets/chapter2/trojan-software.png",
    spyware: "assets/chapter2/spyware.png",
    keylogger: "assets/chapter2/keylogger.png",
    backdoor: "assets/chapter2/backdoor.png",
    rootkit: "assets/chapter2/rootkit.png",
  },
  ui: {
    badge: "assets/ui/agent-badge.png",
  },
};

const RISK_OPTIONS = [
  "Tin giả",
  "Lừa đảo",
  "Lộ thông tin cá nhân",
  "Bắt nạt trên mạng",
  "Nghiện Internet",
  "Không có nguy cơ",
];

const scenarios = [
  {
    id: 1,
    title: "Người bạn mới",
    lead: "Một tài khoản lạ gửi lời mời kết bạn cho Minh.",
    story: [
      {
        type: "notice",
        who: "Mạng xã hội",
        text: "Hải Nam đã gửi lời mời kết bạn. Hai bạn có 14 bạn chung.",
      },
      {
        type: "chat",
        who: "Hải Nam",
        text: "Chào bạn! Mình cũng thích bóng rổ. Kết bạn nhé?",
      },
      {
        type: "chat",
        who: "Hải Nam",
        text: "Bạn học trường nào, lớp nào vậy? Nhà bạn ở khu nào?",
      },
      {
        type: "chat",
        who: "Hải Nam",
        text: "Cho mình xin số điện thoại và một tấm ảnh riêng được không?",
      },
    ],
    question: "Em phát hiện điều gì bất thường trong tình huống này?",
    riskType: "Lộ thông tin cá nhân",
    options: [
      "Gửi một ít thông tin vì có nhiều bạn chung",
      "Không cung cấp thông tin, kiểm tra danh tính và chỉ kết bạn khi thực sự biết người đó",
      "Hỏi lại thật nhiều thông tin riêng của người kia",
      "Chấp nhận kết bạn nhưng khóa bình luận",
    ],
    correctAnswer: 1,
    hint: "Bạn chung và ảnh đại diện chưa chứng minh người đứng sau tài khoản là ai.",
    feedbackByOption: [
      "Dù chỉ gửi một ít, trường học, địa chỉ, số điện thoại và ảnh riêng vẫn có thể bị ghép lại để nhận diện hoặc tiếp cận em.",
      "Phù hợp. Em không để vẻ ngoài của tài khoản thay thế việc xác minh danh tính và bảo vệ dữ liệu cá nhân.",
      "Hỏi ngược lại không giúp em xác minh chắc chắn, đồng thời cuộc trò chuyện vẫn có thể bị khai thác.",
      "Khóa bình luận không ngăn người lạ thu thập thông tin em đã gửi trong tin nhắn.",
    ],
    explanation:
      "Dấu hiệu đáng ngờ là người lạ dần hỏi nhiều dữ liệu có thể nhận diện và tiếp cận Minh.",
    knowledge:
      "Chỉ kết bạn với người em thực sự biết. Không tùy tiện cung cấp trường học, địa chỉ, số điện thoại, mật khẩu hoặc ảnh riêng tư.",
    narrative: [
      "Giờ ra chơi, điện thoại của Minh rung lên một tiếng. Trên màn hình hiện lời mời kết bạn từ một tài khoản tên Hải Nam. Ảnh đại diện là một bạn nam trạc tuổi Minh đang cầm quả bóng rổ, phía dưới ghi hai người có mười bốn bạn chung.",
      "Minh bấm vào xem thử trang cá nhân. Vài tấm ảnh sân bóng, mấy dòng trạng thái ngắn kiểu ai cũng có thể viết, không có tấm ảnh nào chụp cùng bạn bè trong lớp, cũng không có chi tiết nào cho thấy hai người từng gặp nhau. Chưa kịp nghĩ thêm thì tin nhắn đầu tiên đã tới: Chào bạn, mình cũng thích bóng rổ, kết bạn nhé.",
      "Minh trả lời vài câu cho có lệ. Nhưng câu hỏi tiếp theo lại đi thẳng vào chuyện khác: bạn học trường nào, lớp nào, nhà ở khu nào. Minh gõ dở một câu rồi ngập ngừng xóa đi.",
      "Rồi tin nhắn cuối cùng hiện lên: cho mình xin số điện thoại và một tấm ảnh riêng được không. Minh đặt điện thoại xuống bàn, nhìn màn hình vài giây. Chuông vào lớp sắp reo, và Minh vẫn chưa bấm gì cả.",
    ],
    comicPages: ASSETS.chapter1.friendRequest,
    points: { identify: 10, decide: 10 },
    skippable: false,
  },
  {
    id: 2,
    title: "Tin nóng đang lan truyền",
    lead: "Một bài đăng gây sốc đang được chia sẻ rất nhanh.",
    story: [
      {
        type: "post",
        who: "Tin Nóng Học Đường",
        text: "KHẨN: Ngày mai toàn bộ học sinh được nghỉ học! Chia sẻ ngay để mọi người biết.",
      },
      {
        type: "metric",
        who: "Bài đăng",
        text: "8.742 lượt chia sẻ trong 35 phút.",
      },
      {
        type: "comment",
        who: "Thu Hà",
        text: "Nhiều người chia sẻ thế này chắc là đúng rồi.",
      },
      {
        type: "notice",
        who: "Dữ kiện",
        text: "Bài đăng không dẫn thông báo chính thức hoặc nguồn tin cụ thể.",
      },
    ],
    question: "Em phát hiện điều gì bất thường trong tình huống này?",
    riskType: "Tin giả",
    options: [
      "Chia sẻ ngay để bạn bè không bỏ lỡ",
      "Đọc thật nhiều bình luận để xem số đông nghĩ gì",
      "Kiểm tra website chính thức của nhà trường hoặc nguồn đáng tin cậy",
      "Gửi cho bạn bè hỏi xem các bạn đã nghe tin chưa",
    ],
    correctAnswer: 2,
    hint: "Số lượt chia sẻ và bình luận không phải bằng chứng về độ chính xác.",
    feedbackByOption: [
      "Chia sẻ trước khi kiểm chứng làm thông tin sai lan nhanh hơn và có thể gây xáo trộn.",
      "Bình luận chỉ cho biết phản ứng của người đọc, không chứng minh nguồn tin là thật.",
      "Phù hợp. Nguồn chính thức hoặc nguồn báo chí đáng tin cậy giúp kiểm tra nội dung trước khi tin và chia sẻ.",
      "Hỏi bạn bè có thể cho thêm góc nhìn, nhưng vẫn chưa thay thế được việc kiểm tra nguồn chính thức.",
    ],
    explanation:
      "Tiêu đề giật gân, thúc giục chia sẻ và không có nguồn là ba dấu hiệu cần dừng lại để kiểm chứng.",
    knowledge:
      "Không đánh giá độ tin cậy bằng lượt chia sẻ. Hãy kiểm tra tác giả, ngày đăng, bằng chứng và đối chiếu với nguồn chính thức.",
    narrative: [
      "Hà đang đứng ở hành lang thì thấy bài đăng nhảy lên đầu bảng tin. Chữ in hoa đỏ chót: KHẨN: Ngày mai toàn bộ học sinh được nghỉ học. Bên dưới là dòng chữ giục chia sẻ ngay để mọi người cùng biết.",
      "Hà đọc kỹ lại. Bài đăng đến từ một trang tên Tin Nóng Học Đường mà Hà chưa nghe bao giờ. Ảnh kèm theo chỉ là một cổng trường chung chung, không rõ trường nào. Không có tên người ký thông báo, không có ngày tháng, cũng không có đường dẫn tới bất kỳ văn bản chính thức nào.",
      "Chỉ trong ba mươi lăm phút, con số lượt chia sẻ đã nhảy lên tám nghìn bảy trăm. Mấy bạn đứng gần đó chuyền tay nhau điện thoại, có bạn reo lên mừng rỡ. Một bạn nói với sang: nhiều người chia sẻ thế này thì chắc đúng rồi.",
      "Hà mở thêm một tab, vào trang thông tin của nhà trường. Ở đó chỉ có những thông báo từ tuần trước, không có dòng nào nhắc tới chuyện nghỉ học. Ngón tay Hà dừng lại phía trên nút chia sẻ.",
    ],
    comicPages: ASSETS.chapter1.fakeNews,
    points: { identify: 10, decide: 10 },
    skippable: false,
  },
  {
    id: 3,
    title: "Tin nhắn cần tiền gấp",
    lead: "Một tài khoản giống bạn thân của Lan bất ngờ nhắn mượn tiền.",
    story: [
      { type: "chat", who: "Mai Anh", text: "Lan ơi, mình đang có việc gấp." },
      {
        type: "chat",
        who: "Mai Anh",
        text: "Chuyển giúp mình 500.000 đồng vào số tài khoản này nhé, tối mình gửi lại.",
      },
      {
        type: "notice",
        who: "Dữ kiện",
        text: "Tài khoản dùng đúng tên và ảnh quen thuộc, nhưng cách xưng hô hơi khác thường.",
      },
      {
        type: "chat",
        who: "Mai Anh",
        text: "Đừng gọi, mình đang họp. Chuyển ngay giúp mình!",
      },
    ],
    question: "Những chi tiết nào khiến em cần dừng lại trước khi chuyển tiền?",
    riskType: "Lừa đảo",
    options: [
      "Chuyển trước vì tài khoản có đúng ảnh bạn mình",
      "Hỏi thêm trong cùng cuộc trò chuyện rồi chuyển",
      "Liên hệ người đó qua cuộc gọi hoặc kênh khác để xác minh",
      "Đăng công khai ảnh chụp tin nhắn để hỏi mọi người",
    ],
    correctAnswer: 2,
    hint: "Tài khoản quen thuộc vẫn có thể bị chiếm quyền hoặc bị giả mạo.",
    feedbackByOption: [
      "Tên và ảnh có thể bị sao chép, còn tài khoản thật cũng có thể đã bị chiếm quyền.",
      "Kẻ gian đang kiểm soát cuộc trò chuyện có thể tiếp tục trả lời. Cần đổi sang một kênh xác minh khác.",
      "Phù hợp. Một cuộc gọi trực tiếp hoặc câu hỏi chỉ hai người biết giúp xác minh người đang yêu cầu chuyển tiền.",
      "Đăng công khai có thể làm lộ thêm thông tin của em và bạn. Hãy xác minh riêng tư và báo cáo tài khoản nếu cần.",
    ],
    explanation:
      "Yêu cầu chuyển tiền khẩn cấp, né cuộc gọi và cách xưng hô khác thường là các tín hiệu lừa đảo mạo danh.",
    knowledge:
      "Khi nhận yêu cầu tiền hoặc dữ liệu nhạy cảm, luôn xác minh bằng một kênh liên lạc khác trước khi thực hiện.",
    narrative: [
      "Bảy giờ tối, Lan đang ngồi học bài thì có tin nhắn. Tên người gửi là Mai Anh, bạn thân của Lan từ năm lớp sáu, ảnh đại diện đúng là tấm ảnh Mai Anh mới đổi tuần trước. Tin nhắn viết: Lan ơi, mình đang có việc gấp.",
      "Lan nhắn lại hỏi chuyện gì. Câu trả lời tới ngay: chuyển giúp mình năm trăm nghìn vào số tài khoản này nhé, tối mình gửi lại. Lan hơi khựng lại. Mai Anh chưa bao giờ mượn tiền kiểu này, và cách xưng hô trong tin nhắn cũng khang khác, không giống giọng điệu thường ngày của bạn.",
      "Lan bấm nút gọi thoại. Cuộc gọi chưa kịp đổ chuông thì tin nhắn đã hiện lên: đừng gọi, mình đang họp. Ngay sau đó là một dòng nữa, lần này gấp gáp hơn: chuyển ngay giúp mình.",
      "Lan nhìn màn hình, rồi nhìn sang danh bạ vẫn còn lưu số điện thoại của Mai Anh. Ứng dụng ngân hàng vẫn chưa được mở.",
    ],
    comicPages: ASSETS.chapter1.urgentMoney,
    points: { identify: 10, decide: 10 },
    skippable: false,
  },
  {
    id: 4,
    title: "Nhóm chat lớp",
    lead: "Một bạn trong lớp bị chế ảnh và xúc phạm trong nhóm chat.",
    sensitiveNote:
      "Tình huống này nói về bắt nạt trên mạng. Nếu em thấy không thoải mái, em có thể bỏ qua và báo với thầy/cô.",
    story: [
      {
        type: "chat",
        who: "Tài khoản K",
        text: "Lại làm sai nữa à? Đúng là chậm thật.",
      },
      {
        type: "notice",
        who: "Nhóm chat",
        text: "Một ảnh chế về Phương được gửi vào nhóm.",
      },
      {
        type: "comment",
        who: "Tài khoản M",
        text: "Ai cũng biết chuyện này rồi, đừng đi học nữa.",
      },
      {
        type: "chat",
        who: "Tin nhắn riêng",
        text: "Nếu mách người lớn thì sẽ còn nhiều ảnh khác.",
      },
    ],
    question:
      "Em nhận thấy hành vi nào đang gây tổn thương và đe dọa bạn Phương?",
    riskType: "Bắt nạt trên mạng",
    options: [
      "Chửi lại để người bắt nạt phải sợ",
      "Xóa ngay mọi tin nhắn để khỏi phải nhìn thấy",
      "Lưu bằng chứng, chặn hoặc báo cáo và tìm người lớn đáng tin cậy hỗ trợ",
      "Im lặng chịu đựng để sự việc tự qua",
    ],
    correctAnswer: 2,
    hint: "Muốn được hỗ trợ hiệu quả, em cần giữ lại dấu vết của sự việc và không đối đầu một mình.",
    feedbackByOption: [
      "Đáp trả có thể làm xung đột leo thang và tạo thêm nội dung gây tổn thương.",
      "Rời khỏi nội dung gây hại là cần thiết, nhưng xóa mọi tin nhắn sẽ làm mất bằng chứng quan trọng.",
      "Phù hợp. Lưu ảnh chụp màn hình, không tranh cãi, chặn hoặc báo cáo và chia sẻ với cha mẹ, giáo viên là chuỗi xử lí an toàn.",
      "Im lặng kéo dài có thể khiến em bị cô lập và người bắt nạt tiếp tục. Em xứng đáng được người lớn hỗ trợ.",
    ],
    explanation:
      "Ảnh chế, lời xúc phạm, bịa đặt và đe dọa lặp lại đều là dấu hiệu bắt nạt trên không gian mạng.",
    supportQuestion: "Em sẽ tìm ai hỗ trợ? Có thể chọn nhiều phương án.",
    supportOptions: [
      "Bạn bè đáng tin cậy",
      "Cha mẹ hoặc người chăm sóc",
      "Giáo viên",
      "Cơ quan chức năng khi sự việc nghiêm trọng",
    ],
    supportExplanation:
      "Bạn bè có thể đồng hành, nhưng em nên tìm ít nhất một người lớn đáng tin cậy. Khi có đe dọa nghiêm trọng, cần báo cơ quan chức năng hoặc Tổng đài 111.",
    knowledge:
      "Không đối đầu một mình. Hãy lưu bằng chứng, chặn hoặc báo cáo, chia sẻ với cha mẹ hoặc thầy cô. Khi nghiêm trọng, có thể tìm hỗ trợ từ cơ quan chức năng hoặc Tổng đài 111.",
    narrative: [
      "Nhóm chat của lớp vốn chỉ để nhắc bài tập. Chiều nay, sau tiết kiểm tra, một tài khoản nhắn vào nhóm: lại làm sai nữa à, đúng là chậm thật. Vài biểu tượng cười xuất hiện ngay bên dưới.",
      "Một lúc sau, có người gửi vào nhóm một tấm ảnh chế về Phương. Nam ngồi bàn cuối nhìn thấy hết. Cậu thấy Phương cúi mặt xuống bàn, tay vẫn cầm điện thoại nhưng không nhắn gì.",
      "Tin nhắn tiếp theo còn nặng hơn: ai cũng biết chuyện này rồi, đừng đi học nữa. Trong nhóm, một số bạn im lặng, một số vẫn thả biểu tượng cười. Không ai nói gì để dừng lại.",
      "Điều Nam không biết là Phương còn nhận riêng một tin nhắn khác: nếu mách người lớn thì sẽ còn nhiều ảnh khác. Cuối buổi, Phương ngồi lại một mình trong lớp. Nam cầm điện thoại, nhìn về phía Phương, rồi nhìn ra cửa phòng giáo viên ở cuối hành lang.",
    ],
    comicPages: ASSETS.chapter1.cyberbullying,
    points: { identify: 10, decide: 10 },
    skippable: true,
  },
  {
    id: 5,
    title: "Chỉ chơi thêm một trận",
    lead: "Một buổi tối của Hoàng trôi qua theo những mốc thời gian dưới đây.",
    story: [
      {
        type: "timeline",
        who: "16:00",
        text: "Hoàng về nhà, dự định học bài sau khi nghỉ một chút.",
      },
      { type: "timeline", who: "17:00", text: "Bắt đầu chơi game cùng bạn." },
      { type: "timeline", who: "19:00", text: "Chỉ thêm một trận nữa." },
      { type: "timeline", who: "21:00", text: "Sắp lên hạng, chưa thể dừng." },
      {
        type: "timeline",
        who: "23:30 - 01:00",
        text: "Vẫn chơi, chưa làm bài tập và thiếu ngủ.",
      },
    ],
    question: "Điều gì đang xảy ra với cách Hoàng sử dụng thời gian?",
    riskType: "Nghiện Internet",
    options: [
      "Chơi tiếp đến khi thắng rồi hôm sau ngủ bù",
      "Đặt giới hạn thời gian, ưu tiên việc cần làm và nghỉ đúng giờ",
      "Xóa ngay mọi trò chơi và không bao giờ dùng Internet",
      "Chỉ chơi vào ban đêm để ban ngày vẫn học",
    ],
    correctAnswer: 1,
    hint: "Một giải pháp tốt cần giúp Hoàng kiểm soát thời lượng mà vẫn thực tế và duy trì được lâu dài.",
    feedbackByOption: [
      "Một trận thắng không bảo đảm em sẽ dừng, còn ngủ bù không khắc phục được việc bỏ học và thiếu ngủ thường xuyên.",
      "Phù hợp. Lịch rõ ràng, báo giờ dừng, hoàn thành việc cần làm trước và nghỉ ngơi đủ giúp sử dụng Internet có kiểm soát.",
      "Cấm tuyệt đối thường khó duy trì. Mục tiêu là xây dựng thói quen cân bằng, không phải loại bỏ mọi hoạt động số.",
      "Đổi sang ban đêm vẫn làm giảm thời gian ngủ và khả năng tập trung vào ngày hôm sau.",
    ],
    explanation:
      "Hoàng liên tục trì hoãn điểm dừng, bỏ nhiệm vụ học tập và hi sinh giấc ngủ cho game.",
    applicationQuestion:
      "Hãy đề xuất một nguyên tắc sử dụng Internet hoặc game hợp lí mà em có thể áp dụng.",
    knowledge:
      "Sử dụng Internet hợp lí cần có giới hạn thời gian, thời điểm dừng cụ thể, ưu tiên học tập, vận động, giao tiếp trực tiếp và giấc ngủ.",
    narrative: [
      "Bốn giờ chiều, Hoàng về tới nhà, quẳng cặp xuống cạnh bàn học. Sách vở vẫn nằm nguyên trong cặp. Hoàng tự nhủ nghỉ một chút rồi học, và mở máy lên chơi cùng mấy người bạn.",
      "Bảy giờ, mẹ dọn cơm ra bàn. Hoàng nói để lát nữa ăn, chỉ thêm một trận nữa thôi. Chín giờ, trận đấu đang căng, sắp lên hạng, dừng lúc này thì tiếc. Sách bài tập vẫn đóng nguyên trên bàn.",
      "Mười một giờ rưỡi, điện thoại hiện lời nhắc làm bài tập. Hoàng bấm bỏ qua. Màn hình vẫn sáng, mắt đã mỏi nhưng ván tiếp theo vừa bắt đầu.",
      "Một giờ sáng Hoàng mới tắt máy. Sáu giờ ba mươi chuông báo thức reo, Hoàng khó nhọc mở mắt. Đến lớp, cậu gật gù trong tiết đầu, vở bài tập vẫn để trống. Chiều hôm đó, Hoàng ngồi trước bàn học với sách bài tập, điện thoại và tay cầm game đặt cạnh nhau.",
    ],
    comicPages: ASSETS.chapter1.lateGaming,
    points: { identify: 10, decide: 10 },
    skippable: false,
  },
];

const malwareCases = [
  {
    id: "virus",
    title: "Virus",
    subtitle: "Đoạn mã bám vào phần mềm khác",
    unlock: "VIRUS",
    intro: [
      "Virus là đoạn mã độc được gắn hoặc chèn vào một tệp, chương trình hay vùng khởi động khác. Thành phần bị gắn mã độc được gọi là vật chủ.",
      "Virus được kích hoạt khi vật chủ được mở, chạy hoặc được hệ thống kích hoạt. Khi đó nó có thể chèn bản sao vào vật chủ khác và tiếp tục lây qua tệp chia sẻ, USB hoặc thiết bị lưu trữ.",
    ],
    keyPoint:
      "Dấu hiệu bản chất của virus là cần vật chủ và lây bằng cách nhiễm mã vào vật chủ khác.",
    keywords: ["đoạn mã độc", "vật chủ", "kích hoạt cùng vật chủ", "lây nhiễm tệp"],
    essence:
      "Virus không phải một chương trình độc lập hoàn chỉnh. Nó tồn tại bằng cách gắn mã của mình vào một vật chủ.",
    mechanism:
      "Vật chủ bị nhiễm được kích hoạt → mã virus chạy → virus tìm và chèn bản sao vào vật chủ khác → các vật chủ mới tiếp tục phát tán khi được kích hoạt.",
    harms: [
      "Làm hỏng, xóa, sửa đổi hoặc mã hóa tệp và chương trình.",
      "Gây lỗi, làm máy chậm, treo máy hoặc khiến phần mềm hoạt động bất thường.",
      "Làm các tệp bị nhiễm tiếp tục phát tán qua USB, thư mục dùng chung hoặc tệp gửi cho người khác.",
    ],
    prevention: [
      "Không mở tệp, chương trình hoặc macro không rõ nguồn gốc.",
      "Quét USB và tệp tải xuống; cập nhật hệ điều hành và phần mềm bảo vệ.",
      "Sao lưu dữ liệu quan trọng để có thể phục hồi nếu tệp bị phá hoại.",
    ],
    distinguish:
      "Nhớ cụm 'cần vật chủ'. Worm là chương trình độc lập có thể tự lan qua mạng, còn Trojan nổi bật ở việc giả dạng để dụ người dùng cài hoặc chạy.",
    story: [
      "Một học sinh nhận USB từ bạn và chạy một chương trình trong đó.",
      "Một số tệp khác bắt đầu có biểu hiện bất thường.",
      "Khi chương trình bị nhiễm được chạy, hiện tượng tiếp tục xuất hiện ở tệp khác.",
    ],
    question: "Điều gì đặc biệt trong cách mã độc này hoạt động?",
    options: [
      "Là một chương trình hoàn chỉnh độc lập",
      "Phải gắn vào chương trình hoặc tệp khác",
      "Có thể hoạt động mà không cần vật chủ",
      "Chủ yếu giả dạng để đánh cắp thông tin",
    ],
    correctAnswer: 1,
    hint: "Theo dõi mối liên hệ giữa mã độc và các tệp bị nhiễm.",
    explanation:
      "Dấu vết quan trọng là hiện tượng chỉ xuất hiện khi chương trình bị nhiễm được chạy, sau đó các tệp khác cũng bị chèn mã. Đây là cơ chế lây nhiễm qua vật chủ của virus.",
    knowledge:
      "Virus: đoạn mã độc cần vật chủ, được kích hoạt cùng vật chủ và lây bằng cách nhiễm mã vào vật chủ khác.",
    asset: ASSETS.chapter2.virus,
    visual: ["FILE A", "VIRUS + FILE A", "FILE B", "VIRUS + FILE B"],
  },
  {
    id: "worm",
    title: "Worm",
    subtitle: "Sâu máy tính, tự lây qua mạng",
    unlock: "WORM - SÂU MÁY TÍNH",
    intro: [
      "Worm, tiếng Việt gọi là sâu máy tính, là một chương trình độc hại độc lập. Khác với virus, nó không cần gắn mã vào một tệp vật chủ để tồn tại.",
      "Worm có thể tự nhân bản và lan từ thiết bị này sang thiết bị khác qua mạng, thường bằng cách khai thác lỗ hổng. Một số worm cũng dùng email, tin nhắn hoặc liên kết để dụ người dùng kích hoạt bước xâm nhập đầu tiên.",
    ],
    keyPoint:
      "Dấu hiệu bản chất của worm là chương trình độc lập có khả năng tự nhân bản và tự lan qua mạng.",
    keywords: ["chương trình độc lập", "tự nhân bản", "tự lan qua mạng", "khai thác lỗ hổng"],
    essence:
      "Worm là chương trình độc hại hoàn chỉnh, không cần vật chủ và có khả năng tạo bản sao của chính nó.",
    mechanism:
      "Một máy bị nhiễm → worm dò thiết bị hoặc lỗ hổng trong mạng → tự gửi hoặc cài bản sao sang máy khác → số máy bị nhiễm tăng rất nhanh.",
    harms: [
      "Chiếm băng thông mạng, bộ nhớ và tài nguyên xử lí, làm máy và mạng chậm hoặc tê liệt.",
      "Lây nhanh tới nhiều thiết bị trong trường học, gia đình hoặc cơ quan trong thời gian ngắn.",
      "Có thể mang theo tải độc khác để phá hoại dữ liệu, tạo cửa hậu hoặc đánh cắp thông tin.",
    ],
    prevention: [
      "Cập nhật hệ điều hành và ứng dụng để vá các lỗ hổng bảo mật.",
      "Bật tường lửa, phần mềm bảo vệ và không mở liên kết hoặc tệp đính kèm đáng ngờ.",
      "Ngắt kết nối mạng hoặc cô lập thiết bị khi phát hiện dấu hiệu lây lan bất thường.",
    ],
    distinguish:
      "Nhớ cụm 'tự lan qua mạng'. Virus cần nhiễm vào vật chủ; Trojan chủ yếu dựa vào vỏ bọc đáng tin để lừa người dùng cài hoặc chạy.",
    story: [
      "Một học sinh nhận tin nhắn: Ảnh của bạn ở đây nè! [BẤM XEM ẢNH].",
      "Sau khi bấm, một chương trình được tải xuống và tự hoạt động.",
      "Nhiều máy trong cùng mạng lần lượt có biểu hiện tương tự.",
    ],
    question: "Đặc điểm nào giải thích tốt nhất sự lan truyền này?",
    options: [
      "Phải gắn vào từng tệp rồi chờ người dùng mở",
      "Là chương trình hoàn chỉnh, có thể tự lan qua mạng hoặc lỗ hổng",
      "Chỉ thu thập lịch sử duyệt web",
      "Chỉ hoạt động khi được đặt tên giống trò chơi",
    ],
    correctAnswer: 1,
    hint: "Chú ý việc nhiều máy bị ảnh hưởng mà không cần từng tệp vật chủ.",
    explanation:
      "Nhiều máy lần lượt bị ảnh hưởng mà không cần từng tệp vật chủ cho thấy một chương trình độc lập đang tự nhân bản và lan qua mạng. Đó là cơ chế đặc trưng của worm.",
    knowledge: "Worm có thể lan theo chuỗi: Máy A → Máy B → Máy C → Máy D.",
    asset: ASSETS.chapter2.worm,
    visual: ["MÁY A", "MÁY B", "MÁY C", "MÁY D"],
  },
  {
    id: "trojan",
    title: "Trojan",
    subtitle: "Phần mềm nội gián đội lốt phần mềm thật",
    unlock: "TROJAN",
    intro: [
      "Trojan lấy tên từ truyền thuyết Con ngựa thành Tơ-roa trong thần thoại Hy Lạp: bên ngoài là một món quà, bên trong giấu quân lính.",
      "Trojan là chương trình độc hại giả dạng phần mềm hữu ích hoặc tệp đáng tin để dụ người dùng tự tải, cài đặt hay cấp quyền. Nó có thể vẫn cho thấy chức năng bề ngoài, đồng thời âm thầm thực hiện hành vi không được người dùng cho phép.",
    ],
    keyPoint:
      "Dấu hiệu bản chất của Trojan là ngụy trang và lừa người dùng kích hoạt; nó không tự nhân bản như worm hay lây nhiễm vật chủ như virus.",
    keywords: ["ngụy trang", "đánh lừa người dùng", "người dùng kích hoạt", "hoạt động bí mật"],
    essence:
      "Trojan là chương trình độc hại khoác vỏ bọc có vẻ an toàn hoặc hữu ích để người dùng tự đưa nó vào máy.",
    mechanism:
      "Người dùng thấy một phần mềm có vẻ hữu ích → tự tải, cài hoặc cấp quyền → chức năng ẩn được kích hoạt → dữ liệu hoặc quyền điều khiển bị chuyển cho kẻ tấn công.",
    harms: [
      "Đánh cắp mật khẩu, dữ liệu cá nhân, tài liệu hoặc thông tin tài khoản.",
      "Theo dõi người dùng, ghi phím, mở cửa hậu hoặc cho phép điều khiển máy từ xa.",
      "Tải thêm mã độc, thay đổi hệ thống hoặc lợi dụng máy để thực hiện hành vi khác.",
    ],
    prevention: [
      "Chỉ tải phần mềm từ nguồn chính thức; không dùng bản crack hoặc tệp cài đặt không rõ nguồn.",
      "Kiểm tra tên tệp, quyền ứng dụng yêu cầu và cảnh báo bảo mật trước khi cài hoặc chạy.",
      "Cập nhật hệ thống, dùng phần mềm bảo vệ và không cấp quyền quản trị khi không cần thiết.",
    ],
    distinguish:
      "Nhớ cụm 'giả dạng để được cài'. Virus nổi bật ở việc nhiễm vào vật chủ; worm nổi bật ở khả năng tự lan qua mạng.",
    story: [
      "Học sinh tải GAME_PRO_FREE_CRACK.exe từ một trang không rõ nguồn.",
      "Trò chơi vẫn chạy bình thường sau khi cài đặt.",
      "Ở phía sau, tài khoản bị truy cập và dữ liệu được gửi ra ngoài.",
    ],
    question: "Điểm nguy hiểm nhất của chương trình này là gì?",
    options: [
      "Nó luôn tự sao chép sang mọi tệp",
      "Nó ngụy trang như chương trình bình thường để thực hiện hoạt động nội gián",
      "Nó chỉ làm giảm chất lượng hình ảnh của game",
      "Nó chỉ xuất hiện trên USB",
    ],
    correctAnswer: 1,
    hint: "Chương trình vẫn tỏ ra hữu ích trong khi có hoạt động bí mật phía sau.",
    explanation:
      "Trò chơi vẫn tạo cảm giác bình thường nhưng có hoạt động bí mật phía sau. Việc ngụy trang để người dùng tự cài hoặc chạy là đặc điểm nhận diện quan trọng của Trojan.",
    knowledge:
      "Trojan: chương trình độc hại ngụy trang, dựa vào việc người dùng tự cài hoặc chạy để thực hiện hoạt động bí mật.",
    asset: ASSETS.chapter2.trojan,
    visual: ["GAME MIỄN PHÍ", "MỞ GÓI", "CHƯƠNG TRÌNH NỘI GIÁN"],
  },
];

/*
  Bốn nhánh của trojan. `clue` là dấu vết thật trên máy, cố ý không nhắc lại
  `behavior` để phần luyện tập buộc học sinh suy luận chứ không chép lại.
*/
const secretFiles = [
  {
    id: "spyware",
    name: "Spyware",
    vi: "Phần mềm gián điệp",
    behavior: "Thu thập thông tin người dùng và gửi ra ngoài.",
    clue: "Máy vẫn chạy bình thường, nhưng mỗi đêm khoảng 2 giờ sáng lại đều đặn gửi một gói dữ liệu nhỏ tới một máy chủ lạ ở nước ngoài.",
    clueWhy:
      "Dữ liệu bị lấy rồi chuyển ra ngoài, đúng mục đích ăn trộm thông tin của spyware.",
    asset: ASSETS.chapter2.spyware,
  },
  {
    id: "keylogger",
    name: "Keylogger",
    vi: "Phần mềm ghi phím",
    behavior: "Ghi lại thao tác bàn phím để tìm thông tin nhạy cảm.",
    clue: "Hà vừa đổi mật khẩu mới hôm qua và chưa nói với ai. Sáng nay tài khoản vẫn bị đăng nhập từ một thiết bị lạ.",
    clueWhy:
      "Mật khẩu mới chỉ tồn tại ở một nơi duy nhất là lúc Hà gõ nó ra, nên thứ đọc được nó phải nằm ở bàn phím.",
    asset: ASSETS.chapter2.keylogger,
  },
  {
    id: "backdoor",
    name: "Backdoor",
    vi: "Cửa hậu",
    behavior: "Tạo một đường truy cập bí mật vào máy tính.",
    clue: "Trong danh sách tài khoản của máy có thêm một tài khoản quản trị tên lạ mà không ai trong nhà tạo ra.",
    clueWhy:
      "Một tài khoản bí mật được tạo sẵn để vào máy về sau chính là cửa sau.",
    asset: ASSETS.chapter2.backdoor,
  },
  {
    id: "rootkit",
    name: "Rootkit",
    vi: "Bộ công cụ chiếm quyền gốc",
    behavior: "Chiếm quyền cao nhất và che giấu hoạt động trên hệ thống.",
    clue: "Phần mềm diệt virus báo máy hoàn toàn sạch, nhưng nhật kí hệ thống của ba ngày qua bị mất hẳn một khoảng không rõ lí do.",
    clueWhy:
      "Chỉ thứ có quyền cao nhất mới xóa được nhật kí và tự giấu mình khỏi phần mềm diệt virus.",
    asset: ASSETS.chapter2.rootkit,
  },
];

const malwareComparison = [
  {
    feature: "Có phải phần mềm hoàn chỉnh không?",
    values: {
      virus: "Không. Chỉ là một đoạn mã nằm trong phần mềm khác",
      worm: "Có. Là phần mềm hoàn chỉnh, tự chạy được",
      trojan: "Có. Là phần mềm hoàn chỉnh, tự chạy được",
    },
    hints: {
      virus: "Nhớ cụm “cần vật chủ”: virus phải gắn mã của nó vào một tệp hoặc chương trình khác.",
      worm: "Worm tồn tại như một chương trình riêng và không cần bám vào tệp vật chủ.",
      trojan: "Trojan là một chương trình có vỏ bọc hữu ích hoặc đáng tin, nhưng bên trong chứa chức năng độc hại.",
    },
  },
  {
    feature: "Có tự lây sang máy khác không?",
    values: {
      virus: "Không chủ động tự lan qua mạng; phát tán khi vật chủ bị nhiễm được chia sẻ hoặc chạy",
      worm: "Có. Tự lây sang máy khác qua mạng",
      trojan: "Không tự lây lan",
    },
    hints: {
      virus: "Virus không chủ động quét mạng để tự đi; hãy nghĩ xem tệp vật chủ bị nhiễm được chia sẻ hoặc chạy như thế nào.",
      worm: "Từ khóa nhận diện worm là “tự nhân bản” và “tự lan qua mạng”.",
      trojan: "Trojan thường vào máy vì người dùng tải, cài hoặc chạy nó; bản thân nó không tự nhân bản để lây lan.",
    },
  },
  {
    feature: "Nó cần người dùng làm gì để hoạt động?",
    values: {
      virus: "Vật chủ phải được người dùng hoặc hệ thống kích hoạt",
      worm: "Có thể tự lan sau khi xâm nhập; bước đầu có thể do lỗ hổng hoặc cú nhấp của người dùng",
      trojan: "Thường phải lừa người dùng tải, cài, chạy hoặc cấp quyền",
    },
    hints: {
      virus: "Hãy xác định thứ phải được mở hoặc chạy trước khi đoạn mã virus bên trong hoạt động.",
      worm: "Tách hai giai đoạn: cách worm xâm nhập lần đầu và khả năng tự lan của nó sau khi đã vào một máy.",
      trojan: "Vỏ bọc giả chỉ phát huy tác dụng khi người dùng tin tưởng và chủ động đưa chương trình vào máy.",
    },
  },
  {
    feature: "Mục đích chính của nó là gì?",
    values: {
      virus: "Nhiễm vào vật chủ khác và có thể phá hoại dữ liệu hoặc chương trình",
      worm: "Tự nhân bản, lan rộng và có thể mang thêm tải độc",
      trojan: "Thực hiện hoạt động bí mật như đánh cắp dữ liệu hoặc mở cửa hậu",
    },
    hints: {
      virus: "Cơ chế đặc trưng của virus là chèn mã vào vật chủ khác; hậu quả có thể đi kèm phá hoại tệp hoặc chương trình.",
      worm: "Nhấn vào mục tiêu lan thật nhanh bằng nhiều bản sao; một số worm còn mang theo mã độc khác.",
      trojan: "Sau vỏ bọc bình thường là một chức năng bí mật, chẳng hạn lấy dữ liệu hoặc tạo đường truy cập trái phép.",
    },
  },
  {
    feature: "Tác hại điển hình là gì?",
    values: {
      virus: "Hỏng hoặc mất tệp, lỗi chương trình, máy hoạt động bất thường",
      worm: "Nghẽn mạng, cạn tài nguyên, nhiều máy bị ảnh hưởng rất nhanh",
      trojan: "Mất mật khẩu hoặc dữ liệu, bị theo dõi hay điều khiển máy từ xa",
    },
    hints: {
      virus: "Hãy nghĩ tới những vật chủ bị nhiễm: tệp, chương trình và hoạt động của máy có thể bị thay đổi hoặc phá hỏng.",
      worm: "Nhiều bản sao cùng lan trong mạng sẽ tiêu thụ băng thông, bộ nhớ và tài nguyên xử lí.",
      trojan: "Hoạt động bí mật của Trojan thường nhắm tới dữ liệu, tài khoản hoặc quyền điều khiển thiết bị.",
    },
  },
  {
    feature: "Phòng tránh trọng tâm là gì?",
    values: {
      virus: "Không chạy tệp lạ, quét USB và sao lưu dữ liệu",
      worm: "Vá lỗ hổng, bật tường lửa và cô lập máy có dấu hiệu lây lan",
      trojan: "Chỉ tải từ nguồn chính thức, tránh bản crack và kiểm tra quyền ứng dụng",
    },
    hints: {
      virus: "Tập trung vào các đường mang tệp nhiễm như USB, tệp tải xuống và việc phục hồi khi dữ liệu bị phá hoại.",
      worm: "Worm thường lợi dụng lỗ hổng và kết nối mạng, vì vậy cần chặn đường lan và vá điểm yếu.",
      trojan: "Giảm khả năng bị lừa cài chương trình giả bằng cách kiểm tra nguồn tải, tệp cài đặt và quyền được yêu cầu.",
    },
  },
];

const defenseActions = [
  {
    id: 1,
    text: "Tải phần mềm crack từ trang không rõ nguồn",
    category: "Nguy hiểm",
    explanation:
      "Phần mềm crack có thể bị cài mã độc và không có cơ chế xác minh đáng tin cậy.",
  },
  {
    id: 2,
    text: "Cập nhật hệ điều hành và phần mềm",
    category: "An toàn",
    explanation:
      "Bản cập nhật thường vá các lỗ hổng mà mã độc có thể lợi dụng.",
  },
  {
    id: 3,
    text: "Bấm liên kết trong email lạ",
    category: "Nguy hiểm",
    explanation: "Liên kết lạ có thể dẫn đến trang giả mạo hoặc tải mã độc.",
  },
  {
    id: 4,
    text: "Cài và cập nhật phần mềm bảo mật",
    category: "An toàn",
    explanation:
      "Công cụ bảo mật giúp phát hiện, cách ly và ngăn chặn nhiều mối đe dọa.",
  },
  {
    id: 5,
    text: "Cắm USB lạ rồi chạy ngay chương trình",
    category: "Nguy hiểm",
    explanation:
      "USB và tệp thực thi không rõ nguồn có thể mang virus hoặc Trojan.",
  },
  {
    id: 6,
    text: "Xác minh người gửi trước khi mở tệp đáng ngờ",
    category: "An toàn",
    explanation:
      "Xác minh qua kênh khác giúp tránh tin nhắn từ tài khoản bị chiếm quyền.",
  },
  {
    id: 7,
    text: "Sử dụng mật khẩu mạnh và không để lộ",
    category: "An toàn",
    explanation:
      "Mật khẩu mạnh, riêng cho từng dịch vụ làm giảm nguy cơ bị chiếm nhiều tài khoản.",
  },
  {
    id: 8,
    text: "Tải phần mềm từ nguồn chính thức",
    category: "An toàn",
    explanation:
      "Nguồn chính thức giảm nguy cơ tệp bị chỉnh sửa hoặc cài kèm mã độc.",
  },
];

const reflectionQuestions = [
  "Nguy cơ trên mạng nào em cho rằng học sinh dễ gặp nhất? Vì sao?",
  "Nếu nhận được một đường link đáng ngờ từ tài khoản của bạn thân, em sẽ làm gì?",
  "Sau hoạt động hôm nay, em sẽ thay đổi ít nhất một thói quen sử dụng Internet nào?",
];

const SCREEN_NAMES = {
  home: "Trung tâm chỉ huy",
  risksIntro: "Một số nguy cơ trên mạng",
  scenario: "Nhiệm vụ 1: Dấu vết trên mạng",
  transition: "Cảnh báo bảo mật",
  malware: "Nhiệm vụ 2: Ba loại mã độc",
  secrets: "Bốn nhánh của Trojan",
  comparison: "Phân biệt mã độc",
  defense: "Phòng tuyến an toàn",
  reflection: "Điều em rút ra",
  report: "Hồ sơ An toàn số",
};
