package reader.site.Comic.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import reader.site.Comic.model.Comment;
import reader.site.Comic.persistence.JPAUtil;

import java.util.List;

public class CommentDAO {

    public Comment create(Comment comment) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(comment);
            em.getTransaction().commit();
            return comment;
        } catch (RuntimeException e) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    /**
     * Lấy comment theo postId. Mới nhất trước (DESC).
     */
    public List<Comment> listByPost(Long postId, Integer limit) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            String jpql = "SELECT c FROM Comment c WHERE c.post.id = :pid ORDER BY c.createdAt DESC";
            TypedQuery<Comment> q = em.createQuery(jpql, Comment.class);
            q.setParameter("pid", postId);
            if (limit != null && limit > 0) q.setMaxResults(limit);
            return q.getResultList();
        } finally {
            em.close();
        }
    }
}
