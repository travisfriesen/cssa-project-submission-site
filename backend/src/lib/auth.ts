import { betterAuth } from "better-auth/minimal";
import { PGlite } from "@electric-sql/pglite"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { configDotenv } from "dotenv";
import * as schema from "./auth-schema";
import path from "node:path";

configDotenv();

const dbPath = process.env.DATABASE_PATH ?? "/app/database";
const client = new PGlite(dbPath);
const db = drizzle({ client, schema });

async function createAuth() {
	await migrate(db, { migrationsFolder: path.join(__dirname, "../../drizzle") });

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			schema
		}),
		user: {
			additionalFields: {
				discordId: {
					type: "string",
					required: false,
					fieldName: "discordId",
				}
			}
		},
		socialProviders: {
			discord: {
				clientId: process.env.DISCORD_CLIENT_ID as string,
				clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
				scope: ["identify"],
				disableDefaultScope: true,
				disableIdTokenSignIn: true,
				mapProfileToUser: (profile) => {
					return {
						name: profile.username,
						email: `${profile.id}@discord.placeholder`,
						emailVerified: false,
						image: profile.avatar
							? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
							: undefined,
						discordId: profile.id,
					}
				}
			},
		},
		trustedOrigins: [process.env.CORS_ORIGIN as string],
	});
}

export const authPromise = createAuth();
