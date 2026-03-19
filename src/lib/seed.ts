import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { hashSync } from "bcryptjs";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import { getTemplateById } from "./field-templates";
import path from "path";
import fs from "fs";

const seedDataPath = path.join(process.cwd(), "seed-data.json");

if (!fs.existsSync(seedDataPath)) {
  console.error(
    "seed-data.json not found. Copy seed-data.example.json to seed-data.json and fill in your data."
  );
  process.exit(1);
}

const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"));

const dbPath = path.join(process.cwd(), "local.db");
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

const migrationsPath = path.join(process.cwd(), "drizzle");
const migrationFiles = fs
  .readdirSync(migrationsPath)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of migrationFiles) {
  const sql = fs.readFileSync(path.join(migrationsPath, file), "utf8");
  sqlite.exec(sql);
}

for (const user of seedData.users) {
  db.insert(schema.users)
    .values({
      name: user.name,
      email: user.email,
      password: hashSync(user.password, 10),
      role: user.role || "Product Designer",
    })
    .run();
}

for (const metric of seedData.metrics) {
  const owner = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, metric.ownerEmail))
    .get();

  if (!owner) {
    console.error(`Owner not found for metric "${metric.name}": ${metric.ownerEmail}`);
    continue;
  }

  const template = getTemplateById(metric.fieldTemplate);
  if (!template) {
    console.error(`Unknown field template "${metric.fieldTemplate}" for metric "${metric.name}"`);
    continue;
  }

  db.insert(schema.metrics)
    .values({
      name: metric.name,
      shortDescription: metric.shortDescription,
      fullDescription: metric.fullDescription,
      ownerId: owner.id,
      cadence: metric.cadence,
      target: metric.target,
      fieldDefinitions: template.fieldDefinitions,
      displayType: template.displayType,
    })
    .run();
}

console.log(
  `Seed complete: ${seedData.users.length} users, ${seedData.metrics.length} metrics`
);
sqlite.close();
