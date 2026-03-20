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

export function getFile(fileName: string) {
	const filePath = submissionsDir + "/" + fileName;
	if (fs.existsSync(filePath)) {
		const file = fs.readFileSync(filePath, "utf-8");
		return new Blob([file], { type: "text/plain" });
	} else {
		console.error("File not found:", filePath);
		return null;
	}
}
