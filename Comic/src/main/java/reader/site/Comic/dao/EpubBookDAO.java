package reader.site.Comic.dao;

import jakarta.persistence.*;
import reader.site.Comic.model.EpubBook;

import java.util.List;

public class EpubBookDAO {

    // 500 MB limit
    private static final long USER_STORAGE_LIMIT = 500 * 1024 * 1024;
    private final EntityManagerFactory emf;

    public EpubBookDAO() {
        // Tên của persistence unit trong persistence.xml
        emf = Persistence.createEntityManagerFactory("comicPU");
    }

    /**
     * Lấy tổng dung lượng đã sử dụng của một người dùng.
     */
    public long getUserUsedStorage(String userId) {
        EntityManager em = emf.createEntityManager();
        try {
            // JPQL để tính tổng dung lượng file theo userId
            String jpql = "SELECT SUM(e.fileSizeInBytes) FROM EpubBook e WHERE e.userId = :userId";
            TypedQuery<Long> query = em.createQuery(jpql, Long.class);
            query.setParameter("userId", userId);

            Long usedBytes = query.getSingleResult();
            return usedBytes != null ? usedBytes : 0L;
        } finally {
            em.close();
        }
    }

    /**
     * Thêm một tệp Epub mới. Kiểm tra giới hạn dung lượng trước khi thêm.
     */
    public EpubBook insert(EpubBook book) throws Exception {
        if (book.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required.");
        }

        // 1. Kiểm tra giới hạn dung lượng
        long used = getUserUsedStorage(book.getUserId());
        if (used + book.getFileSizeInBytes() > USER_STORAGE_LIMIT) {
            throw new Exception("Storage limit (500MB) exceeded for user: " + book.getUserId());
        }

        // 2. Lưu vào Database
        EntityManager em = emf.createEntityManager();
        em.getTransaction().begin();
        try {
            em.persist(book);
            em.getTransaction().commit();
            return book;
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw e;
        } finally {
            em.close();
        }
    }

    /**
     * Lấy tất cả tệp Epub của một người dùng.
     */
    public List<EpubBook> findAllByUserId(String userId) {
        EntityManager em = emf.createEntityManager();
        try {
            TypedQuery<EpubBook> query = em.createQuery(
                    "SELECT e FROM EpubBook e WHERE e.userId = :userId", EpubBook.class);
            query.setParameter("userId", userId);
            return query.getResultList();
        } finally {
            em.close();
        }
    }

    public EpubBook findById(Long id) {
        EntityManager em = emf.createEntityManager();
        try {
            return em.find(EpubBook.class, id);
        } finally {
            em.close();
        }
    }

    public boolean deleteById(Long id) {
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            EpubBook book = em.find(EpubBook.class, id);
            if (book == null) {
                tx.rollback();
                return false;
            }

            em.remove(book);
            tx.commit();

            return true;
        } catch (Exception e) {
            if (tx.isActive()) tx.rollback();
            throw e;
        } finally {
            em.close();
        }
    }
}