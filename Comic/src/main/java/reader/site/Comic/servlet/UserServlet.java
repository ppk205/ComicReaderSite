package reader.site.Comic.servlet;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/user/*")
public class UserServlet extends HttpServlet {
    private UserDAO userDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        userDAO = new UserDAO();
        gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        PrintWriter out = response.getWriter();
        String pathInfo = request.getPathInfo();

        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get current user profile
                HttpSession session = request.getSession(false);
                if (session == null || session.getAttribute("userId") == null) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    out.print(gson.toJson(new ErrorResponse(false, "Not authenticated")));
                    return;
                }

                String userId = (String) session.getAttribute("userId");
                User user = userDAO.findById(userId);

                if (user != null) {
                    // Don't send password to frontend
                    user.setPassword(null);
                    Map<String, Object> result = new HashMap<>();
                    result.put("success", true);
                    result.put("user", user);
                    result.put("isOwnProfile", true);
                    out.print(gson.toJson(result));
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.print(gson.toJson(new ErrorResponse(false, "User not found")));
                }
            } else if (pathInfo.equals("/check")) {
                // Check if user is logged in
                HttpSession session = request.getSession(false);
                if (session != null && session.getAttribute("userId") != null) {
                    String userId = (String) session.getAttribute("userId");
                    User user = userDAO.findById(userId);
                    if (user != null) {
                        user.setPassword(null);
                        Map<String, Object> result = new HashMap<>();
                        result.put("success", true);
                        result.put("authenticated", true);
                        result.put("user", user);
                        out.print(gson.toJson(result));
                    } else {
                        out.print(gson.toJson(Map.of("success", true, "authenticated", false)));
                    }
                } else {
                    out.print(gson.toJson(Map.of("success", true, "authenticated", false)));
                }
            } else {
                // Get user by username
                String username = pathInfo.substring(1);
                User user = userDAO.findByUsername(username);

                if (user != null) {
                    user.setPassword(null);
                    user.setEmail(null); // Don't expose email for other users

                    Map<String, Object> result = new HashMap<>();
                    result.put("success", true);
                    result.put("user", user);
                    result.put("isOwnProfile", false);
                    out.print(gson.toJson(result));
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.print(gson.toJson(new ErrorResponse(false, "User not found")));
                }
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(new ErrorResponse(false, "Internal server error: " + e.getMessage())));
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        PrintWriter out = response.getWriter();
        String pathInfo = request.getPathInfo();

        try {
            if (pathInfo != null && pathInfo.equals("/login")) {
                // Handle login
                BufferedReader reader = request.getReader();
                JsonObject loginData = gson.fromJson(reader, JsonObject.class);

                String username = loginData.get("username").getAsString();
                String password = loginData.get("password").getAsString();

                // For demo purposes, using plain text password
                // In production, hash the password
                User user = userDAO.authenticate(username, password);

                if (user != null) {
                    // Create session
                    HttpSession session = request.getSession(true);
                    session.setAttribute("userId", user.getId());
                    session.setAttribute("username", user.getUsername());
                    session.setAttribute("role", user.getRole());
                    session.setMaxInactiveInterval(30 * 60); // 30 minutes

                    // Don't send password to frontend
                    user.setPassword(null);

                    Map<String, Object> result = new HashMap<>();
                    result.put("success", true);
                    result.put("message", "Login successful");
                    result.put("user", user);
                    result.put("redirectTo", "/"); // Redirect to home page
                    out.print(gson.toJson(result));
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    out.print(gson.toJson(new ErrorResponse(false, "Invalid username or password")));
                }
            } else if (pathInfo != null && pathInfo.equals("/logout")) {
                // Handle logout
                HttpSession session = request.getSession(false);
                if (session != null) {
                    session.invalidate();
                }

                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("message", "Logout successful");
                result.put("redirectTo", "/");
                out.print(gson.toJson(result));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print(gson.toJson(new ErrorResponse(false, "Endpoint not found")));
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(new ErrorResponse(false, "Internal server error: " + e.getMessage())));
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        PrintWriter out = response.getWriter();

        // Check authentication
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print(gson.toJson(new ErrorResponse(false, "Not authenticated")));
            return;
        }

        try {
            String userId = (String) session.getAttribute("userId");
            User currentUser = userDAO.findById(userId);

            if (currentUser == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print(gson.toJson(new ErrorResponse(false, "User not found")));
                return;
            }

            // Parse update data
            BufferedReader reader = request.getReader();
            JsonObject updateData = gson.fromJson(reader, JsonObject.class);

            // Update user fields
            if (updateData.has("displayName")) {
                currentUser.setDisplayName(updateData.get("displayName").getAsString());
            }
            if (updateData.has("bio")) {
                currentUser.setBio(updateData.get("bio").getAsString());
            }
            if (updateData.has("avatarUrl")) {
                currentUser.setAvatarUrl(updateData.get("avatarUrl").getAsString());
            }
            if (updateData.has("socialLinks")) {
                Map<String, String> socialLinks = gson.fromJson(updateData.get("socialLinks"), Map.class);
                currentUser.setSocialLinks(socialLinks);
            }
            if (updateData.has("quickNote")) {
                Map<String, Object> quickNote = gson.fromJson(updateData.get("quickNote"), Map.class);
                currentUser.setQuickNote(quickNote);
            }

            // Update in database
            User updatedUser = userDAO.update(currentUser);
            updatedUser.setPassword(null);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Profile updated successfully");
            result.put("user", updatedUser);
            out.print(gson.toJson(result));

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(new ErrorResponse(false, "Internal server error: " + e.getMessage())));
        }
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    // Error response class
    private static class ErrorResponse {
        private boolean success;
        private String message;

        public ErrorResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        // Getters for JSON serialization
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }
}

