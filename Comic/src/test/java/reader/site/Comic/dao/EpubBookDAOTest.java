package reader.site.Comic.dao;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reader.site.Comic.TestDb;
import reader.site.Comic.model.EpubBook;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for EPUB book storage: insert, per-user listing, storage-limit enforcement,
 * and delete.
 */
class EpubBookDAOTest {

    private static EpubBookDAO epubDAO;

    @BeforeAll
    static void setUp() {
        TestDb.ensureRolesSeeded();
        epubDAO = new EpubBookDAO();
    }

    private EpubBook book(String userId, String title, long sizeBytes) {
        EpubBook book = new EpubBook();
        book.setUserId(userId);
        book.setTitle(title);
        book.setFileName(title.toLowerCase().replace(' ', '-') + ".epub");
        book.setFileSizeInBytes(sizeBytes);
        book.setBlobName(java.util.UUID.randomUUID().toString());
        return book;
    }

    @Test
    void insertPersistsBookWithGeneratedId() throws Exception {
        String userId = TestDb.createUser("role-user");
        EpubBook saved = epubDAO.insert(book(userId, "My Book", 1024));

        assertNotNull(saved.getId());
        assertEquals("My Book", saved.getTitle());
    }

    @Test
    void insertRequiresUserId() {
        EpubBook orphan = book(null, "Orphan", 1024);
        assertThrows(IllegalArgumentException.class, () -> epubDAO.insert(orphan));
    }

    @Test
    void findAllByUserIdReturnsOnlyOwnBooks() throws Exception {
        String userA = TestDb.createUser("role-user");
        String userB = TestDb.createUser("role-user");

        epubDAO.insert(book(userA, "A Book 1", 100));
        epubDAO.insert(book(userA, "A Book 2", 200));
        epubDAO.insert(book(userB, "B Book 1", 300));

        List<EpubBook> aBooks = epubDAO.findAllByUserId(userA);
        List<EpubBook> bBooks = epubDAO.findAllByUserId(userB);
        assertEquals(2, aBooks.size());
        assertEquals(1, bBooks.size());
    }

    @Test
    void getUserUsedStorageSumsSizes() throws Exception {
        String userId = TestDb.createUser("role-user");
        epubDAO.insert(book(userId, "Size 1", 1_000));
        epubDAO.insert(book(userId, "Size 2", 2_500));

        assertEquals(3_500L, epubDAO.getUserUsedStorage(userId));
    }

    @Test
    void getUserUsedStorageIsZeroForNewUser() {
        String userId = TestDb.createUser("role-user");
        assertEquals(0L, epubDAO.getUserUsedStorage(userId));
    }

    @Test
    void insertRejectsBookOver500MBLimit() {
        String userId = TestDb.createUser("role-user");
        long overLimit = 500L * 1024 * 1024 + 1;
        EpubBook tooBig = book(userId, "Too Big", overLimit);

        Exception ex = assertThrows(Exception.class, () -> epubDAO.insert(tooBig));
        assertTrue(ex.getMessage().contains("500MB"), "message should mention the limit: " + ex.getMessage());
    }

    @Test
    void insertRejectsWhenCumulativeUsageExceedsLimit() throws Exception {
        String userId = TestDb.createUser("role-user");
        long chunk = 300L * 1024 * 1024; // 300 MB

        epubDAO.insert(book(userId, "Chunk 1", chunk));
        // 300 + 300 = 600 MB > 500 MB limit
        assertThrows(Exception.class, () -> epubDAO.insert(book(userId, "Chunk 2", chunk)));
    }

    @Test
    void findByIdReturnsSavedBook() throws Exception {
        String userId = TestDb.createUser("role-user");
        EpubBook saved = epubDAO.insert(book(userId, "Findable", 512));

        EpubBook found = epubDAO.findById(saved.getId());
        assertNotNull(found);
        assertEquals("Findable", found.getTitle());
    }

    @Test
    void findByIdReturnsNullForUnknown() {
        assertNull(epubDAO.findById(999_999_999L));
    }

    @Test
    void deleteByIdRemovesBook() throws Exception {
        String userId = TestDb.createUser("role-user");
        EpubBook saved = epubDAO.insert(book(userId, "Deletable", 256));

        assertTrue(epubDAO.deleteById(saved.getId()));
        assertNull(epubDAO.findById(saved.getId()));
        assertFalse(epubDAO.deleteById(saved.getId()), "second delete must return false");
    }
}
