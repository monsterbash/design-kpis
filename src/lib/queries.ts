import { db } from "./db";
import { users, metrics, entries } from "./schema";
import { eq } from "drizzle-orm";

export async function getActiveMetrics() {
  return db.select().from(metrics).where(eq(metrics.status, "active")).all();
}

export async function getArchivedMetrics() {
  return db.select().from(metrics).where(eq(metrics.status, "archived")).all();
}

export async function getMetricById(id: number) {
  return db.select().from(metrics).where(eq(metrics.id, id)).get();
}

export async function getEntriesForMetric(metricId: number) {
  return db
    .select()
    .from(entries)
    .where(eq(entries.metricId, metricId))
    .all();
}

export async function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export async function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get();
}

export async function getAllUsers() {
  return db.select().from(users).all();
}

export async function getActiveUsers() {
  return db.select().from(users).where(eq(users.status, "active")).all();
}
