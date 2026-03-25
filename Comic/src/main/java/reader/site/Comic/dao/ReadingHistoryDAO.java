package reader.site.Comic.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import reader.site.Comic.entity.ReadingHistoryEntity;
import reader.site.Comic.entity.MangaEntity;
import reader.site.Comic.entity.UserEntity;
import reader.site.Comic.model.ReadingHistory;
import reader.site.Comic.persistence.JPAUtil;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class ReadingHistoryDAO {

    public ReadingHistory save(Long userId, Long mangaId, String chapterId, Integer currentPage, Boolean completed) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            // Tìm existing record
            TypedQuery<ReadingHistoryEntity> query = em.createQuery(
                "SELECT rh FROM ReadingHistoryEntity rh WHERE rh.user.id = :userId AND rh.manga.id = :mangaId",
                ReadingHistoryEntity.class
            );
            query.setParameter("userId", userId);
            query.setParameter("mangaId", mangaId);
            
            ReadingHistoryEntity entity;
            List<ReadingHistoryEntity> results = query.getResultList();
            
            if (!results.isEmpty()) {
                // Update existing
                entity = results.get(0);
                entity.setChapterId(chapterId);
                entity.setCurrentPage(currentPage);
                entity.setCompleted(completed != null ? completed : false);
                entity.setLastReadAt(LocalDateTime.now());
            } else {
                // Create new
                entity = new ReadingHistoryEntity();
                UserEntity user = em.find(UserEntity.class, userId);
                MangaEntity manga = em.find(MangaEntity.class, mangaId);
                
                if (user == null || manga == null) {
                    em.getTransaction().rollback();
                    return null;
                }
                
                entity.setUser(user);
                entity.setManga(manga);
                entity.setChapterId(chapterId);
                entity.setCurrentPage(currentPage);
                entity.setCompleted(completed != null ? completed : false);
                entity.setLastReadAt(LocalDateTime.now());
                
                em.persist(entity);
            }

            em.getTransaction().commit();
            return toModel(entity);
        } catch (Exception ex) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw ex;
        } finally {
            em.close();
        }
    }

    public List<ReadingHistory> findByUserId(Long userId) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            TypedQuery<ReadingHistoryEntity> query = em.createQuery(
                "SELECT rh FROM ReadingHistoryEntity rh WHERE rh.user.id = :userId ORDER BY rh.lastReadAt DESC",
                ReadingHistoryEntity.class
            );
            query.setParameter("userId", userId);
            return query.getResultList().stream().map(this::toModel).collect(Collectors.toList());
        } finally {
            em.close();
        }
    }

    public Optional<ReadingHistory> findByUserAndManga(Long userId, Long mangaId) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            TypedQuery<ReadingHistoryEntity> query = em.createQuery(
                "SELECT rh FROM ReadingHistoryEntity rh WHERE rh.user.id = :userId AND rh.manga.id = :mangaId",
                ReadingHistoryEntity.class
            );
            query.setParameter("userId", userId);
            query.setParameter("mangaId", mangaId);
            List<ReadingHistoryEntity> results = query.getResultList();
            return results.isEmpty() ? Optional.empty() : Optional.of(toModel(results.get(0)));
        } finally {
            em.close();
        }
    }

    public boolean delete(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            ReadingHistoryEntity entity = em.find(ReadingHistoryEntity.class, id);
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

    private ReadingHistory toModel(ReadingHistoryEntity entity) {
        ReadingHistory model = new ReadingHistory();
        model.setId(String.valueOf(entity.getId()));
        model.setUserId(String.valueOf(entity.getUser().getId()));
        model.setMangaId(String.valueOf(entity.getManga().getId()));
        model.setMangaTitle(entity.getManga().getTitle());
        model.setMangaCover(entity.getManga().getCover());
        model.setChapterId(entity.getChapterId());
        model.setCurrentPage(entity.getCurrentPage());
        model.setLastReadAt(entity.getLastReadAt());
        model.setCompleted(entity.getCompleted());
        return model;
    }
}
