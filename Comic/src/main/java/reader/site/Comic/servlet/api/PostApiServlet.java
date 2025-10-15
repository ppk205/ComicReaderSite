package reader.site.Comic.servlet.api;

import com.google.gson.JsonObject;
import reader.site.Comic.dao.PostDAO;
import reader.site.Comic.model.Post;
import reader.site.Comic.model.User;
import reader.site.Comic.util.Json;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@WebServlet(name = "PostApiServlet", urlPatterns = {"/api/posts/*"})
public class PostApiServlet extends HttpServlet {
    private final PostDAO dao = new PostDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json; charset=UTF-8");
        try {
            String path = req.getPathInfo(); // "/{id}" hoặc null

            if (path != null && path.length() > 1) {
                long id = Long.parseLong(path.substring(1));
                Post p = dao.get(id);
                if (p == null) {
                    resp.setStatus(404);
                    resp.getWriter().write("{}");
                    return;
                }
                resp.getWriter().write(Json.gson.toJson(p));
                return;
            }

            Integer mangaId = req.getParameter("mangaId") == null ? null : Integer.parseInt(req.getParameter("mangaId"));
            int page = parseInt(req.getParameter("page"), 1);
            int size = parseInt(req.getParameter("size"), 20);
            List<Post> list = dao.list(mangaId, page, size);
            resp.getWriter().write(Json.gson.toJson(list));

        } catch (Exception e) {
            resp.setStatus(500);
            JsonObject err = new JsonObject();
            err.addProperty("error", e.getMessage());
            resp.getWriter().write(Json.gson.toJson(err));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json; charset=UTF-8");
        try {
            req.setCharacterEncoding(StandardCharsets.UTF_8.name());

            // Lấy user đăng nhập từ session
            HttpSession session = req.getSession(false);
            if (session == null) {
                resp.setStatus(401);
                resp.getWriter().write("{\"error\":\"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.\"}");
                return;
            }

            Object userObj = session.getAttribute("user");
            if (userObj == null || !(userObj instanceof User user)) {
                resp.setStatus(401);
                resp.getWriter().write("{\"error\":\"Bạn chưa đăng nhập.\"}");
                return;
            }

            // Lấy dữ liệu bài viết
            Map body = Json.gson.fromJson(req.getReader(), Map.class);
            if (body == null) {
                resp.setStatus(400);
                resp.getWriter().write("{\"error\":\"Dữ liệu không hợp lệ.\"}");
                return;
            }

            Post p = new Post();
            p.mangaId = body.get("mangaId") == null ? 0 : ((Double) body.get("mangaId")).intValue();
            p.title = (String) body.getOrDefault("title", "");
            p.content = (String) body.getOrDefault("content", "");
            p.coverImage = (String) body.getOrDefault("coverImage", null);

            if (body.get("tags") instanceof List<?> ts) {
                p.tags = String.join(",", ts.stream().map(Object::toString).toList());
            }

            // Gán ID người đăng nhập
            p.authorId = user.getId();
            System.out.println("🟢 Bài viết mới của user: " + user.getId() + " (" + user.getEmail() + ")");

            // Tạo bài viết
            Post created = dao.create(p);

            resp.setStatus(201);
            resp.getWriter().write(Json.gson.toJson(created));

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(400);
            JsonObject err = new JsonObject();
            err.addProperty("error", e.getMessage());
            resp.getWriter().write(Json.gson.toJson(err));
        }
    }

    private int parseInt(String s, int d) {
        try {
            return Integer.parseInt(s);
        } catch (Exception e) {
            return d;
        }
    }
}
