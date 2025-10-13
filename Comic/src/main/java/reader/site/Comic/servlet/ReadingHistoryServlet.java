package reader.site.Comic.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import reader.site.Comic.dao.ReadingHistoryDAO;
import reader.site.Comic.model.ReadingHistory;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet("/api/reading/*")
public class ReadingHistoryServlet extends HttpServlet {
    private ReadingHistoryDAO readingHistoryDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        readingHistoryDAO = new ReadingHistoryDAO();
        gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String pathInfo = request.getPathInfo();
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            sendErrorResponse(response, "Unauthorized", 401);
            return;
        }

        String userId = (String) session.getAttribute("userId");

        try {
            switch (pathInfo) {
                case "/history":
                    handleGetHistory(userId, request, response, out);
                    break;
                case "/recent":
                    handleGetRecent(userId, request, response, out);
                    break;
                case "/completed":
                    handleGetCompleted(userId, response, out);
                    break;
                case "/reading":
                    handleGetCurrentlyReading(userId, response, out);
                    break;
                case "/stats":
                    handleGetStats(userId, response, out);
                    break;
                case "/progress":
                    handleGetProgress(userId, request, response, out);
                    break;
                default:
                    sendErrorResponse(response, "Invalid endpoint", 404);
                    break;
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, "Internal server error", 500);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            sendErrorResponse(response, "Unauthorized", 401);
            return;
        }

        String userId = (String) session.getAttribute("userId");

        try {
            switch (pathInfo) {
                case "/update":
                    handleUpdateProgress(userId, request, response);
                    break;
                case "/status":
                    handleUpdateStatus(userId, request, response);
                    break;
                case "/add-to-list":
                    handleAddToList(userId, request, response);
                    break;
                default:
                    sendErrorResponse(response, "Invalid endpoint", 404);
                    break;
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, "Internal server error", 500);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            sendErrorResponse(response, "Unauthorized", 401);
            return;
        }

        String userId = (String) session.getAttribute("userId");

        if ("/remove".equals(pathInfo)) {
            handleRemoveFromHistory(userId, request, response);
        } else {
            sendErrorResponse(response, "Invalid endpoint", 404);
        }
    }

    private void handleGetHistory(String userId, HttpServletRequest request,
                                 HttpServletResponse response, PrintWriter out) {
        String status = request.getParameter("status");
        List<ReadingHistory> history;

        if (status != null && !status.isEmpty()) {
            history = readingHistoryDAO.getReadingHistoryByUserAndStatus(userId, status);
        } else {
            history = readingHistoryDAO.getReadingHistoryByUser(userId);
        }

        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.add("data", gson.toJsonTree(history));
        out.print(gson.toJson(jsonResponse));
    }

    private void handleGetRecent(String userId, HttpServletRequest request,
                                HttpServletResponse response, PrintWriter out) {
        int limit = 10;
        String limitParam = request.getParameter("limit");
        if (limitParam != null) {
            try {
                limit = Integer.parseInt(limitParam);
            } catch (NumberFormatException e) {
                limit = 10;
            }
        }

        List<ReadingHistory> recent = readingHistoryDAO.getRecentlyRead(userId, limit);
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.add("data", gson.toJsonTree(recent));
        out.print(gson.toJson(jsonResponse));
    }

    private void handleGetCompleted(String userId, HttpServletResponse response, PrintWriter out) {
        List<ReadingHistory> completed = readingHistoryDAO.getCompletedComics(userId);
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.add("data", gson.toJsonTree(completed));
        out.print(gson.toJson(jsonResponse));
    }

    private void handleGetCurrentlyReading(String userId, HttpServletResponse response, PrintWriter out) {
        List<ReadingHistory> reading = readingHistoryDAO.getCurrentlyReading(userId);
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.add("data", gson.toJsonTree(reading));
        out.print(gson.toJson(jsonResponse));
    }

    private void handleGetStats(String userId, HttpServletResponse response, PrintWriter out) {
        Map<String, Integer> stats = readingHistoryDAO.getReadingStats(userId);
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.add("data", gson.toJsonTree(stats));
        out.print(gson.toJson(jsonResponse));
    }

    private void handleGetProgress(String userId, HttpServletRequest request,
                                  HttpServletResponse response, PrintWriter out) {
        String comicId = request.getParameter("comicId");
        if (comicId == null || comicId.isEmpty()) {
            response.setStatus(400);
            JsonObject errorResponse = new JsonObject();
            errorResponse.addProperty("success", false);
            errorResponse.addProperty("message", "Comic ID is required");
            out.print(gson.toJson(errorResponse));
            return;
        }

        ReadingHistory progress = readingHistoryDAO.getReadingProgress(userId, comicId);
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.add("data", gson.toJsonTree(progress));
        out.print(gson.toJson(jsonResponse));
    }

    private void handleUpdateProgress(String userId, HttpServletRequest request,
                                    HttpServletResponse response) throws IOException {
        JsonObject requestBody = gson.fromJson(request.getReader(), JsonObject.class);

        String comicId = requestBody.get("comicId").getAsString();
        String comicTitle = requestBody.get("comicTitle").getAsString();
        String comicCover = requestBody.has("comicCover") ? requestBody.get("comicCover").getAsString() : "";
        int chapter = requestBody.get("chapter").getAsInt();
        int totalChapters = requestBody.has("totalChapters") ? requestBody.get("totalChapters").getAsInt() : 0;

        ReadingHistory updated = readingHistoryDAO.updateReadingProgress(
            userId, comicId, comicTitle, comicCover, chapter, totalChapters
        );

        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.addProperty("message", "Reading progress updated successfully");
        jsonResponse.add("data", gson.toJsonTree(updated));

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(jsonResponse));
    }

    private void handleUpdateStatus(String userId, HttpServletRequest request,
                                  HttpServletResponse response) throws IOException {
        JsonObject requestBody = gson.fromJson(request.getReader(), JsonObject.class);

        String comicId = requestBody.get("comicId").getAsString();
        String status = requestBody.get("status").getAsString();

        ReadingHistory updated = readingHistoryDAO.updateReadingStatus(userId, comicId, status);

        JsonObject jsonResponse = new JsonObject();
        if (updated != null) {
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Status updated successfully");
            jsonResponse.add("data", gson.toJsonTree(updated));
        } else {
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Comic not found in reading history");
        }

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(jsonResponse));
    }

    private void handleAddToList(String userId, HttpServletRequest request,
                                HttpServletResponse response) throws IOException {
        JsonObject requestBody = gson.fromJson(request.getReader(), JsonObject.class);

        String comicId = requestBody.get("comicId").getAsString();
        String comicTitle = requestBody.get("comicTitle").getAsString();
        String comicCover = requestBody.has("comicCover") ? requestBody.get("comicCover").getAsString() : "";

        ReadingHistory added = readingHistoryDAO.addToPlanToRead(userId, comicId, comicTitle, comicCover);

        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", true);
        jsonResponse.addProperty("message", "Added to plan to read");
        jsonResponse.add("data", gson.toJsonTree(added));

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(jsonResponse));
    }

    private void handleRemoveFromHistory(String userId, HttpServletRequest request,
                                       HttpServletResponse response) throws IOException {
        String comicId = request.getParameter("comicId");
        if (comicId == null || comicId.isEmpty()) {
            sendErrorResponse(response, "Comic ID is required", 400);
            return;
        }

        boolean removed = readingHistoryDAO.removeFromHistory(userId, comicId);

        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("success", removed);
        jsonResponse.addProperty("message", removed ? "Removed from history" : "Comic not found");

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(jsonResponse));
    }

    private void sendErrorResponse(HttpServletResponse response, String message, int statusCode)
            throws IOException {
        response.setStatus(statusCode);
        JsonObject errorResponse = new JsonObject();
        errorResponse.addProperty("success", false);
        errorResponse.addProperty("message", message);

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(errorResponse));
    }
}
