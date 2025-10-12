package auth.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;

@WebFilter("/*")
public class CORSFilter implements Filter {

    // Whitelist origins (thêm domain deploy thực tế của bạn vào đây)
    private static final Set<String> ALLOWED_ORIGINS = Set.of(
            "http://localhost:3000"
            // "https://your-frontend.example.com"
    );

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request  = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String origin = request.getHeader("Origin");
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            // KHÔNG dùng "*"
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Vary", "Origin");
            response.setHeader("Access-Control-Allow-Credentials", "true");

            // Cho phép các header/method FE sẽ dùng
            String reqHeaders = request.getHeader("Access-Control-Request-Headers");
            if (reqHeaders == null || reqHeaders.isBlank()) {
                reqHeaders = "Content-Type, Authorization";
            }
            response.setHeader("Access-Control-Allow-Headers", reqHeaders);
            response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.setHeader("Access-Control-Max-Age", "86400"); // cache preflight 1 ngày
            // (Tuỳ chọn) expose headers nếu cần đọc từ FE:
            // response.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
        }

        // Kết thúc sớm preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }
}