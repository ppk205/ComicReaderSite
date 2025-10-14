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
 * Base servlet that centralises JSON serialisation and CORS handling so every
 * dashboard endpoint behaves consistently.
 */
public abstract class BaseServlet extends HttpServlet {
    protected static final Gson GSON = new GsonBuilder()
            .setPrettyPrinting()
            .disableHtmlEscaping()
            .create();

    protected void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    @Override
    protected void doOptions(jakarta.servlet.http.HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    protected void writeJson(HttpServletResponse resp, Object payload) throws IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(GSON.toJson(payload));
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
