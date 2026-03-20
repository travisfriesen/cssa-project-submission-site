import * as fs from "node:fs";
import { configDotenv } from "dotenv";

configDotenv();

const submissionsDir = process.env.SUBMISSIONS_PATH ?? "/app/submissions";

export function saveFile(fileName: string, content: Buffer | string): boolean {
	fs.writeFile(submissionsDir + "/" + fileName, content, (err) => {
		if (err) {
			console.error("Error saving file:", err);
			return false;
		} else {
			return true;
		}
	});
	return true;
}

export function getFile(fileName: string): Buffer | null {
	const filePath = submissionsDir + "/" + fileName;
	if (fs.existsSync(filePath)) {
		return fs.readFileSync(filePath);
	} else {
		console.error("File not found:", filePath);
		return null;
	}
}
