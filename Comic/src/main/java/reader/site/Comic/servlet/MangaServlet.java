package reader.site.Comic.servlet;

import java.io.IOException;
import java.util.List;

import com.google.gson.Gson;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.MangaDAO;
import reader.site.Comic.model.Manga;
import org.bson.types.ObjectId;

@WebServlet("/api/manga/*")
public class MangaServlet extends HttpServlet {
    private MongoClient client;
    private MangaDAO mangaDAO;
    private Gson gson = new Gson();

    @Override
    public void init() throws ServletException {
        try {
            mangaDAO = new MangaDAO();   // ✅ use the no-arg constructor
            System.out.println("MangaServlet initialized successfully");
        } catch (Exception e) {
            System.err.println("Failed to initialize MangaServlet: " + e.getMessage());
            throw new ServletException("Database connection failed", e);
        }
    }


    @Override
    public void destroy() {
        if (client != null) {
            client.close();
            System.out.println("MangaServlet destroyed, MongoDB connection closed");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        System.out.println("POST request received");

        try {
            Manga manga = gson.fromJson(req.getReader(), Manga.class);
            Manga inserted = mangaDAO.insert(manga);
            sendJsonResponse(resp, inserted);
        } catch (Exception e) {
            System.err.println("Error in doPost: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid manga data");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String pathInfo = req.getPathInfo();
        System.out.println("PUT request - PathInfo: " + pathInfo);

        if (pathInfo == null || pathInfo.equals("/")) {
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Manga ID required for update");
            return;
        }

        try {
            String id = pathInfo.substring(1); // Remove leading slash
            Manga manga = gson.fromJson(req.getReader(), Manga.class);

            boolean updated = mangaDAO.update(id, manga);
            if (updated) {
                manga.setId(id);
                sendJsonResponse(resp, manga);
            } else {
                sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Manga not found or not updated");
            }
        } catch (Exception e) {
            System.err.println("Error in doPut: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid manga data");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        String pathInfo = req.getPathInfo();
        System.out.println("DELETE request - PathInfo: " + pathInfo);

        if (pathInfo == null || pathInfo.equals("/")) {
            sendErrorResponse(resp, HttpServletResponse.SC_BAD_REQUEST, "Manga ID required for deletion");
            return;
        }

        try {
            String id = pathInfo.substring(1); // Remove leading slash
            boolean deleted = mangaDAO.delete(id);

            if (deleted) {
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            } else {
                sendErrorResponse(resp, HttpServletResponse.SC_NOT_FOUND, "Manga not found");
            }
        } catch (Exception e) {
            System.err.println("Error in doDelete: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        // Handle CORS preflight requests
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        setCorsHeaders(response); // ✅ Add this so CORS headers are always sent

        String pathInfo = request.getPathInfo();
        System.out.println("GET request - PathInfo: " + pathInfo);

        if (pathInfo == null || pathInfo.equals("/")) {
            List<Manga> mangas = mangaDAO.findAll();
            sendJsonResponse(response, mangas); // ✅ use helper (already sets CORS + content type)
            return;
        }

        String id = pathInfo.substring(1);
        if (ObjectId.isValid(id)) {
            Manga manga = mangaDAO.findById(id);
            if (manga != null) {
                sendJsonResponse(response, manga);
            } else {
                sendErrorResponse(response, HttpServletResponse.SC_NOT_FOUND, "Manga not found");
            }
        } else {
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid ObjectId: " + id);
        }
    }


    private void sendJsonResponse(HttpServletResponse resp, Object data) throws IOException {
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

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    // Helper class for error responses
    private static class ErrorResponse {
        private final String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }
    }
}