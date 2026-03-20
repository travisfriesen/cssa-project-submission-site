import { toNodeHandler } from "better-auth/node";
import express from "express";
import { configDotenv } from "dotenv";
// @ts-ignore
import cors from "cors";
import {authPromise} from "./lib/auth";
import { GetTeamIDByUserID } from "./lib/pocketbase";
import {getAllFilesEntry, getFilesEntry, saveFileEntry} from "./lib/pg-database";
import {getFile, saveFile} from "./utils/files";
configDotenv();


const app = express();
const port = process.env.BACKEND_PORT;

export const getParamValue = (
	param: string | string[] | undefined,
): string | undefined =>
	typeof param === "string"
		? param
		: Array.isArray(param)
			? param[0]
			: undefined;

(async () => {
	const auth = await authPromise;

	app.use(
		cors({
			origin: process.env.CORS_ORIGIN,
			methods: ["GET", "POST", "PUT", "DELETE"],
			credentials: true,
		})
	);

	app.all("/api/auth/*splat", toNodeHandler(auth));

	app.use(express.json());

	app.get("/api/team-id/:uid", async (req, res) => {
		const uid = getParamValue(req.params.uid);

		if (!uid) {
			res.status(400).json({ error: "Missing uid parameter" });
			return;
		}

		try {
			const teamId = await GetTeamIDByUserID(uid);

			if (!teamId) {
				res.status(404).json({ error: "Team not found for user" });
				return;
			}

			res.json({ teamId });
		} catch (err) {
			console.error("Error fetching team ID:", err);
		}
	});

	app.post("/api/submissions/:teamId", express.raw({ type: '*/*', limit: '2gb' }), async (req, res) => {
		const teamId = getParamValue(req.params.teamId);

		if (!teamId) {
			res.status(400).json({ error: "Missing teamId parameter" });
			return;
		}

		const submissionData = req.body;
		const fileName = `${teamId}_${Date.now()}.zip`;
		const result = saveFile(fileName, submissionData)
			if (!result) {
				res.status(500).json({ error: "Failed to save submission file" });
				return;
			}

		await saveFileEntry(teamId, fileName);
		res.json({ success: true, fileName });
	})

	app.get("/api/submissions/:teamId", async (req, res) => {
		const teamId = getParamValue(req.params.teamId);
		if (!teamId) {
			res.status(400).json({ error: "Missing teamId parameter" });
			return;
		}

		const entries = await getFilesEntry(teamId);
		res.json({ entries });
	})

	app.get("/api/submissions/", async (req, res) => {
		const submissions = getAllFilesEntry();
		res.json({ submissions });
	})

	app.get("/api/submissions/file/:fileName", async (req, res) => {
		const fileName = getParamValue(req.params.fileName);
		if (!fileName) {
			res.status(400).json({ error: "Missing fileName parameter" });
			return;
		}

		const file = getFile(fileName);

		if (!file) {
			res.status(404).json({ error: "File not found" });
			return;
		}

		res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
		res.setHeader("Content-Type", "application/zip");
		res.send(file);
	})

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`);
	});
})();