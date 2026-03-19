import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { siteSettings } from "./schema";

const COOKIE_NAME = "site-access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  return process.env.AUTH_SECRET || "dev-secret";
}

function signToken(passwordVersion: number): string {
  const hmac = createHmac("sha256", getSecret())
    .update(String(passwordVersion))
    .digest("hex");
  return `${passwordVersion}.${hmac}`;
}

function verifyToken(token: string, currentVersion: number): boolean {
  const [versionStr, hmac] = token.split(".");
  if (Number(versionStr) !== currentVersion) return false;
  const expected = createHmac("sha256", getSecret())
    .update(versionStr)
    .digest("hex");
  return hmac === expected;
}

export async function getSiteSettings() {
  const row = await db.select().from(siteSettings).get();
  return row ?? null;
}

export async function ensureSiteSettingsRow() {
  let row = await db.select().from(siteSettings).get();
  if (!row) {
    await db.insert(siteSettings).values({});
    row = await db.select().from(siteSettings).get();
  }
  return row!;
}

export async function isSiteGateRequired(): Promise<boolean> {
  const settings = await getSiteSettings();
  if (!settings?.siteProtectionEnabled) return false;
  if (!settings.sitePasswordHash) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return true;

  return !verifyToken(token, settings.passwordVersion);
}

export async function setSiteAccessCookie(passwordVersion: number) {
  const token = signToken(passwordVersion);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearSiteAccessCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
