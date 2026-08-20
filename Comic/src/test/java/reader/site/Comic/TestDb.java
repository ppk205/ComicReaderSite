package reader.site.Comic;

import jakarta.persistence.EntityManager;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.entity.MangaEntity;
import reader.site.Comic.entity.UserEntity;
import reader.site.Comic.persistence.JPAUtil;
import reader.site.Comic.util.PasswordUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Shared fixtures for DAO/service tests. All tests run against the in-memory H2
 * database defined in src/test/resources/META-INF/persistence.xml (unit "comicPU").
 * The database is shared across the test JVM, so every helper generates unique values.
 */
public final class TestDb {

    private TestDb() {}

    /** Ensures default roles/permissions are seeded (idempotent). */
    public static void ensureRolesSeeded() {
        new RoleDAO();
    }

    /** Creates and persists a user with a bcrypt-hashed password. Returns the entity id. */
    public static String createUser(String roleId) {
        ensureRolesSeeded();
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            UserEntity user = new UserEntity();
            String suffix = UUID.randomUUID().toString().substring(0, 8);
            user.setUsername("user-" + suffix);
            user.setEmail(suffix + "@test.local");
            user.setPassword(PasswordUtil.hash("Secret123!"));
            user.setStatus("active");
            user.setRole(em.find(reader.site.Comic.entity.UserRoleEntity.class, roleId));
            em.persist(user);
            em.getTransaction().commit();
            return user.getId();
        } finally {
            em.close();
        }
    }

    /** Creates and persists a manga. Returns the entity id. */
    public static Long createManga() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            MangaEntity manga = new MangaEntity();
            manga.setTitle("Test Manga " + UUID.randomUUID().toString().substring(0, 8));
            manga.setCover("https://example.com/cover.png");
            manga.setChapters(new ArrayList<>(List.of("chapter-1", "chapter-2")));
            em.persist(manga);
            em.getTransaction().commit();
            return manga.getId();
        } finally {
            em.close();
        }
    }
}
