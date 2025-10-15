package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.User;
import reader.site.Comic.model.UserRole;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.TokenService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet(name = "UserServlet", urlPatterns = "/api/users/*")
public class UserServlet extends BaseServlet {
    private UserDAO userDAO;
    private RoleDAO roleDAO;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        this.userDAO = new UserDAO();
        this.roleDAO = new RoleDAO();
        this.authService = new AuthService(userDAO, roleDAO, new TokenService());
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAuthorized(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }

        String path = req.getPathInfo();
        if (path == null || path.equals("/")) {
            handleList(req, resp);
        } else {
            handleDetail(resp, path.substring(1));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAuthorized(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }

        UserRequest payload = readJson(resp, req, UserRequest.class);
        if (payload == null) {
            return;
        }

        UserRole role = resolveRole(payload);
        if (role == null) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid role id");
            return;
        }
        User newUser = new User();
        newUser.setUsername(payload.username);
        newUser.setEmail(payload.email);
        newUser.setPassword(payload.password);
        newUser.setRole(role);
        newUser.setStatus(payload.status != null ? payload.status : "active");

        User created = userDAO.create(newUser);
        writeJson(resp, created);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAuthorized(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }

        String path = req.getPathInfo();
        if (path == null || path.equals("/")) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "User id required");
            return;
        }
        UserRequest updates = readJson(resp, req, UserRequest.class);
        if (updates == null) {
            return;
        }

        UserRole role = resolveRole(updates);
        User userUpdates = new User();
        userUpdates.setUsername(updates.username);
        userUpdates.setEmail(updates.email);
        userUpdates.setStatus(updates.status);
        userUpdates.setPassword(updates.password);
        if (role != null) {
            userUpdates.setRole(role);
        }

        User updated = userDAO.update(path.substring(1), userUpdates);
        if (updated == null) {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "User not found");
            return;
        }

        writeJson(resp, updated);
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isAuthorized(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }

        String path = req.getPathInfo();
        if (path == null || path.equals("/")) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "User id required");
            return;
        }

        boolean deleted = userDAO.delete(path.substring(1));
        if (!deleted) {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "User not found");
            return;
        }
        writeJson(resp, new MessageResponse("User deleted"));
    }

    private void handleList(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int page = parseInt(req.getParameter("page"), 1);
        int limit = parseInt(req.getParameter("limit"), 10);
        String search = req.getParameter("search");
        String roleName = req.getParameter("role");
        String status = req.getParameter("status");

        List<User> users = userDAO.findAll(page, limit, search, roleName, status);
        int total = userDAO.count(search, roleName, status);

        Map<String, Object> response = new HashMap<>();
        response.put("items", users);
        response.put("total", total);
        response.put("page", page);
        response.put("limit", limit);
        writeJson(resp, response);
    }

    private void handleDetail(HttpServletResponse resp, String id) throws IOException {
        User user = userDAO.findById(id).orElse(null);
        if (user == null) {
            writeError(resp, HttpServletResponse.SC_NOT_FOUND, "User not found");
            return;
        }
        writeJson(resp, user);
    }

    private boolean isAuthorized(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            header = header.substring(7);
        }
        User user = authService.resolveToken(header);
        return user != null && user.getRole() != null && "admin".equalsIgnoreCase(user.getRole().getName());
    }

    private int parseInt(String value, int defaultValue) {
        try {
            return value != null ? Integer.parseInt(value) : defaultValue;
        } catch (NumberFormatException ex) {
            return defaultValue;
        }
    }

    private UserRole resolveRole(UserRequest payload) {
        if (payload == null) {
            return null;
        }
        if (payload.roleId != null && !payload.roleId.isBlank()) {
            UserRole byId = roleDAO.findById(payload.roleId);
            if (byId != null) {
                return byId;
            }
            return roleDAO.findByName(payload.roleId);
        }
        if (payload.roleName != null && !payload.roleName.isBlank()) {
            return roleDAO.findByName(payload.roleName);
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

    private static class UserRequest {
        String username;
        String email;
        String password;
        String roleId;
        String roleName;
        String status;
    }
}
