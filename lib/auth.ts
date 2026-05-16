export const COOKIE_NAME = "workhub_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-change-me";
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes.buffer;
}

export async function createSessionToken(): Promise<string> {
  const nonce = new Uint8Array(32);
  globalThis.crypto.getRandomValues(nonce);
  const nonceHex = bufToHex(nonce.buffer);
  const key = await importHmacKey(getSecret());
  const sig = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(nonceHex),
  );
  return `${nonceHex}.${bufToHex(sig)}`;
}

export async function isValidSessionToken(token: string): Promise<boolean> {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const nonce = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);
  if (!nonce || sig.length !== 64) return false;
  try {
    const key = await importHmacKey(getSecret());
    return await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      hexToBuf(sig),
      new TextEncoder().encode(nonce),
    );
  } catch {
    return false;
  }
}

// Constant-time password comparison (no hashing needed for a personal tool —
// AUTH_PASSWORD lives only in .env and never leaves the server).
export function verifyPassword(input: string): boolean {
  const expected = process.env.AUTH_PASSWORD ?? "";
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
