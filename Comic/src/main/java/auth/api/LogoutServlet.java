package auth.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Map;

@WebServlet(name = "LogoutServlet", urlPatterns = {"/api/logout"})
public class LogoutServlet extends HttpServlet {
    private final ObjectMapper json = new ObjectMapper();
    @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession s = req.getSession(false);
        if (s != null) s.invalidate();
        resp.setContentType("application/json;charset=UTF-8");
        json.writeValue(resp.getWriter(), Map.of("ok", true));
    }
}