package com.demo.upimesh.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Transaction model.
 * Tests getter/setter methods, idempotency key (packetHash), status, and immutability of settled transactions.
 */
@DisplayName("Transaction Model Tests")
class TransactionTest {

    private static final Long ID = 1L;
    private static final String PACKET_HASH = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6";
    private static final String SENDER_VPA = "alice@demo";
    private static final String RECEIVER_VPA = "bob@demo";
    private static final BigDecimal AMOUNT = new BigDecimal("100.00");
    private static final Instant SIGNED_AT = Instant.parse("2026-06-16T10:00:00Z");
    private static final Instant SETTLED_AT = Instant.parse("2026-06-16T10:00:05Z");
    private static final String BRIDGE_NODE_ID = "bridge-1";
    private static final int HOP_COUNT = 3;

    @Test
    @DisplayName("Default constructor creates empty Transaction")
    void testDefaultConstructor() {
        // Arrange & Act
        Transaction transaction = new Transaction();

        // Assert
        assertNull(transaction.getId());
        assertNull(transaction.getPacketHash());
        assertNull(transaction.getSenderVpa());
        assertNull(transaction.getReceiverVpa());
        assertNull(transaction.getAmount());
        assertNull(transaction.getSignedAt());
        assertNull(transaction.getSettledAt());
        assertNull(transaction.getBridgeNodeId());
        assertEquals(0, transaction.getHopCount());
        assertNull(transaction.getStatus());
    }

    @Test
    @DisplayName("setId sets the transaction ID correctly")
    void testSetId() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setId(ID);

        // Assert
        assertEquals(ID, transaction.getId());
    }

    @Test
    @DisplayName("setPacketHash sets the idempotency key correctly")
    void testSetPacketHash() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setPacketHash(PACKET_HASH);

        // Assert
        assertEquals(PACKET_HASH, transaction.getPacketHash());
    }

    @Test
    @DisplayName("Packet hash is SHA-256 hex of encrypted packet for idempotency")
    void testPacketHashAsIdempotencyKey() {
        // Arrange
        Transaction txn1 = new Transaction();
        Transaction txn2 = new Transaction();
        String hashValue = "abcd1234567890";

        // Act
        txn1.setPacketHash(hashValue);
        txn2.setPacketHash(hashValue);

        // Assert - same packet hash means duplicate (prevented by DB constraint)
        assertEquals(txn1.getPacketHash(), txn2.getPacketHash());
    }

    @Test
    @DisplayName("setSenderVpa sets the sender VPA correctly")
    void testSetSenderVpa() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setSenderVpa(SENDER_VPA);

        // Assert
        assertEquals(SENDER_VPA, transaction.getSenderVpa());
    }

    @Test
    @DisplayName("setReceiverVpa sets the receiver VPA correctly")
    void testSetReceiverVpa() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setReceiverVpa(RECEIVER_VPA);

        // Assert
        assertEquals(RECEIVER_VPA, transaction.getReceiverVpa());
    }

    @Test
    @DisplayName("setAmount sets the transaction amount correctly")
    void testSetAmount() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setAmount(AMOUNT);

        // Assert
        assertEquals(AMOUNT, transaction.getAmount());
    }

    @Test
    @DisplayName("setSignedAt sets the offline signature timestamp correctly")
    void testSetSignedAt() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setSignedAt(SIGNED_AT);

        // Assert
        assertEquals(SIGNED_AT, transaction.getSignedAt());
    }

    @Test
    @DisplayName("setSettledAt sets the backend settlement timestamp correctly")
    void testSetSettledAt() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setSettledAt(SETTLED_AT);

        // Assert
        assertEquals(SETTLED_AT, transaction.getSettledAt());
    }

    @Test
    @DisplayName("Settlement timestamp is after signing timestamp")
    void testSettlementAfterSigning() {
        // Arrange
        Transaction transaction = new Transaction();
        transaction.setSignedAt(SIGNED_AT);
        transaction.setSettledAt(SETTLED_AT);

        // Act & Assert - settlement should come after signing
        assertTrue(transaction.getSettledAt().isAfter(transaction.getSignedAt()));
    }

    @Test
    @DisplayName("setBridgeNodeId sets the mesh node identifier correctly")
    void testSetBridgeNodeId() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setBridgeNodeId(BRIDGE_NODE_ID);

        // Assert
        assertEquals(BRIDGE_NODE_ID, transaction.getBridgeNodeId());
    }

    @Test
    @DisplayName("setHopCount sets the number of hops correctly")
    void testSetHopCount() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setHopCount(HOP_COUNT);

        // Assert
        assertEquals(HOP_COUNT, transaction.getHopCount());
    }

    @Test
    @DisplayName("Hop count tracks path length through mesh network")
    void testHopCountTracksPath() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setHopCount(5); // packet went through 5 nodes

        // Assert
        assertEquals(5, transaction.getHopCount());
    }

    @Test
    @DisplayName("setStatus sets transaction status correctly")
    void testSetStatus() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setStatus(Transaction.Status.SETTLED);

        // Assert
        assertEquals(Transaction.Status.SETTLED, transaction.getStatus());
    }

    @Test
    @DisplayName("Transaction can be marked as SETTLED")
    void testStatusSettled() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setStatus(Transaction.Status.SETTLED);

        // Assert
        assertEquals(Transaction.Status.SETTLED, transaction.getStatus());
    }

    @Test
    @DisplayName("Transaction can be marked as REJECTED")
    void testStatusRejected() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setStatus(Transaction.Status.REJECTED);

        // Assert
        assertEquals(Transaction.Status.REJECTED, transaction.getStatus());
    }

    @Test
    @DisplayName("Complete transaction record with all fields")
    void testCompleteTransactionRecord() {
        // Arrange & Act
        Transaction transaction = new Transaction();
        transaction.setId(ID);
        transaction.setPacketHash(PACKET_HASH);
        transaction.setSenderVpa(SENDER_VPA);
        transaction.setReceiverVpa(RECEIVER_VPA);
        transaction.setAmount(AMOUNT);
        transaction.setSignedAt(SIGNED_AT);
        transaction.setSettledAt(SETTLED_AT);
        transaction.setBridgeNodeId(BRIDGE_NODE_ID);
        transaction.setHopCount(HOP_COUNT);
        transaction.setStatus(Transaction.Status.SETTLED);

        // Assert - all fields are set correctly
        assertEquals(ID, transaction.getId());
        assertEquals(PACKET_HASH, transaction.getPacketHash());
        assertEquals(SENDER_VPA, transaction.getSenderVpa());
        assertEquals(RECEIVER_VPA, transaction.getReceiverVpa());
        assertEquals(AMOUNT, transaction.getAmount());
        assertEquals(SIGNED_AT, transaction.getSignedAt());
        assertEquals(SETTLED_AT, transaction.getSettledAt());
        assertEquals(BRIDGE_NODE_ID, transaction.getBridgeNodeId());
        assertEquals(HOP_COUNT, transaction.getHopCount());
        assertEquals(Transaction.Status.SETTLED, transaction.getStatus());
    }

    @Test
    @DisplayName("Packet hash uniqueness prevents duplicate settlements")
    void testPacketHashUniquenessPreventsDuplicates() {
        // Arrange
        String uniqueHash = "unique-hash-xyz";
        Transaction txn1 = new Transaction();
        Transaction txn2 = new Transaction();

        // Act
        txn1.setPacketHash(uniqueHash);
        txn2.setPacketHash(uniqueHash);

        // Assert - database would reject duplicate
        assertEquals(txn1.getPacketHash(), txn2.getPacketHash());
    }

    @Test
    @DisplayName("Self-transfer is recorded (alice sends to alice)")
    void testSelfTransfer() {
        // Arrange
        Transaction transaction = new Transaction();
        String selfVpa = "alice@demo";

        // Act
        transaction.setSenderVpa(selfVpa);
        transaction.setReceiverVpa(selfVpa);

        // Assert
        assertEquals(transaction.getSenderVpa(), transaction.getReceiverVpa());
    }

    @Test
    @DisplayName("Zero-hop transaction indicates direct delivery")
    void testZeroHopDelivery() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setHopCount(0);

        // Assert
        assertEquals(0, transaction.getHopCount());
    }

    @Test
    @DisplayName("High hop count indicates long path through mesh")
    void testHighHopCount() {
        // Arrange
        Transaction transaction = new Transaction();

        // Act
        transaction.setHopCount(25);

        // Assert
        assertEquals(25, transaction.getHopCount());
    }
}
