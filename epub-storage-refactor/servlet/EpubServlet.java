package reader.site.Comic.servlet;

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
import reader.site.Comic.service.HybridStorageService;
import reader.site.Comic.service.LocalFileStorage;

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
    private HybridStorageService storage;

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
            AzureBlobUploader azure = new AzureBlobUploader();
            LocalFileStorage  local = new LocalFileStorage();
            storage = new HybridStorageService(azure, local);
            System.out.println("[EpubServlet] Initialized with HybridStorageService (Azure + Local fallback).");
        } catch (Exception e) {
            System.err.println("[EpubServlet] Init failed: " + e.getMessage());
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
        resp.getWriter().write(gson.toJson(new ErrorResponse(message)));
    }

    private static class ErrorResponse {
        private final String error;
        public ErrorResponse(String error) { this.error = error; }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    // --- GET ---
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        String pathInfo = req.getPathInfo();

        // GET /api/epub/file?id=<bookId>
        if ("/file".equals(pathInfo)) {
            String bookIdStr = req.getParameter("id");
            if (bookIdStr == null || bookIdStr.isBlank()) {
                sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Missing 'id'");
                return;
            }
            try {
                Long bookId   = Long.parseLong(bookIdStr);
                EpubBook book = epubDAO.findById(bookId);

                if (book == null) {
                    sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Book metadata not found");
                    return;
                }

                // storedKey: "az:<uuid>.epub" hoặc "lc:<uuid>.epub"
                String storedKey = book.getBlobName();

                if (!storage.exists(storedKey)) {
                    sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "File not found in storage");
                    return;
                }

                resp.setContentType("application/epub+zip");
                resp.setHeader("Content-Disposition", "attachment; filename=\"" + book.getFileName() + "\"");
                resp.setContentLengthLong(storage.getFileSize(storedKey));
                resp.setHeader("Accept-Ranges", "bytes");

                try (var out = resp.getOutputStream()) {
                    storage.streamFile(storedKey, out);
                    out.flush();
                }

            } catch (NumberFormatException e) {
                sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid book ID format.");
            }
            return;
        }

        // GET /api/epub/user/<userId>
        if (pathInfo != null && pathInfo.startsWith("/user/")) {
            String userId = pathInfo.substring("/user/".length());
            try {
                List<EpubBook> books = epubDAO.findAllByUserId(userId);
                sendJsonResponse(resp, HttpServletResponse.SC_OK, books);
            } catch (Exception e) {
                System.err.println("[EpubServlet] Error fetching books: " + e.getMessage());
                sendErrorResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error retrieving book list.");
            }
            return;
        }

        sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Invalid API endpoint.");
    }

    // --- POST: Upload ---
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        try {
            String userId   = req.getParameter("userId");
            String title    = req.getParameter("title");
            Part   filePart = req.getPart("file");

            if (userId == null || title == null || filePart == null || filePart.getSize() == 0) {
                sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST,
                        "Missing required fields (userId, title, file).");
                return;
            }

            String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
            long   fileSize = filePart.getSize();

            // UUID làm tên file cơ sở (giống bản gốc)
            String baseName = UUID.randomUUID().toString().replace("-", "") + ".epub";

            // HybridStorageService quyết định Azure hay Local, trả về storedKey có prefix
            String storedKey;
            try (InputStream in = filePart.getInputStream()) {
                storedKey = storage.upload(in, baseName, fileSize);
            }

            EpubBook newBook = new EpubBook();
            newBook.setUserId(userId);
            newBook.setTitle(title);
            newBook.setFileName(fileName);
            newBook.setFileSizeInBytes(fileSize);
            newBook.setBlobName(storedKey);  // "az:uuid.epub" hoặc "lc:uuid.epub"

            EpubBook insertedBook = epubDAO.insert(newBook);
            sendJsonResponse(resp, HttpServletResponse.SC_CREATED, insertedBook);

        } catch (Exception e) {
            System.err.println("[EpubServlet] Upload error: " + e.getMessage());
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }

    // --- DELETE ---
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        String pathInfo = req.getPathInfo();
        try {
            String idStr  = pathInfo.replaceFirst("^/", "");
            Long   bookId = Long.parseLong(idStr);

            EpubBook book = epubDAO.findById(bookId);
            if (book == null) {
                sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Book not found.");
                return;
            }

            // Xóa ở đúng backend (tự resolve qua prefix)
            storage.deleteFile(book.getBlobName());

            boolean deleted = epubDAO.deleteById(bookId);
            if (deleted) {
                setCorsHeaders(resp);
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            } else {
                sendErrorResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database deletion failed.");
            }

        } catch (NumberFormatException e) {
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid book ID format.");
        } catch (Exception e) {
            System.err.println("[EpubServlet] Delete error: " + e.getMessage());
            sendErrorResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Internal server error during deletion.");
        }
    }
}
