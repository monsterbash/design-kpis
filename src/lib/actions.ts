"use server";

import { db } from "./db";
import { users, metrics, entries } from "./schema";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { auth, signIn, signOut } from "./auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTemplateById } from "./field-templates";

export async function signup(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) {
    return { error: "An account with this email already exists" };
  }

  await db.insert(users).values({
    name,
    email,
    password: hashSync(password, 10),
    role: role || "Product Designer",
  });

  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "CredentialsSignin"
    ) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function archiveUser(userId: number) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  await db
    .update(users)
    .set({ status: "archived" })
    .where(eq(users.id, userId));

  await db
    .update(metrics)
    .set({ status: "archived" })
    .where(eq(metrics.ownerId, userId));

  if (String(userId) === session.user.id) {
    await signOut({ redirectTo: "/" });
  }

  revalidatePath("/");
}

export async function archiveMetric(metricId: number) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  await db
    .update(metrics)
    .set({ status: "archived" })
    .where(eq(metrics.id, metricId));

  revalidatePath("/");
}

export async function createEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const metricId = Number(formData.get("metricId"));
  const description = formData.get("description") as string;
  const ratingsJson = formData.get("ratings") as string;

  if (!description) return { error: "Description is required" };

  const ratings = JSON.parse(ratingsJson);

  await db.insert(entries).values({
    metricId,
    submittedBy: Number(session.user.id),
    description,
    ratings,
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const entryId = Number(formData.get("entryId"));
  const description = formData.get("description") as string;
  const ratingsJson = formData.get("ratings") as string;

  const ratings = JSON.parse(ratingsJson);

  await db
    .update(entries)
    .set({
      description,
      ratings,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(entries.id, entryId));

  revalidatePath("/");
  return { success: true };
}

export async function deleteEntry(entryId: number) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  await db.delete(entries).where(eq(entries.id, entryId));

  revalidatePath("/");
  return { success: true };
}

export async function createMetric(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const fullDescription = formData.get("fullDescription") as string;
  const ownerId = Number(formData.get("ownerId"));
  const cadence = formData.get("cadence") as string;
  const target = formData.get("target") as string;
  const templateId = formData.get("fieldTemplate") as string;

  if (!name || !shortDescription || !fullDescription || !ownerId || !cadence || !target || !templateId) {
    return { error: "All fields are required" };
  }

  const template = getTemplateById(templateId);
  if (!template) {
    return { error: "Invalid field template" };
  }

  await db.insert(metrics).values({
    name,
    shortDescription,
    fullDescription,
    ownerId,
    cadence,
    target,
    fieldDefinitions: template.fieldDefinitions,
    displayType: template.displayType,
  });

  revalidatePath("/");
  redirect("/");
}
