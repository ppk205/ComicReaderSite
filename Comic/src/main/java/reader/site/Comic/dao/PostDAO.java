package reader.site.Comic.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import reader.site.Comic.model.Post;
import reader.site.Comic.persistence.JPAUtil; // giữ nguyên util JPA của bạn

import java.util.List;
import java.util.Optional;

public class PostDAO {

    public Post create(Post post) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(post);
            em.getTransaction().commit();
            return post;
        } catch (RuntimeException e) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public Optional<Post> findById(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Post p = em.find(Post.class, id);
            return Optional.ofNullable(p);
        } finally {
            em.close();
        }
    }

    /**
     * Liệt kê post; nếu mangaId != null thì lọc theo mangaId.
     * Mặc định trả mới nhất trước (DESC).
     */
    public List<Post> list(Long mangaId, Integer limit) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            String jpql = "SELECT p FROM Post p " +
                    (mangaId != null ? "WHERE p.mangaId = :mid " : "") +
                    "ORDER BY p.createdAt DESC";
            TypedQuery<Post> q = em.createQuery(jpql, Post.class);
            if (mangaId != null) q.setParameter("mid", mangaId);
            if (limit != null && limit > 0) q.setMaxResults(limit);
            return q.getResultList();
        } finally {
            em.close();
        }
    }
}
