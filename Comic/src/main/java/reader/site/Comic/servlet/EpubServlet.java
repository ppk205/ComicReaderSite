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

/**
 * EpubServlet — handles upload/download/delete of EPUB files.
 *
 * [REFACTOR] Now uses HybridStorageService (Azure + Local fallback) instead of
 * a direct AzureBlobUploader reference. This allows the epub reader to continue
 * working locally even when Azure is unavailable.
 */
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
            // AzureBlobUploader reads credentials from AZURE_BLOB_CONNECTION_STRING env var.
            // If Azure is unavailable at runtime, HybridStorageService falls back to LocalFileStorage.
            AzureBlobUploader azure = null;
            try {
                azure = new AzureBlobUploader();
            } catch (Exception e) {
                System.err.println("[EpubServlet] Azure init failed (will use local-only mode): " + e.getMessage());
            }
            LocalFileStorage local = new LocalFileStorage();
            // If azure is null, upload always goes to local
            if (azure != null) {
                storage = new HybridStorageService(azure, local);
                System.out.println("[EpubServlet] Initialized with HybridStorageService (Azure + Local fallback).");
            } else {
                storage = new LocalOnlyStorageAdapter(local);
                System.out.println("[EpubServlet] Initialized in local-only storage mode.");
            }
        } catch (Exception e) {
            System.err.println("[EpubServlet] Init failed: " + e.getMessage());
            throw new ServletException("Initialization failed", e);
        }
    }

    private void setCorsHeaders(HttpServletResponse resp) {
        // CORS is handled by BaseServlet for endpoints that extend it.
        // EpubServlet extends HttpServlet directly for multipart support; set CORS explicitly.
        String allowedOrigin = System.getenv("ALLOWED_ORIGINS");
        if (allowedOrigin == null || allowedOrigin.isBlank()) allowedOrigin = "http://localhost:3000";
        // Use first allowed origin
        String origin = allowedOrigin.split(",")[0].trim();
        resp.setHeader("Access-Control-Allow-Origin", origin);
        resp.setHeader("Vary", "Origin");
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

    // --- GET: Serve file from storage (Azure or Local) ---
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
                Long bookId = Long.parseLong(bookIdStr);
                EpubBook book = epubDAO.findById(bookId);

                if (book == null) {
                    sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Book metadata not found");
                    return;
                }

                // storedKey: "az:<uuid>.epub" or "lc:<uuid>.epub" (or legacy bare uuid.epub)
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

    // --- POST: Upload new EPUB ---
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

            // UUID as base file name
            String baseName = UUID.randomUUID().toString().replace("-", "") + ".epub";

            // HybridStorageService decides Azure vs Local, returns storedKey with prefix
            String storedKey;
            try (InputStream in = filePart.getInputStream()) {
                storedKey = storage.upload(in, baseName, fileSize);
            }

            EpubBook newBook = new EpubBook();
            newBook.setUserId(userId);
            newBook.setTitle(title);
            newBook.setFileName(fileName);
            newBook.setFileSizeInBytes(fileSize);
            newBook.setBlobName(storedKey); // "az:uuid.epub" or "lc:uuid.epub"

            EpubBook insertedBook = epubDAO.insert(newBook);
            sendJsonResponse(resp, HttpServletResponse.SC_CREATED, insertedBook);

        } catch (Exception e) {
            System.err.println("[EpubServlet] Upload error: " + e.getMessage());
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Upload failed. Please try again.");
        }
    }

    // --- DELETE: Remove EPUB ---
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

            // Delete from the correct backend (resolved via prefix)
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

    // ─── Inner adapter for local-only mode when Azure env var is not configured ───
    private static class LocalOnlyStorageAdapter extends HybridStorageService {
        private final LocalFileStorage local;

        LocalOnlyStorageAdapter(LocalFileStorage local) {
            super(null, local);
            this.local = local;
        }

        @Override
        public String upload(InputStream in, String baseName, long fileSize) throws Exception {
            boolean ok = local.uploadFile(in, baseName, fileSize);
            if (!ok) throw new Exception("Local storage upload failed.");
            return LOCAL_PREFIX + baseName;
        }

        @Override
        public boolean exists(String storedKey) {
            return local.exists(stripPrefixStatic(storedKey));
        }

        @Override
        public long getFileSize(String storedKey) throws java.io.IOException {
            return local.getFileSize(stripPrefixStatic(storedKey));
        }

        @Override
        public void streamFile(String storedKey, java.io.OutputStream out) throws java.io.IOException {
            local.streamFile(stripPrefixStatic(storedKey), out);
        }

        @Override
        public boolean deleteFile(String storedKey) {
            return local.deleteFile(stripPrefixStatic(storedKey));
        }

        private static String stripPrefixStatic(String key) {
            if (key == null) return key;
            if (key.startsWith(AZURE_PREFIX)) return key.substring(AZURE_PREFIX.length());
            if (key.startsWith(LOCAL_PREFIX)) return key.substring(LOCAL_PREFIX.length());
            return key;
        }
    }
}