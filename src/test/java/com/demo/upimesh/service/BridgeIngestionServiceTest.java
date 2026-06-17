package com.demo.upimesh.service;

import com.demo.upimesh.crypto.HybridCryptoService;
import com.demo.upimesh.model.MeshPacket;
import com.demo.upimesh.model.PaymentInstruction;
import com.demo.upimesh.model.Transaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BridgeIngestionService
 * Tests packet ingestion pipeline including idempotency, decryption, freshness, and settlement
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BridgeIngestionService Tests")
class BridgeIngestionServiceTest {

    @Mock
    private HybridCryptoService crypto;

    @Mock
    private IdempotencyService idempotency;

    @Mock
    private SettlementService settlement;

    @InjectMocks
    private BridgeIngestionService bridgeIngestionService;

    private MeshPacket packet;
    private PaymentInstruction instruction;
    private Transaction transaction;
    private String packetHash;
    private long currentTime;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bridgeIngestionService, "maxAgeSeconds", 86400L);

        currentTime = Instant.now().toEpochMilli();
        packet = new MeshPacket();
        packet.setCiphertext("encrypted-data-123");

        instruction = new PaymentInstruction();
        instruction.setSenderVpa("alice@demo");
        instruction.setReceiverVpa("bob@demo");
        instruction.setAmount(new BigDecimal("100.00"));
        instruction.setSignedAt(currentTime);

        transaction = new Transaction();
        transaction.setId(1L);
        transaction.setStatus(Transaction.Status.SETTLED);
        transaction.setAmount(new BigDecimal("100.00"));

        packetHash = "hash-abc123def456";
    }

    @Test
    @DisplayName("should successfully ingest valid packet")
    void testIngestValidPacket() throws Exception {
        when(crypto.hashCiphertext("encrypted-data-123")).thenReturn(packetHash);
        when(idempotency.claim(packetHash)).thenReturn(true);
        when(crypto.decrypt("encrypted-data-123")).thenReturn(instruction);
        when(settlement.settle(any(), anyString(), anyString(), anyInt())).thenReturn(transaction);

        BridgeIngestionService.IngestResult result = bridgeIngestionService.ingest(packet, "bridge-1", 2);

        assertEquals("SETTLED", result.outcome());
        assertEquals(packetHash, result.packetHash());
        assertEquals(1L, result.transactionId());
        assertNull(result.reason());

        verify(crypto).hashCiphertext("encrypted-data-123");
        verify(idempotency).claim(packetHash);
        verify(crypto).decrypt("encrypted-data-123");
        verify(settlement).settle(instruction, packetHash, "bridge-1", 2);
    }

    @Test
    @DisplayName("should reject duplicate packets")
    void testIngestDuplicatePacket() throws Exception {
        when(crypto.hashCiphertext("encrypted-data-123")).thenReturn(packetHash);
        when(idempotency.claim(packetHash)).thenReturn(false);

        BridgeIngestionService.IngestResult result = bridgeIngestionService.ingest(packet, "bridge-1", 2);

        assertEquals("DUPLICATE_DROPPED", result.outcome());
        assertEquals(packetHash, result.packetHash());
        assertNull(result.reason());
        verify(settlement, never()).settle(any(), anyString(), anyString(), anyInt());
    }

    @Test
    @DisplayName("should reject stale packets")
    void testIngestStalePacket() throws Exception {
        long staleTime = currentTime - (25 * 60 * 60 * 1000);  // 25 hours ago
        instruction.setSignedAt(staleTime);

        when(crypto.hashCiphertext("encrypted-data-123")).thenReturn(packetHash);
        when(idempotency.claim(packetHash)).thenReturn(true);
        when(crypto.decrypt("encrypted-data-123")).thenReturn(instruction);

        BridgeIngestionService.IngestResult result = bridgeIngestionService.ingest(packet, "bridge-1", 2);

        assertEquals("INVALID", result.outcome());
        assertEquals(packetHash, result.packetHash());
        assertEquals("stale_packet", result.reason());
        verify(settlement, never()).settle(any(), anyString(), anyString(), anyInt());
    }

    @Test
    @DisplayName("should accept packet within max age")
    void testIngestPacketWithinMaxAge() throws Exception {
        long recentTime = currentTime - (10 * 60 * 60 * 1000);  // 10 hours ago
        instruction.setSignedAt(recentTime);

        when(crypto.hashCiphertext("encrypted-data-123")).thenReturn(packetHash);
        when(idempotency.claim(packetHash)).thenReturn(true);
        when(crypto.decrypt("encrypted-data-123")).thenReturn(instruction);
        when(settlement.settle(any(), anyString(), anyString(), anyInt())).thenReturn(transaction);

        BridgeIngestionService.IngestResult result = bridgeIngestionService.ingest(packet, "bridge-1", 2);

        assertEquals("SETTLED", result.outcome());
        verify(settlement).settle(any(), anyString(), anyString(), anyInt());
    }

    @Test
    @DisplayName("should tolerate minor clock skew")
    void testIngestMinorClockSkew() throws Exception {
        long minorSkew = currentTime + (4 * 60 * 1000);  // 4 minutes in future
        instruction.setSignedAt(minorSkew);

        when(crypto.hashCiphertext("encrypted-data-123")).thenReturn(packetHash);
        when(idempotency.claim(packetHash)).thenReturn(true);
        when(crypto.decrypt("encrypted-data-123")).thenReturn(instruction);
        when(settlement.settle(any(), anyString(), anyString(), anyInt())).thenReturn(transaction);

        BridgeIngestionService.IngestResult result = bridgeIngestionService.ingest(packet, "bridge-1", 2);

        assertEquals("SETTLED", result.outcome());
        verify(settlement).settle(any(), anyString(), anyString(), anyInt());
    }

    @Test
    @DisplayName("should pass correct bridge metadata to settlement")
    void testIngestPassesBridgeMetadata() throws Exception {
        when(crypto.hashCiphertext("encrypted-data-123")).thenReturn(packetHash);
        when(idempotency.claim(packetHash)).thenReturn(true);
        when(crypto.decrypt("encrypted-data-123")).thenReturn(instruction);
        when(settlement.settle(any(), anyString(), anyString(), anyInt())).thenReturn(transaction);

        bridgeIngestionService.ingest(packet, "bridge-xyz-001", 5);

        verify(settlement).settle(any(), eq(packetHash), eq("bridge-xyz-001"), eq(5));
    }

    @Test
    @DisplayName("should simulate real-world mesh bridge scenario")
    void testRealWorldMeshBridgeScenario() throws Exception {
        when(crypto.hashCiphertext(anyString())).thenReturn(packetHash);
        when(crypto.decrypt(anyString())).thenReturn(instruction);
        when(settlement.settle(any(), anyString(), anyString(), anyInt())).thenReturn(transaction);

        when(idempotency.claim(packetHash)).thenReturn(true);
        BridgeIngestionService.IngestResult result1 = bridgeIngestionService.ingest(packet, "bridge-1", 1);
        assertEquals("SETTLED", result1.outcome());

        when(idempotency.claim(packetHash)).thenReturn(false);
        BridgeIngestionService.IngestResult result2 = bridgeIngestionService.ingest(packet, "bridge-2", 2);
        assertEquals("DUPLICATE_DROPPED", result2.outcome());

        BridgeIngestionService.IngestResult result3 = bridgeIngestionService.ingest(packet, "bridge-3", 3);
        assertEquals("DUPLICATE_DROPPED", result3.outcome());

        verify(settlement, times(1)).settle(any(), anyString(), anyString(), anyInt());
    }
}
