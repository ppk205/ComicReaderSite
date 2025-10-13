package reader.site.Comic.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {
    // Azure MySQL database configuration
    private static final String JDBC_URL =
            "jdbc:mysql://websql1.mysql.database.azure.com:3306/comicdb?useSSL=true&requireSSL=true&serverTimezone=UTC";
    private static final String JDBC_USER = "ppk123";
    private static final String JDBC_PASSWORD = "Mysql@1234";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC Driver not found", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
    }

    public static String getJdbcUrl() {
        return JDBC_URL;
    }

    public static String getJdbcUser() {
        return JDBC_USER;
    }

    public static String getJdbcPassword() {
        return JDBC_PASSWORD;
    }
}
