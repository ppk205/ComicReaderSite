package reader.site.Comic.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.util.EnvConfig;

import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Global CORS + security-header filter.
 *
 * [SECURITY FIX] Vuln #17: Access-Control-Allow-Origin is only echoed for origins in
 * the ALLOWED_ORIGINS allow-list (env var, comma-separated). Unknown origins receive
 * no CORS headers at all.
 *
 * [SECURITY FIX] Vuln #32: baseline security response headers are applied to every response.
 */
@WebFilter("/*")
public class CorsFilter implements Filter {

    // Allowed origins come from the ALLOWED_ORIGINS env var (comma-separated, no trailing slash).
    // Defaults to localhost:3000 for local development.
    private static final Set<String> ALLOWED_ORIGINS = Arrays.stream(EnvConfig.allowedOrigins().split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toSet());

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // ── CORS (allow-list only) ────────────────────────────────────────────
        String origin = req.getHeader("Origin");
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Vary", "Origin");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            res.setHeader("Access-Control-Expose-Headers", "Authorization");
        }

        // ── Security headers (vuln #32) ───────────────────────────────────────
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        // API responses are JSON only — nothing may load as a document from them.
        res.setHeader("Content-Security-Policy", "default-src 'none'");

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(request, response);
    }
}
