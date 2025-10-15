package reader.site.Comic.servlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.MangaDAO;

import java.io.IOException;

@WebServlet(name = "HealthServlet", urlPatterns = "/api/health")
public class HealthServlet extends BaseServlet {
    private final MangaDAO mangaDAO = new MangaDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            mangaDAO.findAll();
            writeJson(resp, new HealthResponse("ok", "Database connection successful"));
        } catch (Exception ex) {
            writeJson(resp, new HealthResponse("degraded", "Database not reachable: " + ex.getMessage()));
        }
    }

    private static class HealthResponse {
        private final String status;
        private final String message;

        private HealthResponse(String status, String message) {
            this.status = status;
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }
    }
}
