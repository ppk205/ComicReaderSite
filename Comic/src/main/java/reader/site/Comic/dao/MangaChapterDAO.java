package reader.site.Comic.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import reader.site.Comic.entity.MangaChapterEntity;
import reader.site.Comic.model.MangaChapter;
import reader.site.Comic.persistence.JPAUtil;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public class MangaChapterDAO {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public List<MangaChapter> findByMangaId(String mangaId) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Long parsedId = parseId(mangaId);
            if (parsedId == null) {
                return new ArrayList<>();
            }

            TypedQuery<MangaChapterEntity> query = em.createQuery(
                    "SELECT c FROM MangaChapterEntity c WHERE c.mangaId = :mangaId ORDER BY c.chapterNumber ASC",
                    MangaChapterEntity.class
            );
            query.setParameter("mangaId", parsedId);
            List<MangaChapterEntity> entities = query.getResultList();
            List<MangaChapter> results = new ArrayList<>(entities.size());
            for (MangaChapterEntity entity : entities) {
                results.add(toModel(entity));
            }
            return results;
        } finally {
            em.close();
        }
    }

    public MangaChapter findById(String id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Long parsedId = parseId(id);
            if (parsedId == null) {
                return null;
            }
            MangaChapterEntity entity = em.find(MangaChapterEntity.class, parsedId);
            return entity != null ? toModel(entity) : null;
        } finally {
            em.close();
        }
    }

    public MangaChapter insert(MangaChapter chapter) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Long mangaId = parseId(chapter.getMangaId());
            if (mangaId == null) {
                throw new IllegalArgumentException("Invalid manga id");
            }

            em.getTransaction().begin();
            MangaChapterEntity entity = new MangaChapterEntity();
            entity.setMangaId(mangaId);
            entity.setChapterNumber(normaliseChapterNumber(chapter.getChapterNumber()));
            entity.setChapterTitle(chapter.getChapterTitle());
            entity.setImageUrl(trimToNull(chapter.getImageUrl()));
            entity.setChapterUrl(trimToNull(chapter.getChapterUrl()));
            entity.setReleaseDate(parseDate(chapter.getReleaseDate()));
            em.persist(entity);
            em.getTransaction().commit();

            chapter.setId(String.valueOf(entity.getId()));
            chapter.setMangaId(String.valueOf(entity.getMangaId()));
            chapter.setChapterNumber(entity.getChapterNumber());
            chapter.setChapterTitle(entity.getChapterTitle());
            chapter.setImageUrl(entity.getImageUrl());
            chapter.setChapterUrl(entity.getChapterUrl());
            chapter.setReleaseDate(formatDate(entity.getReleaseDate()));
            chapter.setCreatedAt(formatDateTime(entity.getCreatedAt()));
            chapter.setUpdatedAt(formatDateTime(entity.getUpdatedAt()));
            return chapter;
        } catch (RuntimeException ex) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw ex;
        } finally {
            em.close();
        }
    }

    public boolean update(String id, MangaChapter chapter) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Long parsedId = parseId(id);
            if (parsedId == null) {
                return false;
            }

            em.getTransaction().begin();
            MangaChapterEntity entity = em.find(MangaChapterEntity.class, parsedId);
            if (entity == null) {
                em.getTransaction().rollback();
                return false;
            }

            if (chapter.getMangaId() != null) {
                Long mangaId = parseId(chapter.getMangaId());
                if (mangaId != null) {
                    entity.setMangaId(mangaId);
                }
            }

            if (chapter.getChapterNumber() != null) {
                entity.setChapterNumber(normaliseChapterNumber(chapter.getChapterNumber()));
            }

            if (chapter.getChapterTitle() != null) {
                entity.setChapterTitle(chapter.getChapterTitle());
            }

            if (chapter.getImageUrl() != null) {
                entity.setImageUrl(trimToNull(chapter.getImageUrl()));
            }

            if (chapter.getChapterUrl() != null) {
                entity.setChapterUrl(trimToNull(chapter.getChapterUrl()));
            }

            if (chapter.getReleaseDate() != null) {
                entity.setReleaseDate(parseDate(chapter.getReleaseDate()));
            }

            em.getTransaction().commit();
            return true;
        } catch (RuntimeException ex) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw ex;
        } finally {
            em.close();
        }
    }

    public boolean delete(String id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Long parsedId = parseId(id);
            if (parsedId == null) {
                return false;
            }

            em.getTransaction().begin();
            MangaChapterEntity entity = em.find(MangaChapterEntity.class, parsedId);
            if (entity == null) {
                em.getTransaction().rollback();
                return false;
            }
            em.remove(entity);
            em.getTransaction().commit();
            return true;
        } catch (RuntimeException ex) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw ex;
        } finally {
            em.close();
        }
    }

    private MangaChapter toModel(MangaChapterEntity entity) {
        MangaChapter chapter = new MangaChapter();
        chapter.setId(String.valueOf(entity.getId()));
        chapter.setMangaId(String.valueOf(entity.getMangaId()));
        chapter.setChapterNumber(entity.getChapterNumber());
        chapter.setChapterTitle(entity.getChapterTitle());
    chapter.setImageUrl(entity.getImageUrl());
        chapter.setChapterUrl(entity.getChapterUrl());
        chapter.setReleaseDate(formatDate(entity.getReleaseDate()));
        chapter.setCreatedAt(formatDateTime(entity.getCreatedAt()));
        chapter.setUpdatedAt(formatDateTime(entity.getUpdatedAt()));
        return chapter;
    }

    private Long parseId(String id) {
        try {
            return id != null ? Long.parseLong(id) : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Integer normaliseChapterNumber(Integer number) {
        if (number == null) {
            return null;
        }
        return number < 0 ? 0 : number;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value, DATE_FORMATTER);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private String formatDate(LocalDate date) {
        return date != null ? DATE_FORMATTER.format(date) : null;
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? DATE_TIME_FORMATTER.format(dateTime) : null;
    }
}
