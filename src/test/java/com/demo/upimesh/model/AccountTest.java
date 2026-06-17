package com.demo.upimesh.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Account model.
 * Tests getter/setter methods, balance updates, and optimistic locking version tracking.
 */
@DisplayName("Account Model Tests")
class AccountTest {

    private static final String VPA = "alice@demo";
    private static final String HOLDER_NAME = "Alice";
    private static final BigDecimal INITIAL_BALANCE = new BigDecimal("5000.00");

    @Test
    @DisplayName("Default constructor creates empty Account")
    void testDefaultConstructor() {
        // Arrange & Act
        Account account = new Account();

        // Assert
        assertNull(account.getVpa());
        assertNull(account.getHolderName());
        assertNull(account.getBalance());
        assertNull(account.getVersion());
    }

    @Test
    @DisplayName("Full constructor initializes account with VPA, name, and balance")
    void testFullConstructor() {
        // Arrange & Act
        Account account = new Account(VPA, HOLDER_NAME, INITIAL_BALANCE);

        // Assert
        assertEquals(VPA, account.getVpa());
        assertEquals(HOLDER_NAME, account.getHolderName());
        assertEquals(INITIAL_BALANCE, account.getBalance());
    }

    @Test
    @DisplayName("setVpa sets the Virtual Payment Address correctly")
    void testSetVpa() {
        // Arrange
        Account account = new Account();

        // Act
        account.setVpa(VPA);

        // Assert
        assertEquals(VPA, account.getVpa());
    }

    @Test
    @DisplayName("setHolderName sets the account holder name correctly")
    void testSetHolderName() {
        // Arrange
        Account account = new Account();

        // Act
        account.setHolderName(HOLDER_NAME);

        // Assert
        assertEquals(HOLDER_NAME, account.getHolderName());
    }

    @Test
    @DisplayName("setBalance sets account balance correctly")
    void testSetBalance() {
        // Arrange
        Account account = new Account();

        // Act
        account.setBalance(INITIAL_BALANCE);

        // Assert
        assertEquals(INITIAL_BALANCE, account.getBalance());
    }

    @Test
    @DisplayName("Balance can be zero")
    void testBalanceCanBeZero() {
        // Arrange
        Account account = new Account();
        BigDecimal zeroBalance = new BigDecimal("0.00");

        // Act
        account.setBalance(zeroBalance);

        // Assert
        assertEquals(zeroBalance, account.getBalance());
    }

    @Test
    @DisplayName("Balance can be updated after withdrawal")
    void testBalanceUpdateAfterWithdrawal() {
        // Arrange
        Account account = new Account(VPA, HOLDER_NAME, INITIAL_BALANCE);
        BigDecimal withdrawalAmount = new BigDecimal("100.00");

        // Act - simulate withdrawal
        BigDecimal newBalance = account.getBalance().subtract(withdrawalAmount);
        account.setBalance(newBalance);

        // Assert
        assertEquals(new BigDecimal("4900.00"), account.getBalance());
    }

    @Test
    @DisplayName("Balance can be updated after deposit")
    void testBalanceUpdateAfterDeposit() {
        // Arrange
        Account account = new Account(VPA, HOLDER_NAME, INITIAL_BALANCE);
        BigDecimal depositAmount = new BigDecimal("500.00");

        // Act - simulate deposit
        BigDecimal newBalance = account.getBalance().add(depositAmount);
        account.setBalance(newBalance);

        // Assert
        assertEquals(new BigDecimal("5500.00"), account.getBalance());
    }

    @Test
    @DisplayName("setVersion sets optimistic lock version correctly")
    void testSetVersion() {
        // Arrange
        Account account = new Account();

        // Act
        account.setVersion(1L);

        // Assert
        assertEquals(1L, account.getVersion());
    }

    @Test
    @DisplayName("Version increments track concurrent modification attempts")
    void testVersionTracksModifications() {
        // Arrange
        Account account = new Account();
        account.setVersion(1L);

        // Act - simulate concurrent modification
        account.setVersion(2L);

        // Assert
        assertEquals(2L, account.getVersion());
    }

    @Test
    @DisplayName("Different accounts maintain separate VPAs")
    void testMultipleAccountsWithDifferentVpas() {
        // Arrange
        Account alice = new Account("alice@demo", "Alice", new BigDecimal("5000.00"));
        Account bob = new Account("bob@demo", "Bob", new BigDecimal("1000.00"));

        // Act & Assert
        assertNotEquals(alice.getVpa(), bob.getVpa());
        assertNotEquals(alice.getHolderName(), bob.getHolderName());
    }

    @Test
    @DisplayName("VPA acts as unique identifier for accounts")
    void testVpaAsUniqueIdentifier() {
        // Arrange
        String vpa = "user@bank";
        Account account1 = new Account(vpa, "User One", new BigDecimal("100.00"));
        Account account2 = new Account(vpa, "User Two", new BigDecimal("200.00"));

        // Act & Assert - same VPA identifies the account
        assertEquals(account1.getVpa(), account2.getVpa());
    }

    @Test
    @DisplayName("High precision balance stores rupees and paise")
    void testHighPrecisionBalance() {
        // Arrange
        Account account = new Account();
        BigDecimal preciseAmount = new BigDecimal("999.99"); // max paise

        // Act
        account.setBalance(preciseAmount);

        // Assert
        assertEquals(preciseAmount, account.getBalance());
    }
}
