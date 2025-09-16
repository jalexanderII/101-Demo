import { config } from "dotenv";

config();

const REQUIRED_SALESFORCE_KEYS = [
	"SALESFORCE_CLIENT_ID",
	"SALESFORCE_CLIENT_SECRET",
	"SALESFORCE_REFRESH_TOKEN",
] as const;

const rawEnv = {
	SALESFORCE_CLIENT_ID: process.env.SALESFORCE_CLIENT_ID,
	SALESFORCE_CLIENT_SECRET: process.env.SALESFORCE_CLIENT_SECRET,
	SALESFORCE_REFRESH_TOKEN: process.env.SALESFORCE_REFRESH_TOKEN,
	SALESFORCE_LOGIN_URL: process.env.SALESFORCE_LOGIN_URL,
	SALESFORCE_API_VERSION: process.env.SALESFORCE_API_VERSION,
	SERVER_PORT: process.env.SERVER_PORT,
	VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
} as const;

export const missingSalesforceEnv = REQUIRED_SALESFORCE_KEYS.filter(
	(key) => !rawEnv[key],
);

if (missingSalesforceEnv.length > 0) {
	console.warn(
		`[salesforce] Missing environment variables: ${missingSalesforceEnv.join(", ")}. The API will return 503 until credentials are provided.`,
	);
}

export const env = {
	...rawEnv,
	SALESFORCE_LOGIN_URL:
		rawEnv.SALESFORCE_LOGIN_URL ?? "https://login.salesforce.com",
	SALESFORCE_API_VERSION: rawEnv.SALESFORCE_API_VERSION ?? "65.0",
	SERVER_PORT: Number(rawEnv.SERVER_PORT ?? 5174),
} as const;

export const isSalesforceConfigured = missingSalesforceEnv.length === 0;
