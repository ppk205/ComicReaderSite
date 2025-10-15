package reader.site.Comic.service;

import reader.site.Comic.dao.RoleDAO;
import reader.site.Comic.dao.UserDAO;
import reader.site.Comic.model.User;
import reader.site.Comic.model.UserRole;
import reader.site.Comic.util.PasswordUtil;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

public class AuthService {
    private final UserDAO userDAO;
    private final RoleDAO roleDAO;
    private final TokenService tokenService;

    public AuthService(UserDAO userDAO, RoleDAO roleDAO, TokenService tokenService) {
        this.userDAO = userDAO;
        this.roleDAO = roleDAO;
        this.tokenService = tokenService;
    }

    public User authenticate(String identifier, String password) {
        if (identifier == null) {
            return null;
        }

        // Try username first
        Optional<User> userOpt = userDAO.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();
        String stored = user.getPassword();
        // Use bcrypt verification or legacy fallback inside PasswordUtil.verify
        if (stored == null || !PasswordUtil.verify(password, stored)) {
            return null;
        }

        user.setLastLogin(Instant.now().truncatedTo(ChronoUnit.SECONDS).toString());

        User updates = new User();
        updates.setLastLogin(user.getLastLogin());

        userDAO.update(user.getId(), updates);

        return user;
    }

    public String issueToken(User user) {
        return tokenService.issueToken(user);
    }

    public User resolveToken(String token) {
        return tokenService.resolve(token);
    }

    public void invalidateToken(String token) {
        tokenService.invalidate(token);
    }

    public UserRole findRoleById(String id) {
        return roleDAO.findById(id);
    }

    public UserRole findRoleByName(String name) {
        return roleDAO.findByName(name);
    }
}