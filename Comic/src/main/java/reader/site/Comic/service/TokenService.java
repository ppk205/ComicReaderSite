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
        private Instant expiresAt;

        private TokenMetadata(User user, Instant expiresAt) {
            this.user = user;
            this.expiresAt = expiresAt;
        }
    }

    private static final Map<String, TokenMetadata> TOKENS = new ConcurrentHashMap<>();

    public String issueToken(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plus(12, ChronoUnit.HOURS);
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

        // Sliding expiration for convenience during demos
        metadata.expiresAt = Instant.now().plus(12, ChronoUnit.HOURS);
        return metadata.user;
    }

    public void invalidate(String token) {
        if (token != null) {
            TOKENS.remove(token);
        }
    }
}
