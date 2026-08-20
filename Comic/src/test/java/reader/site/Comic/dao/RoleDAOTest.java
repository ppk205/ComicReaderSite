package reader.site.Comic.dao;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reader.site.Comic.TestDb;
import reader.site.Comic.model.UserRole;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for role/permission seeding and lookup.
 */
class RoleDAOTest {

    private static RoleDAO roleDAO;

    @BeforeAll
    static void setUp() {
        TestDb.ensureRolesSeeded();
        roleDAO = new RoleDAO();
    }

    @Test
    void seedsFourDefaultRoles() {
        List<UserRole> roles = roleDAO.findAll();
        assertTrue(roles.size() >= 4, "expected at least 4 seeded roles, got " + roles.size());
    }

    @Test
    void findByIdReturnsAdminRole() {
        UserRole admin = roleDAO.findById("role-admin");
        assertNotNull(admin);
        assertEquals("admin", admin.getName());
    }

    @Test
    void findByIdReturnsNullForUnknown() {
        assertNull(roleDAO.findById("role-does-not-exist"));
    }

    @Test
    void findByNameIsCaseInsensitive() {
        UserRole byLower = roleDAO.findByName("admin");
        UserRole byUpper = roleDAO.findByName("ADMIN");
        assertNotNull(byLower);
        assertNotNull(byUpper);
        assertEquals(byLower.getId(), byUpper.getId());
    }

    @Test
    void adminRoleHasDashboardPermission() {
        UserRole admin = roleDAO.findById("role-admin");
        assertNotNull(admin);
        assertTrue(admin.getPermissions().stream().anyMatch(p -> "perm.dashboard.read".equals(p.getId())),
                "admin role should include dashboard access");
    }

    @Test
    void regularUserRoleLacksDashboardPermission() {
        UserRole user = roleDAO.findById("role-user");
        assertNotNull(user);
        assertTrue(user.getPermissions().stream().noneMatch(p -> "perm.dashboard.read".equals(p.getId())),
                "regular user role must not include dashboard access");
    }
}
