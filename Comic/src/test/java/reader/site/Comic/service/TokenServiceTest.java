package reader.site.Comic.service;

import org.junit.jupiter.api.Test;
import reader.site.Comic.model.User;
import reader.site.Comic.model.UserRole;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the in-memory token service, including the security fix that removed
 * sliding expiration (vuln #25).
 */
class TokenServiceTest {

    private User user(String id, String roleName) {
        User user = new User();
        user.setId(id);
        user.setUsername("tester-" + id);
        UserRole role = new UserRole();
        role.setId("role-" + roleName);
        role.setName(roleName);
        user.setRole(role);
        return user;
    }

    @Test
    void issueTokenReturnsUniqueTokens() {
        TokenService service = new TokenService();
        String t1 = service.issueToken(user("u1", "user"));
        String t2 = service.issueToken(user("u2", "user"));
        assertNotNull(t1);
        assertNotNull(t2);
        assertNotEquals(t1, t2);
    }

    @Test
    void resolveReturnsIssuedUser() {
        TokenService service = new TokenService();
        User user = user("u1", "user");
        String token = service.issueToken(user);

        User resolved = service.resolve(token);
        assertNotNull(resolved);
        assertEquals("u1", resolved.getId());
    }

    @Test
    void resolveRejectsUnknownToken() {
        TokenService service = new TokenService();
        assertNull(service.resolve("not-a-real-token"));
    }

    @Test
    void resolveRejectsNullAndBlankToken() {
        TokenService service = new TokenService();
        assertNull(service.resolve(null));
        assertNull(service.resolve(""));
        assertNull(service.resolve("   "));
    }

    @Test
    void invalidateRemovesToken() {
        TokenService service = new TokenService();
        String token = service.issueToken(user("u1", "user"));
        assertNotNull(service.resolve(token));

        service.invalidate(token);
        assertNull(service.resolve(token), "token must not resolve after invalidation");
    }

    @Test
    void invalidateNullIsSafe() {
        TokenService service = new TokenService();
        assertDoesNotThrow(() -> service.invalidate(null));
    }

    @Test
    void tokenResolvesWithinLifetime() {
        // A freshly issued token must resolve (12h absolute lifetime).
        TokenService service = new TokenService();
        String token = service.issueToken(user("u1", "admin"));
        User resolved = service.resolve(token);
        assertNotNull(resolved);
        assertEquals("admin", resolved.getRole().getName());
    }
}
