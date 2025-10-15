package reader.site.Comic.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;

/**
 * Json helper with java.time adapters.
 */
public final class JsonUtil {
    private JsonUtil() {}

    private static final Gson gson = new GsonBuilder()
            // java.time.* adapters
            .registerTypeAdapter(LocalDateTime.class,
                    (com.google.gson.JsonSerializer<LocalDateTime>) (src, t, ctx) ->
                            new com.google.gson.JsonPrimitive(src.toString()))
            .registerTypeAdapter(LocalDateTime.class,
                    (com.google.gson.JsonDeserializer<LocalDateTime>) (json, t, ctx) ->
                            LocalDateTime.parse(json.getAsString()))
            .registerTypeAdapter(Instant.class,
                    (com.google.gson.JsonSerializer<Instant>) (src, t, ctx) ->
                            new com.google.gson.JsonPrimitive(src.toString()))
            .registerTypeAdapter(Instant.class,
                    (com.google.gson.JsonDeserializer<Instant>) (json, t, ctx) ->
                            Instant.parse(json.getAsString()))
            .create();

    public static <T> T readJson(HttpServletRequest req, Class<T> clazz) throws IOException {
        req.setCharacterEncoding(StandardCharsets.UTF_8.name());
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = req.getReader()) {
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
        }
        String body = sb.toString();
        if (body == null || body.isBlank()) return null;
        return gson.fromJson(body, clazz);
    }

    public static void writeJson(HttpServletResponse resp, int status, Object obj) throws IOException {
        resp.setStatus(status);
        resp.setCharacterEncoding(StandardCharsets.UTF_8.name());
        resp.setContentType("application/json; charset=UTF-8");
        try (PrintWriter out = resp.getWriter()) {
            out.write(gson.toJson(obj));
        }
    }

    public static void writeError(HttpServletResponse resp, int status, String message) throws IOException {
        writeJson(resp, status, new ErrorBody(message));
    }

    private static final class ErrorBody {
        final String error;
        ErrorBody(String error) { this.error = error; }
    }
}
