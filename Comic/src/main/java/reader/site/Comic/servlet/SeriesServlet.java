package reader.site.Comic.servlet;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.lang.reflect.Type;
import java.sql.*;
import java.util.*;

@WebServlet("/Comic/api/series")
public class SeriesServlet extends HttpServlet {
    private final Gson gson = new Gson();
    private String dbUrl;
    private String dbUser;
    private String dbPass;

    @Override
    public void init() throws ServletException {
        // NOTE: move these to environment variables or config in production
        dbUrl = "jdbc:mysql://websql1.mysql.database.azure.com:3306/comic?useSSL=true&allowPublicKeyRetrieval=true";
        dbUser = "ppk123@websql1"; // Azure MySQL usually requires user@servername
        dbPass = "Mysql@1234";

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("[SeriesServlet] JDBC driver loaded");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            throw new ServletException("MySQL driver not found", e);
        }

        // Optional: test connection at init so we can see error early
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPass)) {
            System.out.println("[SeriesServlet] ✅ Connected to DB in init()");
        } catch (SQLException ex) {
            ex.printStackTrace();
            throw new ServletException("Cannot connect to DB in init(): " + ex.getMessage(), ex);
        }
    }

    // CORS headers helper
    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        setCorsHeaders(resp);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("utf-8");

        String idParam = req.getParameter("id");

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPass)) {
            if (idParam != null && !idParam.isBlank()) {
                String sql = "SELECT id, title, cover, chapters FROM manga WHERE id = ?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setInt(1, Integer.parseInt(idParam));
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            Map<String, Object> out = new HashMap<>();
                            out.put("id", rs.getInt("id"));
                            out.put("title", rs.getString("title"));
                            out.put("coverUrl", rs.getString("cover"));

                            String chaptersJson = rs.getString("chapters");
                            if (chaptersJson != null) {
                                Type listType = new TypeToken<List<String>>(){}.getType();
                                List<String> chapters = gson.fromJson(chaptersJson, listType);
                                out.put("chapters", chapters);
                            } else {
                                out.put("chapters", Collections.emptyList());
                            }

                            resp.getWriter().write(gson.toJson(out));
                            return;
                        } else {
                            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                            resp.getWriter().write(gson.toJson(Map.of("error", "Series not found")));
                            return;
                        }
                    }
                }
            } else {
                String sql = "SELECT id, title, cover FROM manga ORDER BY id DESC LIMIT 500";
                List<Map<String, Object>> list = new ArrayList<>();
                try (PreparedStatement ps = conn.prepareStatement(sql);
                     ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> row = new HashMap<>();
                        row.put("id", rs.getInt("id"));
                        row.put("title", rs.getString("title"));
                        row.put("coverUrl", rs.getString("cover"));
                        list.add(row);
                    }
                }
                resp.getWriter().write(gson.toJson(list));
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write(gson.toJson(Map.of("error", "DB error", "message", ex.getMessage())));
        } catch (NumberFormatException nf) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(Map.of("error", "Invalid id")));
        }
    }
}
