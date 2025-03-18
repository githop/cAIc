import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { loadEnvFile } from "node:process";

loadEnvFile();

const client = createClient({ url: process.env.DB_FILE_NAME! });
export const db = drizzle({ client });
console.log("db??", db);
