import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_EMAIL = "radurawebsite@proton.me";
const SESSION_COOKIE = "radura_admin_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  email: string;
  exp: number;
};

function sessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Admin session secret not configured");
  return secret;
}

function sign(body: string) {
  return createHmac("sha256", sessionSecret()).update(body).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function createSessionToken(email: string) {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  let expected: string;
  try {
    expected = sign(body);
  } catch {
    return null;
  }

  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf-8"),
    ) as SessionPayload;

    if (payload.email !== ADMIN_EMAIL || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(email: string, password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  if (email.toLowerCase() !== ADMIN_EMAIL) return false;
  return safeEqual(password, adminPassword);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}
