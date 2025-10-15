package reader.site.Comic.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import jakarta.servlet.ServletException;
import java.io.IOException;

import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.util.EmailUtil;

@WebServlet("/api/auth/forgot-password")
public class ForgotPasswordServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException, ServletException {

        res.setContentType("application/json;charset=UTF-8");

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
            res.getWriter().write("{\"message\": \"Email đặt lại mật khẩu đã được gửi.\"}");
        } else {
            res.getWriter().write("{\"error\": \"Email không tồn tại trong hệ thống.\"}");
        }
    }
}
