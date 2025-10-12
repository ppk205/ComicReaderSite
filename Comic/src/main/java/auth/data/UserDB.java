package auth.data;

import auth.business.User;
import jakarta.persistence.*;
import java.util.List;

public class UserDB {
    public static List<User> findAll() {
        var em = DBUtil.getEmFactory().createEntityManager();
        try { return em.createQuery("SELECT u FROM User u ORDER BY u.userId", User.class).getResultList(); }
        finally { em.close(); }
    }

    public static User findByUsername(String username) {
        var em = DBUtil.getEmFactory().createEntityManager();
        try {
            return em.createQuery("SELECT u FROM User u WHERE u.username=:u", User.class)
                    .setParameter("u", username).getSingleResult();
        } catch (NoResultException e) { return null; }
        finally { em.close(); }
    }

    public static void insert(User user) {
        var em = DBUtil.getEmFactory().createEntityManager();
        var tx = em.getTransaction();
        tx.begin();
        try { em.persist(user); tx.commit(); }
        catch (Exception e) { tx.rollback(); throw e; }
        finally { em.close(); }
    }

    public static void update(User user) {
        var em = DBUtil.getEmFactory().createEntityManager();
        var tx = em.getTransaction();
        tx.begin();
        try { em.merge(user); tx.commit(); }
        catch (Exception e) { tx.rollback(); throw e; }
        finally { em.close(); }
    }

    public static void delete(User user) {
        var em = DBUtil.getEmFactory().createEntityManager();
        var tx = em.getTransaction();
        tx.begin();
        try { em.remove(em.merge(user)); tx.commit(); }
        catch (Exception e) { tx.rollback(); throw e; }
        finally { em.close(); }
    }
}