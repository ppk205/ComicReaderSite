package reader.site.Comic.servlet.api;

import com.google.gson.JsonObject;
import reader.site.Comic.dao.CommentDAO;
import reader.site.Comic.model.Comment;
import reader.site.Comic.util.Json;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@WebServlet(name="CommentApiServlet", urlPatterns={"/api/comments/*"})
public class CommentApiServlet extends HttpServlet {
  private final CommentDAO dao = new CommentDAO();

  private void writeErr(HttpServletResponse resp, int code, String msg) throws IOException {
    resp.setStatus(code);
    JsonObject err = new JsonObject(); err.addProperty("error", msg);
    resp.getWriter().write(Json.gson.toJson(err));
  }

  @Override protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setContentType("application/json; charset=UTF-8");
    try {
      String path = req.getPathInfo(); // "/{id}" hoặc "/post/{postId}" hoặc null
      if (path != null && path.length() > 1) {
        String[] seg = path.substring(1).split("/");
        if (seg.length == 1) {
          long id = Long.parseLong(seg[0]);
          Comment c = dao.get(id);
          if (c == null) { writeErr(resp, 404, "Not found"); return; }
          resp.getWriter().write(Json.gson.toJson(c));
          return;
        } else if (seg.length == 2 && "post".equals(seg[0])) {
          long postId = Long.parseLong(seg[1]);
          List<Comment> list = dao.list(postId);
          resp.getWriter().write(Json.gson.toJson(list));
          return;
        } else {
          writeErr(resp, 400, "Invalid path");
          return;
        }
      }

      // Fallback: /api/comments?postId=...
      String q = req.getParameter("postId");
      if (q == null) { writeErr(resp, 400, "postId is required"); return; }
      long postId = Long.parseLong(q);
      List<Comment> list = dao.list(postId);
      resp.getWriter().write(Json.gson.toJson(list));
    } catch (Exception e) {
      writeErr(resp, 400, e.getMessage());
    }
  }

  @Override protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setContentType("application/json; charset=UTF-8");
    try {
      req.setCharacterEncoding(StandardCharsets.UTF_8.name());
      Map body = Json.gson.fromJson(req.getReader(), Map.class);
      if (body == null) { writeErr(resp, 400, "Invalid JSON"); return; }

      Comment c = new Comment();
      c.postId   = ((Double) body.get("postId")).longValue();
      c.content  = (String) body.get("content");
      c.authorId = (String) body.getOrDefault("authorId", "guest-1");

      c = dao.create(c);
      resp.setStatus(201);
      resp.getWriter().write(Json.gson.toJson(c));
    } catch (Exception e) {
      writeErr(resp, 400, e.getMessage());
    }
  }
}
