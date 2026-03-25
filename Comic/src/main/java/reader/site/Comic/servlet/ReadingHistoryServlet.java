package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.ReadingHistoryDAO;
import reader.site.Comic.model.ReadingHistory;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.service.TokenService;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/reading-history/*")
public class ReadingHistoryServlet extends BaseServlet {
    private ReadingHistoryDAO historyDAO;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        historyDAO = new ReadingHistoryDAO();
        authService = new AuthService(new UserDAO(), new RoleDAO(), new TokenService());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String userId = req.getParameter("userId");
        
        if (userId == null || userId.isEmpty()) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "userId parameter required");
            return;
        }

        try {
            List<ReadingHistory> history = historyDAO.findByUserId(Long.parseLong(userId));
            writeJson(resp, history);
        } catch (Exception e) {
            e.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error fetching reading history");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        ReadingProgressRequest request = readJson(resp, req, ReadingProgressRequest.class);
        if (request == null) {
            return;
        }

        if (request.getMangaId() == null || request.getChapterId() == null) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "mangaId and chapterId are required");
            return;
        }

        try {
            Long userId = Long.parseLong(user.getId());
            Long mangaId = Long.parseLong(request.getMangaId());
            
            ReadingHistory saved = historyDAO.save(
                userId,
                mangaId,
                request.getChapterId(),
                request.getCurrentPage() != null ? request.getCurrentPage() : 0,
                request.getCompleted() != null ? request.getCompleted() : false
            );
            
            writeJson(resp, saved);
        } catch (Exception e) {
            e.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error saving reading progress");
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
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "History ID required");
            return;
        }

        try {
            String historyId = pathInfo.substring(1);
            boolean deleted = historyDAO.delete(Long.parseLong(historyId));
            
            if (deleted) {
                setCorsHeaders(resp);
                resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            } else {
                writeError(resp, HttpServletResponse.SC_NOT_FOUND, "History not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error deleting history");
        }
    }

    private User getAuthenticatedUser(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            header = header.substring(7);
        }
        return authService.resolveToken(header);
    }

    private static class ReadingProgressRequest {
        private String mangaId;
        private String chapterId;
        private Integer currentPage;
        private Boolean completed;

        public String getMangaId() { return mangaId; }
        public void setMangaId(String mangaId) { this.mangaId = mangaId; }
        
        public String getChapterId() { return chapterId; }
        public void setChapterId(String chapterId) { this.chapterId = chapterId; }
        
        public Integer getCurrentPage() { return currentPage; }
        public void setCurrentPage(Integer currentPage) { this.currentPage = currentPage; }
        
        public Boolean getCompleted() { return completed; }
        public void setCompleted(Boolean completed) { this.completed = completed; }
    }
}
