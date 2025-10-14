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
            "jdbc:mysql://websql1.mysql.database.azure.com:3306/ComicDB?useSSL=true&requireSSL=true&serverTimezone=UTC";
    private static final String JDBC_USER = "ppk123";
    private static final String JDBC_PASSWORD = "Mysql@1234";




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
        String sql = "INSERT INTO manga (title, cover, chapters) VALUES (?, ?, ?)";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, manga.getTitle());
            stmt.setString(2, manga.getCover());
            stmt.setString(3, gson.toJson(manga.getChapters()));

            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    manga.setId(String.valueOf(rs.getInt(1)));
                }
            }
            return manga;
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting manga", e);
        }
    }

    // READ ALL
    public List<Manga> findAll() {
        List<Manga> mangas = new ArrayList<>();
        String sql = "SELECT * FROM manga";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                mangas.add(fromResultSet(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException("Error fetching all mangas", e);
        }
        return mangas;
    }

    // READ ONE
    public Manga findById(String id) {
        String sql = "SELECT * FROM manga WHERE id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, Integer.parseInt(id));
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return fromResultSet(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching manga by ID", e);
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
            throw new RuntimeException("Error updating manga", e);
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
            throw new RuntimeException("Error deleting manga", e);
        }
    }

    // Helper: convert SQL result -> Manga object
    private Manga fromResultSet(ResultSet rs) throws SQLException {
        Manga manga = new Manga();
        manga.setId(String.valueOf(rs.getInt("id")));
        manga.setTitle(rs.getString("title"));
        manga.setCover(rs.getString("cover"));

        String chaptersJson = rs.getString("chapters");
        List<String> chapters = gson.fromJson(chaptersJson, List.class);
        manga.setChapters(chapters);

        return manga;
    }

    public Manga findById(int id) {
        throw new UnsupportedOperationException("Not supported yet."); // Generated from nbfs://nbhost/SystemFileSystem/Templates/Classes/Code/GeneratedMethodBody
    }
}
