package reader.site.Comic.util;

import java.sql.Connection;
import java.sql.DriverManager;

public class Db {
  private static final String URL =
      "jdbc:mysql://websql1.mysql.database.azure.com:3306/comicdb?useSSL=true&requireSSL=true&serverTimezone=UTC";
  private static final String USER = "ppk123";
  private static final String PASSWORD = "Mysql@1234";

  public static Connection get() throws Exception {
    Class.forName("com.mysql.cj.jdbc.Driver");
    return DriverManager.getConnection(URL, USER, PASSWORD);
  }
}
