import { db } from "@/lib/auth";
import * as schema from "@/lib/auth-schema";
import { eq } from "drizzle-orm";

export async function getFilesEntry(teamId: string) {
	return db.select().from(schema.submissions).where(eq(schema.submissions.teamId, teamId));
}

export function saveFileEntry(teamId: string, fileName: string) {
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
	return db.select().from(schema.submissions);
}
