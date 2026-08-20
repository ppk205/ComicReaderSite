package reader.site.Comic.util;

import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Raw JDBC access helper. Credentials come from environment variables
 * (DB_URL / DB_USER / DB_PASSWORD) — never hardcode secrets here.
 */
public class Db {

  public static Connection get() throws Exception {
    Class.forName("com.mysql.cj.jdbc.Driver");
    return DriverManager.getConnection(
        EnvConfig.dbUrl(),
        EnvConfig.dbUser(),
        EnvConfig.dbPassword());
  }
}
