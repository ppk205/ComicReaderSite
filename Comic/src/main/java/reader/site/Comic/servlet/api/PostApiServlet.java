package reader.site.Comic.servlet.api;

import com.google.gson.JsonObject;
import reader.site.Comic.dao.PostDAO;
import reader.site.Comic.model.Post;
import reader.site.Comic.util.Json;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@WebServlet(name="PostApiServlet", urlPatterns={"/api/posts/*"})
public class PostApiServlet extends HttpServlet {
  private final PostDAO dao = new PostDAO();

  @Override protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setContentType("application/json; charset=UTF-8");
    try {
      String path = req.getPathInfo();     // "/{id}" hoặc null
      if (path != null && path.length() > 1) {
        long id = Long.parseLong(path.substring(1));
        Post p = dao.get(id);
        if (p == null) { resp.setStatus(404); resp.getWriter().write("{}"); return; }
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
      JsonObject err = new JsonObject(); err.addProperty("error", e.getMessage());
      resp.getWriter().write(Json.gson.toJson(err));
    }
  }

  @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setContentType("application/json; charset=UTF-8");
    try {
      req.setCharacterEncoding(StandardCharsets.UTF_8.name());
      Map body = Json.gson.fromJson(req.getReader(), Map.class);

      Post p = new Post();
      p.mangaId    = ((Double) body.get("mangaId")).intValue();
      p.title      = (String) body.get("title");
      p.content    = (String) body.get("content");
      p.coverImage = (String) body.getOrDefault("coverImage", null);
      if (body.get("tags") instanceof java.util.List<?> ts) {
        p.tags = String.join(",", ts.stream().map(Object::toString).toList());
      }
      // tạm thời không bắt buộc login
        // Nếu chưa đăng nhập thì dùng user mặc định để test
    String authorId = (String) body.get("authorId");
        if (authorId == null || authorId.isEmpty()) {
            authorId = "admin-001"; // 👈 ID user thật trong comicdb.users
        }
      p.authorId = authorId;

      System.out.println(">>> Using authorId: " + authorId);
      p = dao.create(p);
      resp.setStatus(201);
      resp.getWriter().write(Json.gson.toJson(p));
    } catch (Exception e) {
      resp.setStatus(400);
      JsonObject err = new JsonObject(); err.addProperty("error", e.getMessage());
      resp.getWriter().write(Json.gson.toJson(err));
    }
  }

  private int parseInt(String s, int d) { try { return Integer.parseInt(s); } catch (Exception e) { return d; } }
}
