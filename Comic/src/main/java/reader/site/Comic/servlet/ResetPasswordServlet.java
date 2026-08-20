package reader.site.Comic.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.util.RateLimiter;

import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/api/auth/reset-password")
public class ResetPasswordServlet extends HttpServlet {

    /** Reset throttle: 5 attempts per 15 minutes per IP. */
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 15 * 60 * 1000L;

    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");

        // [SECURITY FIX] Vuln #31: throttle reset attempts per client IP.
        if (!RateLimiter.allow(RateLimiter.clientIp(req), MAX_ATTEMPTS, WINDOW_MILLIS)) {
            res.setStatus(429);
            res.getWriter().write("{\"error\": \"Too many requests. Try again later.\"}");
            return;
        }

        // Đọc JSON body
        BufferedReader reader = req.getReader();
        StringBuilder jsonBuilder = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            jsonBuilder.append(line);
        }
        String json = jsonBuilder.toString();

        String token;
        String newPassword;
        try {
            // Parse JSON
            com.google.gson.JsonObject jsonObj = com.google.gson.JsonParser.parseString(json).getAsJsonObject();
            token = jsonObj.has("token") ? jsonObj.get("token").getAsString() : null;
            newPassword = jsonObj.has("password") ? jsonObj.get("password").getAsString() : null;
        } catch (Exception e) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            res.getWriter().write("{\"error\": \"Invalid JSON payload\"}");
            return;
        }

        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            res.getWriter().write("{\"error\": \"token and password are required\"}");
            return;
        }

        // [SECURITY FIX] Vuln #15: reset token and new password are never logged.
        boolean success = UserDAO.resetPassword(token, newPassword);

        if (success) {
            res.getWriter().write("{\"message\": \"Mật khẩu đã được đặt lại.\"}");
        } else {
            res.getWriter().write("{\"error\": \"Token không hợp lệ hoặc đã hết hạn.\"}");
        }
    }
}
