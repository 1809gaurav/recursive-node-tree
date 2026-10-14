import pg from "pg";
import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

dotenv.config();

const { Pool } = pg;


const useSsl = process.env.DATABASE_SSL === "true";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(path.join(dir, "..", "schema.sql"), "utf8");
  await pool.query(sql);
}