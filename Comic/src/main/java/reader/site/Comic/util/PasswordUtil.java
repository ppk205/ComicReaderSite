package reader.site.Comic.util;

import org.mindrot.jbcrypt.BCrypt;

public final class PasswordUtil {
    private static final int WORKLOAD = 12;

    private PasswordUtil() {}

    public static String hash(String plain) {
        if (plain == null) return null;
        return BCrypt.hashpw(plain, BCrypt.gensalt(WORKLOAD));
    }

    public static boolean verify(String plain, String hashed) {
        if (plain == null || hashed == null) return false;
        try {
            if (isBCryptHash(hashed)) {
                return BCrypt.checkpw(plain, hashed);
            } else {
                return hashed.equals(plain);
            }
        } catch (Exception ex) {
            return false;
        }
    }

    public static boolean isBCryptHash(String s) {
        return s != null && (s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$"));
    }
}