package reader.site.Comic.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for bcrypt password hashing and verification, including the security fix
 * that removed the legacy plaintext-comparison fallback (vuln #12).
 */
class PasswordUtilTest {

    @Test
    void hashProducesBcryptHash() {
        String hashed = PasswordUtil.hash("MyPassword1!");
        assertNotNull(hashed);
        assertTrue(PasswordUtil.isBCryptHash(hashed), "hash should be a bcrypt hash: " + hashed);
        assertNotEquals("MyPassword1!", hashed);
    }

    @Test
    void verifyAcceptsCorrectPassword() {
        String hashed = PasswordUtil.hash("CorrectHorseBattery");
        assertTrue(PasswordUtil.verify("CorrectHorseBattery", hashed));
    }

    @Test
    void verifyRejectsWrongPassword() {
        String hashed = PasswordUtil.hash("CorrectHorseBattery");
        assertFalse(PasswordUtil.verify("wrong-password", hashed));
    }

    @Test
    void verifyRejectsNullInputs() {
        assertFalse(PasswordUtil.verify(null, PasswordUtil.hash("x")));
        assertFalse(PasswordUtil.verify("x", null));
        assertFalse(PasswordUtil.verify(null, null));
    }

    @Test
    void verifyRejectsLegacyNonBcryptStoredValue() {
        // [SECURITY] vuln #12: a stored value that is not a bcrypt hash must never
        // authenticate via plaintext comparison — even if it equals the input.
        String legacyStored = "plaintext-secret";
        assertFalse(PasswordUtil.verify("plaintext-secret", legacyStored));
    }

    @Test
    void verifyRejectsLegacySha256SeedHashes() {
        // The old seeded accounts stored SHA-256 hex digests; they must no longer verify.
        String sha256OfAdmin = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
        assertFalse(PasswordUtil.verify("admin123", sha256OfAdmin));
        assertFalse(PasswordUtil.verify(sha256OfAdmin, sha256OfAdmin));
    }

    @Test
    void hashOfNullIsNull() {
        assertNull(PasswordUtil.hash(null));
    }

    @Test
    void isBCryptHashRecognisesPrefixes() {
        assertTrue(PasswordUtil.isBCryptHash("$2a$12$abcdefghijklmnopqrstuv"));
        assertTrue(PasswordUtil.isBCryptHash("$2b$12$abcdefghijklmnopqrstuv"));
        assertTrue(PasswordUtil.isBCryptHash("$2y$12$abcdefghijklmnopqrstuv"));
        assertFalse(PasswordUtil.isBCryptHash("not-a-hash"));
        assertFalse(PasswordUtil.isBCryptHash(null));
        assertFalse(PasswordUtil.isBCryptHash(""));
    }

    @Test
    void hashesAreSaltedAndUnique() {
        String h1 = PasswordUtil.hash("same-password");
        String h2 = PasswordUtil.hash("same-password");
        assertNotEquals(h1, h2, "bcrypt salts must make hashes unique");
        assertTrue(PasswordUtil.verify("same-password", h1));
        assertTrue(PasswordUtil.verify("same-password", h2));
    }
}
