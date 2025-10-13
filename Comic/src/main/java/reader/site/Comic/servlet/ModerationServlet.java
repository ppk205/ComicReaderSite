package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.ModerationSubmission;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.ModerationService;
import reader.site.Comic.service.TokenService;

import java.io.IOException;

@WebServlet(name = "ModerationServlet", urlPatterns = "/api/moderation/*")
public class ModerationServlet extends BaseServlet {
    private ModerationService moderationService;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        this.moderationService = new ModerationService();
        this.authService = new AuthService(new UserDAO(), new RoleDAO(), new TokenService());
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAuthorised(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }

        String path = req.getPathInfo();
        if (path == null) {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            return;
        }

        switch (path) {
            case "/reports" -> writeJson(resp, moderationService.fetchReports());
            case "/approval" -> writeJson(resp, moderationService.fetchSubmissions());
            default -> writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAuthorised(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }

        String path = req.getPathInfo();
        if (path == null || !path.startsWith("/approval/")) {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            return;
        }

        String[] segments = path.split("/");
        if (segments.length < 4) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Submission id and status required");
            return;
        }

        String submissionId = segments[2];
        String status = segments[3];
        ModerationSubmission updated = moderationService.updateSubmissionStatus(submissionId, status);
        if (updated == null) {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Submission not found");
            return;
        }
        writeJson(resp, updated);
    }

    private boolean isAuthorised(HttpServletRequest req) {
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
