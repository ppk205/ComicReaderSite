package reader.site.Comic.dao;
import reader.site.Comic.model.Manga;
import com.google.gson.Gson;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.sql.Connection;
import java.sql.DriverManager;

public class MangaDAO {
    private static final String JDBC_URL =
            "jdbc:mysql://web-welpweb.l.aivencloud.com:26170/defaultdb?useSSL=true&requireSSL=true&serverTimezone=UTC";
    private static final String JDBC_USER = "avnadmin";
    private static final String JDBC_PASSWORD = "AVNS_WRR4qdO4pISviLaP54c";

    private static final Gson gson = new Gson();

    public MangaDAO() {
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
    public Manga insert(Manga manga) {
        String sql = "INSERT INTO manga (title, author_id, cover, description, genre, status, rating, views, likes, chapters, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, manga.getTitle());
            stmt.setInt(2, 1); // Default author_id, should be passed from manga object
            stmt.setString(3, manga.getCover());
            stmt.setString(4, ""); // description
            stmt.setString(5, ""); // genre
            stmt.setString(6, "ongoing"); // status
            stmt.setDouble(7, 0.0); // rating
            stmt.setInt(8, 0); // views
            stmt.setInt(9, 0); // likes
            stmt.setString(10, gson.toJson(manga.getChapters()));
            stmt.setString(11, "[]"); // tags

            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    manga.setId(String.valueOf(rs.getInt(1)));
                }
            }
            return manga;
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting manga: " + e.getMessage(), e);
        }
    }

    // READ ALL
    public List<Manga> findAll() {
        List<Manga> mangas = new ArrayList<>();
        String sql = "SELECT id, title, cover, chapters, author_id, description, genre, status, rating, views, likes FROM manga ORDER BY created_at DESC";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                mangas.add(fromResultSet(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error fetching all mangas: " + e.getMessage(), e);
        }
        return mangas;
    }

    // READ ONE
    public Manga findById(String id) {
        String sql = "SELECT id, title, cover, chapters, author_id, description, genre, status, rating, views, likes FROM manga WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, Integer.parseInt(id));
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return fromResultSet(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching manga by ID: " + e.getMessage(), e);
        }
        return null;
    }

    // UPDATE
    public boolean update(String id, Manga manga) {
        String sql = "UPDATE manga SET title = ?, cover = ?, chapters = ? WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, manga.getTitle());
            stmt.setString(2, manga.getCover());
            stmt.setString(3, gson.toJson(manga.getChapters()));
            stmt.setInt(4, Integer.parseInt(id));

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error updating manga: " + e.getMessage(), e);
        }
    }

    // DELETE
    public boolean delete(String id) {
        String sql = "DELETE FROM manga WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, Integer.parseInt(id));
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting manga: " + e.getMessage(), e);
        }
    }

    // Helper: convert SQL result -> Manga object
    private Manga fromResultSet(ResultSet rs) throws SQLException {
        Manga manga = new Manga();
        manga.setId(String.valueOf(rs.getInt("id")));
        manga.setTitle(rs.getString("title"));
        manga.setCover(rs.getString("cover"));

        String chaptersJson = rs.getString("chapters");
        if (chaptersJson != null && !chaptersJson.isEmpty()) {
            List<String> chapters = gson.fromJson(chaptersJson, List.class);
            manga.setChapters(chapters);
        } else {
            manga.setChapters(new ArrayList<>());
        }

        return manga;
    }

    // Test connection method
    public boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("Connection test failed: " + e.getMessage());
            return false;
        }
    }
}
