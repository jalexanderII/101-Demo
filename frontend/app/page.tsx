"use client";

import { AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Financials } from "@/components/financials";
import { TickerForm } from "@/components/ticker-form";
import { TickerOverview } from "@/components/ticker-overview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TickerData {
	status: string;
	results?: {
		ticker: string;
		name: string;
		market: string;
		locale: string;
		primary_exchange: string;
		type: string;
		active: boolean;
		currency_name: string;
		cik?: string;
		market_cap?: number;
		phone_number?: string;
		address?: {
			address1?: string;
			city?: string;
			state?: string;
			postal_code?: string;
		};
		description?: string;
		sic_code?: string;
		sic_description?: string;
		ticker_root?: string;
		homepage_url?: string;
		total_employees?: number;
		list_date?: string;
		branding?: { logo_url?: string; icon_url?: string };
		share_class_shares_outstanding?: number;
		weighted_shares_outstanding?: number;
	};
}

interface FinancialsData {
	results?: Array<{
		start_date?: string;
		end_date?: string;
		filing_date?: string;
		timeframe?: string;
		fiscal_period?: string;
		fiscal_year?: string;
		financials?: {
			income_statement?: Record<
				string,
				{ value?: number | string | null; unit?: string; label?: string }
			>;
			balance_sheet?: Record<
				string,
				{ value?: number | string | null; unit?: string; label?: string }
			>;
			cash_flow_statement?: Record<
				string,
				{ value?: number | string | null; unit?: string; label?: string }
			>;
		};
	}>;
}

function HomeContent() {
	const router = useRouter();
	const params = useSearchParams();

	const [loading, setLoading] = useState(false);
	const [financialsLoading, setFinancialsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<TickerData | null>(null);
	const [financialsData, setFinancialsData] = useState<FinancialsData | null>(
		null,
	);

	useEffect(() => {
		const t = params.get("ticker") ?? "";
		const d = params.get("date") ?? undefined;
		if (t) {
			void fetchTickerData(t, d);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function fetchTickerData(ticker: string, date?: string) {
		setLoading(true);
		setFinancialsLoading(true);
		setError(null);
		setData(null);
		setFinancialsData(null);

		const url = new URL(window.location.href);
		url.searchParams.set("ticker", ticker);
		if (date) url.searchParams.set("date", date);
		else url.searchParams.delete("date");
		router.replace(url.pathname + "?" + url.searchParams.toString());

		try {
			const [overviewResponse, financialsResponse] = await Promise.all([
				fetch(`/api/ticker/${ticker}${date ? `?date=${date}` : ""}`),
				fetch(`/api/ticker/${ticker}/financials?timeframe=annual&limit=3`),
			]);

			if (!overviewResponse.ok) {
				const errorData = await overviewResponse.json();
				throw new Error(
					errorData.detail?.message ||
						errorData.detail ||
						`Error: ${overviewResponse.status}`,
				);
			}

			const overviewResult = await overviewResponse.json();
			setData(overviewResult);
			setLoading(false);

			if (financialsResponse.ok) {
				const financialsResult = await financialsResponse.json();
				setFinancialsData(financialsResult);
			}
			setFinancialsLoading(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred",
			);
			setLoading(false);
			setFinancialsLoading(false);
		}
	}

	return (
		<main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
			<div className="container mx-auto px-4 py-6 max-w-7xl">
				{/* Header and Search Bar */}
				<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Finance Dashboard
						</h1>
						<p className="text-muted-foreground">
							Real-time stock data powered by Yahoo Finance
						</p>
					</div>
					{/* Search Form - Top Right */}
					<div className="bg-card/50 rounded-lg border p-3 sm:min-w-[280px]">
						<TickerForm onSubmit={fetchTickerData} isLoading={loading} />
					</div>
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
							{financialsData && !financialsLoading && (
								<Financials results={financialsData.results || []} />
							)}
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

export default function Home() {
	return (
		<Suspense
			fallback={
				<main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
					<div className="container mx-auto px-4 py-6 max-w-7xl">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
							<div>
								<h1 className="text-3xl font-bold tracking-tight">
									Finance Dashboard
								</h1>
								<p className="text-muted-foreground">
									Real-time stock data powered by Yahoo Finance
								</p>
							</div>
						</div>
						<LoadingSkeleton />
					</div>
				</main>
			}
		>
			<HomeContent />
		</Suspense>
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
