package reader.site.Comic.dao;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reader.site.Comic.TestDb;
import reader.site.Comic.model.ReadingHistory;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for reading-history upsert semantics and per-user isolation.
 * User ids are UUID strings (the DAO was fixed to accept String userId —
 * the old Long signature broke every real user, see ReadingHistoryServlet fix).
 */
class ReadingHistoryDAOTest {

    private static ReadingHistoryDAO historyDAO;

    @BeforeAll
    static void setUp() {
        TestDb.ensureRolesSeeded();
        historyDAO = new ReadingHistoryDAO();
    }

    @Test
    void saveCreatesNewHistoryEntry() {
        String userId = TestDb.createUser("role-user");
        Long mangaId = TestDb.createManga();

        ReadingHistory saved = historyDAO.save(userId, mangaId, "chapter-1", 5, false);
        assertNotNull(saved);

        List<ReadingHistory> mine = historyDAO.findByUserId(userId);
        assertEquals(1, mine.size());
    }

    @Test
    void saveUpsertsExistingEntryInsteadOfDuplicating() {
        String userId = TestDb.createUser("role-user");
        Long mangaId = TestDb.createManga();

        historyDAO.save(userId, mangaId, "chapter-1", 1, false);
        historyDAO.save(userId, mangaId, "chapter-2", 9, true);

        List<ReadingHistory> mine = historyDAO.findByUserId(userId);
        assertEquals(1, mine.size(), "re-reading the same manga must update the row, not add a new one");
    }

    @Test
    void saveReturnsNullForUnknownUserOrManga() {
        Long mangaId = TestDb.createManga();
        assertNull(historyDAO.save("no-such-user", mangaId, "c", 0, false));

        String userId = TestDb.createUser("role-user");
        assertNull(historyDAO.save(userId, 999_999_999L, "c", 0, false));
    }

    @Test
    void historyIsIsolatedPerUser() {
        String userA = TestDb.createUser("role-user");
        String userB = TestDb.createUser("role-user");
        Long mangaId = TestDb.createManga();

        historyDAO.save(userA, mangaId, "chapter-1", 3, false);

        assertTrue(historyDAO.findByUserId(userB).isEmpty(),
                "user B must not see user A's reading history");
        assertEquals(1, historyDAO.findByUserId(userA).size());
    }

    @Test
    void findByUserAndMangaReturnsSavedEntry() {
        String userId = TestDb.createUser("role-user");
        Long mangaId = TestDb.createManga();
        historyDAO.save(userId, mangaId, "chapter-3", 7, false);

        assertTrue(historyDAO.findByUserAndManga(userId, mangaId).isPresent());
        assertTrue(historyDAO.findByUserAndManga(userId, 999_999_999L).isEmpty());
    }

    @Test
    void deleteRemovesEntry() {
        String userId = TestDb.createUser("role-user");
        Long mangaId = TestDb.createManga();
        ReadingHistory saved = historyDAO.save(userId, mangaId, "chapter-1", 1, false);
        assertNotNull(saved);

        assertTrue(historyDAO.delete(Long.valueOf(saved.getId())));
        assertTrue(historyDAO.findByUserId(userId).isEmpty());
        assertFalse(historyDAO.delete(Long.valueOf(saved.getId())), "second delete must return false");
    }
}
