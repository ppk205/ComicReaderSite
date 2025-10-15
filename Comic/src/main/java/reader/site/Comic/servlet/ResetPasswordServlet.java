package reader.site.Comic.servlet;

import io.jsonwebtoken.io.IOException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import reader.site.Comic.dao.UserDAO;

import java.io.BufferedReader;

@WebServlet("/api/auth/reset-password")
public class ResetPasswordServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException, java.io.IOException {
        // Đọc JSON body
        BufferedReader reader = req.getReader();
        StringBuilder jsonBuilder = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            jsonBuilder.append(line);
        }
        String json = jsonBuilder.toString();

        // Parse JSON
        com.google.gson.JsonObject jsonObj = new com.google.gson.JsonParser().parse(json).getAsJsonObject();

        String token = jsonObj.get("token").getAsString();
        String newPassword = jsonObj.get("password").getAsString();

        System.out.println("token after update: " + token);
        System.out.println("newPassword after update: " + newPassword);

        boolean success = UserDAO.resetPassword(token, newPassword);

        res.setContentType("application/json");
        if (success)
            res.getWriter().write("{\"message\": \"Mật khẩu đã được đặt lại.\"}");
        else
            res.getWriter().write("{\"error\": \"Token không hợp lệ hoặc đã hết hạn.\"}");
    }
}
