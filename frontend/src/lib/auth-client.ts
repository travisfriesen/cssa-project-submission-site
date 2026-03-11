import { createAuthClient } from "better-auth/react";

const authUrl = import.meta.env.VITE_AUTH_URL as string;

export const authClient = createAuthClient({
	baseURL: authUrl,
})

