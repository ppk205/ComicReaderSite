package reader.site.Comic.util;

/**
 * Centralized utility to read required environment variables.
 * Throws a clear error at startup if a required variable is missing.
 *
 * Required env vars (see Comic/.env.example):
 *   DB_URL, DB_USER, DB_PASSWORD,
 *   SMTP_USERNAME, SMTP_APP_PASSWORD,
 *   AZURE_BLOB_CONNECTION_STRING
 *
 * Optional:
 *   AZURE_BLOB_CONTAINER (default "temp"),
 *   ALLOWED_ORIGINS (comma-separated CORS allow-list, default http://localhost:3000),
 *   APP_BASE_URL (frontend base for reset-password links),
 *   BACKEND_BASE_URL (backend base for account-activation links)
 */
public final class EnvConfig {

    private EnvConfig() {}

    /**
     * Reads an environment variable. Throws if the variable is not set or blank.
     */
    public static String require(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                "[EnvConfig] Required environment variable '" + name + "' is not set. " +
                "Please configure it before starting the application."
            );
        }
        return value;
    }

    /**
     * Reads an environment variable, returning a default if not set.
     */
    public static String getOrDefault(String name, String defaultValue) {
        String value = System.getenv(name);
        return (value != null && !value.isBlank()) ? value : defaultValue;
    }

    // ─── Convenience accessors ───────────────────────────────────────────────

    public static String dbUrl() {
        return require("DB_URL");
    }

    public static String dbUser() {
        return require("DB_USER");
    }

    public static String dbPassword() {
        return require("DB_PASSWORD");
    }

    public static String azureBlobConnectionString() {
        return require("AZURE_BLOB_CONNECTION_STRING");
    }

    public static String azureBlobContainer() {
        return getOrDefault("AZURE_BLOB_CONTAINER", "temp");
    }

    public static String smtpUsername() {
        return require("SMTP_USERNAME");
    }

    public static String smtpPassword() {
        return require("SMTP_APP_PASSWORD");
    }

    public static String allowedOrigins() {
        return getOrDefault("ALLOWED_ORIGINS", "http://localhost:3000");
    }

    /** Frontend base URL used in password-reset email links. */
    public static String appBaseUrl() {
        return getOrDefault("APP_BASE_URL", "http://localhost:3000");
    }

    /** Backend base URL used in account-activation email links. */
    public static String backendBaseUrl() {
        return getOrDefault("BACKEND_BASE_URL", "http://localhost:8080/Comic/api");
    }
}
