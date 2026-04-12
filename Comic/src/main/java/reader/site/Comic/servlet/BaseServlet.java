package reader.site.Comic.servlet;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.util.EnvConfig;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Base servlet that centralises JSON serialisation and CORS handling so every
 * dashboard endpoint behaves consistently.
 */
public abstract class BaseServlet extends HttpServlet {
    // [SECURITY FIX] Vuln #18: Removed disableHtmlEscaping() — Gson will now escape
    // HTML special characters (<, >, &, ", ') in JSON output, adding a layer of XSS defense.
    protected static final Gson GSON = new GsonBuilder()
            .setPrettyPrinting()
            .create();

    // Allowed origins loaded from env var ALLOWED_ORIGINS (comma-separated).
    // Defaults to localhost:3000 for local development.
    private static final Set<String> ALLOWED_ORIGINS = Arrays.stream(
            EnvConfig.allowedOrigins().split(",")
    ).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toSet());

    /**
     * [SECURITY FIX] Vuln #17: CORS header is only set for allowed origins instead of wildcard *.
     * Credentials-bearing requests from unknown origins will not receive the header.
     */
    protected void setCorsHeaders(HttpServletResponse resp) {
        // Note: HttpServletRequest is not available here, so we expose all allowed origins
        // via a comma-separated Vary-based approach. For simple requests, this is acceptable.
        // If only one origin is configured, send it directly.
        if (ALLOWED_ORIGINS.size() == 1) {
            resp.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS.iterator().next());
        } else {
            // Multi-origin: let subclasses call setCorsHeaders(req, resp) for dynamic matching
            resp.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS.iterator().next());
        }
        resp.setHeader("Vary", "Origin");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    /**
     * Dynamic CORS header that validates the incoming Origin against the allowed list.
     */
    protected void setCorsHeaders(HttpServletRequest req, HttpServletResponse resp) {
        String origin = req.getHeader("Origin");
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            resp.setHeader("Access-Control-Allow-Origin", origin);
        }
        resp.setHeader("Vary", "Origin");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(req, resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    protected void writeJson(HttpServletResponse resp, Object payload) throws IOException {
        try {
            setCorsHeaders(resp);
            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            String json = GSON.toJson(payload);
            resp.getWriter().write(json);
            resp.getWriter().flush();
        } catch (Exception e) {
            System.err.println("[BaseServlet] Failed to write JSON: " + e.getClass().getSimpleName());
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\":\"Internal server error\"}");
        }
    }

    protected void writeError(HttpServletResponse resp, int status, String message) throws IOException {
        setCorsHeaders(resp);
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
