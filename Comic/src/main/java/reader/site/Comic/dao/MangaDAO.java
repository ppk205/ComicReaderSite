package reader.site.Comic.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import reader.site.Comic.entity.MangaEntity;
import reader.site.Comic.model.Manga;
import reader.site.Comic.persistence.JPAUtil;

import java.util.List;
import java.util.stream.Collectors;

public class MangaDAO {

    public Manga insert(Manga manga) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            MangaEntity entity = new MangaEntity();
            entity.setTitle(manga.getTitle());
            entity.setCover(manga.getCover());
            entity.setChapters(manga.getChapters());
            em.persist(entity);
            em.getTransaction().commit();
            manga.setId(String.valueOf(entity.getId()));
            return manga;
        } catch (Exception ex) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw ex;
        } finally {
            em.close();
        }
    }

    public List<Manga> findAll() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            TypedQuery<MangaEntity> query = em.createQuery("SELECT m FROM MangaEntity m", MangaEntity.class);
            return query.getResultList().stream().map(this::toModel).collect(Collectors.toList());
        } finally {
            em.close();
        }
    }

    public Manga findById(String id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Long entityId = parseId(id);
            if (entityId == null) {
                return null;
            }
            MangaEntity entity = em.find(MangaEntity.class, entityId);
            return entity != null ? toModel(entity) : null;
        } finally {
            em.close();
        }
    }

    public boolean update(String id, Manga manga) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            Long entityId = parseId(id);
            if (entityId == null) {
                em.getTransaction().rollback();
                return false;
            }
            MangaEntity entity = em.find(MangaEntity.class, entityId);
            if (entity == null) {
                em.getTransaction().rollback();
                return false;
            }
            entity.setTitle(manga.getTitle());
            entity.setCover(manga.getCover());
            entity.setChapters(manga.getChapters());
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

    public boolean delete(String id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            Long entityId = parseId(id);
            if (entityId == null) {
                em.getTransaction().rollback();
                return false;
            }
            MangaEntity entity = em.find(MangaEntity.class, entityId);
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

    private Manga toModel(MangaEntity entity) {
        Manga manga = new Manga();
        manga.setId(String.valueOf(entity.getId()));
        manga.setTitle(entity.getTitle());
        manga.setCover(entity.getCover());
        manga.setChapters(entity.getChapters());
        return manga;
    }

    private Long parseId(String id) {
        try {
            return id != null ? Long.parseLong(id) : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}