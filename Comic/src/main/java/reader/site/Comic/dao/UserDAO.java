package reader.site.Comic.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import reader.site.Comic.entity.UserEntity;
import reader.site.Comic.entity.UserRoleEntity;
import reader.site.Comic.model.User;
import reader.site.Comic.model.UserRole;
import reader.site.Comic.persistence.JPAUtil;
import reader.site.Comic.util.PasswordUtil;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class UserDAO {
    private final RoleDAO roleDAO = new RoleDAO();

    public UserDAO() {
        seedDefaults();
    }

    public List<User> findAll(int page, int limit, String search, String roleName, String status) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            CriteriaBuilder cb = em.getCriteriaBuilder();
            CriteriaQuery<UserEntity> cq = cb.createQuery(UserEntity.class);
            Root<UserEntity> root = cq.from(UserEntity.class);

            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }

            if (roleName != null && !roleName.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("role").get("name")), roleName.toLowerCase()));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.toLowerCase()));
            }

            cq.select(root)
                    .where(predicates.toArray(new Predicate[0]))
                    .orderBy(cb.desc(root.get("createdAt")));

            TypedQuery<UserEntity> query = em.createQuery(cq);
            query.setFirstResult((Math.max(page, 1) - 1) * Math.max(limit, 1));
            query.setMaxResults(Math.max(limit, 1));

            return query.getResultList().stream().map(this::toModel).collect(java.util.stream.Collectors.toList());
        } finally {
            em.close();
        }
    }

    public int count(String search, String roleName, String status) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            CriteriaBuilder cb = em.getCriteriaBuilder();
            CriteriaQuery<Long> cq = cb.createQuery(Long.class);
            Root<UserEntity> root = cq.from(UserEntity.class);

            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }

            if (roleName != null && !roleName.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("role").get("name")), roleName.toLowerCase()));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.toLowerCase()));
            }

            cq.select(cb.count(root)).where(predicates.toArray(new Predicate[0]));
            return em.createQuery(cq).getSingleResult().intValue();
        } finally {
            em.close();
        }
    }

    public Optional<User> findById(String id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            UserEntity entity = em.find(UserEntity.class, id);
            return Optional.ofNullable(entity).map(this::toModel);
        } finally {
            em.close();
        }
    }

    public Optional<User> findByUsername(String username) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            TypedQuery<UserEntity> query = em.createQuery(
                    "SELECT u FROM UserEntity u WHERE LOWER(u.username) = :username", UserEntity.class);
            query.setParameter("username", username.toLowerCase());
            List<UserEntity> results = query.getResultList();
            if (results.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(toModel(results.get(0)));
        } finally {
            em.close();
        }
    }

    public User create(User user) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            UserEntity entity = new UserEntity();
            applyToEntity(em, entity, user);
            em.persist(entity);
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

    public User update(String id, User updates) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            UserEntity entity = em.find(UserEntity.class, id);
            if (entity == null) {
                em.getTransaction().rollback();
                return null;
            }
            applyPartialUpdate(em, entity, updates);
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

    public boolean delete(String id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            UserEntity entity = em.find(UserEntity.class, id);
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

    public List<User> findAllUsers() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            TypedQuery<UserEntity> query = em.createQuery("SELECT u FROM UserEntity u", UserEntity.class);
            return query.getResultList().stream().map(this::toModel).collect(java.util.stream.Collectors.toList());
        } finally {
            em.close();
        }
    }

    /**
     * Apply all fields from source User to entity. Password will be hashed with bcrypt
     * if it's not already a bcrypt hash.
     */
    private void applyToEntity(EntityManager em, UserEntity entity, User source) {
        entity.setUsername(source.getUsername());
        entity.setEmail(source.getEmail());

        if (source.getPassword() != null) {
            String pw = source.getPassword();
            // If already bcrypt hash, leave it. Otherwise hash it.
            if (PasswordUtil.isBCryptHash(pw)) {
                entity.setPassword(pw);
            } else {
                entity.setPassword(PasswordUtil.hash(pw));
            }
        }

        entity.setStatus(source.getStatus() != null ? source.getStatus() : "active");
        if (source.getCreatedAt() != null) {
            entity.setCreatedAt(parseInstant(source.getCreatedAt()));
        }
        if (source.getUpdatedAt() != null) {
            entity.setUpdatedAt(parseInstant(source.getUpdatedAt()));
        }
        if (source.getLastLogin() != null) {
            entity.setLastLogin(parseInstant(source.getLastLogin()));
        }
        UserRoleEntity role = null;
        if (source.getRole() != null && source.getRole().getId() != null) {
            role = roleDAO.findEntityById(em, source.getRole().getId());
        }
        if (role == null && source.getRole() != null && source.getRole().getName() != null) {
            role = roleDAO.findEntityByName(em, source.getRole().getName());
        }
        if (role != null) {
            entity.setRole(role);
        } else {
            // default to regular user role
            entity.setRole(roleDAO.findEntityById(em, "role-user"));
        }
        if (source.getId() != null) {
            entity.setId(source.getId());
        }
    }

    /**
     * Apply only provided updates to existing entity. If password present and not empty,
     * it will be hashed before being set (unless it's already a bcrypt hash).
     */
    private void applyPartialUpdate(EntityManager em, UserEntity entity, User updates) {
        if (updates.getUsername() != null) {
            entity.setUsername(updates.getUsername());
        }
        if (updates.getEmail() != null) {
            entity.setEmail(updates.getEmail());
        }
        if (updates.getPassword() != null && !updates.getPassword().isBlank()) {
            String pw = updates.getPassword();
            if (PasswordUtil.isBCryptHash(pw)) {
                entity.setPassword(pw);
            } else {
                entity.setPassword(PasswordUtil.hash(pw));
            }
        }
        if (updates.getStatus() != null) {
            entity.setStatus(updates.getStatus());
        }
        if (updates.getLastLogin() != null) {
            entity.setLastLogin(parseInstant(updates.getLastLogin()));
        }
        if (updates.getRole() != null) {
            UserRoleEntity role = null;
            if (updates.getRole().getId() != null) {
                role = roleDAO.findEntityById(em, updates.getRole().getId());
            }
            if (role == null && updates.getRole().getName() != null) {
                role = roleDAO.findEntityByName(em, updates.getRole().getName());
            }
            if (role != null) {
                entity.setRole(role);
            }
        }
    }

    private User toModel(UserEntity entity) {
        User user = new User();
        user.setId(entity.getId());
        user.setUsername(entity.getUsername());
        user.setEmail(entity.getEmail());
        // keep the hashed password in model for server-side usage (transient in model ensures not serialized)
        user.setPassword(entity.getPassword());
        user.setStatus(entity.getStatus());
        user.setCreatedAt(formatInstant(entity.getCreatedAt()));
        user.setUpdatedAt(formatInstant(entity.getUpdatedAt()));
        user.setLastLogin(formatInstant(entity.getLastLogin()));
        user.setRole(roleDAO.toModel(entity.getRole()));
        return user;
    }

    private void seedDefaults() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            long count = em.createQuery("SELECT COUNT(u) FROM UserEntity u", Long.class).getSingleResult();
            if (count > 0) {
                return;
            }

            em.getTransaction().begin();
            createDefaultUser(em, "admin-001", "admin", "admin@comicreader.com", "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", "role-admin");
            createDefaultUser(em, "mod-001", "moderator", "mod@comicreader.com", "4c8425b174053ea6935b29c2b0e0aa4e2eab1a01b784e6ac91b8bdce9c26235a", "role-moderator");
            createDefaultUser(em, "editor-001", "editor", "editor@comicreader.com", "ef5e5a1fb95055e0e56cccf98a41e784a132c14e7f6e1ba244302f0e72b29baf", "role-editor");
            createDefaultUser(em, "user-001", "reader", "reader@comicreader.com", "128a1cb71e153e042708de7ea043d9a030fc1a83fa258788e7ef7aa23309eb72", "role-user");
            em.getTransaction().commit();
        } catch (Exception ex) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw ex;
        } finally {
            em.close();
        }
    }

    private void createDefaultUser(EntityManager em,
                                   String id,
                                   String username,
                                   String email,
                                   String password,
                                   String roleId) {
        UserEntity entity = new UserEntity();
        entity.setId(id);
        entity.setUsername(username);
        entity.setEmail(email);
        // keep legacy seeded hashes as-is (they are not bcrypt). PasswordUtil.verify has a fallback.
        entity.setPassword(password);
        entity.setStatus("active");
        entity.setRole(roleDAO.findEntityById(em, roleId));
        entity.setCreatedAt(Instant.now().minusSeconds(86400L));
        entity.setUpdatedAt(Instant.now().minusSeconds(3600L));
        entity.setLastLogin(Instant.now().minusSeconds(600L));
        em.persist(entity);
    }

    private String formatInstant(Instant instant) {
        return instant != null ? instant.toString() : null;
    }

    private Instant parseInstant(String value) {
        try {
            return value != null ? Instant.parse(value) : null;
        } catch (Exception ex) {
            return null;
        }
    }
}