package com.demo.upimesh.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for IdempotencyService
 * Tests duplicate packet detection and idempotent claim semantics
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("IdempotencyService Tests")
class IdempotencyServiceTest {

    private IdempotencyService idempotencyService;

    @BeforeEach
    void setUp() {
        idempotencyService = new IdempotencyService();
        // Set TTL to 1 hour for testing
        ReflectionTestUtils.setField(idempotencyService, "ttlSeconds", 3600L);
    }

    @Test
    @DisplayName("should return true on first claim for new hash")
    void testClaimNewHash() {
        // Act
        boolean firstClaim = idempotencyService.claim("hash-001");

        // Assert
        assertTrue(firstClaim, "First claim should return true");
    }

    @Test
    @DisplayName("should return false on second claim for same hash")
    void testClaimDuplicateHash() {
        // Arrange
        String hash = "hash-001";
        idempotencyService.claim(hash);

        // Act
        boolean secondClaim = idempotencyService.claim(hash);

        // Assert
        assertFalse(secondClaim, "Duplicate claim should return false");
    }

    @Test
    @DisplayName("should return false on multiple duplicate claims")
    void testClaimMultipleDuplicates() {
        // Arrange
        String hash = "hash-001";
        idempotencyService.claim(hash);

        // Act & Assert
        assertFalse(idempotencyService.claim(hash), "Second claim should return false");
        assertFalse(idempotencyService.claim(hash), "Third claim should return false");
        assertFalse(idempotencyService.claim(hash), "Fourth claim should return false");
    }

    @Test
    @DisplayName("should handle different hashes independently")
    void testClaimDifferentHashes() {
        // Arrange
        String hash1 = "hash-001";
        String hash2 = "hash-002";
        String hash3 = "hash-003";

        // Act
        boolean claim1 = idempotencyService.claim(hash1);
        boolean claim2 = idempotencyService.claim(hash2);
        boolean claim3 = idempotencyService.claim(hash3);

        // Assert
        assertTrue(claim1, "First hash should claim successfully");
        assertTrue(claim2, "Second hash should claim successfully");
        assertTrue(claim3, "Third hash should claim successfully");

        // Verify duplicates are rejected
        assertFalse(idempotencyService.claim(hash1), "Duplicate of hash1 should be rejected");
        assertFalse(idempotencyService.claim(hash2), "Duplicate of hash2 should be rejected");
        assertFalse(idempotencyService.claim(hash3), "Duplicate of hash3 should be rejected");
    }

    @Test
    @DisplayName("should track cache size correctly")
    void testCacheSize() {
        // Act
        idempotencyService.claim("hash-001");
        int sizeAfterFirst = idempotencyService.size();

        idempotencyService.claim("hash-002");
        int sizeAfterSecond = idempotencyService.size();

        idempotencyService.claim("hash-001");  // Duplicate
        int sizeAfterDuplicate = idempotencyService.size();

        // Assert
        assertEquals(1, sizeAfterFirst, "Size should be 1 after first claim");
        assertEquals(2, sizeAfterSecond, "Size should be 2 after second unique claim");
        assertEquals(2, sizeAfterDuplicate, "Size should remain 2 after duplicate claim");
    }

    @Test
    @DisplayName("should clear all entries")
    void testClear() {
        // Arrange
        idempotencyService.claim("hash-001");
        idempotencyService.claim("hash-002");
        idempotencyService.claim("hash-003");

        // Act
        idempotencyService.clear();

        // Assert
        assertEquals(0, idempotencyService.size(), "Size should be 0 after clear");
        assertTrue(idempotencyService.claim("hash-001"), "Should be able to claim hash again after clear");
    }

    @Test
    @DisplayName("should handle concurrent claims atomically")
    void testConcurrentClaimsAreAtomic() throws InterruptedException {
        // Arrange
        String sharedHash = "concurrent-hash";
        int threadCount = 10;
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);

        // Act
        for (int i = 0; i < threadCount; i++) {
            new Thread(() -> {
                try {
                    startLatch.await();  // Wait for all threads to be ready
                    if (idempotencyService.claim(sharedHash)) {
                        successCount.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    try {
                        endLatch.countDown();
                    } catch (Exception e) {
                        // Ignore countDown errors
                    }
                }
            }).start();
        }

        startLatch.countDown();  // Release all threads simultaneously
        endLatch.await();  // Wait for all threads to complete

        // Assert - Only ONE thread should successfully claim the hash
        assertEquals(1, successCount.get(),
                "Only one thread should successfully claim the same hash (atomic semantics)");
    }

    @Test
    @DisplayName("should handle empty string hash")
    void testClaimEmptyStringHash() {
        // Act
        boolean firstClaim = idempotencyService.claim("");
        boolean secondClaim = idempotencyService.claim("");

        // Assert
        assertTrue(firstClaim, "Empty string should be claimable");
        assertFalse(secondClaim, "Empty string duplicate should be rejected");
    }

    @Test
    @DisplayName("should handle long hash strings")
    void testClaimLongHashString() {
        // Arrange
        String longHash = "a".repeat(1000);

        // Act
        boolean firstClaim = idempotencyService.claim(longHash);
        boolean secondClaim = idempotencyService.claim(longHash);

        // Assert
        assertTrue(firstClaim, "Long hash should be claimable");
        assertFalse(secondClaim, "Long hash duplicate should be rejected");
    }

    @Test
    @DisplayName("should handle special characters in hash")
    void testClaimSpecialCharacterHash() {
        // Arrange
        String specialHash = "hash-!@#$%^&*()_+-=[]{}|;:,.<>?";

        // Act
        boolean firstClaim = idempotencyService.claim(specialHash);
        boolean secondClaim = idempotencyService.claim(specialHash);

        // Assert
        assertTrue(firstClaim, "Hash with special chars should be claimable");
        assertFalse(secondClaim, "Hash with special chars duplicate should be rejected");
    }

    @Test
    @DisplayName("should handle case-sensitive hash comparison")
    void testHashCaseSensitivity() {
        // Arrange
        String hashLower = "hash-abc123";
        String hashUpper = "HASH-ABC123";

        // Act
        boolean claimLower = idempotencyService.claim(hashLower);
        boolean claimUpper = idempotencyService.claim(hashUpper);

        // Assert - Hashes should be treated as different since they differ in case
        assertTrue(claimLower, "Lowercase hash should be claimed");
        assertTrue(claimUpper, "Uppercase hash should be claimed (different hash)");
        assertFalse(idempotencyService.claim(hashLower), "Duplicate lowercase should be rejected");
        assertFalse(idempotencyService.claim(hashUpper), "Duplicate uppercase should be rejected");
    }

    @Test
    @DisplayName("should evict expired entries based on TTL")
    void testEvictExpired() {
        // Arrange - Set very short TTL for testing
        ReflectionTestUtils.setField(idempotencyService, "ttlSeconds", 1L);

        idempotencyService.claim("hash-001");
        idempotencyService.claim("hash-002");
        assertEquals(2, idempotencyService.size(), "Should have 2 entries");

        // Act - Wait for expiration
        try {
            Thread.sleep(1100);  // Wait 1.1 seconds for TTL to expire
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            fail("Thread was interrupted during test");
        }

        // Execute eviction
        idempotencyService.evictExpired();

        // Assert
        assertEquals(0, idempotencyService.size(), "Expired entries should be evicted");
        assertTrue(idempotencyService.claim("hash-001"), "Expired hash should be claimable again");
    }

    @Test
    @DisplayName("should not evict non-expired entries")
    void testEvictNonExpired() {
        // Arrange
        ReflectionTestUtils.setField(idempotencyService, "ttlSeconds", 3600L);  // 1 hour

        idempotencyService.claim("hash-001");
        idempotencyService.claim("hash-002");
        assertEquals(2, idempotencyService.size());

        // Act - Evict immediately (nothing should expire)
        idempotencyService.evictExpired();

        // Assert
        assertEquals(2, idempotencyService.size(), "Non-expired entries should not be evicted");
        assertFalse(idempotencyService.claim("hash-001"), "Hash should still be claimed");
    }

    @Test
    @DisplayName("should simulate real-world packet deduplication scenario")
    void testRealWorldPacketDeduplication() {
        // Simulate a mesh network where packets arrive from multiple bridges
        // Bridge 1 delivers packet with hash "packet-123"
        assertTrue(idempotencyService.claim("packet-123"), "Bridge 1 should deliver packet");

        // Bridge 2 delivers the same packet (legitimate because bridging)
        assertFalse(idempotencyService.claim("packet-123"), "Bridge 2's duplicate should be detected");

        // Bridge 3 delivers the same packet
        assertFalse(idempotencyService.claim("packet-123"), "Bridge 3's duplicate should be detected");

        // New packet from Bridge 1
        assertTrue(idempotencyService.claim("packet-124"), "Bridge 1 delivers new packet");

        // Old packet arrives late from Bridge 3 (retry)
        assertFalse(idempotencyService.claim("packet-123"), "Late retry should be detected");
    }
}
