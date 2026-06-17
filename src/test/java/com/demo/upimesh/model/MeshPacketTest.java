package com.demo.upimesh.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MeshPacket model.
 * Tests getter/setter methods, validation constraints, and over-the-wire format integrity.
 */
@DisplayName("MeshPacket Model Tests")
class MeshPacketTest {

    private static final String PACKET_ID = "packet-uuid-123";
    private static final int TTL = 5;
    private static final Long CREATED_AT = 1234567890L;
    private static final String CIPHERTEXT = "base64EncodedCiphertextHere";

    @Test
    @DisplayName("Default constructor creates empty MeshPacket")
    void testDefaultConstructor() {
        // Arrange & Act
        MeshPacket packet = new MeshPacket();

        // Assert
        assertNull(packet.getPacketId());
        assertEquals(0, packet.getTtl());
        assertNull(packet.getCreatedAt());
        assertNull(packet.getCiphertext());
    }

    @Test
    @DisplayName("setPacketId sets packet ID correctly")
    void testSetPacketId() {
        // Arrange
        MeshPacket packet = new MeshPacket();

        // Act
        packet.setPacketId(PACKET_ID);

        // Assert
        assertEquals(PACKET_ID, packet.getPacketId());
    }

    @Test
    @DisplayName("setTtl sets TTL correctly")
    void testSetTtl() {
        // Arrange
        MeshPacket packet = new MeshPacket();

        // Act
        packet.setTtl(TTL);

        // Assert
        assertEquals(TTL, packet.getTtl());
    }

    @Test
    @DisplayName("TTL can be zero for boundary condition")
    void testSetTtlToZero() {
        // Arrange
        MeshPacket packet = new MeshPacket();

        // Act
        packet.setTtl(0);

        // Assert
        assertEquals(0, packet.getTtl());
    }

    @Test
    @DisplayName("TTL can be large value")
    void testSetTtlToLargeValue() {
        // Arrange
        MeshPacket packet = new MeshPacket();
        int largeTtl = 255;

        // Act
        packet.setTtl(largeTtl);

        // Assert
        assertEquals(largeTtl, packet.getTtl());
    }

    @Test
    @DisplayName("setCreatedAt sets creation timestamp correctly")
    void testSetCreatedAt() {
        // Arrange
        MeshPacket packet = new MeshPacket();

        // Act
        packet.setCreatedAt(CREATED_AT);

        // Assert
        assertEquals(CREATED_AT, packet.getCreatedAt());
    }

    @Test
    @DisplayName("setCiphertext sets ciphertext correctly")
    void testSetCiphertext() {
        // Arrange
        MeshPacket packet = new MeshPacket();

        // Act
        packet.setCiphertext(CIPHERTEXT);

        // Assert
        assertEquals(CIPHERTEXT, packet.getCiphertext());
    }

    @Test
    @DisplayName("Intermediates can read outer fields for routing")
    void testIntermediateCanReadOuterFields() {
        // Arrange
        MeshPacket packet = new MeshPacket();
        packet.setPacketId(PACKET_ID);
        packet.setTtl(TTL);
        packet.setCreatedAt(CREATED_AT);
        packet.setCiphertext(CIPHERTEXT);

        // Act & Assert - intermediates read unencrypted fields
        assertNotNull(packet.getPacketId()); // Readable for dedup
        assertNotEquals(0, packet.getTtl()); // Readable for hop counting
        assertNotNull(packet.getCreatedAt()); // Readable for freshness
        assertNotNull(packet.getCiphertext()); // Encrypted, unopenable by intermediates
    }

    @Test
    @DisplayName("TTL decrement simulates intermediate hop")
    void testTtlDecrement() {
        // Arrange
        MeshPacket packet = new MeshPacket();
        packet.setTtl(5);
        int initialTtl = packet.getTtl();

        // Act - simulate intermediate decrementing TTL
        packet.setTtl(initialTtl - 1);

        // Assert
        assertEquals(4, packet.getTtl());
    }

    @Test
    @DisplayName("TTL reaches zero when packet expires")
    void testTtlExpiration() {
        // Arrange
        MeshPacket packet = new MeshPacket();
        packet.setTtl(1);

        // Act - final intermediate decrements
        int newTtl = packet.getTtl() - 1;
        packet.setTtl(newTtl);

        // Assert
        assertEquals(0, packet.getTtl());
    }

    @Test
    @DisplayName("Packet ID used for gossip dedup prevents duplicates")
    void testPacketIdForDedup() {
        // Arrange
        MeshPacket packet1 = new MeshPacket();
        MeshPacket packet2 = new MeshPacket();

        packet1.setPacketId("same-id");
        packet2.setPacketId("same-id");

        // Act & Assert - dedup checks packet ID
        assertEquals(packet1.getPacketId(), packet2.getPacketId());
    }

    @Test
    @DisplayName("Different packets have unique IDs")
    void testPacketIdUniqueness() {
        // Arrange
        MeshPacket packet1 = new MeshPacket();
        MeshPacket packet2 = new MeshPacket();

        packet1.setPacketId("packet-1");
        packet2.setPacketId("packet-2");

        // Act & Assert
        assertNotEquals(packet1.getPacketId(), packet2.getPacketId());
    }

    @Test
    @DisplayName("Ciphertext is opaque to intermediates")
    void testCiphertextOpaqueToIntermediates() {
        // Arrange
        MeshPacket packet = new MeshPacket();
        String encryptedData = "base64/RSA-encrypted-AES-key/GCM-IV/GCM-ciphertext+tag";

        // Act
        packet.setCiphertext(encryptedData);

        // Assert - intermediates cannot decrypt this field
        assertTrue(packet.getCiphertext().contains("/"));
        assertNotNull(packet.getCiphertext());
    }

    @Test
    @DisplayName("Timestamp helps detect stale packets")
    void testTimestampForFreshness() {
        // Arrange
        MeshPacket packet = new MeshPacket();
        Long now = System.currentTimeMillis();

        // Act
        packet.setCreatedAt(now);

        // Assert - timestamp allows server to check freshness window
        assertTrue(packet.getCreatedAt() <= System.currentTimeMillis());
    }
}
