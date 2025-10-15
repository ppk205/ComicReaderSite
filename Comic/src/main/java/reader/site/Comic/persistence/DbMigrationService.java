package reader.site.Comic.persistence;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import reader.site.Comic.entity.DbMigrationEntity;

public class DbMigrationService {

    public void applyPendingMigrations() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            // ensure migration table exists - since hibernate.hbm2ddl.auto=update it will create from entity

            List<String> applied = getAppliedScripts(em);

            List<Path> files = listMigrationFilesFromFilesystem();
            if (files.isEmpty()) {
                files = listMigrationFilesFromClasspath();
            }

            for (Path p : files) {
                String name = p.getFileName().toString();
                if (applied.contains(name)) {
                    System.out.println("[db-migration] skipping already applied: " + name);
                    continue;
                }

                String sql = Files.readString(p, StandardCharsets.UTF_8);
                int executedCount = 0;
                // naive split by ";" to support simple scripts
                for (String stmt : sql.split(";")) {
                    String trim = stmt.trim();
                    if (trim.isEmpty()) continue;
                    em.createNativeQuery(trim).executeUpdate();
                    executedCount++;
                }

                if (executedCount > 0) {
                    DbMigrationEntity record = new DbMigrationEntity(name, Instant.now());
                    em.persist(record);
                    System.out.println("[db-migration] applied " + name + ", statements executed: " + executedCount);
                } else {
                    System.out.println("[db-migration] no statements to execute in " + name + " - skipping record");
                }
            }

            em.getTransaction().commit();
        } catch (Exception ex) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            throw new RuntimeException("Migration failed", ex);
        } finally {
            em.close();
        }
    }

    private List<String> getAppliedScripts(EntityManager em) {
        TypedQuery<String> q = em.createQuery("select m.scriptName from DbMigrationEntity m", String.class);
        return q.getResultList();
    }

    private List<Path> listMigrationFilesFromFilesystem() {
        List<Path> res = new ArrayList<>();
        try {
            Path base = Path.of(System.getProperty("catalina.base", ""));
            if (!base.toString().isEmpty()) {
                Path migrations = base.resolve("webapps/ROOT/WEB-INF/classes/migrations");
                if (Files.exists(migrations) && Files.isDirectory(migrations)) {
                    res.addAll(Files.list(migrations).sorted().collect(Collectors.toList()));
                    return res;
                }
            }

            // fallback to project-level folder (useful in dev): ../Comic/migrations
            Path projectMigrations = Path.of("migrations");
            if (Files.exists(projectMigrations) && Files.isDirectory(projectMigrations)) {
                res.addAll(Files.list(projectMigrations).sorted().collect(Collectors.toList()));
            }
        } catch (IOException ignored) {
        }
        return res;
    }

    private List<Path> listMigrationFilesFromClasspath() {
        // Listing directories inside classpath can be container/packaging dependent. For simplicity
        // we don't attempt to enumerate classpath resources here. The filesystem paths are used
        // (project `migrations/` or `WEB-INF/classes/migrations`).
        return new ArrayList<>();
    }
}
