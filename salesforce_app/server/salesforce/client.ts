import axios from "axios";

import { env, isSalesforceConfigured } from "../config";

interface TokenResponse {
	access_token: string;
	instance_url: string;
}

export interface SalesforceQueryResponse<TRecord = Record<string, unknown>> {
	totalSize: number;
	done: boolean;
	records: TRecord[];
}

let cachedToken: TokenResponse | null = null;
let tokenExpiresAt = 0;

function assertConfigured(): asserts isSalesforceConfigured is true {
	if (!isSalesforceConfigured) {
		throw new Error(
			"Salesforce environment variables are not configured. Update .env with the required credentials.",
		);
	}
}

async function refreshAccessToken() {
	assertConfigured();
	const now = Date.now();
	if (cachedToken && tokenExpiresAt > now + 30_000) {
		return cachedToken;
	}

	const params = new URLSearchParams({
		grant_type: "refresh_token",
		client_id: env.SALESFORCE_CLIENT_ID!,
		client_secret: env.SALESFORCE_CLIENT_SECRET!,
		refresh_token: env.SALESFORCE_REFRESH_TOKEN!,
	});

	const { data } = await axios.post<TokenResponse>(
		`${env.SALESFORCE_LOGIN_URL}/services/oauth2/token`,
		params.toString(),
		{
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		},
	);

	cachedToken = data;
	tokenExpiresAt = now + 14 * 60 * 1000;
	return data;
}

export async function runSoql<TRecord = Record<string, unknown>>(
	query: string,
) {
	const { access_token, instance_url } = await refreshAccessToken();
	const url = `${instance_url}/services/data/v${env.SALESFORCE_API_VERSION}/query`;

	const response = await axios.post<SalesforceQueryResponse<TRecord>>(
		url,
		{ query },
		{
			headers: {
				Authorization: `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
		},
	);

	return response.data;
}

export async function getSampleAccounts() {
	const query = "SELECT Id, Name, Type FROM Account LIMIT 10";
	return runSoql<{ Id: string; Name: string; Type?: string }>(query);
}
