"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TickerForm } from "@/components/ticker-form";
import { TickerOverview } from "@/components/ticker-overview";
import { MarketSnapshot } from "@/components/market-snapshot";
import { Financials } from "@/components/financials";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

export default function Home() {
	const router = useRouter();
	const params = useSearchParams();

	const [loading, setLoading] = useState(false);
	const [snapshotLoading, setSnapshotLoading] = useState(false);
	const [financialsLoading, setFinancialsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<any>(null);
	const [snapshotData, setSnapshotData] = useState<any>(null);
	const [financialsData, setFinancialsData] = useState<any>(null);
	const [currentTicker, setCurrentTicker] = useState<string>("");
	const [currentDate, setCurrentDate] = useState<string | undefined>(undefined);

	useEffect(() => {
		const t = params.get("ticker") ?? "";
		const d = params.get("date") ?? undefined;
		if (t) {
			setCurrentTicker(t);
			setCurrentDate(d);
			void fetchTickerData(t, d);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function fetchTickerData(ticker: string, date?: string) {
		setLoading(true);
		setSnapshotLoading(true);
		setFinancialsLoading(true);
		setError(null);
		setData(null);
		setSnapshotData(null);
		setFinancialsData(null);
		setCurrentTicker(ticker);
		setCurrentDate(date);

		const url = new URL(window.location.href);
		url.searchParams.set("ticker", ticker);
		if (date) url.searchParams.set("date", date); else url.searchParams.delete("date");
		router.replace(url.pathname + "?" + url.searchParams.toString());

		try {
			const [overviewResponse, snapshotResponse, financialsResponse] = await Promise.all([
				fetch(`/api/ticker/${ticker}${date ? `?date=${date}` : ""}`),
				fetch(`/api/ticker/${ticker}/snapshot`),
				fetch(`/api/ticker/${ticker}/financials?timeframe=annual&limit=3`)
			]);
			
			if (!overviewResponse.ok) {
				const errorData = await overviewResponse.json();
				throw new Error(errorData.detail?.message || errorData.detail || `Error: ${overviewResponse.status}`);
			}

			const overviewResult = await overviewResponse.json();
			setData(overviewResult);
			setLoading(false);

			if (snapshotResponse.ok) {
				const snapshotResult = await snapshotResponse.json();
				setSnapshotData(snapshotResult);
			}
			setSnapshotLoading(false);

			if (financialsResponse.ok) {
				const financialsResult = await financialsResponse.json();
				setFinancialsData(financialsResult);
			}
			setFinancialsLoading(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred");
			setLoading(false);
			setSnapshotLoading(false);
			setFinancialsLoading(false);
		}
	}

	return (
		<main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
			<div className="container mx-auto px-4 py-6 max-w-7xl">
				{/* Header and Search Bar */}
				<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
						<p className="text-muted-foreground">Real-time stock data powered by Polygon.io</p>
					</div>
					{/* Search Form - Top Right */}
					<div className="bg-card/50 rounded-lg border p-3 sm:min-w-[280px]">
						<TickerForm onSubmit={fetchTickerData} isLoading={loading} />
					</div>
				</div>

				{/* Market Snapshot - Full Width */}
				<div className="mb-6">
					{snapshotLoading && <SnapshotSkeleton />}
					{snapshotData && !snapshotLoading && (
						<MarketSnapshot data={snapshotData} ticker={currentTicker} onRefresh={() => fetchTickerData(currentTicker, currentDate)} />
					)}
					{!snapshotData && !snapshotLoading && !error && !data && (
						<div className="bg-muted/30 rounded-lg border border-dashed p-8 text-center">
							<p className="text-muted-foreground">
								Search for a ticker to see real-time market data
							</p>
						</div>
					)}
				</div>

				{/* Error Alert */}
				{error && (
					<Alert variant="destructive" className="mb-6">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Main Content - Tabbed View */}
				{(loading || data) && (
					<Tabs defaultValue="overview" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="financials">Financials</TabsTrigger>
						</TabsList>
						<TabsContent value="overview">
							{loading && <LoadingSkeleton />}
							{data && !loading && <TickerOverview data={data} />}
						</TabsContent>
						<TabsContent value="financials">
							{financialsLoading && <FinancialsSkeleton />}
							{financialsData && !financialsLoading && <Financials results={financialsData.results || []} />}
							{!financialsData && !financialsLoading && !loading && (
								<div className="text-center py-8 text-muted-foreground">
									No financial data available
								</div>
							)}
						</TabsContent>
					</Tabs>
				)}
			</div>
		</main>
	);
}

function LoadingSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{[...Array(6)].map((_, i) => (
				<div key={i} className="bg-card rounded-lg border p-4">
					<Skeleton className="h-4 w-24 mb-3" />
					<Skeleton className="h-6 w-full mb-2" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			))}
		</div>
	);
}

function SnapshotSkeleton() {
	return (
		<div className="bg-card rounded-lg border p-4">
			<div className="grid gap-4 md:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<div key={i}>
						<Skeleton className="h-4 w-20 mb-2" />
						<Skeleton className="h-8 w-full" />
					</div>
				))}
			</div>
		</div>
	);
}

function FinancialsSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-10 w-full" />
			<div className="grid gap-4 md:grid-cols-2">
				{[...Array(8)].map((_, i) => (
					<div key={i} className="bg-card rounded-lg border p-4">
						<Skeleton className="h-4 w-32 mb-3" />
						<div className="space-y-2">
							{[...Array(5)].map((_, j) => (
								<div key={j} className="flex justify-between">
									<Skeleton className="h-3 w-24" />
									<Skeleton className="h-3 w-16" />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}