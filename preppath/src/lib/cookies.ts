import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "bb_api_key";
const ALGORITHM = "aes-256-gcm";

function getSecret(): Buffer {
  const secret = process.env.COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("COOKIE_SECRET must be at least 32 characters");
  }
  return crypto.scryptSync(secret, "preppath-salt", 32);
}

export function encryptApiKey(apiKey: string): string {
  const key = getSecret();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

export function decryptApiKey(encryptedValue: string): string {
  const key = getSecret();
  const [ivHex, tagHex, encrypted] = encryptedValue.split(":");

  if (!ivHex || !tagHex || !encrypted) {
    throw new Error("Invalid encrypted value format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function storeApiKey(apiKey: string): Promise<void> {
  const encrypted = encryptApiKey(apiKey);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function getApiKey(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;
    return decryptApiKey(cookie.value);
  } catch {
    return null;
  }
}

export async function clearApiKey(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
