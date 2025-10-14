package reader.site.Comic.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import reader.site.Comic.dao.ChapterImageDAO;
import reader.site.Comic.model.ChapterImage;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/chapter-images/*")
public class ChapterImageServlet extends BaseServlet {
    private ChapterImageDAO dao;

    @Override
    public void init() throws ServletException {
        dao = new ChapterImageDAO();
        System.out.println("✅ ChapterImageServlet initialized");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        setCorsHeaders(resp);

        String mangaId = req.getParameter("mangaId");
        String chapterId = req.getParameter("chapterId");

        if (mangaId == null || chapterId == null) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST, "mangaId and chapterId are required");
            return;
        }

        try {
            String chapterName = "Chapter" + chapterId;
            List<ChapterImage> images = dao.findByMangaAndChapter(mangaId, chapterName);
            writeJson(resp, images);
        } catch (Exception e) {
            e.printStackTrace();
            writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error fetching chapter images");
        }
    }
}
