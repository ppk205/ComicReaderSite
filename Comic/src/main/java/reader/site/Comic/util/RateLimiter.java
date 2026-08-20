package reader.site.Comic.util;

import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * [SECURITY] Simple in-memory sliding-window rate limiter keyed by client IP.
 * Used to throttle credential endpoints (login, forgot-password) against brute force.
 *
 * Note: per-instance only — adequate for a single Tomcat node. If the app is scaled
 * out horizontally, move rate limiting to the gateway / a shared store (e.g. Redis).
 */
public final class RateLimiter {

    private RateLimiter() {}

    private static final Map<String, Deque<Long>> ATTEMPTS = new ConcurrentHashMap<>();

    /**
     * Records an attempt for the given key and reports whether it is allowed.
     *
     * @param key          usually the client IP
     * @param maxAttempts  max attempts within the window
     * @param windowMillis sliding window size
     * @return true if the attempt is within the limit
     */
    public static boolean allow(String key, int maxAttempts, long windowMillis) {
        long now = System.currentTimeMillis();
        Deque<Long> timestamps = ATTEMPTS.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());

        // Evict expired entries
        while (!timestamps.isEmpty() && now - timestamps.peekFirst() > windowMillis) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxAttempts) {
            return false;
        }
        timestamps.addLast(now);
        return true;
    }

    /** Best-effort client IP (honours a single-hop X-Forwarded-For if present). */
    public static String clientIp(jakarta.servlet.http.HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }
}
