import { Router } from "express";

import { env } from "../config";

const router = Router();

// Generate OAuth authorization URL and redirect user to Salesforce
router.get("/salesforce/start", (req, res) => {
	if (!env.SALESFORCE_CLIENT_ID || !env.SALESFORCE_CLIENT_SECRET) {
		res.status(400).json({
			error: "Missing SALESFORCE_CLIENT_ID or SALESFORCE_CLIENT_SECRET in environment",
		});
		return;
	}

	const authUrl = new URL(`${env.SALESFORCE_LOGIN_URL}/services/oauth2/authorize`);
	authUrl.searchParams.set("response_type", "code");
	authUrl.searchParams.set("client_id", env.SALESFORCE_CLIENT_ID);
	authUrl.searchParams.set("redirect_uri", `http://localhost:${env.SERVER_PORT}/auth/salesforce/callback`);
	authUrl.searchParams.set("scope", "refresh_token offline_access api");

	res.redirect(authUrl.toString());
});

// Handle OAuth callback and exchange code for tokens
router.get("/salesforce/callback", async (req, res) => {
	const { code, error } = req.query;

	if (error) {
		res.status(400).send(`
			<html>
				<head><title>Salesforce OAuth Error</title></head>
				<body style="font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px;">
					<h1>❌ OAuth Error</h1>
					<p><strong>Error:</strong> ${error}</p>
					<p><strong>Description:</strong> ${req.query.error_description || "Unknown error"}</p>
					<a href="/">← Return to app</a>
				</body>
			</html>
		`);
		return;
	}

	if (!code || typeof code !== "string") {
		res.status(400).send(`
			<html>
				<head><title>Missing Authorization Code</title></head>
				<body style="font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px;">
					<h1>❌ Missing Code</h1>
					<p>No authorization code received from Salesforce.</p>
					<a href="/auth/salesforce/start">← Try again</a>
				</body>
			</html>
		`);
		return;
	}

	try {
		// Exchange code for tokens
		const tokenResponse = await fetch(`${env.SALESFORCE_LOGIN_URL}/services/oauth2/token`, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				grant_type: "authorization_code",
				client_id: env.SALESFORCE_CLIENT_ID!,
				client_secret: env.SALESFORCE_CLIENT_SECRET!,
				redirect_uri: `http://localhost:${env.SERVER_PORT}/auth/salesforce/callback`,
				code,
			}).toString(),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			throw new Error(`Token exchange failed: ${errorText}`);
		}

		const tokens = await tokenResponse.json();
		const { refresh_token, instance_url } = tokens;

		if (!refresh_token) {
			throw new Error("No refresh token received. Make sure your Connected App has 'refresh_token' and 'offline_access' scopes.");
		}

		// Display success page with refresh token
		res.send(`
			<html>
				<head>
					<title>✅ Salesforce OAuth Success</title>
					<style>
						body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
						.token-box { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace; word-break: break-all; }
						.copy-btn { background: #0176d3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px; }
						.copy-btn:hover { background: #014486; }
						.success { color: #2e844a; }
						.warning { background: #fff3cd; border: 1px solid #ffecb5; padding: 15px; border-radius: 8px; margin: 20px 0; }
					</style>
				</head>
				<body>
					<h1 class="success">✅ OAuth Setup Complete!</h1>
					<p>Your Salesforce integration is ready. Copy the refresh token below and add it to your <code>.env</code> file:</p>
					
					<h3>Refresh Token:</h3>
					<div class="token-box" id="refresh-token">${refresh_token}</div>
					<button class="copy-btn" onclick="copyToken()">📋 Copy Token</button>
					
					<div class="warning">
						<h4>⚠️ Next Steps:</h4>
						<ol>
							<li>Copy the refresh token above</li>
							<li>Add it to your <code>.env</code> file as <code>SALESFORCE_REFRESH_TOKEN="..."</code></li>
							<li>Restart your dev server (<code>pnpm dev</code>)</li>
							<li>Test the Salesforce Query component in your app</li>
						</ol>
					</div>

					<p><strong>Instance URL:</strong> <code>${instance_url}</code></p>
					<p><a href="/">← Return to app</a></p>

					<script>
						function copyToken() {
							const token = document.getElementById('refresh-token').textContent;
							navigator.clipboard.writeText(token).then(() => {
								const btn = document.querySelector('.copy-btn');
								const originalText = btn.textContent;
								btn.textContent = '✅ Copied!';
								setTimeout(() => btn.textContent = originalText, 2000);
							});
						}
					</script>
				</body>
			</html>
		`);
	} catch (error) {
		console.error("OAuth callback error:", error);
		res.status(500).send(`
			<html>
				<head><title>OAuth Token Exchange Error</title></head>
				<body style="font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px;">
					<h1>❌ Token Exchange Failed</h1>
					<p><strong>Error:</strong> ${error instanceof Error ? error.message : "Unknown error"}</p>
					<p>Make sure your Connected App is configured correctly with the right client ID/secret.</p>
					<a href="/auth/salesforce/start">← Try again</a>
				</body>
			</html>
		`);
	}
});

export const authRouter = router;
