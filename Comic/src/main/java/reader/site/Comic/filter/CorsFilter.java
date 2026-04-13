package reader.site.Comic.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@WebFilter("/*")
public class CorsFilter implements Filter {

    // Read comma-separated allowed origins from env var ALLOWED_ORIGINS.
    // Falls back to production URL + common local dev origins.
    private static final Set<String> ALLOWED_ORIGINS = buildAllowedOrigins();

    private static Set<String> buildAllowedOrigins() {
        String env = System.getenv("ALLOWED_ORIGINS");
        if (env != null && !env.isBlank()) {
            Set<String> origins = new HashSet<>();
            for (String o : env.split(",")) {
                String trimmed = o.trim();
                if (!trimmed.isEmpty()) origins.add(trimmed);
            }
            return Collections.unmodifiableSet(origins);
        }
        // Default: production + local dev fallbacks
        return Collections.unmodifiableSet(new HashSet<>(Arrays.asList(
                "https://comicreadersite.azurewebsites.net",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        )));
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest  req = (HttpServletRequest)  request;
        HttpServletResponse res = (HttpServletResponse) response;

        String origin = req.getHeader("Origin");

        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            // Reflect the exact allowed origin back — required when credentials=true
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Vary", "Origin"); // tell caches response varies by origin
        }
        // If origin is NOT in allowlist → do not set the header → browser blocks it

        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        res.setHeader("Access-Control-Expose-Headers", "Authorization");

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(request, response);
    }
}
