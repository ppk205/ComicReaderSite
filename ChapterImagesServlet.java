package reader.site.Comic.servlet;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.*;
import java.util.*;

@WebServlet("/Comic/api/chapter-images")
public class ChapterImagesServlet extends HttpServlet {
    private String dbUrl;
    private String dbUser;
    private String dbPass;
    private final Gson gson = new Gson();

    @Override
    public void init() throws ServletException {
        dbUrl = "jdbc:mysql://websql1.mysql.database.azure.com:3306/comic?useSSL=true";
        dbUser = "ppk123";
        dbPass = "Mysql@1234";

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new ServletException("MySQL JDBC driver not found", e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("utf-8");
        resp.setHeader("Access-Control-Allow-Origin", "*");

        String mangaIdParam = req.getParameter("mangaId");
        String chapterIdParam = req.getParameter("chapterId");

        if (mangaIdParam == null || chapterIdParam == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(Map.of("error", "mangaId and chapterId required")));
            return;
        }

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPass)) {
            // Dữ liệu trong DB: chapter_name = 'Chapter1', 'Chapter2'...
            String chapterName = "Chapter" + chapterIdParam;

            String sql = """
                SELECT image_url, image_order
                FROM ga_chapters
                WHERE manga_id = ? AND chapter_name = ?
                ORDER BY image_order ASC
            """;

            List<Map<String, Object>> images = new ArrayList<>();

            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setInt(1, Integer.parseInt(mangaIdParam));
                ps.setString(2, chapterName);

                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> img = new HashMap<>();
                        img.put("url", rs.getString("image_url"));
                        img.put("order", rs.getInt("image_order"));
                        images.add(img);
                    }
                }
            }

            resp.getWriter().write(gson.toJson(images));

        } catch (SQLException ex) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write(gson.toJson(Map.of("error", "DB error", "message", ex.getMessage())));
        } catch (NumberFormatException nf) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(Map.of("error", "Invalid mangaId")));
        }
    }
}
