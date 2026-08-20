package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.CommentDAO;
import reader.site.Comic.dao.PostDAO;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.Comment;
import reader.site.Comic.model.Post;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.TokenService;
import reader.site.Comic.util.JsonUtil;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@WebServlet(name = "CommentApiServlet", urlPatterns = {"/api/comments"})
public class CommentApiServlet extends BaseServlet {

    private CommentDAO commentDAO;
    private PostDAO postDAO;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        commentDAO = new CommentDAO();
        postDAO = new PostDAO();
        authService = new AuthService(new UserDAO(), new RoleDAO(), new TokenService());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Long postId = parseLong(req.getParameter("postId"));
        if (postId == null) {
            JsonUtil.writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Thiếu postId");
            return;
        }
        Integer limit = parseInt(req.getParameter("limit"), 50);

        List<Comment> comments = commentDAO.listByPost(postId, limit);
        List<CommentDTO> dto = comments.stream().map(CommentDTO::from).collect(Collectors.toList());
        JsonUtil.writeJson(resp, HttpServletResponse.SC_OK, dto);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // [SECURITY FIX] Vuln #8 & #9: Require authentication. authorId set from token.
        User user = getAuthenticatedUser(req);
        if (user == null) {
            JsonUtil.writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        CreateCommentBody body = JsonUtil.readJson(req, CreateCommentBody.class);
        if (body == null || body.postId == null || isBlank(body.content)) {
            JsonUtil.writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "postId, content là bắt buộc");
            return;
        }

        Post post = postDAO.findById(body.postId).orElse(null);
        if (post == null) {
            JsonUtil.writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Post không tồn tại");
            return;
        }

        Comment c = new Comment();
        c.setPost(post); // phải set entity
        c.setContent(body.content);
        // [SECURITY FIX] authorId is always taken from the validated token, not from client input
        c.setAuthorId(user.getId());
        c.setCreatedAt(Instant.now());

        Comment created = commentDAO.create(c);
        JsonUtil.writeJson(resp, HttpServletResponse.SC_CREATED, CommentDTO.from(created));
    }

    // ===== Helpers =====
    private User getAuthenticatedUser(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            header = header.substring(7);
        }
        return authService.resolveToken(header);
    }

    private static boolean isBlank(String s) { return s == null || s.isBlank(); }
    private static Long parseLong(String s) { try { return s==null?null:Long.parseLong(s);} catch(Exception e){return null;} }
    private static Integer parseInt(String s, int def) { try { return s==null?def:Integer.parseInt(s);} catch(Exception e){return def;} }

    // ===== Request/Response types =====
    public static class CreateCommentBody {
        public Long postId;
        public String content;
        // authorId field removed from request body — set server-side from token
    }

    public static class CommentDTO {
        public Long id;
        public Long postId;
        public String content;
        public String authorId;
        public String createdAt; // ISO string

        public static CommentDTO from(Comment c) {
            CommentDTO d = new CommentDTO();
            d.id = c.getId();
            d.postId = (c.getPost() == null) ? null : c.getPost().getId();
            d.content = c.getContent();
            d.authorId = c.getAuthorId();
            d.createdAt = c.getCreatedAt() == null ? null : c.getCreatedAt().toString();
            return d;
        }
    }
}
