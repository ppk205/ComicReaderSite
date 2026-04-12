package reader.site.Comic.util;

import java.sql.Connection;
import java.sql.DriverManager;

public class Db {

  public static Connection get() throws Exception {
    Class.forName("com.mysql.cj.jdbc.Driver");
    return DriverManager.getConnection(
        EnvConfig.dbUrl(),
        EnvConfig.dbUser(),
        EnvConfig.dbPassword()
    );
  }
}
