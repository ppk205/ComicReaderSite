package auth.api;

import auth.business.User;
import auth.data.UserDB;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@WebServlet(name = "LoginServlet", urlPatterns = {"/api/login"}, loadOnStartup = 1)
public class LoginServlet extends HttpServlet {
    private final ObjectMapper json = new ObjectMapper();

    @Override public void init() {
        System.out.println("[LoginServlet] initialized");
    }

    @Override protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        // cho preflight CORS
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");

        // request-id để lần ra log nhanh
        String rid = UUID.randomUUID().toString().substring(0, 8);
        try {
            // 1) Parse JSON an toàn
            Map<?, ?> body;
            try {
                body = json.readValue(req.getInputStream(), Map.class);
            } catch (Exception parseEx) {
                logErr(rid, "Invalid JSON body", parseEx);
                resp.setStatus(400);
                json.writeValue(resp.getWriter(), Map.of("ok", false, "message", "Body JSON không hợp lệ", "rid", rid));
                return;
            }

            String username = (body.get("username") instanceof String) ? (String) body.get("username") : null;
            String password = (body.get("password") instanceof String) ? (String) body.get("password") : null;

            if (isBlank(username) || isBlank(password)) {
                resp.setStatus(400);
                json.writeValue(resp.getWriter(), Map.of("ok", false, "message", "Missing username/password", "rid", rid));
                return;
            }
            System.out.println("[" + rid + "] login attempt: " + username + " UA=" + req.getHeader("User-Agent"));

            // 2) Tìm user trong DB
            User u;
            try {
                u = UserDB.findByUsername(username);
            } catch (Exception dbEx) {
                logErr(rid, "DB error when findByUsername", dbEx);
                resp.setStatus(500);
                json.writeValue(resp.getWriter(), Map.of("ok", false, "message", "DB error", "rid", rid));
                return;
            }

            // 3) Kiểm tra thông tin xác thực
            if (u == null) {
                resp.setStatus(401);
                json.writeValue(resp.getWriter(), Map.of("ok", false, "message", "Invalid credentials", "rid", rid));
                return;
            }

            String hash = u.getPassword();
            if (isBlank(hash) || !hash.startsWith("$2")) { // Không phải BCrypt
                logErr(rid, "Stored password is not BCrypt hash (value truncated): " + safeTrunc(hash), null);
                resp.setStatus(500);
                json.writeValue(resp.getWriter(), Map.of("ok", false, "message", "Password hash invalid", "rid", rid));
                return;
            }

            boolean ok;
            try {
                ok = BCrypt.checkpw(password, hash);
            } catch (Exception bEx) {
                logErr(rid, "BCrypt checkpw failed", bEx);
                resp.setStatus(500);
                json.writeValue(resp.getWriter(), Map.of("ok", false, "message", "Hash verification failed", "rid", rid));
                return;
            }

            if (!ok) {
                resp.setStatus(401);
                json.writeValue(resp.getWriter(), Map.of("ok", false, "message", "Invalid credentials", "rid", rid));
                return;
            }

            // 4) Tạo session
            HttpSession s = req.getSession(true);
            s.setAttribute("authUser", u.getUsername());

            json.writeValue(resp.getWriter(), Map.of(
                    "ok", true,
                    "username", u.getUsername(),
                    "userId", u.getUserId(),
                    "rid", rid
            ));
        } catch (Exception e) {
            // chặn mọi 500 mù còn sót
            logErr(rid, "Unhandled server error", e);
            resp.setStatus(500);
            json.writeValue(resp.getWriter(), Map.of("ok", false, "message", "Server error", "rid", rid));
        }
    }

    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }

    private static String safeTrunc(String s) {
        if (s == null) return "null";
        return s.length() <= 12 ? s : s.substring(0, 12) + "...";
    }

    private static void logErr(String rid, String msg, Throwable t) {
        if (t != null) {
            System.err.println("[" + rid + "] " + msg + " :: " + t.getClass().getSimpleName() + " - " + t.getMessage());
            t.printStackTrace();
        } else {
            System.err.println("[" + rid + "] " + msg);
        }
    }
}
