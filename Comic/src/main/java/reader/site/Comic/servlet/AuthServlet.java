package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.AuthResponse;
import reader.site.Comic.model.LoginRequest;
import reader.site.Comic.model.RegisterRequest;
import reader.site.Comic.model.User;
import reader.site.Comic.model.UserRole;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.TokenService;
import reader.site.Comic.util.EmailUtil;
import reader.site.Comic.util.RateLimiter;

import java.io.IOException;

@WebServlet(name = "AuthServlet", urlPatterns = "/api/auth/*")
public class AuthServlet extends BaseServlet {
    private AuthService authService;
    private TokenService tokenService;
    private UserDAO userDAO;
    private RoleDAO roleDAO;

    /** Login brute-force throttle: 10 attempts per 15 minutes per IP. */
    private static final int LOGIN_MAX_ATTEMPTS = 10;
    private static final long LOGIN_WINDOW_MILLIS = 15 * 60 * 1000L;

    @Override
    public void init() throws ServletException {
        this.userDAO = new UserDAO();
        this.roleDAO = new RoleDAO();
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
        } else if (path.equals("/register")) {
            handleRegister(req, resp);
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
        // [SECURITY FIX] Vuln #31: throttle login attempts per client IP.
        if (!RateLimiter.allow(RateLimiter.clientIp(req), LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MILLIS)) {
            writeError(resp, 429, "Too many login attempts. Try again later.");
            return;
        }

        LoginRequest loginRequest = readJson(resp, req, LoginRequest.class);
        if (loginRequest == null) {
            return;
        }

        String identifier = loginRequest.getEmail();
        // [SECURITY FIX] Vuln #14: never log credentials.
        if (identifier == null || identifier.isBlank() ||
                loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "email and password are required");
            return;
        }

        User user = authService.authenticate(identifier, loginRequest.getPassword());
        if (user == null) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Invalid credentials");
            return;
        }

        String token = authService.issueToken(user);
        writeJson(resp, new AuthResponse(token, user));
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RegisterRequest registerRequest = readJson(resp, req, RegisterRequest.class);
        if (registerRequest == null) {
            return;
        }

        if (registerRequest.getUsername() == null || registerRequest.getUsername().isBlank() ||
                registerRequest.getPassword() == null || registerRequest.getPassword().isBlank() ||
                registerRequest.getEmail() == null || registerRequest.getEmail().isBlank()) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "username, email and password are required");
            return;
        }

        // Check username availability
        if (userDAO.findByEmail(registerRequest.getEmail()).isPresent()) {
            writeError(resp, HttpServletResponse.SC_CONFLICT, "Email already taken");
            return;
        }

        // Build new user (UserDAO.create will hash password if you have PasswordUtil wired)
        User newUser = new User();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(registerRequest.getPassword());
        // default role: role-user
        UserRole defaultRole = roleDAO.findById("role-user");
        if (defaultRole != null) {
            newUser.setRole(defaultRole);
        }

        User created = userDAO.create(newUser);
        String activationToken = userDAO.generateActivationToken(created.getId());

        // [SECURITY FIX] Vuln #15: activation token is not logged.
        EmailUtil.sendActivationEmail(newUser.getEmail(), activationToken);

        String token = authService.issueToken(created);
        writeJson(resp, new AuthResponse(token, created));
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
        // [SECURITY FIX] Vuln #24: tokens are only accepted via the Authorization header.
        // Query-param tokens leak into URLs, server logs, and Referer headers.
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
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
