package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.SystemSettings;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.SystemSettingsService;
import reader.site.Comic.service.TokenService;

import java.io.IOException;

@WebServlet(name = "SettingsServlet", urlPatterns = "/api/settings")
public class SettingsServlet extends BaseServlet {
    private SystemSettingsService settingsService;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        this.settingsService = new SystemSettingsService();
        this.authService = new AuthService(new UserDAO(), new RoleDAO(), new TokenService());
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAdmin(req)) {
            writeError(resp, HttpServletResponse.SC_FORBIDDEN, "Administrator access required");
            return;
        }
        writeJson(resp, settingsService.getSettings());
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAdmin(req)) {
            writeError(resp, HttpServletResponse.SC_FORBIDDEN, "Administrator access required");
            return;
        }
        SystemSettings payload = readJson(resp, req, SystemSettings.class);
        if (payload == null) {
            return;
        }
        SystemSettings updated = settingsService.updateSettings(payload);
        writeJson(resp, updated);
    }

    private boolean isAdmin(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            header = header.substring(7);
        }
        User user = authService.resolveToken(header);
        return user != null && user.getRole() != null && "admin".equalsIgnoreCase(user.getRole().getName());
    }
}
