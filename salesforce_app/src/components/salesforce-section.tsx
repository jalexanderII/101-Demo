import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

import { SalesforceQuery } from "./salesforce-query";
import { SalesforceSetup } from "./salesforce-setup";

interface SalesforceStatus {
	configured: boolean;
	missing: string[];
}

export function SalesforceSection() {
	const [status, setStatus] = useState<SalesforceStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const checkStatus = async () => {
		setIsLoading(true);
		try {
			const result = await apiFetch<SalesforceStatus>("/api/salesforce/status");
			setStatus(result);
		} catch (error) {
			console.error("Failed to check Salesforce status:", error);
			// Default to setup mode on error
			setStatus({ configured: false, missing: [] });
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		checkStatus();
	}, []);

	if (isLoading) {
		return (
			<div className="h-48 flex items-center justify-center text-muted-foreground">
				Loading Salesforce status...
			</div>
		);
	}

	if (!status?.configured) {
		return <SalesforceSetup onRefresh={checkStatus} />;
	}

	return <SalesforceQuery />;
}
