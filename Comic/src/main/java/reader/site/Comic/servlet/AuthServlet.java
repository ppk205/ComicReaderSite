package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.AuthResponse;
import reader.site.Comic.model.LoginRequest;
import reader.site.Comic.model.User;
import reader.site.Comic.model.UserRole;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.TokenService;

import java.io.IOException;

@WebServlet(name = "AuthServlet", urlPatterns = "/api/auth/*")
public class AuthServlet extends BaseServlet {
    private AuthService authService;
    private TokenService tokenService;
    private UserDAO userDAO;

    @Override
    public void init() throws ServletException {
        this.userDAO = new UserDAO();
        RoleDAO roleDAO = new RoleDAO();
        this.tokenService = new TokenService();
        this.authService = new AuthService(userDAO, roleDAO, tokenService);
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null || path.equals("/login")) {
            handleLogin(req, resp);
        } else if (path.equals("/logout")) {
            handleLogout(req, resp);
        } else {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null || path.equals("/me")) {
            handleCurrentUser(req, resp);
        } else {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        LoginRequest loginRequest = readJson(resp, req, LoginRequest.class);
        if (loginRequest == null) {
            return;
        }
        User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        if (user == null) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Invalid credentials");
            return;
        }

        String token = authService.issueToken(user);
        writeJson(resp, new AuthResponse(token, user));
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String token = extractToken(req);
        if (token != null) {
            authService.invalidateToken(token);
        }
    writeJson(resp, new MessageResponse("Logged out"));
    }

    private void handleCurrentUser(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String token = extractToken(req);
        if (token == null) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Missing token");
            return;
        }

        User user = authService.resolveToken(token);
        if (user == null) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return;
        }

        writeJson(resp, user);
    }

    private String extractToken(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return header != null ? header : req.getParameter("token");
    }

    private static class MessageResponse {
        private final String message;

        private MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}
