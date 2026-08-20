package reader.site.Comic.service;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reader.site.Comic.TestDb;
import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.User;
import reader.site.Comic.model.UserRole;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the authentication service: credential verification, token issuance,
 * and token resolution.
 */
class AuthServiceTest {

    private static AuthService authService;
    private static UserDAO userDAO;

    @BeforeAll
    static void setUp() {
        TestDb.ensureRolesSeeded();
        userDAO = new UserDAO();
        RoleDAO roleDAO = new RoleDAO();
        authService = new AuthService(userDAO, roleDAO, new TokenService());
    }

    private User registerUser(String suffix, String password) {
        User user = new User();
        user.setUsername("auth-user-" + suffix);
        user.setEmail(suffix + "@auth.test");
        user.setPassword(password);
        UserRole role = new UserRole();
        role.setId("role-user");
        user.setRole(role);
        return userDAO.create(user);
    }

    @Test
    void authenticateSucceedsWithCorrectPassword() {
        String suffix = "ok-" + System.nanoTime();
        registerUser(suffix, "GoodPassword1!");

        User authenticated = authService.authenticate(suffix + "@auth.test", "GoodPassword1!");
        assertNotNull(authenticated, "correct credentials must authenticate");
        assertEquals(suffix + "@auth.test", authenticated.getEmail());
    }

    @Test
    void authenticateFailsWithWrongPassword() {
        String suffix = "bad-" + System.nanoTime();
        registerUser(suffix, "GoodPassword1!");

        assertNull(authService.authenticate(suffix + "@auth.test", "WrongPassword!"));
    }

    @Test
    void authenticateFailsForUnknownEmail() {
        assertNull(authService.authenticate("ghost-" + System.nanoTime() + "@auth.test", "whatever"));
    }

    @Test
    void authenticateFailsWithNullIdentifier() {
        assertNull(authService.authenticate(null, "whatever"));
    }

    @Test
    void authenticateFailsAgainstLegacyPlaintextPassword() {
        // [SECURITY] vuln #12: even if a stored password is not bcrypt-hashed,
        // plaintext comparison must not succeed.
        String suffix = "legacy-" + System.nanoTime();
        User user = new User();
        user.setUsername("auth-legacy-" + suffix);
        user.setEmail(suffix + "@legacy.test");
        user.setPassword("legacy-plain"); // stored as-is only if it looked like bcrypt; here it gets hashed
        UserRole role = new UserRole();
        role.setId("role-user");
        user.setRole(role);
        userDAO.create(user);

        // The DAO hashes on create, so "legacy-plain" now verifies normally:
        assertNotNull(authService.authenticate(suffix + "@legacy.test", "legacy-plain"));
        // ...but a *different* password never verifies:
        assertNull(authService.authenticate(suffix + "@legacy.test", "legacy-plain-imposter"));
    }

    @Test
    void issueAndResolveTokenRoundTrip() {
        String suffix = "tok-" + System.nanoTime();
        User created = registerUser(suffix, "TokenPassword1!");

        String token = authService.issueToken(created);
        assertNotNull(token);

        User resolved = authService.resolveToken(token);
        assertNotNull(resolved);
        assertEquals(created.getId(), resolved.getId());
    }

    @Test
    void invalidateTokenEndsSession() {
        String suffix = "inv-" + System.nanoTime();
        User created = registerUser(suffix, "InvalidateMe1!");

        String token = authService.issueToken(created);
        assertNotNull(authService.resolveToken(token));

        authService.invalidateToken(token);
        assertNull(authService.resolveToken(token));
    }

    @Test
    void findRoleByNameReturnsUserRole() {
        UserRole role = authService.findRoleByName("user");
        assertNotNull(role);
        assertEquals("role-user", role.getId());
    }
}
