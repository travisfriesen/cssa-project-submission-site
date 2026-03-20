import PocketBase from 'pocketbase';
import { configDotenv } from "dotenv";
import { Team } from "@/utils/Team";
configDotenv();

let _pb: PocketBase | null = null;

const getPb = async (): Promise<PocketBase> => {
	if (!_pb) {
		if (!process.env.POCKETBASE_HOST) {
			throw new Error("POCKETBASE_HOST is not set");
		}

		if (!process.env.POCKETBASE_EMAIL) {
			throw new Error("POCKETBASE_EMAIL is not set");
		}

		if (!process.env.POCKETBASE_PASSWORD) {
			throw new Error("POCKETBASE_PASSWORD is not set");
		}

		console.log("Connecting to PocketBase with host:", process.env.POCKETBASE_HOST);
		console.log("Using email:", process.env.POCKETBASE_EMAIL);

		_pb = new PocketBase(process.env.POCKETBASE_HOST);
		await _pb.admins.authWithPassword(process.env.POCKETBASE_EMAIL, process.env.POCKETBASE_PASSWORD);
		await _pb.autoCancellation(false);
	}

	return _pb;
};

export async function GetTeamIDByUserID(discordId: string): Promise<string | null> {
	const pb = await getPb();

	console.log("getting team");

	try {
		const team = await pb.collection("teams").getFirstListItem(
			`team_member_1 = "${discordId}" || team_member_2 = "${discordId}" || team_member_3 = "${discordId}" || team_member_4 = "${discordId}" || team_member_5 = "${discordId}"`
		);


		return team.team_id ?? null;

	} catch {
		return null;
	}
}
