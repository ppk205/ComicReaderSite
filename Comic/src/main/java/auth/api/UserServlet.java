package auth.api;

import auth.business.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import auth.data.UserDB;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.*;

@WebServlet(name = "UserServlet", urlPatterns = {"/api/users"})
public class UserServlet extends HttpServlet {
    private final ObjectMapper json = new ObjectMapper();

    @Override protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        var users = UserDB.findAll();
        resp.setContentType("application/json;charset=UTF-8");
        // can nhac: khong tra truong password trong san pham thuc te
        json.writeValue(resp.getWriter(), users);
    }

    @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        var body = json.readValue(req.getInputStream(), Map.class);
        String username = (String) body.get("username");
        String password = (String) body.get("password"); // nen hash o server
        var u = new User();
        u.setUsername(username);
        u.setPassword(password);
        UserDB.insert(u);
        resp.setStatus(201);
        resp.setContentType("application/json;charset=UTF-8");
        json.writeValue(resp.getWriter(), Map.of("ok", true));
    }

    @Override protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        var body = json.readValue(req.getInputStream(), Map.class);
        String username = (String) body.get("username");
        String password = (String) body.get("password");
        var u = UserDB.findByUsername(username);
        if (u == null) { resp.setStatus(404); return; }
        if (password != null && !password.isBlank()) u.setPassword(password);
        UserDB.update(u);
        resp.setContentType("application/json;charset=UTF-8");
        json.writeValue(resp.getWriter(), Map.of("ok", true));
    }

    @Override protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String username = req.getParameter("username");
        var u = UserDB.findByUsername(username);
        if (u == null) { resp.setStatus(404); return; }
        UserDB.delete(u);
        resp.setContentType("application/json;charset=UTF-8");
        json.writeValue(resp.getWriter(), Map.of("ok", true));
    }
}