package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.MangaDAO;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.ActivityItem;
import reader.site.Comic.model.DashboardStats;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.DashboardService;
import reader.site.Comic.service.TokenService;

import java.io.IOException;
import java.util.List;

@WebServlet(name = "DashboardServlet", urlPatterns = "/api/dashboard/*")
public class DashboardServlet extends BaseServlet {
    private DashboardService dashboardService;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        UserDAO userDAO = new UserDAO();
        MangaDAO mangaDAO = new MangaDAO();
        RoleDAO roleDAO = new RoleDAO();
        TokenService tokenService = new TokenService();
        this.dashboardService = new DashboardService(userDAO, mangaDAO);
        this.authService = new AuthService(userDAO, roleDAO, tokenService);
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null) {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            return;
        }

        switch (path) {
            case "/stats" -> handleStats(req, resp);
            case "/activity" -> handleActivity(req, resp);
            default -> writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }

    private void handleStats(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAuthorised(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }
        DashboardStats stats = dashboardService.buildStats();
        writeJson(resp, stats);
    }

    private void handleActivity(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAuthorised(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }
        List<ActivityItem> activity = dashboardService.recentActivity();
        writeJson(resp, activity);
    }

    private boolean isAuthorised(HttpServletRequest req) {
        String token = req.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        User user = authService.resolveToken(token);
        return user != null;
    }
}
