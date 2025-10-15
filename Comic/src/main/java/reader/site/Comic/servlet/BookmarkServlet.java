package reader.site.Comic.servlet;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.BookmarkDAO;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.Bookmark;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.TokenService;

@WebServlet("/api/bookmarks/*")
public class BookmarkServlet extends BaseServlet {
    private BookmarkDAO bookmarkDAO;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        bookmarkDAO = new BookmarkDAO();
        authService = new AuthService(new UserDAO(), new RoleDAO(), new TokenService());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // Development helper: if caller provides ?devUser=<userId>, return that user's bookmarks
        String devUser = req.getParameter("devUser");
        if (devUser != null && !devUser.isBlank()) {
            try {
                List<Bookmark> bookmarks = bookmarkDAO.findByUserId(devUser);
                writeJson(resp, bookmarks);
            } catch (Exception ex) {
                ex.printStackTrace();
                String detail = ex.toString();
                StackTraceElement[] stack = ex.getStackTrace();
                if (stack != null && stack.length > 0) {
                    detail += " at " + stack[0].toString();
                }
                writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error fetching bookmarks: " + detail);
            }
            return;
        }

        User user = getAuthenticatedUser(req);
        if (user == null) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        try {
            List<Bookmark> bookmarks = bookmarkDAO.findByUserId(user.getId());
            writeJson(resp, bookmarks);
        } catch (Exception ex) {
            ex.printStackTrace();
            // Development-time: include exception detail to help debugging
            String detail = ex.toString();
            StackTraceElement[] stack = ex.getStackTrace();
            if (stack != null && stack.length > 0) {
                detail += " at " + stack[0].toString();
            }
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error fetching bookmarks: " + detail);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // Accept Bookmarks payload and persist for authenticated user
        User user = getAuthenticatedUser(req);
        if (user == null) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        Bookmark payload = readJson(resp, req, Bookmark.class);
        if (payload == null) return;

        try {
            String userId = user.getId();
            Long mangaId = payload.getMangaId() != null ? Long.parseLong(payload.getMangaId()) : null;
            Bookmark saved = bookmarkDAO.saveOrUpdate(
                    userId,
                    mangaId,
                    payload.getTitle(),
                    payload.getCover(),
                    payload.getCurrentChapter(),
                    payload.getTotalChapters(),
                    payload.getReadingProgress()
            );

            writeJson(resp, saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            String detail = ex.toString();
            StackTraceElement[] stack = ex.getStackTrace();
            if (stack != null && stack.length > 0) {
                detail += " at " + stack[0].toString();
            }
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error saving bookmark: " + detail);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Bookmark id required");
            return;
        }

        try {
            String idStr = pathInfo.substring(1);
            boolean deleted = bookmarkDAO.delete(Long.parseLong(idStr));
            if (deleted) {
                setCorsHeaders(resp);
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            } else {
                writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Bookmark not found");
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error deleting bookmark");
        }
    }

    private User getAuthenticatedUser(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            header = header.substring(7);
        }
        return authService.resolveToken(header);
    }
}