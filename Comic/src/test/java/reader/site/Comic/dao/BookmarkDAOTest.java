package reader.site.Comic.dao;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reader.site.Comic.TestDb;
import reader.site.Comic.model.Bookmark;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for bookmark persistence and the ownership-checked delete
 * that closes the IDOR hole (vuln #5/#19 family).
 */
class BookmarkDAOTest {

    private static BookmarkDAO bookmarkDAO;

    @BeforeAll
    static void setUp() {
        TestDb.ensureRolesSeeded();
        bookmarkDAO = new BookmarkDAO();
    }

    @Test
    void saveOrUpdateCreatesBookmarkForOwner() {
        String userId = TestDb.createUser("role-user");
        Long mangaId = TestDb.createManga();

        Bookmark saved = bookmarkDAO.saveOrUpdate(userId, mangaId, "My Bookmark", null, 3, 10, 0.3);
        assertNotNull(saved);
        assertEquals("My Bookmark", saved.getTitle());

        List<Bookmark> mine = bookmarkDAO.findByUserId(userId);
        assertEquals(1, mine.size());
    }

    @Test
    void saveOrUpdateUpdatesExistingBookmarkInsteadOfDuplicating() {
        String userId = TestDb.createUser("role-user");
        Long mangaId = TestDb.createManga();

        bookmarkDAO.saveOrUpdate(userId, mangaId, "First", null, 1, 10, 0.1);
        bookmarkDAO.saveOrUpdate(userId, mangaId, "Second", null, 5, 10, 0.5);

        List<Bookmark> mine = bookmarkDAO.findByUserId(userId);
        assertEquals(1, mine.size(), "saving twice for the same manga must update, not duplicate");
        assertEquals("Second", mine.get(0).getTitle());
    }

    @Test
    void saveOrUpdateReturnsNullForUnknownUserOrManga() {
        Long mangaId = TestDb.createManga();
        assertNull(bookmarkDAO.saveOrUpdate("no-such-user", mangaId, "x", null, 1, 1, 0.0));

        String userId = TestDb.createUser("role-user");
        assertNull(bookmarkDAO.saveOrUpdate(userId, 999_999_999L, "x", null, 1, 1, 0.0));
    }

    @Test
    void deleteOwnedRemovesOwnBookmark() {
        String userId = TestDb.createUser("role-user");
        Long mangaId = TestDb.createManga();
        Bookmark saved = bookmarkDAO.saveOrUpdate(userId, mangaId, "ToDelete", null, 1, 1, 1.0);
        assertNotNull(saved);

        Long bookmarkId = Long.valueOf(saved.getId());
        assertTrue(bookmarkDAO.deleteOwned(bookmarkId, userId));
        assertTrue(bookmarkDAO.findByUserId(userId).isEmpty());
    }

    @Test
    void deleteOwnedRefusesAnotherUsersBookmark() {
        // [SECURITY] IDOR: user B must not be able to delete user A's bookmark.
        String owner = TestDb.createUser("role-user");
        String attacker = TestDb.createUser("role-user");
        Long mangaId = TestDb.createManga();
        Bookmark saved = bookmarkDAO.saveOrUpdate(owner, mangaId, "Protected", null, 1, 1, 1.0);
        assertNotNull(saved);

        Long bookmarkId = Long.valueOf(saved.getId());
        assertFalse(bookmarkDAO.deleteOwned(bookmarkId, attacker),
                "another user's bookmark must not be deletable");

        // owner's bookmark is still there
        assertEquals(1, bookmarkDAO.findByUserId(owner).size());

        // owner can still delete it
        assertTrue(bookmarkDAO.deleteOwned(bookmarkId, owner));
    }

    @Test
    void deleteOwnedReturnsFalseForUnknownId() {
        String userId = TestDb.createUser("role-user");
        assertFalse(bookmarkDAO.deleteOwned(999_999_999L, userId));
    }
}
