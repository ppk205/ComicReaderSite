package reader.site.Comic.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import reader.site.Comic.entity.PermissionEntity;
import reader.site.Comic.entity.UserRoleEntity;
import reader.site.Comic.model.Permission;
import reader.site.Comic.model.UserRole;
import reader.site.Comic.persistence.JPAUtil;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

public class RoleDAO {

    public RoleDAO() {
        seedDefaults();
    }

    public List<UserRole> findAll() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            TypedQuery<UserRoleEntity> query = em.createQuery("SELECT r FROM UserRoleEntity r", UserRoleEntity.class);
            return query.getResultList().stream().map(this::toModel).collect(Collectors.toList());
        } finally {
            em.close();
        }
    }

    public UserRole findById(String id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            UserRoleEntity entity = em.find(UserRoleEntity.class, id);
            return entity != null ? toModel(entity) : null;
        } finally {
            em.close();
        }
    }

    public UserRole findByName(String name) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            TypedQuery<UserRoleEntity> query = em.createQuery(
                    "SELECT r FROM UserRoleEntity r WHERE LOWER(r.name) = :name", UserRoleEntity.class);
            query.setParameter("name", name.toLowerCase());
            List<UserRoleEntity> results = query.getResultList();
            if (results.isEmpty()) {
                return null;
            }
            return toModel(results.get(0));
        } finally {
            em.close();
        }
    }

    private void seedDefaults() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            long count = em.createQuery("SELECT COUNT(r) FROM UserRoleEntity r", Long.class).getSingleResult();
            if (count > 0) {
                return;
            }

            em.getTransaction().begin();

            PermissionEntity createManga = permission(em, "perm.manga.create", "Create Manga", "manga", "create", "Can create manga");
            PermissionEntity readManga = permission(em, "perm.manga.read", "Read Manga", "manga", "read", "Can read manga");
            PermissionEntity updateManga = permission(em, "perm.manga.update", "Update Manga", "manga", "update", "Can update manga");
            PermissionEntity deleteManga = permission(em, "perm.manga.delete", "Delete Manga", "manga", "delete", "Can delete manga");

            PermissionEntity createUser = permission(em, "perm.user.create", "Create User", "user", "create", "Can create users");
            PermissionEntity readUser = permission(em, "perm.user.read", "Read User", "user", "read", "Can read users");
            PermissionEntity updateUser = permission(em, "perm.user.update", "Update User", "user", "update", "Can update users");
            PermissionEntity deleteUser = permission(em, "perm.user.delete", "Delete User", "user", "delete", "Can delete users");

            PermissionEntity dashboardAccess = permission(em, "perm.dashboard.read", "Dashboard Access", "dashboard", "read", "Can access dashboard");

            UserRoleEntity admin = new UserRoleEntity();
            admin.setId("role-admin");
            admin.setName("admin");
            admin.setDescription("System Administrator");
            admin.setPermissions(new LinkedHashSet<>(List.of(
                    createManga,
                    readManga,
                    updateManga,
                    deleteManga,
                    createUser,
                    readUser,
                    updateUser,
                    deleteUser,
                    dashboardAccess
            )));
            em.persist(admin);

            UserRoleEntity moderator = new UserRoleEntity();
            moderator.setId("role-moderator");
            moderator.setName("moderator");
            moderator.setDescription("Content Moderator");
            moderator.setPermissions(new LinkedHashSet<>(List.of(
                    readManga,
                    updateManga,
                    dashboardAccess
            )));
            em.persist(moderator);

            UserRoleEntity editor = new UserRoleEntity();
            editor.setId("role-editor");
            editor.setName("editor");
            editor.setDescription("Content Editor");
            editor.setPermissions(new LinkedHashSet<>(List.of(
                    createManga,
                    readManga,
                    updateManga,
                    dashboardAccess
            )));
            em.persist(editor);

            UserRoleEntity user = new UserRoleEntity();
            user.setId("role-user");
            user.setName("user");
            user.setDescription("Regular User");
            user.setPermissions(new LinkedHashSet<>(List.of(readManga)));
            em.persist(user);

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

    private PermissionEntity permission(EntityManager em,
                                        String id,
                                        String name,
                                        String resource,
                                        String action,
                                        String description) {
        PermissionEntity existing = em.find(PermissionEntity.class, id);
        if (existing != null) {
            return existing;
        }
        PermissionEntity permission = new PermissionEntity();
        permission.setId(id);
        permission.setName(name);
        permission.setResource(resource);
        permission.setAction(action);
        permission.setDescription(description);
        em.persist(permission);
        return permission;
    }

    public UserRole toModel(UserRoleEntity entity) {
        UserRole role = new UserRole();
        role.setId(entity.getId());
        role.setName(entity.getName());
        role.setDescription(entity.getDescription());
        role.setPermissions(entity.getPermissions().stream()
                .map(this::toModel)
                .collect(Collectors.toList()));
        return role;
    }

    public Permission toModel(PermissionEntity entity) {
        Permission permission = new Permission();
        permission.setId(entity.getId());
        permission.setName(entity.getName());
        permission.setResource(entity.getResource());
        permission.setAction(entity.getAction());
        permission.setDescription(entity.getDescription());
        return permission;
    }

    public UserRoleEntity findEntityById(EntityManager em, String id) {
        return em.find(UserRoleEntity.class, id);
    }

    public UserRoleEntity findEntityByName(EntityManager em, String name) {
        TypedQuery<UserRoleEntity> query = em.createQuery(
                "SELECT r FROM UserRoleEntity r WHERE LOWER(r.name) = :name", UserRoleEntity.class);
        query.setParameter("name", name.toLowerCase());
        List<UserRoleEntity> result = query.getResultList();
        return result.isEmpty() ? null : result.get(0);
    }
}
