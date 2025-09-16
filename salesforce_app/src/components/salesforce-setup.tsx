import { ExternalLink, Key, RefreshCw, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5174";

interface SalesforceSetupProps {
	onRefresh?: () => void;
}

export function SalesforceSetup({ onRefresh }: SalesforceSetupProps) {
	const handleStartOAuth = () => {
		window.open(`${API_BASE_URL}/auth/salesforce/start`, '_blank', 'width=600,height=700');
	};

	return (
		<Card className="border-amber-200 bg-amber-50">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Settings className="h-5 w-5 text-amber-600" />
					<CardTitle className="text-amber-900">Salesforce Setup Required</CardTitle>
				</div>
				<CardDescription className="text-amber-700">
					Complete one-time OAuth setup to enable Salesforce queries.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3 text-sm">
					<div className="flex items-start gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-medium">1</span>
						<div>
							<p className="font-medium">Update your Connected App callback URL:</p>
							<code className="text-xs bg-white px-2 py-1 rounded border">
								http://localhost:5174/auth/salesforce/callback
							</code>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-medium">2</span>
						<div>
							<p className="font-medium">Start OAuth flow:</p>
							<p className="text-amber-600 text-xs">Click below to authorize and get your refresh token</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-medium">3</span>
						<div>
							<p className="font-medium">Add credentials to <code>.env</code>:</p>
							<p className="text-amber-600 text-xs">Copy the refresh token and restart dev server</p>
						</div>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-2 pt-2">
					<Button onClick={handleStartOAuth} className="flex items-center gap-2">
						<Key className="h-4 w-4" />
						Start Salesforce OAuth
						<ExternalLink className="h-3 w-3" />
					</Button>
					{onRefresh && (
						<Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
							<RefreshCw className="h-4 w-4" />
							Check Configuration
						</Button>
					)}
					<Button variant="outline" asChild>
						<a 
							href="https://help.salesforce.com/s/articleView?id=sf.connected_app_create_api_integration.htm" 
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2"
						>
							📚 Setup Guide
							<ExternalLink className="h-3 w-3" />
						</a>
					</Button>
				</div>

				<div className="bg-white border border-amber-200 rounded-md p-3 text-xs">
					<p className="font-medium text-amber-800">Environment Variables Needed:</p>
					<div className="mt-2 space-y-1 font-mono text-amber-700">
						<div>SALESFORCE_CLIENT_ID="your_client_id"</div>
						<div>SALESFORCE_CLIENT_SECRET="your_client_secret"</div>
						<div>SALESFORCE_REFRESH_TOKEN="from_oauth_flow"</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
