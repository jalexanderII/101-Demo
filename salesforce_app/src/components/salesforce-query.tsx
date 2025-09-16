import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

interface SalesforceRecord {
	Id?: string;
	[key: string]: unknown;
}

interface SalesforceQueryResult {
	totalSize: number;
	done: boolean;
	records: SalesforceRecord[];
}

const DEFAULT_QUERY = `
SELECT 
	SUM(Amount)
FROM Opportunity 
WHERE Stagename = 'Closed Won' AND Booking_Quarter__c = '2025-Q3'
`.trim();

export function SalesforceQuery() {
	const [query, setQuery] = useState(DEFAULT_QUERY);
	const [records, setRecords] = useState<SalesforceRecord[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasFetched, setHasFetched] = useState(false);

	const columns = useMemo(() => {
		if (records.length === 0) return [];
		const keys = new Set<string>();
		records.forEach((record) => {
			Object.keys(record).forEach((key) => keys.add(key));
		});
		return Array.from(keys);
	}, [records]);

	useEffect(() => {
		setRecords([]);
		setError(null);
	}, []);

	const handleSample = async () => {
		setQuery(DEFAULT_QUERY);
		await runQuery(DEFAULT_QUERY);
	};

	const runQuery = async (soql: string) => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await apiFetch<SalesforceQueryResult>(
				"/api/salesforce/query",
				{
					method: "POST",
					json: { query: soql },
				},
			);
			setRecords(data.records);
			setHasFetched(true);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to run query";
			setError(message);
			setHasFetched(true);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="overflow-hidden">
			<CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<CardTitle>Salesforce Query Tester</CardTitle>
					<CardDescription>
						Use SOQL to pull sample data once Salesforce credentials are
						configured.
					</CardDescription>
				</div>
				<div className="flex gap-2">
					<Button
						variant="secondary"
						onClick={handleSample}
						disabled={isLoading}
					>
						Run Sample Query
					</Button>
					<Button onClick={() => runQuery(query)} disabled={isLoading}>
						{isLoading ? "Running..." : "Run Query"}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<label htmlFor="soql" className="font-medium">
						SOQL Query
					</label>
					<Textarea
						id="soql"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						className="min-h-[160px]"
						placeholder="SELECT Id, Name FROM Account LIMIT 10"
					/>
				</div>
				{error ? (
					<div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
						{error}
					</div>
				) : null}
				{hasFetched && records.length === 0 && !error ? (
					<div className="text-sm text-muted-foreground">
						No records returned.
					</div>
				) : null}
				{records.length > 0 ? (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									{columns.map((column) => (
										<TableHead key={column} className="whitespace-nowrap">
											{column}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{records.map((record) => (
									<TableRow key={record.Id ?? crypto.randomUUID()}>
										{columns.map((column) => (
											<TableCell
												key={column}
												className="whitespace-nowrap text-xs md:text-sm"
											>
												{formatValue(record[column])}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}

function formatValue(value: unknown) {
	if (value == null) return "";
	if (typeof value === "object") {
		return JSON.stringify(value);
	}
	return String(value);
}
