package com.demo.upimesh.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for PaymentInstruction model.
 * Tests all getter/setter methods and constructors to ensure data integrity.
 */
@DisplayName("PaymentInstruction Model Tests")
class PaymentInstructionTest {

    private static final String SENDER_VPA = "alice@demo";
    private static final String RECEIVER_VPA = "bob@demo";
    private static final BigDecimal AMOUNT = new BigDecimal("100.00");
    private static final String PIN_HASH = "abc123hash";
    private static final String NONCE = "12345-uuid";
    private static final Long SIGNED_AT = 1234567890L;

    @Test
    @DisplayName("Default constructor creates empty PaymentInstruction")
    void testDefaultConstructor() {
        // Arrange & Act
        PaymentInstruction instruction = new PaymentInstruction();

        // Assert
        assertNull(instruction.getSenderVpa());
        assertNull(instruction.getReceiverVpa());
        assertNull(instruction.getAmount());
        assertNull(instruction.getPinHash());
        assertNull(instruction.getNonce());
        assertNull(instruction.getSignedAt());
    }

    @Test
    @DisplayName("Full constructor initializes all fields correctly")
    void testFullConstructor() {
        // Arrange & Act
        PaymentInstruction instruction = new PaymentInstruction(
                SENDER_VPA, RECEIVER_VPA, AMOUNT, PIN_HASH, NONCE, SIGNED_AT);

        // Assert
        assertEquals(SENDER_VPA, instruction.getSenderVpa());
        assertEquals(RECEIVER_VPA, instruction.getReceiverVpa());
        assertEquals(AMOUNT, instruction.getAmount());
        assertEquals(PIN_HASH, instruction.getPinHash());
        assertEquals(NONCE, instruction.getNonce());
        assertEquals(SIGNED_AT, instruction.getSignedAt());
    }

    @Test
    @DisplayName("setSenderVpa sets the sender VPA correctly")
    void testSetSenderVpa() {
        // Arrange
        PaymentInstruction instruction = new PaymentInstruction();

        // Act
        instruction.setSenderVpa(SENDER_VPA);

        // Assert
        assertEquals(SENDER_VPA, instruction.getSenderVpa());
    }

    @Test
    @DisplayName("setReceiverVpa sets the receiver VPA correctly")
    void testSetReceiverVpa() {
        // Arrange
        PaymentInstruction instruction = new PaymentInstruction();

        // Act
        instruction.setReceiverVpa(RECEIVER_VPA);

        // Assert
        assertEquals(RECEIVER_VPA, instruction.getReceiverVpa());
    }

    @Test
    @DisplayName("setAmount sets the amount correctly")
    void testSetAmount() {
        // Arrange
        PaymentInstruction instruction = new PaymentInstruction();

        // Act
        instruction.setAmount(AMOUNT);

        // Assert
        assertEquals(AMOUNT, instruction.getAmount());
    }

    @Test
    @DisplayName("setPinHash sets the PIN hash correctly")
    void testSetPinHash() {
        // Arrange
        PaymentInstruction instruction = new PaymentInstruction();

        // Act
        instruction.setPinHash(PIN_HASH);

        // Assert
        assertEquals(PIN_HASH, instruction.getPinHash());
    }

    @Test
    @DisplayName("setNonce sets the nonce correctly")
    void testSetNonce() {
        // Arrange
        PaymentInstruction instruction = new PaymentInstruction();

        // Act
        instruction.setNonce(NONCE);

        // Assert
        assertEquals(NONCE, instruction.getNonce());
    }

    @Test
    @DisplayName("setSignedAt sets the timestamp correctly")
    void testSetSignedAt() {
        // Arrange
        PaymentInstruction instruction = new PaymentInstruction();

        // Act
        instruction.setSignedAt(SIGNED_AT);

        // Assert
        assertEquals(SIGNED_AT, instruction.getSignedAt());
    }

    @Test
    @DisplayName("Setters can overwrite values set by constructor")
    void testSettersOverwriteConstructorValues() {
        // Arrange
        PaymentInstruction instruction = new PaymentInstruction(
                SENDER_VPA, RECEIVER_VPA, AMOUNT, PIN_HASH, NONCE, SIGNED_AT);

        String newSender = "charlie@demo";
        String newReceiver = "dave@demo";
        BigDecimal newAmount = new BigDecimal("500.00");

        // Act
        instruction.setSenderVpa(newSender);
        instruction.setReceiverVpa(newReceiver);
        instruction.setAmount(newAmount);

        // Assert
        assertEquals(newSender, instruction.getSenderVpa());
        assertEquals(newReceiver, instruction.getReceiverVpa());
        assertEquals(newAmount, instruction.getAmount());
        // Original values still preserved
        assertEquals(PIN_HASH, instruction.getPinHash());
        assertEquals(NONCE, instruction.getNonce());
        assertEquals(SIGNED_AT, instruction.getSignedAt());
    }

    @Test
    @DisplayName("Amount can handle very small values (paise)")
    void testAmountWithSmallValue() {
        // Arrange
        PaymentInstruction instruction = new PaymentInstruction();
        BigDecimal smallAmount = new BigDecimal("0.01");

        // Act
        instruction.setAmount(smallAmount);

        // Assert
        assertEquals(smallAmount, instruction.getAmount());
    }

    @Test
    @DisplayName("Amount can handle large values")
    void testAmountWithLargeValue() {
        // Arrange
        PaymentInstruction instruction = new PaymentInstruction();
        BigDecimal largeAmount = new BigDecimal("999999.99");

        // Act
        instruction.setAmount(largeAmount);

        // Assert
        assertEquals(largeAmount, instruction.getAmount());
    }

    @Test
    @DisplayName("Nonce uniqueness supports replay attack prevention")
    void testNonceSupportsUniqueness() {
        // Arrange
        PaymentInstruction instruction1 = new PaymentInstruction();
        PaymentInstruction instruction2 = new PaymentInstruction();

        String nonce1 = "uuid-1";
        String nonce2 = "uuid-2";

        // Act
        instruction1.setNonce(nonce1);
        instruction2.setNonce(nonce2);

        // Assert
        assertNotEquals(instruction1.getNonce(), instruction2.getNonce());
    }
}
