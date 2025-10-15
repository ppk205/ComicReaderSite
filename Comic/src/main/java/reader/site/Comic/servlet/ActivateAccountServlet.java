package reader.site.Comic.servlet;

import io.jsonwebtoken.io.IOException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import reader.site.Comic.dao.UserDAO;

@WebServlet("/api/auth/activate")
public class ActivateAccountServlet extends HttpServlet {
    private final UserDAO dao = new UserDAO();

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, java.io.IOException {
        String token = request.getParameter("token");
        boolean success = UserDAO.activateUser(token);

        response.setContentType("application/json");
        if (success) {
            response.getWriter().write("{\"message\": \"Tài khoản đã được kích hoạt!\"}");
        } else {
            response.getWriter().write("{\"error\": \"Token không hợp lệ hoặc đã hết hạn.\"}");
        }


    }
}