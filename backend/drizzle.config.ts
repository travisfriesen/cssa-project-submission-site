import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './drizzle',
	schema: './src/lib/auth-schema.ts',
	dialect: 'postgresql',
	driver: 'pglite',
	dbCredentials: {
		url: process.env.DATABASE_PATH ?? '/app/database',
	},
	schemaFilter: ['public'],
});
