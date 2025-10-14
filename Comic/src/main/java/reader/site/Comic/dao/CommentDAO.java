package reader.site.Comic.dao;

import reader.site.Comic.model.Comment;
import reader.site.Comic.util.Db;

import java.sql.*;
import java.util.*;

public class CommentDAO {

  private Comment from(ResultSet rs) throws SQLException {
    Comment c = new Comment();
    c.id = rs.getLong("id");
    c.postId = rs.getLong("post_id");
    c.authorId = rs.getString("author_id");
    c.content = rs.getString("content");
    c.createdAt = rs.getTimestamp("created_at");
    return c;
  }

  public List<Comment> list(long postId) throws Exception {
    try (Connection c = Db.get();
         PreparedStatement st = c.prepareStatement(
             "SELECT * FROM comments WHERE post_id=? ORDER BY created_at ASC")) {
      st.setLong(1, postId);
      try (ResultSet rs = st.executeQuery()) {
        List<Comment> list = new ArrayList<>();
        while (rs.next()) list.add(from(rs));
        return list;
      }
    }
  }

  public Comment get(long id) throws Exception {
    try (Connection c = Db.get();
         PreparedStatement st = c.prepareStatement("SELECT * FROM comments WHERE id=?")) {
      st.setLong(1, id);
      try (ResultSet rs = st.executeQuery()) {
        return rs.next() ? from(rs) : null;
      }
    }
  }

  public Comment create(Comment cm) throws Exception {
    try (Connection c = Db.get();
         PreparedStatement st = c.prepareStatement(
           "INSERT INTO comments(post_id,author_id,content) VALUES (?,?,?)",
           Statement.RETURN_GENERATED_KEYS)) {
      st.setLong(1, cm.postId);
      st.setString(2, cm.authorId);
      st.setString(3, cm.content);
      st.executeUpdate();
      try (ResultSet keys = st.getGeneratedKeys()) {
        if (keys.next()) cm.id = keys.getLong(1);
      }
      return get(cm.id);
    }
  }
}
