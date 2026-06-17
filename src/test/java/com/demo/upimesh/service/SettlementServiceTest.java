package com.demo.upimesh.service;

import com.demo.upimesh.model.Account;
import com.demo.upimesh.model.AccountRepository;
import com.demo.upimesh.model.PaymentInstruction;
import com.demo.upimesh.model.Transaction;
import com.demo.upimesh.model.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SettlementService
 * Tests payment settlement logic, balance transfers, and transaction recording
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SettlementService Tests")
class SettlementServiceTest {

    private static final String TEST_HASH_64 = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2";

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private SettlementService settlementService;

    private Account sender;
    private Account receiver;
    private PaymentInstruction instruction;

    @BeforeEach
    void setUp() {
        // Arrange: Create test accounts
        sender = new Account();
        sender.setVpa("alice@demo");
        sender.setBalance(new BigDecimal("1000.00"));
        sender.setVersion(0L);

        receiver = new Account();
        receiver.setVpa("bob@demo");
        receiver.setBalance(new BigDecimal("500.00"));
        receiver.setVersion(0L);

        // Arrange: Create payment instruction
        instruction = new PaymentInstruction();
        instruction.setSenderVpa("alice@demo");
        instruction.setReceiverVpa("bob@demo");
        instruction.setAmount(new BigDecimal("100.00"));
        instruction.setSignedAt(System.currentTimeMillis());
    }

    @Test
    @DisplayName("should successfully settle payment and transfer balance")
    void testSettleSuccessfulPayment() {
        // Arrange
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.of(sender));
        when(accountRepository.findById("bob@demo")).thenReturn(Optional.of(receiver));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Act
        Transaction result = settlementService.settle(instruction, TEST_HASH_64, "bridge-1", 2);

        // Assert
        assertNotNull(result);
        assertEquals(Transaction.Status.SETTLED, result.getStatus());
        assertEquals(TEST_HASH_64, result.getPacketHash());
        assertEquals("bridge-1", result.getBridgeNodeId());
        assertEquals(2, result.getHopCount());
        assertEquals(new BigDecimal("100.00"), result.getAmount());
        assertEquals("alice@demo", result.getSenderVpa());
        assertEquals("bob@demo", result.getReceiverVpa());

        // Verify account balances were updated
        assertEquals(new BigDecimal("900.00"), sender.getBalance());
        assertEquals(new BigDecimal("600.00"), receiver.getBalance());

        // Verify repositories were called
        verify(accountRepository, times(2)).save(any(Account.class));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("should throw exception when sender account not found")
    void testSettleUnknownSender() {
        // Arrange
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            settlementService.settle(instruction, TEST_HASH_64, "bridge-1", 2);
        }, "Should throw exception for unknown sender");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("should throw exception when receiver account not found")
    void testSettleUnknownReceiver() {
        // Arrange
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.of(sender));
        when(accountRepository.findById("bob@demo")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            settlementService.settle(instruction, TEST_HASH_64, "bridge-1", 2);
        }, "Should throw exception for unknown receiver");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("should reject zero amount payment")
    void testSettleZeroAmountPayment() {
        // Arrange
        instruction.setAmount(BigDecimal.ZERO);
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.of(sender));
        when(accountRepository.findById("bob@demo")).thenReturn(Optional.of(receiver));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            settlementService.settle(instruction, TEST_HASH_64, "bridge-1", 2);
        }, "Should reject zero amount");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("should reject negative amount payment")
    void testSettleNegativeAmountPayment() {
        // Arrange
        instruction.setAmount(new BigDecimal("-50.00"));
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.of(sender));
        when(accountRepository.findById("bob@demo")).thenReturn(Optional.of(receiver));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            settlementService.settle(instruction, TEST_HASH_64, "bridge-1", 2);
        }, "Should reject negative amount");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("should reject payment when sender has insufficient balance")
    void testSettleInsufficientBalance() {
        // Arrange
        sender.setBalance(new BigDecimal("50.00"));
        instruction.setAmount(new BigDecimal("100.00"));
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.of(sender));
        when(accountRepository.findById("bob@demo")).thenReturn(Optional.of(receiver));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Act
        Transaction result = settlementService.settle(instruction, TEST_HASH_64, "bridge-1", 2);

        // Assert
        assertNotNull(result);
        assertEquals(Transaction.Status.REJECTED, result.getStatus());
        assertEquals(TEST_HASH_64, result.getPacketHash());
        // Balances should NOT change for rejected transaction
        assertEquals(new BigDecimal("50.00"), sender.getBalance());
        assertEquals(new BigDecimal("500.00"), receiver.getBalance());

        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("should handle large amount transfers")
    void testSettleLargeAmountPayment() {
        // Arrange
        sender.setBalance(new BigDecimal("999999.99"));
        instruction.setAmount(new BigDecimal("50000.00"));
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.of(sender));
        when(accountRepository.findById("bob@demo")).thenReturn(Optional.of(receiver));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Act
        Transaction result = settlementService.settle(instruction, TEST_HASH_64, "bridge-1", 2);

        // Assert
        assertEquals(Transaction.Status.SETTLED, result.getStatus());
        assertEquals(new BigDecimal("949999.99"), sender.getBalance());
        assertEquals(new BigDecimal("50500.00"), receiver.getBalance());
    }

    @Test
    @DisplayName("should record transaction with correct metadata")
    void testSettleRecordsTransactionMetadata() {
        // Arrange
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.of(sender));
        when(accountRepository.findById("bob@demo")).thenReturn(Optional.of(receiver));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        long signedAtMs = 1624000000000L;
        instruction.setSignedAt(signedAtMs);

        // Act
        Transaction result = settlementService.settle(instruction, TEST_HASH_64, "bridge-node-5", 5);

        // Assert
        assertEquals(TEST_HASH_64, result.getPacketHash());
        assertEquals("bridge-node-5", result.getBridgeNodeId());
        assertEquals(5, result.getHopCount());
        assertEquals(Instant.ofEpochMilli(signedAtMs), result.getSignedAt());
        assertNotNull(result.getSettledAt());
    }

    @Test
    @DisplayName("should handle payment between same sender and receiver")
    void testSettlePaymentSenderEqualsReceiver() {
        // Arrange
        instruction.setReceiverVpa("alice@demo");
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.of(sender));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Act
        Transaction result = settlementService.settle(instruction, TEST_HASH_64, "bridge-1", 2);

        // Assert - This should succeed but balance stays same (debit and credit same account)
        assertNotNull(result);
        assertEquals(Transaction.Status.SETTLED, result.getStatus());
        // Verify save was called
        verify(accountRepository, atLeastOnce()).save(any(Account.class));
    }

    @Test
    @DisplayName("should handle penny payments")
    void testSettlePennyPayment() {
        // Arrange
        instruction.setAmount(new BigDecimal("0.01"));
        when(accountRepository.findById("alice@demo")).thenReturn(Optional.of(sender));
        when(accountRepository.findById("bob@demo")).thenReturn(Optional.of(receiver));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Act
        Transaction result = settlementService.settle(instruction, TEST_HASH_64, "bridge-1", 2);

        // Assert
        assertEquals(Transaction.Status.SETTLED, result.getStatus());
        assertEquals(new BigDecimal("999.99"), sender.getBalance());
        assertEquals(new BigDecimal("500.01"), receiver.getBalance());
    }
}
