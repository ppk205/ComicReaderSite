package reader.site.Comic.servlet;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class CorsFilter implements Filter {
  @Override
  public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest rq = (HttpServletRequest) req;
    HttpServletResponse rs = (HttpServletResponse) resp;

    // ✅ Cho phép truy cập từ frontend (sửa đúng origin của bạn)
    String origin = rq.getHeader("Origin");
    if (origin != null && origin.contains("http://localhost:3000")) {
      rs.setHeader("Access-Control-Allow-Origin", origin);
    }

    rs.setHeader("Access-Control-Allow-Credentials", "true"); // ⚡ Cho phép gửi cookie
    rs.setHeader("Access-Control-Allow-Headers",
        "Origin, Content-Type, Accept, Authorization, X-Requested-With");
    rs.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    if ("OPTIONS".equalsIgnoreCase(rq.getMethod())) {
      rs.setStatus(HttpServletResponse.SC_OK);
      return;
    }

    chain.doFilter(req, resp);
  }
}
