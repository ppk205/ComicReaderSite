package reader.site.Comic.servlet;

import com.azure.storage.blob.BlobClient;
import com.google.gson.*;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import reader.site.Comic.dao.EpubBookDAO;
import reader.site.Comic.model.EpubBook;
import reader.site.Comic.service.AzureBlobUploader;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@WebServlet("/api/epub/*")
@MultipartConfig(fileSizeThreshold = 1024 * 1024 * 10)
public class EpubServlet extends HttpServlet {
    private EpubBookDAO epubDAO;
    private AzureBlobUploader blobUploader;

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
            System.out.println("EpubServlet initialized successfully with Azure Blob.");
        } catch (Exception e) {
            System.err.println("Failed to initialize EpubServlet/Database/Azure: " + e.getMessage());
            throw new ServletException("Initialization failed", e);
        }
    }

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    // --- GET: Phục vụ file từ Azure Blob ---
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        String pathInfo = req.getPathInfo();

        if ("/file".equals(pathInfo)) {
            // Lấy ID sách thay vì fileName
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

                // Lấy BlobClient từ tên blob đã lưu
                BlobClient blobClient = blobUploader.getBlobClient(book.getBlobName());

                if (!blobClient.exists()) {
                    sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "File not found on Azure Blob");
                    return;
                }

                // Thiết lập header và stream từ Azure
                resp.setContentType("application/epub+zip");
                resp.setHeader("Content-Disposition", "attachment; filename=\"" + book.getFileName() + "\"");
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
            String userId = pathInfo.substring("/user/".length());
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

        try {
            String userId = req.getParameter("userId");
            String title = req.getParameter("title");
            Part filePart = req.getPart("file");

            // ... (Kiểm tra null giữ nguyên)
            if (userId == null || title == null || filePart == null || filePart.getSize() == 0) {
                sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Missing required fields (userId, title, file).");
                return;
            }

            String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
            long fileSize = filePart.getSize();

            // 1. Tạo tên Blob duy nhất (UUID)
            String blobName = UUID.randomUUID().toString().replace("-", "") + ".epub";
            System.out.println("DEBUG: Blob Name = " + blobName + ", Length = " + blobName.length());
            // 2. Upload file lên Azure Blob Storage
            try (InputStream fileContent = filePart.getInputStream()) {
                if (!blobUploader.uploadFile(fileContent, blobName, fileSize)) {
                    throw new Exception("Failed to upload file to Azure.");
                }
            }

            // 3. Tạo đối tượng EpubBook và lưu vào DB
            EpubBook newBook = new EpubBook();
            newBook.setUserId(userId);
            newBook.setTitle(title);
            newBook.setFileName(fileName);
            newBook.setFileSizeInBytes(fileSize);
            newBook.setBlobName(blobName); // Lưu tên blob thay vì storagePath

            EpubBook insertedBook = epubDAO.insert(newBook);

            sendJsonResponse(resp, HttpServletResponse.SC_CREATED, insertedBook);

        } catch (Exception e) {
            System.err.println("Error in doPost (Upload): " + e.getMessage());
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }

    // --- DELETE: Xóa sách khỏi DB và Azure ---
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        String pathInfo = req.getPathInfo();

        // ... (Kiểm tra idStr, Long.parseLong giữ nguyên)

        try {
            String idStr = pathInfo.replaceFirst("^/", "");
            Long bookId = Long.parseLong(idStr);

            EpubBook book = epubDAO.findById(bookId);
            if (book == null) {
                sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Book not found.");
                return;
            }

            // Xóa file trên Azure Blob trước
            blobUploader.deleteFile(book.getBlobName());

            // Xóa metadata trong DB
            boolean deleted = epubDAO.deleteById(bookId); // Cần tinh chỉnh DAO

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
}