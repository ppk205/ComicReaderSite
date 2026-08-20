package reader.site.Comic.dao;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reader.site.Comic.TestDb;
import reader.site.Comic.model.User;
import reader.site.Comic.model.UserRole;
import reader.site.Comic.util.PasswordUtil;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for user CRUD, password hashing on create/update, and the
 * activation / password-reset token flows.
 */
class UserDAOTest {

    private static UserDAO userDAO;

    @BeforeAll
    static void setUp() {
        TestDb.ensureRolesSeeded();
        userDAO = new UserDAO();
    }

    private User newUser(String suffix) {
        User user = new User();
        user.setUsername("dao-user-" + suffix);
        user.setEmail(suffix + "@dao.test");
        user.setPassword("PlainPassword1!");
        UserRole role = new UserRole();
        role.setId("role-user");
        user.setRole(role);
        return user;
    }

    @Test
    void createHashesPasswordWithBcrypt() {
        User created = userDAO.create(newUser("hash-" + System.nanoTime()));
        assertNotNull(created.getId());
        // The returned model carries the stored (hashed) password — it must be bcrypt.
        assertTrue(PasswordUtil.isBCryptHash(created.getPassword()),
                "stored password must be a bcrypt hash");
        assertNotEquals("PlainPassword1!", created.getPassword());
    }

    @Test
    void findByEmailReturnsCreatedUser() {
        String suffix = "find-" + System.nanoTime();
        User created = userDAO.create(newUser(suffix));

        Optional<User> found = userDAO.findByEmail(suffix + "@dao.test");
        assertTrue(found.isPresent());
        assertEquals(created.getId(), found.get().getId());
    }

    @Test
    void findByEmailReturnsEmptyForUnknown() {
        assertTrue(userDAO.findByEmail("nobody-" + System.nanoTime() + "@nowhere.test").isEmpty());
    }

    @Test
    void findByUsernameIsCaseInsensitive() {
        String suffix = "case-" + System.nanoTime();
        userDAO.create(newUser(suffix));

        Optional<User> found = userDAO.findByUsername("DAO-USER-" + suffix.toUpperCase());
        assertTrue(found.isPresent(), "username lookup should be case-insensitive");
    }

    @Test
    void updateChangesUsernameAndHashesNewPassword() {
        User created = userDAO.create(newUser("upd-" + System.nanoTime()));

        User updates = new User();
        updates.setUsername("renamed-" + created.getId().substring(0, 8));
        updates.setPassword("NewPassword2!");
        User updated = userDAO.update(created.getId(), updates);

        assertNotNull(updated);
        assertEquals(updates.getUsername(), updated.getUsername());
        assertTrue(PasswordUtil.verify("NewPassword2!", updated.getPassword()));
    }

    @Test
    void updateReturnsNullForUnknownId() {
        assertNull(userDAO.update("no-such-user-id", new User()));
    }

    @Test
    void deleteRemovesUser() {
        User created = userDAO.create(newUser("del-" + System.nanoTime()));
        assertTrue(userDAO.delete(created.getId()));
        assertTrue(userDAO.findById(created.getId()).isEmpty());
    }

    @Test
    void deleteReturnsFalseForUnknownId() {
        assertFalse(userDAO.delete("no-such-user-id"));
    }

    @Test
    void findAllSupportsSearchAndPagination() {
        String suffix = "page-" + System.nanoTime();
        userDAO.create(newUser(suffix + "a"));
        userDAO.create(newUser(suffix + "b"));

        List<User> page = userDAO.findAll(1, 10, suffix, null, null);
        assertEquals(2, page.size(), "search should find both users created with suffix " + suffix);
        assertEquals(2, userDAO.count(suffix, null, null));
    }

    @Test
    void activationTokenFlowActivatesPendingUser() {
        User created = userDAO.create(newUser("act-" + System.nanoTime()));
        String token = userDAO.generateActivationToken(created.getId());
        assertNotNull(token);

        // user is pending until activated
        assertEquals("pending", userDAO.findById(created.getId()).get().getStatus());

        assertTrue(UserDAO.activateUser(token));
        assertEquals("active", userDAO.findById(created.getId()).get().getStatus());

        // token is single-use
        assertFalse(UserDAO.activateUser(token));
    }

    @Test
    void activateUserRejectsUnknownToken() {
        assertFalse(UserDAO.activateUser("bogus-token"));
    }

    @Test
    void resetPasswordFlowReplacesPassword() {
        User created = userDAO.create(newUser("rst-" + System.nanoTime()));
        String email = created.getEmail();

        String token = userDAO.generateResetToken(email);
        assertNotNull(token);

        assertTrue(UserDAO.resetPassword(token, "ResetPassword3!"));

        Optional<User> reloaded = userDAO.findByEmail(email);
        assertTrue(reloaded.isPresent());
        assertTrue(PasswordUtil.verify("ResetPassword3!", reloaded.get().getPassword()));

        // token is single-use
        assertFalse(UserDAO.resetPassword(token, "AnotherPassword4!"));
    }

    @Test
    void generateResetTokenReturnsNullForUnknownEmail() {
        assertNull(userDAO.generateResetToken("ghost-" + System.nanoTime() + "@nowhere.test"));
    }
}
