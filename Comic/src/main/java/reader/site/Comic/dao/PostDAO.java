package reader.site.Comic.dao;

import reader.site.Comic.model.Post;
import reader.site.Comic.util.Db;

import java.sql.*;
import java.util.*;

public class PostDAO {

    // Chuyển từ ResultSet sang đối tượng Post
    private Post from(ResultSet rs) throws SQLException {
        Post p = new Post();
        p.id = rs.getLong("id");
        p.authorId = rs.getString("author_id");
        p.mangaId = rs.getInt("manga_id");
        p.title = rs.getString("title");
        p.content = rs.getString("content");
        p.coverImage = rs.getString("cover_image");
        p.tags = rs.getString("tags");
        p.createdAt = rs.getTimestamp("created_at");
        p.updatedAt = rs.getTimestamp("updated_at");
        return p;
    }

    // Lấy danh sách bài viết (có hoặc không theo manga_id)
    public List<Post> list(Integer mangaId, int page, int size) throws Exception {
        String sql = "SELECT * FROM posts ";
        if (mangaId != null && mangaId > 0) {
            sql += "WHERE manga_id=? ";
        }
        sql += "ORDER BY created_at DESC LIMIT ? OFFSET ?";

        try (Connection c = Db.get();
             PreparedStatement st = c.prepareStatement(sql)) {
            int i = 1;
            if (mangaId != null && mangaId > 0) st.setInt(i++, mangaId);
            st.setInt(i++, size);
            st.setInt(i, (page - 1) * size);

            try (ResultSet rs = st.executeQuery()) {
                List<Post> list = new ArrayList<>();
                while (rs.next()) list.add(from(rs));
                return list;
            }
        }
    }

    // Lấy chi tiết bài viết
    public Post get(long id) throws Exception {
        try (Connection c = Db.get();
             PreparedStatement st = c.prepareStatement("SELECT * FROM posts WHERE id=?")) {
            st.setLong(1, id);
            try (ResultSet rs = st.executeQuery()) {
                return rs.next() ? from(rs) : null;
            }
        }
    }

    // Tạo mới bài viết
    public Post create(Post p) throws Exception {
        String sql = "INSERT INTO posts(author_id,manga_id,title,content,cover_image,tags) VALUES (?,?,?,?,?,?)";
        try (Connection c = Db.get();
             PreparedStatement st = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            // Gán mặc định admin45 nếu chưa đăng nhập
            if (p.authorId == null || p.authorId.isEmpty()) {
                // ID của admin45 trong bảng users
                p.authorId = "0d948da8-f366-4da9-8113-48a2cf182046";
            }

            st.setString(1, p.authorId);
            st.setInt(2, p.mangaId);
            st.setString(3, p.title);
            st.setString(4, p.content);
            st.setString(5, p.coverImage);
            st.setString(6, p.tags);
            st.executeUpdate();

            try (ResultSet keys = st.getGeneratedKeys()) {
                if (keys.next()) p.id = keys.getLong(1);
            }

            return get(p.id);
        }
    }
}
