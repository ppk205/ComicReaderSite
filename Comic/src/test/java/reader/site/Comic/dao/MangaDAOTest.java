package reader.site.Comic.dao;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reader.site.Comic.TestDb;
import reader.site.Comic.model.Manga;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for manga CRUD, including the StringListConverter round-trip for chapters.
 */
class MangaDAOTest {

    private static MangaDAO mangaDAO;

    @BeforeAll
    static void setUp() {
        TestDb.ensureRolesSeeded();
        mangaDAO = new MangaDAO();
    }

    private Manga newManga(String title) {
        Manga manga = new Manga();
        manga.setTitle(title);
        manga.setCover("https://example.com/" + title.hashCode() + ".png");
        manga.setChapters(new java.util.ArrayList<>(List.of("ch-1", "ch-2", "ch-3")));
        return manga;
    }

    @Test
    void insertAssignsId() {
        Manga saved = mangaDAO.insert(newManga("Insert Test " + System.nanoTime()));
        assertNotNull(saved.getId());
        assertNotNull(mangaDAO.findById(saved.getId()));
    }

    @Test
    void chaptersRoundTripThroughConverter() {
        Manga saved = mangaDAO.insert(newManga("Chapters Test " + System.nanoTime()));
        Manga reloaded = mangaDAO.findById(saved.getId());

        assertNotNull(reloaded);
        assertEquals(List.of("ch-1", "ch-2", "ch-3"), reloaded.getChapters(),
                "chapter list must survive the StringListConverter round-trip");
    }

    @Test
    void findByIdReturnsNullForUnknownOrMalformedId() {
        assertNull(mangaDAO.findById("999999999"));
        assertNull(mangaDAO.findById("not-a-number"));
        assertNull(mangaDAO.findById(null));
    }

    @Test
    void updateChangesFields() {
        Manga saved = mangaDAO.insert(newManga("Before Update " + System.nanoTime()));

        Manga updates = new Manga();
        updates.setTitle("After Update");
        updates.setCover("https://example.com/new.png");
        updates.setChapters(new java.util.ArrayList<>(List.of("ch-1")));

        assertTrue(mangaDAO.update(saved.getId(), updates));

        Manga reloaded = mangaDAO.findById(saved.getId());
        assertEquals("After Update", reloaded.getTitle());
        assertEquals(List.of("ch-1"), reloaded.getChapters());
    }

    @Test
    void updateReturnsFalseForUnknownId() {
        assertFalse(mangaDAO.update("999999999", newManga("ghost")));
        assertFalse(mangaDAO.update("not-a-number", newManga("ghost")));
    }

    @Test
    void deleteRemovesManga() {
        Manga saved = mangaDAO.insert(newManga("Delete Me " + System.nanoTime()));
        assertTrue(mangaDAO.delete(saved.getId()));
        assertNull(mangaDAO.findById(saved.getId()));
        assertFalse(mangaDAO.delete(saved.getId()), "second delete must return false");
    }

    @Test
    void findAllIncludesInsertedManga() {
        String title = "FindAll Marker " + System.nanoTime();
        mangaDAO.insert(newManga(title));

        List<Manga> all = mangaDAO.findAll();
        assertTrue(all.stream().anyMatch(m -> title.equals(m.getTitle())));
    }
}
