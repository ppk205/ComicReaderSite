package reader.site.Comic.dao;

import reader.site.Comic.config.DatabaseConfig;
import reader.site.Comic.model.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {

    public UserDAO() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC Driver not found", e);
        }
    }

    private Connection getConnection() throws SQLException {
        return DatabaseConfig.getConnection();
    }

    // CREATE
    public User insert(User user) {
        String sql = "INSERT INTO users (username, email, password, status, role_id) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPassword());
            stmt.setString(4, user.getStatus() != null ? user.getStatus() : "active");
            stmt.setString(5, user.getRoleId() != null ? user.getRoleId() : "1");

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating user failed, no rows affected.");
            }

            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    user.setId(String.valueOf(generatedKeys.getLong(1)));
                }
            }
            return user;
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting user: " + e.getMessage(), e);
        }
    }

    // READ by ID
    public User findById(String id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, Long.parseLong(id));
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error finding user by ID: " + e.getMessage(), e);
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
            throw new RuntimeException("Error finding user by username: " + e.getMessage(), e);
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
            throw new RuntimeException("Error finding user by email: " + e.getMessage(), e);
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
            throw new RuntimeException("Error finding all users: " + e.getMessage(), e);
        }
        return users;
    }

    // UPDATE
    public User update(User user) {
        String sql = "UPDATE users SET username = ?, email = ?, password = ?, status = ?, role_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPassword());
            stmt.setString(4, user.getStatus());
            stmt.setString(5, user.getRoleId());
            stmt.setLong(6, Long.parseLong(user.getId()));

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Updating user failed, no rows affected.");
            }
            return user;
        } catch (SQLException e) {
            throw new RuntimeException("Error updating user: " + e.getMessage(), e);
        }
    }

    // UPDATE profile fields (without password)
    public User updateProfile(User user) {
        String sql = "UPDATE users SET username = ?, email = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getStatus());
            stmt.setLong(4, Long.parseLong(user.getId()));

            int affectedRows = stmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Updating user profile failed, no rows affected.");
            }
            return user;
        } catch (SQLException e) {
            throw new RuntimeException("Error updating user profile: " + e.getMessage(), e);
        }
    }

    // UPDATE last login
    public void updateLastLogin(String userId) {
        String sql = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, Long.parseLong(userId));
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating last login: " + e.getMessage(), e);
        }
    }

    // DELETE
    public boolean delete(String id) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, Long.parseLong(id));
            int affectedRows = stmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting user: " + e.getMessage(), e);
        }
    }

    // LOGIN - validate user credentials
    public User authenticate(String username, String password) {
        String sql = "SELECT * FROM users WHERE username = ? AND password = ? AND status = 'active'";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            stmt.setString(2, password); // In production, use hashed passwords
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                User user = mapResultSetToUser(rs);
                // Update last login
                updateLastLogin(user.getId());
                return user;
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException("Error authenticating user: " + e.getMessage(), e);
        }
    }

    // Get users by role
    public List<User> findByRole(String roleId) {
        String sql = "SELECT * FROM users WHERE role_id = ? ORDER BY created_at DESC";
        List<User> users = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, roleId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error finding users by role: " + e.getMessage(), e);
        }
        return users;
    }

    // Get users by status
    public List<User> findByStatus(String status) {
        String sql = "SELECT * FROM users WHERE status = ? ORDER BY created_at DESC";
        List<User> users = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, status);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error finding users by status: " + e.getMessage(), e);
        }
        return users;
    }

    // Helper method to map ResultSet to User object
    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(String.valueOf(rs.getLong("id")));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setPassword(rs.getString("password"));
        user.setStatus(rs.getString("status"));
        user.setCreatedAt(rs.getTimestamp("created_at"));
        user.setUpdatedAt(rs.getTimestamp("updated_at"));
        user.setLastLogin(rs.getTimestamp("last_login"));
        user.setRoleId(rs.getString("role_id"));
        return user;
    }
}
