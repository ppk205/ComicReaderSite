package reader.site.Comic.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static final String JDBC_URL =
        "jdbc:mysql://websql1.mysql.database.azure.com:3306/comicdb?useSSL=true&requireSSL=true&serverTimezone=UTC";
    private static final String JDBC_USER = "ppk123";
    private static final String JDBC_PASSWORD = "Mysql@1234";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
    }
}
