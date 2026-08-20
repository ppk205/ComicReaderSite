package reader.site.Comic.util;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the sliding-window rate limiter used to throttle auth endpoints (vuln #31).
 */
class RateLimiterTest {

    @Test
    void allowsRequestsUnderLimit() {
        String key = "ip-" + UUID.randomUUID();
        for (int i = 0; i < 5; i++) {
            assertTrue(RateLimiter.allow(key, 5, 60_000), "request " + i + " should be allowed");
        }
    }

    @Test
    void blocksRequestsOverLimit() {
        String key = "ip-" + UUID.randomUUID();
        for (int i = 0; i < 10; i++) {
            assertTrue(RateLimiter.allow(key, 10, 60_000));
        }
        assertFalse(RateLimiter.allow(key, 10, 60_000), "11th request within window must be blocked");
        assertFalse(RateLimiter.allow(key, 10, 60_000), "12th request within window must be blocked");
    }

    @Test
    void windowExpiryReAllowsRequests() throws InterruptedException {
        String key = "ip-" + UUID.randomUUID();
        assertTrue(RateLimiter.allow(key, 2, 100));
        assertTrue(RateLimiter.allow(key, 2, 100));
        assertFalse(RateLimiter.allow(key, 2, 100));

        Thread.sleep(150); // let the 100ms window expire

        assertTrue(RateLimiter.allow(key, 2, 100), "requests should be allowed again after the window expires");
    }

    @Test
    void keysAreIndependent() {
        String keyA = "ip-a-" + UUID.randomUUID();
        String keyB = "ip-b-" + UUID.randomUUID();

        assertTrue(RateLimiter.allow(keyA, 1, 60_000));
        assertFalse(RateLimiter.allow(keyA, 1, 60_000));

        // keyB has its own budget and must not be affected by keyA
        assertTrue(RateLimiter.allow(keyB, 1, 60_000));
    }
}
