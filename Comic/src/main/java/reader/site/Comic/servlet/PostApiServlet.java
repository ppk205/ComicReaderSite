package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.PostDAO;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.Post;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.TokenService;
import reader.site.Comic.util.JsonUtil;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@WebServlet(name = "PostApiServlet", urlPatterns = {"/api/posts/*"})
public class PostApiServlet extends BaseServlet {

    private PostDAO postDAO;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        postDAO = new PostDAO();
        authService = new AuthService(new UserDAO(), new RoleDAO(), new TokenService());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Long mangaId = parseLong(req.getParameter("mangaId"));
        Integer limit = parseInt(req.getParameter("limit"), 20);

        List<Post> posts = postDAO.list(mangaId, limit);
        List<PostDTO> dto = posts.stream().map(PostDTO::from).collect(Collectors.toList());
        JsonUtil.writeJson(resp, HttpServletResponse.SC_OK, dto);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // [SECURITY FIX] Vuln #7 & #9: Require authentication. authorId is taken from token.
        User user = getAuthenticatedUser(req);
        if (user == null) {
            JsonUtil.writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        CreatePostBody body = JsonUtil.readJson(req, CreatePostBody.class);
        if (body == null ||
                isBlank(body.title) ||
                isBlank(body.content)) {
            JsonUtil.writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "title, content là bắt buộc");
            return;
        }

        Post p = new Post();
        p.setTitle(body.title);
        p.setContent(body.content);
        p.setCoverImage(body.coverImage);
        // [SECURITY FIX] authorId is always taken from the validated token, not from client input
        p.setAuthorId(user.getId());
        p.setMangaId(body.mangaId);
        p.setTagsCsv(body.tagsCsv);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());

        Post created = postDAO.create(p);
        JsonUtil.writeJson(resp, HttpServletResponse.SC_CREATED, PostDTO.from(created));
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
    public static class CreatePostBody {
        public String title;
        public String content;
        public String coverImage;
        // authorId field removed from request body — set server-side from token
        public Long mangaId;
        public String tagsCsv;
    }

    public static class PostDTO {
        public Long id;
        public String title;
        public String content;
        public String coverImage;
        public String authorId;
        public Long mangaId;
        public String tagsCsv;
        public String createdAt;
        public String updatedAt;

        public static PostDTO from(Post p) {
            PostDTO d = new PostDTO();
            d.id = p.getId();
            d.title = p.getTitle();
            d.content = p.getContent();
            d.coverImage = p.getCoverImage();
            d.authorId = p.getAuthorId();
            d.mangaId = p.getMangaId();
            d.tagsCsv = p.getTagsCsv();
            d.createdAt = p.getCreatedAt() == null ? null : p.getCreatedAt().toString();
            d.updatedAt = p.getUpdatedAt() == null ? null : p.getUpdatedAt().toString();
            return d;
        }
    }
}
