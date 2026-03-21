import { toNodeHandler } from "better-auth/node";
import express, { Request, Response, NextFunction } from "express";
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
const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES ?? 25 * 1024 * 1024);
const uploadRateWindowMs = Number(process.env.UPLOAD_RATE_WINDOW_MS ?? 60 * 1000);
const uploadRateMaxRequests = Number(process.env.UPLOAD_RATE_MAX_REQUESTS ?? 10);
const uploadAttempts = new Map<string, { windowStart: number; count: number }>();

const rawUploadParser = express.raw({
	type: ["application/zip", "application/x-zip-compressed", "application/octet-stream"],
	limit: `${maxUploadBytes}b`,
});

// Authentication middleware
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
	const auth = await authPromise;
	const session = await auth.api.getSession({ headers: req.headers as any });

	if (!session) {
		res.status(401).json({ error: "Unauthorized. Please sign in." });
		return;
	}

	// Add session to request object for use in route handlers
	(req as any).session = session;
	next();
};

const isAdmin = async (req: Request, res: Response, next:NextFunction) => {
	const auth = await authPromise;
	const session = await auth.api.getSession({ headers: req.headers as any });

	// @ts-expect-error trust me its there
	const uID: string | undefined = session?.user.discordId

	const adminIds = ["1145458761151033374", "707753613967229011", "259881984069730304"];

	if (!uID || !adminIds.includes(uID)) {
		res.status(403).json({ error: "Not admin." });
		return;
	}

	// Add session to request object for use in route handlers
	(req as any).session = session;
	next();
}

const getDiscordIdFromSession = (session: any): string | undefined =>
	session?.user?.discordId ??
	session?.session?.user?.discordId ??
	session?.user?.user_metadata?.discordId;

const uploadRateLimit = (req: Request, res: Response, next: NextFunction) => {
	const session = (req as any).session;
	const userKey = session?.user?.id ?? req.ip;
	const now = Date.now();
	const current = uploadAttempts.get(userKey);

	if (!current || now - current.windowStart >= uploadRateWindowMs) {
		uploadAttempts.set(userKey, { windowStart: now, count: 1 });
		next();
		return;
	}

	if (current.count >= uploadRateMaxRequests) {
		res.status(429).json({ error: "Too many upload attempts. Please retry shortly." });
		return;
	}

	current.count += 1;
	uploadAttempts.set(userKey, current);
	next();
};

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

	app.use(express.json({ limit: "1mb" }));
	
	app.use(
		cors({
			origin: process.env.CORS_ORIGIN,
			methods: ["GET", "POST", "PUT", "DELETE"],
			credentials: true,
		})
	);

	app.all("/api/auth/*splat", toNodeHandler(auth));

	app.get("/api/team-id/:uid", requireAuth, async (req, res) => {
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

	app.get("/api/submissions/", requireAuth, isAdmin, async (req, res) => {
		const submissions = await getAllFilesEntry();
		res.json({ submissions });
	})

	app.post("/api/submissions/:teamId", requireAuth, uploadRateLimit, rawUploadParser, express.raw({ type: '*/*', limit: '2gb' }), async (req, res) => {
		const teamId = getParamValue(req.params.teamId);

		if (!teamId) {
			res.status(400).json({ error: "Missing teamId parameter" });
			return;
		}

		const discordId = getDiscordIdFromSession((req as any).session);
		if (!discordId) {
			res.status(403).json({ error: "Missing Discord identity in session" });
			return;
		}

		const teamIdForUser = await GetTeamIDByUserID(discordId);
		if (!teamIdForUser || teamIdForUser !== teamId) {
			res.status(403).json({ error: "You are not authorized to upload for this team" });
			return;
		}

		const submissionData = req.body;
		if (!Buffer.isBuffer(submissionData) || submissionData.length === 0) {
			res.status(400).json({ error: "Upload body must be a non-empty binary payload" });
			return;
		}

		const fileName = `${teamId}_${Date.now()}.zip`;
		const result = await saveFile(fileName, submissionData);
			if (!result) {
				res.status(500).json({ error: "Failed to save submission file" });
				return;
			}

		await saveFileEntry(teamId, fileName);
		res.json({ success: true, fileName });
	})

	app.get("/api/submissions/:teamId", requireAuth, async (req, res) => {
		const teamId = getParamValue(req.params.teamId);
		if (!teamId) {
			res.status(400).json({ error: "Missing teamId parameter" });
			return;
		}

		const entries = await getFilesEntry(teamId);
		res.json({ entries });
	})

	app.get("/api/submissions/file/:fileName", requireAuth, async (req, res) => {
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

	app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
		if (err?.type === "entity.too.large") {
			res.status(413).json({ error: "Upload exceeds maximum allowed size" });
			return;
		}

		next(err);
	});

	app.listen(port, () => {
		console.log(`Example app listening on port ${port}`);
	});
})();