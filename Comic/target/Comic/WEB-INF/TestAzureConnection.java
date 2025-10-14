import java.sql.Connection;
import java.sql.DriverManager;

public class TestAzureConnection {
    public static void main(String[] args) {
        String url = "jdbc:mysql://websql1.mysql.database.azure.com:3306/comment"
                   + "?useSSL=true&requireSSL=false&verifyServerCertificate=false"
                   + "&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "ppk123";
        String pass = "Mysql@1234";

        try {
            System.out.println("Connecting...");

            // 👇 BẮT BUỘC: Load MySQL Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            Connection conn = DriverManager.getConnection(url, user, pass);
            System.out.println("✅ Connected successfully!");
            conn.close();
        } catch (Exception e) {
            System.out.println("❌ Connection failed!");
            e.printStackTrace();
        }
    }
}
