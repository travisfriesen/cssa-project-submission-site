import * as fs from "node:fs";
import {configDotenv} from "dotenv";

configDotenv();

const submissionsDir = process.env.SUBMISSIONS_PATH ?? "/app/submissions";

export async function saveFile(fileName: string, content: Buffer): Promise<boolean> {
    try {
        await fs.promises.mkdir(submissionsDir, {recursive: true});
        await fs.promises.writeFile(submissionsDir + "/" + fileName, content);
        return true;
    } catch (err) {
        console.error("Error saving file:", err);
        return false;
    }
}

export function getFile(fileName: string) {
    const filePath = submissionsDir + "/" + fileName;
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
    } else {
        console.error("File not found:", filePath);
        return null;
    }
}