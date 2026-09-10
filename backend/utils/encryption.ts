import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const PREFIX = "enc:v1:";

/**
 * Derives a consistent 32-byte cryptographic key from environment variables.
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.COOKIE_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "default-dsa-tracker-dev-insecure-key-32b";

  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a sensitive string using AES-256-GCM with a fresh random IV.
 * Serialized output: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");
  const ivHex = iv.toString("hex");

  return `${PREFIX}${ivHex}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * If the input does not start with `enc:v1:`, it is returned as-is for backward compatibility.
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText || !cipherText.startsWith(PREFIX)) {
    return cipherText;
  }

  try {
    const key = getEncryptionKey();
    const payload = cipherText.slice(PREFIX.length);
    const parts = payload.split(":");

    if (parts.length !== 3) {
      throw new Error("Invalid encrypted payload format");
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error: any) {
    console.error("Decryption error:", error?.message);
    throw new Error("Failed to decrypt secret. Key mismatch or corrupted data.");
  }
}

/**
 * Generates an HMAC-SHA256 blind index hash of a secret.
 * Used for fast O(1) database equality lookups without storing or comparing plaintext.
 */
export function hashSecret(secret: string): string {
  if (!secret) return "";
  const key = getEncryptionKey();
  return crypto
    .createHmac("sha256", key)
    .update(secret.trim())
    .digest("hex");
}

/**
 * Masks a sensitive secret for display in client UI responses.
 * Example: 'session-xyz-1234' -> '••••••••••••••••1234'
 */
export function maskSecret(secret: string, visibleChars = 4): string {
  if (!secret) return "";
  const clean = secret.trim();
  if (clean.length <= visibleChars) {
    return "•".repeat(clean.length || 4);
  }
  const suffix = clean.slice(-visibleChars);
  return `${"•".repeat(16)}${suffix}`;
}
