CREATE TABLE "submission" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"file_name" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "submission_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "discord_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_discord_id_unique" UNIQUE("discord_id");