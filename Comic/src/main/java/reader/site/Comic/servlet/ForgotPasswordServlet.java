package reader.site.Comic.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import jakarta.servlet.ServletException;
import java.io.IOException;

import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.util.EmailUtil;
import reader.site.Comic.util.RateLimiter;

@WebServlet("/api/auth/forgot-password")
public class ForgotPasswordServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    /** Forgot-password throttle: 5 attempts per 15 minutes per IP. */
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 15 * 60 * 1000L;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException, ServletException {

        res.setContentType("application/json;charset=UTF-8");

        // [SECURITY FIX] Vuln #31: throttle forgot-password attempts per client IP.
        if (!RateLimiter.allow(RateLimiter.clientIp(req), MAX_ATTEMPTS, WINDOW_MILLIS)) {
            res.setStatus(429);
            res.getWriter().write("{\"error\": \"Too many requests. Try again later.\"}");
            return;
        }

        String email = req.getParameter("email");
        if (email == null || email.isBlank()) {
            res.getWriter().write("{\"error\": \"Email không được để trống.\"}");
            return;
        }

        // ✅ Tạo token reset qua DAO
        String token = userDAO.generateResetToken(email);

        if (token != null) {
            // ✅ Gửi email reset password
            EmailUtil.sendResetPasswordEmail(email, token);
        }

        // [SECURITY FIX] Vuln #13: always return the same response so callers cannot
        // enumerate which emails are registered.
        res.getWriter().write("{\"message\": \"Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email đặt lại mật khẩu.\"}");
    }
}
