package reader.site.Comic.dao;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import reader.site.Comic.entity.BookmarkEntity;
import reader.site.Comic.entity.MangaEntity;
import reader.site.Comic.entity.UserEntity;
import reader.site.Comic.model.Bookmark;
import reader.site.Comic.persistence.JPAUtil;

public class BookmarkDAO {

    public Bookmark saveOrUpdate(String userId, Long mangaId, String title, String cover, Integer currentChapter, Integer totalChapters, Double readingProgress) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            TypedQuery<BookmarkEntity> query = em.createQuery(
                "SELECT b FROM BookmarkEntity b WHERE b.user.id = :userId AND b.manga.id = :mangaId",
                BookmarkEntity.class
            );
            query.setParameter("userId", userId);
            query.setParameter("mangaId", mangaId);

            List<BookmarkEntity> results = query.getResultList();
            BookmarkEntity entity;

            if (!results.isEmpty()) {
                entity = results.get(0);
                entity.setTitle(title);
                entity.setCover(cover);
                entity.setCurrentChapter(currentChapter);
                entity.setTotalChapters(totalChapters);
                entity.setReadingProgress(readingProgress);
            } else {
                entity = new BookmarkEntity();
                UserEntity user = em.find(UserEntity.class, userId);
                MangaEntity manga = em.find(MangaEntity.class, mangaId);
                if (user == null || manga == null) {
                    em.getTransaction().rollback();
                    return null;
                }
                entity.setUser(user);
                entity.setManga(manga);
                entity.setTitle(title);
                entity.setCover(cover);
                entity.setCurrentChapter(currentChapter);
                entity.setTotalChapters(totalChapters);
                entity.setReadingProgress(readingProgress);
                em.persist(entity);
            }

            em.getTransaction().commit();

            Bookmark model = new Bookmark();
            model.setMangaId(String.valueOf(entity.getManga().getId()));
            model.setTitle(entity.getTitle());
            model.setCover(entity.getCover());
            model.setCurrentChapter(entity.getCurrentChapter());
            // If totalChapters stored in entity is null, try to compute from manga_chapters table
            Integer tc = entity.getTotalChapters();
            if (tc == null) {
                tc = computeTotalChapters(em, entity.getManga().getId());
            }
            model.setTotalChapters(tc);
            model.setReadingProgress(entity.getReadingProgress());
            // Optionally include id and timestamps if needed by frontend
            try {
                model.getClass().getMethod("setId", String.class).invoke(model, String.valueOf(entity.getId()));
            } catch (ReflectiveOperationException | IllegalArgumentException e) {
                // model may not have id setter (older DTO); ignore if not present
            }
            try {
                java.time.LocalDateTime ca = entity.getCreatedAt();
                java.time.LocalDateTime ua = entity.getUpdatedAt();
                java.lang.reflect.Method mca = model.getClass().getMethod("setCreatedAt", String.class);
                java.lang.reflect.Method mua = model.getClass().getMethod("setUpdatedAt", String.class);
                if (ca != null) mca.invoke(model, formatDateTime(ca));
                if (ua != null) mua.invoke(model, formatDateTime(ua));
            } catch (ReflectiveOperationException | IllegalArgumentException e) {
                // ignore if model doesn't have these methods
            }
            return model;
        } catch (Exception ex) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw ex;
        } finally {
            em.close();
        }
    }

    public List<Bookmark> findByUserId(String userId) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            TypedQuery<BookmarkEntity> query = em.createQuery(
                "SELECT b FROM BookmarkEntity b WHERE b.user.id = :userId ORDER BY b.updatedAt DESC",
                BookmarkEntity.class
            );
            query.setParameter("userId", userId);
            return query.getResultList().stream().map(entity -> {
                // Defensive: skip malformed rows where user or manga is null
                if (entity.getManga() == null || entity.getUser() == null) {
                    return null;
                }
                Bookmark m = new Bookmark();
                Long mangaId = entity.getManga().getId();
                m.setMangaId(mangaId != null ? String.valueOf(mangaId) : null);
                m.setTitle(entity.getTitle());
                m.setCover(entity.getCover());
                m.setCurrentChapter(entity.getCurrentChapter());
                Integer tc = entity.getTotalChapters();
                if (tc == null) {
                    tc = computeTotalChapters(em, entity.getManga().getId());
                }
                m.setTotalChapters(tc);
                m.setReadingProgress(entity.getReadingProgress());
                // populate optional id/timestamps if model supports them
                try {
                    m.getClass().getMethod("setId", String.class).invoke(m, String.valueOf(entity.getId()));
                } catch (ReflectiveOperationException | IllegalArgumentException e) {}
                try {
                    java.time.LocalDateTime ca = entity.getCreatedAt();
                    java.time.LocalDateTime ua = entity.getUpdatedAt();
                    java.lang.reflect.Method mca = m.getClass().getMethod("setCreatedAt", String.class);
                    java.lang.reflect.Method mua = m.getClass().getMethod("setUpdatedAt", String.class);
                    if (ca != null) mca.invoke(m, formatDateTime(ca));
                    if (ua != null) mua.invoke(m, formatDateTime(ua));
                } catch (ReflectiveOperationException | IllegalArgumentException e) {}
                return m;
            }).filter(b -> b != null).collect(Collectors.toList());
        } finally {
            em.close();
        }
    }

    // Helper: compute total chapters by querying manga_chapters for the manga id. Returns null if none found.
    private Integer computeTotalChapters(EntityManager em, Long mangaId) {
        if (mangaId == null) return null;
        try {
            // find the maximum chapter_number for this manga
            TypedQuery<Integer> q = em.createQuery(
                "SELECT MAX(c.chapterNumber) FROM MangaChapterEntity c WHERE c.mangaId = :mangaId",
                Integer.class
            );
            q.setParameter("mangaId", mangaId);
            Integer max = q.getSingleResult();
            return max;
        } catch (Exception ex) {
            return null;
        }
    }

    private String formatDateTime(java.time.LocalDateTime dateTime) {
        return dateTime != null ? java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(dateTime) : null;
    }

    public boolean delete(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            BookmarkEntity entity = em.find(BookmarkEntity.class, id);
            if (entity == null) {
                em.getTransaction().rollback();
                return false;
            }
            em.remove(entity);
            em.getTransaction().commit();
            return true;
        } catch (Exception ex) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw ex;
        } finally {
            em.close();
        }
    }
}
