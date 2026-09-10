import { describe, it, expect } from "vitest";
import {
  encryptSecret,
  decryptSecret,
  hashSecret,
  maskSecret,
} from "../utils/encryption";

describe("Encryption & Cryptographic Protection Utilities", () => {
  const sampleSecret = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sampleLeetCodeSession123456";

  it("should encrypt and decrypt secrets cleanly (round-trip)", () => {
    const encrypted = encryptSecret(sampleSecret);
    expect(encrypted).not.toBe(sampleSecret);
    expect(encrypted.startsWith("enc:v1:")).toBe(true);

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(sampleSecret);
  });

  it("should produce non-deterministic ciphertext due to random IV", () => {
    const enc1 = encryptSecret(sampleSecret);
    const enc2 = encryptSecret(sampleSecret);

    expect(enc1).not.toBe(enc2);
    expect(decryptSecret(enc1)).toBe(sampleSecret);
    expect(decryptSecret(enc2)).toBe(sampleSecret);
  });

  it("should detect tampering with ciphertext or auth tag", () => {
    const encrypted = encryptSecret(sampleSecret);
    const parts = encrypted.split(":");
    // Tamper with the ciphertext (last part)
    parts[parts.length - 1] = "ff" + parts[parts.length - 1].slice(2);
    const tampered = parts.join(":");

    expect(() => decryptSecret(tampered)).toThrow(/Failed to decrypt secret/);
  });

  it("should support backward compatibility for unencrypted legacy strings", () => {
    const legacyPlaintext = "legacy_session_token_12345";
    const result = decryptSecret(legacyPlaintext);
    expect(result).toBe(legacyPlaintext);
  });

  it("should handle empty strings safely", () => {
    expect(encryptSecret("")).toBe("");
    expect(decryptSecret("")).toBe("");
  });

  it("should generate deterministic HMAC-SHA256 blind index hashes", () => {
    const hash1 = hashSecret(sampleSecret);
    const hash2 = hashSecret(sampleSecret);
    const hashOther = hashSecret("different-secret");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashOther);
    expect(hash1).toHaveLength(64); // 256 bits = 64 hex characters
  });

  it("should mask secrets correctly for client display", () => {
    const masked = maskSecret("abcdef1234");
    expect(masked).toBe("••••••••••••••••1234");
    expect(masked).not.toContain("abcdef");

    expect(maskSecret("")).toBe("");
    expect(maskSecret("abc")).toBe("•••");
  });
});
