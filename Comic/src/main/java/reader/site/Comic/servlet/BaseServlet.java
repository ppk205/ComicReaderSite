package reader.site.Comic.servlet;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;

/**
 * Base servlet that centralises JSON serialisation so every endpoint behaves consistently.
 *
 * [SECURITY FIX] Vuln #17: CORS is handled exclusively by {@link reader.site.Comic.filter.CorsFilter}
 * (origin allow-list from the ALLOWED_ORIGINS env var). Servlets no longer emit
 * "Access-Control-Allow-Origin: *" — the helper below is intentionally a no-op kept
 * for call-site compatibility.
 */
public abstract class BaseServlet extends HttpServlet {
    // [SECURITY FIX] Vuln #18: Removed disableHtmlEscaping() — Gson now escapes
    // HTML special characters (<, >, &, ", ') in JSON output, adding a layer of XSS defense.
    protected static final Gson GSON = new GsonBuilder()
            .setPrettyPrinting()
            .create();

    /**
     * Kept for compatibility with existing call sites. CORS headers are set by the
     * global CorsFilter; emitting them here previously produced a wildcard origin.
     */
    protected void setCorsHeaders(HttpServletResponse resp) {
        // Intentionally empty — see class javadoc (CorsFilter owns CORS).
    }

    @Override
    protected void doOptions(jakarta.servlet.http.HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    protected void writeJson(HttpServletResponse resp, Object payload) throws IOException {
        try {
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            String json = GSON.toJson(payload);
            resp.getWriter().write(json);
            resp.getWriter().flush(); // đảm bảo ghi xong
        } catch (Exception e) {
            // [SECURITY FIX] Vuln #16: log details server-side only; return a generic error.
            System.err.println("[BaseServlet] Failed to write JSON: " + e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\":\"Internal server error\"}");
        }
    }

    protected void writeError(HttpServletResponse resp, int status, String message) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(GSON.toJson(new ErrorResponse(message)));
    }

    protected <T> T readJson(HttpServletResponse resp, Reader bodyReader, Class<T> clazz) throws IOException {
        try (Reader reader = bodyReader) {
            return GSON.fromJson(reader, clazz);
        } catch (Exception ex) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON payload");
            return null;
        }
    }

    protected <T> T readJson(HttpServletResponse resp, jakarta.servlet.http.HttpServletRequest req, Class<T> clazz) throws IOException {
        try (Reader reader = new InputStreamReader(req.getInputStream(), StandardCharsets.UTF_8)) {
            return GSON.fromJson(reader, clazz);
        } catch (Exception ex) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON payload");
            return null;
        }
    }

    private static class ErrorResponse {
        private final String error;

        private ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }
    }
}
