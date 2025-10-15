package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.MangaChapterDAO;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.MangaChapter;
import reader.site.Comic.model.User;
import reader.site.Comic.service.AuthService;
import reader.site.Comic.service.TokenService;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/manga-chapters/*")
public class MangaChapterServlet extends BaseServlet {
    private transient MangaChapterDAO chapterDAO;
    private transient AuthService authService;

    @Override
    public void init() throws ServletException {
        chapterDAO = new MangaChapterDAO();
        authService = new AuthService(new UserDAO(), new RoleDAO(), new TokenService());
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        String mangaIdParam = req.getParameter("mangaId");

        try {
            if (pathInfo == null || "/".equals(pathInfo)) {
                if (mangaIdParam == null || mangaIdParam.isBlank()) {
                    writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "mangaId parameter is required");
                    return;
                }

                List<MangaChapter> chapters = chapterDAO.findByMangaId(mangaIdParam);
                writeJson(resp, chapters);
                return;
            }

            String id = pathInfo.substring(1);
            MangaChapter chapter = chapterDAO.findById(id);
            if (chapter == null) {
                writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Chapter not found");
                return;
            }
            writeJson(resp, chapter);
        } catch (Exception ex) {
            ex.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error fetching chapters");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isEditor(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }

        MangaChapter chapter = readJson(resp, req, MangaChapter.class);
        if (chapter == null) {
            return;
        }

        if (!isValidPayload(chapter)) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "mangaId, chapterNumber, and chapterTitle are required");
            return;
        }

        trimChapterFields(chapter);

        try {
            MangaChapter created = chapterDAO.insert(chapter);
            writeJson(resp, created);
        } catch (Exception ex) {
            ex.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create chapter");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isEditor(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || "/".equals(pathInfo)) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Chapter id required for update");
            return;
        }

        MangaChapter chapter = readJson(resp, req, MangaChapter.class);
        if (chapter == null) {
            return;
        }

        trimChapterFields(chapter);

        String id = pathInfo.substring(1);
        try {
            boolean updated = chapterDAO.update(id, chapter);
            if (!updated) {
                writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Chapter not found");
                return;
            }
            MangaChapter refreshed = chapterDAO.findById(id);
            writeJson(resp, refreshed);
        } catch (Exception ex) {
            ex.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update chapter");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!isEditor(req)) {
            writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not authorised");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || "/".equals(pathInfo)) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "Chapter id required for deletion");
            return;
        }

        String id = pathInfo.substring(1);
        try {
            boolean deleted = chapterDAO.delete(id);
            if (!deleted) {
                writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Chapter not found");
                return;
            }
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            setCorsHeaders(resp);
        } catch (Exception ex) {
            ex.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to delete chapter");
        }
    }

    private boolean isValidPayload(MangaChapter chapter) {
        return chapter.getMangaId() != null
                && !chapter.getMangaId().isBlank()
                && chapter.getChapterNumber() != null
                && chapter.getChapterTitle() != null
                && !chapter.getChapterTitle().isBlank();
    }

    private boolean isEditor(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            header = header.substring(7);
        }
        User user = authService.resolveToken(header);
        if (user == null || user.getRole() == null) {
            return false;
        }
        String roleName = user.getRole().getName();
        return "admin".equalsIgnoreCase(roleName) || "moderator".equalsIgnoreCase(roleName);
    }

    private void trimChapterFields(MangaChapter chapter) {
        if (chapter.getChapterTitle() != null) {
            chapter.setChapterTitle(chapter.getChapterTitle().trim());
        }
        if (chapter.getImageUrl() != null) {
            chapter.setImageUrl(chapter.getImageUrl().trim());
        }
        if (chapter.getChapterUrl() != null) {
            chapter.setChapterUrl(chapter.getChapterUrl().trim());
        }
        if (chapter.getReleaseDate() != null) {
            chapter.setReleaseDate(chapter.getReleaseDate().trim());
        }
    }
}
