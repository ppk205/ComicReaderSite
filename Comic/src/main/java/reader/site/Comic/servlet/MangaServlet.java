package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.MangaDAO;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.Manga;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.TokenService;

import java.io.IOException;
import java.util.List;
<<<<<<< HEAD

@WebServlet("/api/manga/*")
public class MangaServlet extends BaseServlet {
=======
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.MangaDAO;
import reader.site.Comic.model.Manga;


@WebServlet("/api/manga/*")
public class MangaServlet extends HttpServlet {
>>>>>>> 8056ef92f9ca6650cbc5711d7c4ba2540a5acd06
    private MangaDAO mangaDAO;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        try {
            mangaDAO = new MangaDAO();
<<<<<<< HEAD
            authService = new AuthService(new UserDAO(), new RoleDAO(), new TokenService());
=======
>>>>>>> 8056ef92f9ca6650cbc5711d7c4ba2540a5acd06
            System.out.println("MangaServlet initialized successfully (MySQL)");
        } catch (Exception e) {
            throw new ServletException("Database connection failed", e);
        }
    }

    @Override
    public void destroy() {
        System.out.println("MangaServlet destroyed (MySQL version)");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
<<<<<<< HEAD
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
=======
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        setCorsHeaders(response);

>>>>>>> 8056ef92f9ca6650cbc5711d7c4ba2540a5acd06
        String pathInfo = request.getPathInfo();
        System.out.println("GET request - PathInfo: " + pathInfo);

        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                List<Manga> mangas = mangaDAO.findAll();
<<<<<<< HEAD
                writeJson(response, mangas);
                return;
            }

            String id = pathInfo.substring(1);
            Manga manga = mangaDAO.findById(id);
            if (manga != null) {
                writeJson(response, manga);
            } else {
                writeError(response, HttpServletResponse.SC_NOT_FOUND, "Manga not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            writeError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error processing GET request");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isEditor(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }
        System.out.println("POST request received");
        try {
            Manga manga = readJson(resp, req, Manga.class);
            if (manga == null) {
                return;
            }
            Manga inserted = mangaDAO.insert(manga);
            writeJson(resp, inserted);
        } catch (Exception e) {
            System.err.println("Error in doPost: " + e.getMessage());
            e.printStackTrace();
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid manga data");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isEditor(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }
        String pathInfo = req.getPathInfo();
        System.out.println("PUT request - PathInfo: " + pathInfo);

        if (pathInfo == null || pathInfo.equals("/")) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Manga ID required for update");
            return;
        }

        try {
            String id = pathInfo.substring(1);
            Manga manga = readJson(resp, req, Manga.class);
            if (manga == null) {
                return;
            }

            boolean updated = mangaDAO.update(id, manga);
            if (updated) {
                manga.setId(id);
                writeJson(resp, manga);
            } else {
                writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Manga not found or not updated");
            }
        } catch (Exception e) {
            System.err.println("Error in doPut: " + e.getMessage());
            e.printStackTrace();
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid manga data");
=======
                sendJsonResponse(response, mangas);
                return;
            }

            String id = pathInfo.substring(1); // e.g. /3 → "3"
            Manga manga = mangaDAO.findById(id);

            if (manga != null) {
                sendJsonResponse(response, manga);
            } else {
                sendErrorResponse(response, HttpServletResponse.SC_NOT_FOUND, "Manga not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error processing GET request");
>>>>>>> 8056ef92f9ca6650cbc5711d7c4ba2540a5acd06
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isEditor(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }
        String pathInfo = req.getPathInfo();
        System.out.println("DELETE request - PathInfo: " + pathInfo);

<<<<<<< HEAD
        if (pathInfo == null || pathInfo.equals("/")) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Manga ID required for deletion");
            return;
=======

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
>>>>>>> 8056ef92f9ca6650cbc5711d7c4ba2540a5acd06
        }

        try {
            String id = pathInfo.substring(1);
            boolean deleted = mangaDAO.delete(id);
            if (deleted) {
                setCorsHeaders(resp);
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            } else {
                writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Manga not found");
            }
        } catch (Exception e) {
            System.err.println("Error in doDelete: " + e.getMessage());
            e.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    private boolean isEditor(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            header = header.substring(7);
        }
        User user = authService.resolveToken(header);
        if (user == null || user.getRole() == null) {
            return false;
        }
        String roleName = user.getRole().getName();
        return "admin".equalsIgnoreCase(roleName) || "moderator".equalsIgnoreCase(roleName);
    }
}