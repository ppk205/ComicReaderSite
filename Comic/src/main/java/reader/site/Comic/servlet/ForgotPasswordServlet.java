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

        // ✅ Tạo token reset qua DAO (không tiết lộ email có tồn tại hay không)
        String token = userDAO.generateResetToken(email);

        if (token != null) {
            // ✅ Gửi email reset password
            EmailUtil.sendResetPasswordEmail(email, token);
        }
        // Luôn trả về cùng một message để tránh user enumeration
        res.getWriter().write("{\"message\": \"Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email đặt lại mật khẩu.\"}");
    }
}
