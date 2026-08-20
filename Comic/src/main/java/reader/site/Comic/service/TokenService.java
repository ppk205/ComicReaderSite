package reader.site.Comic.service;

import reader.site.Comic.model.User;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class TokenService {
    private static class TokenMetadata {
        private final User user;
        private final Instant expiresAt;

        private TokenMetadata(User user, Instant expiresAt) {
            this.user = user;
            this.expiresAt = expiresAt;
        }
    }

    private static final Map<String, TokenMetadata> TOKENS = new ConcurrentHashMap<>();

    /** Absolute session lifetime. */
    private static final long TOKEN_LIFETIME_HOURS = 12;

    public String issueToken(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plus(TOKEN_LIFETIME_HOURS, ChronoUnit.HOURS);
        TOKENS.put(token, new TokenMetadata(user, expiry));
        return token;
    }

    public User resolve(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        TokenMetadata metadata = TOKENS.get(token);
        if (metadata == null) {
            return null;
        }

        if (metadata.expiresAt.isBefore(Instant.now())) {
            TOKENS.remove(token);
            return null;
        }

        // [SECURITY FIX] Vuln #25: removed sliding expiration. Tokens now have a fixed
        // absolute lifetime of 12 hours; activity no longer extends the session.
        return metadata.user;
    }

    public void invalidate(String token) {
        if (token != null) {
            TOKENS.remove(token);
        }
    }
}
