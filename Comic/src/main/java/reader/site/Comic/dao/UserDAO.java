package reader.site.Comic.dao;

import reader.site.Comic.model.User;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class UserDAO {
    private static final String JDBC_URL =
            "jdbc:mysql://web-welpweb.l.aivencloud.com:26170/defaultdb?useSSL=true&requireSSL=true&serverTimezone=UTC";
    private static final String JDBC_USER = "avnadmin";
    private static final String JDBC_PASSWORD = "AVNS_WRR4qdO4pISviLaP54c";

    private static final Gson gson = new Gson();

    public UserDAO() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC Driver not found", e);
        }
    }

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
    }

    // CREATE
    public User insert(User user) {
        String sql = "INSERT INTO users (username, email, password, avatar_url, role, series_count, followers_count, " +
                     "bio, preferences, display_name, birth_date, viewer_count, manga_likes, author_likes, social_links, quick_note) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPassword());
            stmt.setString(4, user.getAvatarUrl());
            stmt.setString(5, user.getRole());
            stmt.setInt(6, user.getSeriesCount());
            stmt.setInt(7, user.getFollowersCount());
            stmt.setString(8, user.getBio());
            stmt.setString(9, user.getPreferences());
            stmt.setString(10, user.getDisplayName());
            stmt.setString(11, user.getBirthDate());
            stmt.setInt(12, user.getViewerCount());
            stmt.setString(13, user.getMangaLikes() != null ? gson.toJson(user.getMangaLikes()) : null);
            stmt.setString(14, user.getAuthorLikes() != null ? gson.toJson(user.getAuthorLikes()) : null);
            stmt.setString(15, user.getSocialLinks() != null ? gson.toJson(user.getSocialLinks()) : null);
            stmt.setString(16, user.getQuickNote() != null ? gson.toJson(user.getQuickNote()) : null);

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating user failed, no rows affected.");
            }

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    user.setId(String.valueOf(generatedKeys.getInt(1)));
                }
            }
            return user;
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting user", e);
        }
    }

    // READ by ID
    public User findById(String id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, Integer.parseInt(id));
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error finding user by ID", e);
        }
    }

    // READ by username
    public User findByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error finding user by username", e);
        }
    }

    // READ by email
    public User findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error finding user by email", e);
        }
    }

    // READ ALL
    public List<User> findAll() {
        String sql = "SELECT * FROM users ORDER BY created_at DESC";
        List<User> users = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error finding all users", e);
        }
        return users;
    }

    // UPDATE
    public User update(User user) {
        String sql = "UPDATE users SET username = ?, email = ?, password = ?, avatar_url = ?, role = ?, " +
                     "series_count = ?, followers_count = ?, bio = ?, preferences = ?, display_name = ?, " +
                     "birth_date = ?, viewer_count = ?, manga_likes = ?, author_likes = ?, social_links = ?, " +
                     "quick_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPassword());
            stmt.setString(4, user.getAvatarUrl());
            stmt.setString(5, user.getRole());
            stmt.setInt(6, user.getSeriesCount());
            stmt.setInt(7, user.getFollowersCount());
            stmt.setString(8, user.getBio());
            stmt.setString(9, user.getPreferences());
            stmt.setString(10, user.getDisplayName());
            stmt.setString(11, user.getBirthDate());
            stmt.setInt(12, user.getViewerCount());
            stmt.setString(13, user.getMangaLikes() != null ? gson.toJson(user.getMangaLikes()) : null);
            stmt.setString(14, user.getAuthorLikes() != null ? gson.toJson(user.getAuthorLikes()) : null);
            stmt.setString(15, user.getSocialLinks() != null ? gson.toJson(user.getSocialLinks()) : null);
            stmt.setString(16, user.getQuickNote() != null ? gson.toJson(user.getQuickNote()) : null);
            stmt.setInt(17, Integer.parseInt(user.getId()));

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Updating user failed, no rows affected.");
            }
            return user;
        } catch (SQLException e) {
            throw new RuntimeException("Error updating user", e);
        }
    }

    // DELETE
    public boolean delete(String id) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, Integer.parseInt(id));
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting user", e);
        }
    }

    // LOGIN - validate user credentials
    public User authenticate(String username, String password) {
        String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            stmt.setString(2, password); // In production, use hashed passwords
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error authenticating user", e);
        }
    }

    // Get users by role
    public List<User> findByRole(String role) {
        String sql = "SELECT * FROM users WHERE role = ? ORDER BY created_at DESC";
        List<User> users = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, role);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error finding users by role", e);
        }
        return users;
    }

    // Helper method to map ResultSet to User object
    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(String.valueOf(rs.getInt("id")));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setPassword(rs.getString("password"));
        user.setAvatarUrl(rs.getString("avatar_url"));
        user.setRole(rs.getString("role"));
        user.setSeriesCount(rs.getInt("series_count"));
        user.setFollowersCount(rs.getInt("followers_count"));
        user.setBio(rs.getString("bio"));
        user.setPreferences(rs.getString("preferences"));
        user.setDisplayName(rs.getString("display_name"));
        user.setBirthDate(rs.getString("birth_date"));
        user.setViewerCount(rs.getInt("viewer_count"));

        // Parse JSON fields
        String mangaLikesJson = rs.getString("manga_likes");
        if (mangaLikesJson != null) {
            user.setMangaLikes(gson.fromJson(mangaLikesJson, new TypeToken<List<String>>(){}.getType()));
        }

        String authorLikesJson = rs.getString("author_likes");
        if (authorLikesJson != null) {
            user.setAuthorLikes(gson.fromJson(authorLikesJson, new TypeToken<List<String>>(){}.getType()));
        }

        String socialLinksJson = rs.getString("social_links");
        if (socialLinksJson != null) {
            user.setSocialLinks(gson.fromJson(socialLinksJson, new TypeToken<Map<String, String>>(){}.getType()));
        }

        String quickNoteJson = rs.getString("quick_note");
        if (quickNoteJson != null) {
            user.setQuickNote(gson.fromJson(quickNoteJson, new TypeToken<Map<String, Object>>(){}.getType()));
        }

        return user;
    }
}
