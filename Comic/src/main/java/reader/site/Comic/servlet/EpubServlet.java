package reader.site.Comic.servlet;

import com.azure.storage.blob.BlobClient;
import com.google.gson.*;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import reader.site.Comic.dao.EpubBookDAO;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.EpubBook;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.AzureBlobUploader;
import reader.site.Comic.service.TokenService;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * EPUB endpoints.
 *
 * [SECURITY] Every operation requires a valid bearer token:
 *  - GET  /api/epub/file?id=...   → only the owner (or an admin) can download
 *  - GET  /api/epub/user/<id>     → only the owner (or an admin) can list
 *  - POST /api/epub               → userId is taken from the token, uploads validated
 *  - DELETE /api/epub/<id>        → only the owner (or an admin) can delete
 */
@WebServlet("/api/epub/*")
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024 * 10,
        maxFileSize = 1024L * 1024 * 50,      // [SECURITY] 50 MB per file
        maxRequestSize = 1024L * 1024 * 55)
public class EpubServlet extends BaseServlet {
    private EpubBookDAO epubDAO;
    private AzureBlobUploader blobUploader;
    private AuthService authService;

    // Adapter cho LocalDateTime
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDateTime.class, (JsonSerializer<LocalDateTime>) (src, t, ctx) ->
                    new JsonPrimitive(src.format(ISO)))
            .registerTypeAdapter(LocalDateTime.class, (JsonDeserializer<LocalDateTime>) (json, t, ctx) ->
                    LocalDateTime.parse(json.getAsString(), ISO))
            .create();

    @Override
    public void init() throws ServletException {
        try {
            epubDAO = new EpubBookDAO();
            blobUploader = new AzureBlobUploader(); // Khởi tạo Blob Uploader
            authService = new AuthService(new UserDAO(), new RoleDAO(), new TokenService());
            System.out.println("EpubServlet initialized successfully with Azure Blob.");
        } catch (Exception e) {
            System.err.println("Failed to initialize EpubServlet/Database/Azure: " + e.getMessage());
            throw new ServletException("Initialization failed", e);
        }
    }

    private void sendJsonResponse(HttpServletResponse resp, int status, Object data) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        setCorsHeaders(resp);
        resp.getWriter().write(gson.toJson(data));
    }

    private void sendErrorResponse(HttpServletResponse resp, int status, String message) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        setCorsHeaders(resp);
        String errorJson = gson.toJson(new ErrorResponse(message));
        resp.getWriter().write(errorJson);
    }

    // Helper class
    private static class ErrorResponse {
        private final String error;
        public ErrorResponse(String error) { this.error = error; }
    }

    // --- GET: Phục vụ file từ Azure Blob ---
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        String pathInfo = req.getPathInfo();

        if ("/file".equals(pathInfo)) {
            // [SECURITY FIX] Vuln #21: downloading a book now requires authentication
            // and ownership (or admin role).
            User user = getAuthenticatedUser(req);
            if (user == null) {
                sendErrorResponse(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
                return;
            }

            String bookIdStr = req.getParameter("id");
            if (bookIdStr == null || bookIdStr.isBlank()) {
                sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Missing 'id'");
                return;
            }

            try {
                Long bookId = Long.parseLong(bookIdStr);
                EpubBook book = epubDAO.findById(bookId);

                if (book == null) {
                    sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Book metadata not found");
                    return;
                }

                if (!canAccess(user, book.getUserId())) {
                    sendErrorResponse(resp, HttpServletResponse.SC_FORBIDDEN, "Access denied");
                    return;
                }

                // Lấy BlobClient từ tên blob đã lưu
                BlobClient blobClient = blobUploader.getBlobClient(book.getBlobName());

                if (!blobClient.exists()) {
                    sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "File not found on Azure Blob");
                    return;
                }

                // Thiết lập header và stream từ Azure
                resp.setContentType("application/epub+zip");
                // [SECURITY FIX] Vuln #23: sanitize filename to prevent header injection
                String safeName = sanitizeFileName(book.getFileName());
                resp.setHeader("Content-Disposition", "attachment; filename=\"" + safeName + "\"");
                resp.setContentLengthLong(blobClient.getProperties().getBlobSize());

                // Hỗ trợ Range Requests là TỐT NHẤT cho epubjs
                resp.setHeader("Accept-Ranges", "bytes");

                try (var out = resp.getOutputStream()) {
                    blobClient.download(out); // Stream trực tiếp từ Azure ra response
                    out.flush();
                }
            } catch (NumberFormatException e) {
                sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid book ID format.");
            }
            return;
        }

        // NHÁNH CŨ: /user/<userId> ...
        if (pathInfo != null && pathInfo.startsWith("/user/")) {
            // [SECURITY FIX] IDOR: callers may only list their own books (admins excepted).
            User user = getAuthenticatedUser(req);
            if (user == null) {
                sendErrorResponse(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
                return;
            }

            String userId = pathInfo.substring("/user/".length());
            if (!canAccess(user, userId)) {
                sendErrorResponse(resp, HttpServletResponse.SC_FORBIDDEN, "Access denied");
                return;
            }

            try {
                List<EpubBook> books = epubDAO.findAllByUserId(userId);
                sendJsonResponse(resp, HttpServletResponse.SC_OK, books);
            } catch (Exception e) {
                System.err.println("Error fetching books: " + e.getMessage());
                sendErrorResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error retrieving book list.");
            }
            return;
        }

        sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Invalid API endpoint.");
    }


    // --- POST: Tải lên sách mới lên Azure ---
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);

        // [SECURITY FIX] Vuln #22: uploads require authentication; the owning user is
        // taken from the validated token, never from client input.
        User user = getAuthenticatedUser(req);
        if (user == null) {
            sendErrorResponse(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        try {
            String title = req.getParameter("title");
            Part filePart = req.getPart("file");

            if (title == null || title.isBlank() || filePart == null || filePart.getSize() == 0) {
                sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Missing required fields (title, file).");
                return;
            }

            // [SECURITY] Validate the upload: must be an .epub file within the size limit.
            String fileName = Paths.get(filePart.getSubmittedFileName() == null ? "" : filePart.getSubmittedFileName())
                    .getFileName().toString();
            if (!fileName.toLowerCase().endsWith(".epub")) {
                sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Only .epub files are allowed.");
                return;
            }
            long fileSize = filePart.getSize();
            if (fileSize > 1024L * 1024 * 50) {
                sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "File exceeds the 50 MB limit.");
                return;
            }

            // 1. Tạo tên Blob duy nhất (UUID)
            String blobName = UUID.randomUUID().toString().replace("-", "") + ".epub";
            // 2. Upload file lên Azure Blob Storage
            try (InputStream fileContent = filePart.getInputStream()) {
                if (!blobUploader.uploadFile(fileContent, blobName, fileSize)) {
                    throw new Exception("Failed to upload file to Azure.");
                }
            }

            // 3. Tạo đối tượng EpubBook và lưu vào DB
            EpubBook newBook = new EpubBook();
            newBook.setUserId(user.getId()); // [SECURITY] owner comes from the token
            newBook.setTitle(title);
            newBook.setFileName(fileName);
            newBook.setFileSizeInBytes(fileSize);
            newBook.setBlobName(blobName); // Lưu tên blob thay vì storagePath

            EpubBook insertedBook = epubDAO.insert(newBook);

            sendJsonResponse(resp, HttpServletResponse.SC_CREATED, insertedBook);

        } catch (IllegalStateException e) {
            // Multipart size limit exceeded
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "File exceeds the 50 MB limit.");
        } catch (Exception e) {
            System.err.println("Error in doPost (Upload): " + e.getMessage());
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Upload failed.");
        }
    }

    // --- DELETE: Xóa sách khỏi DB và Azure ---
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);

        // [SECURITY FIX] deletion requires authentication + ownership (or admin).
        User user = getAuthenticatedUser(req);
        if (user == null) {
            sendErrorResponse(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Book id required.");
            return;
        }

        try {
            String idStr = pathInfo.replaceFirst("^/", "");
            Long bookId = Long.parseLong(idStr);

            EpubBook book = epubDAO.findById(bookId);
            if (book == null) {
                sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Book not found.");
                return;
            }

            if (!canAccess(user, book.getUserId())) {
                sendErrorResponse(resp, HttpServletResponse.SC_FORBIDDEN, "Access denied");
                return;
            }

            // Xóa file trên Azure Blob trước
            blobUploader.deleteFile(book.getBlobName());

            // Xóa metadata trong DB
            boolean deleted = epubDAO.deleteById(bookId);

            // Xử lý Deleted
            if (deleted) {
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            } else {
                sendErrorResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database deletion failed.");
            }

        } catch (NumberFormatException e) {
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid book ID format.");
        } catch (Exception e) {
            System.err.println("Error in doDelete: " + e.getMessage());
            sendErrorResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Internal server error during deletion.");
        }
    }

    // ===== Helpers =====

    private User getAuthenticatedUser(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            header = header.substring(7);
        }
        return authService.resolveToken(header);
    }

    /** Owner of the resource, or an admin, may access it. */
    private boolean canAccess(User user, String resourceOwnerId) {
        if (user == null) return false;
        boolean isAdmin = user.getRole() != null && "admin".equalsIgnoreCase(user.getRole().getName());
        return isAdmin || (resourceOwnerId != null && resourceOwnerId.equals(user.getId()));
    }

    /**
     * [SECURITY] Strip CR/LF/quotes/path separators from a filename before embedding it
     * in a Content-Disposition header (prevents HTTP response splitting / header injection).
     */
    private static String sanitizeFileName(String name) {
        if (name == null) return "download.epub";
        String clean = name.replaceAll("[\\r\\n\"]", "")
                .replace('\\', '_')
                .replace('/', '_')
                .trim();
        return clean.isEmpty() ? "download.epub" : clean;
    }
}
