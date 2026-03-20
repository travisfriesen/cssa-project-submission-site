import { PGlite } from "@electric-sql/pglite";
import { configDotenv } from "dotenv";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/lib/auth-schema";
import { eq } from "drizzle-orm";

configDotenv();

function createClient() {
	const dbPath = process.env.DATABASE_PATH ?? "/app/database";
	const client = new PGlite(dbPath);
	return drizzle({ client });
}

export async function getFilesEntry(teamId: string) {
	const db = createClient();
	return db.select().from(schema.submissions).where(eq(schema.submissions.teamId, teamId));
}

export function saveFileEntry(teamId: string, fileName: string) {
	const db = createClient();
	const a = db.insert(schema.submissions).values({
		id: crypto.randomUUID(),
		teamId: teamId,
		fileName: fileName,
		uploadedAt: new Date(),
	});
	console.log(a);
	return a;
}

export function getAllFilesEntry() {
	const db = createClient();
	return db.select().from(schema.submissions);
}
