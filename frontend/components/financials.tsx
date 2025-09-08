"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFinancialValue } from "@/lib/format";

interface FinancialPoint {
	value?: number | string | null;
	unit?: string;
	label?: string;
}

interface Statement {
	[key: string]: FinancialPoint;
}

interface FinancialsResult {
	start_date?: string;
	end_date?: string;
	filing_date?: string;
	timeframe?: string;
	fiscal_period?: string;
	fiscal_year?: string;
	financials?: {
		income_statement?: Statement;
		balance_sheet?: Statement;
		cash_flow_statement?: Statement;
		comprehensive_income?: Statement;
	};
}

export function Financials({ results }: { results: FinancialsResult[] }) {
	if (!results || results.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-center text-muted-foreground">No financials found</p>
				</CardContent>
			</Card>
		);
	}

	function renderStatement(title: string, statement?: Statement) {
		if (!statement) return null;
		const entries = Object.entries(statement);
		if (entries.length === 0) return null;

		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-2 sm:grid-cols-2">
						{entries.map(([key, point]) => {
							const label = point.label || key.replace(/_/g, " ");
							const value = formatFinancialValue(point.value, point.unit);
							
							// Show unit as a subtle indicator when it's not already included in the formatted value
							let unitIndicator = "";
							if (point.unit && !value.includes(point.unit) && value !== "N/A") {
								if (point.unit === "USD") {
									unitIndicator = " USD";
								} else if (point.unit === "shares") {
									unitIndicator = " shares";
								} else if (point.unit.includes("/")) {
									// Don't show ratio units as they're complex
									unitIndicator = "";
								} else {
									unitIndicator = ` ${point.unit}`;
								}
							}

							return (
								<div key={key} className="flex items-start justify-between gap-4 border-b py-1 last:border-b-0">
									<span className="text-xs text-muted-foreground leading-5">{label}</span>
									<div className="text-right">
										<span className="text-sm font-medium whitespace-nowrap">{value}</span>
										{unitIndicator && (
											<span className="text-xs text-muted-foreground ml-1">{unitIndicator}</span>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Tabs defaultValue="income" className="w-full">
			<TabsList className="grid w-full grid-cols-4">
				<TabsTrigger value="income">Income</TabsTrigger>
				<TabsTrigger value="balance">Balance Sheet</TabsTrigger>
				<TabsTrigger value="cash">Cash Flow</TabsTrigger>
				<TabsTrigger value="comp">Comprehensive</TabsTrigger>
			</TabsList>

			<TabsContent value="income" className="mt-6">
				<Tabs defaultValue={results[0]?.fiscal_year || "2024"} className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						{results.map((period, idx) => (
							<TabsTrigger key={idx} value={period.fiscal_year || `year-${idx}`}>
								{period.fiscal_year || ""} {period.fiscal_period || ""}
							</TabsTrigger>
						))}
					</TabsList>
					{results.map((period, idx) => (
						<TabsContent key={idx} value={period.fiscal_year || `year-${idx}`} className="mt-4">
							<div className="text-xs text-muted-foreground mb-4">
								{period.timeframe ? `${period.timeframe.toUpperCase()}` : ""}
								{period.end_date ? ` • End ${new Date(period.end_date).toLocaleDateString()}` : ""}
								{period.filing_date ? ` • Filed ${new Date(period.filing_date).toLocaleDateString()}` : ""}
							</div>
							{renderStatement("Income Statement", period.financials?.income_statement)}
						</TabsContent>
					))}
				</Tabs>
			</TabsContent>

			<TabsContent value="balance" className="mt-6">
				<Tabs defaultValue={results[0]?.fiscal_year || "2024"} className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						{results.map((period, idx) => (
							<TabsTrigger key={idx} value={period.fiscal_year || `year-${idx}`}>
								{period.fiscal_year || ""} {period.fiscal_period || ""}
							</TabsTrigger>
						))}
					</TabsList>
					{results.map((period, idx) => (
						<TabsContent key={idx} value={period.fiscal_year || `year-${idx}`} className="mt-4">
							<div className="text-xs text-muted-foreground mb-4">
								{period.timeframe ? `${period.timeframe.toUpperCase()}` : ""}
								{period.end_date ? ` • End ${new Date(period.end_date).toLocaleDateString()}` : ""}
								{period.filing_date ? ` • Filed ${new Date(period.filing_date).toLocaleDateString()}` : ""}
							</div>
							{renderStatement("Balance Sheet", period.financials?.balance_sheet)}
						</TabsContent>
					))}
				</Tabs>
			</TabsContent>

			<TabsContent value="cash" className="mt-6">
				<Tabs defaultValue={results[0]?.fiscal_year || "2024"} className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						{results.map((period, idx) => (
							<TabsTrigger key={idx} value={period.fiscal_year || `year-${idx}`}>
								{period.fiscal_year || ""} {period.fiscal_period || ""}
							</TabsTrigger>
						))}
					</TabsList>
					{results.map((period, idx) => (
						<TabsContent key={idx} value={period.fiscal_year || `year-${idx}`} className="mt-4">
							<div className="text-xs text-muted-foreground mb-4">
								{period.timeframe ? `${period.timeframe.toUpperCase()}` : ""}
								{period.end_date ? ` • End ${new Date(period.end_date).toLocaleDateString()}` : ""}
								{period.filing_date ? ` • Filed ${new Date(period.filing_date).toLocaleDateString()}` : ""}
							</div>
							{renderStatement("Cash Flow Statement", period.financials?.cash_flow_statement)}
						</TabsContent>
					))}
				</Tabs>
			</TabsContent>

			<TabsContent value="comp" className="mt-6">
				<Tabs defaultValue={results[0]?.fiscal_year || "2024"} className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						{results.map((period, idx) => (
							<TabsTrigger key={idx} value={period.fiscal_year || `year-${idx}`}>
								{period.fiscal_year || ""} {period.fiscal_period || ""}
							</TabsTrigger>
						))}
					</TabsList>
					{results.map((period, idx) => (
						<TabsContent key={idx} value={period.fiscal_year || `year-${idx}`} className="mt-4">
							<div className="text-xs text-muted-foreground mb-4">
								{period.timeframe ? `${period.timeframe.toUpperCase()}` : ""}
								{period.end_date ? ` • End ${new Date(period.end_date).toLocaleDateString()}` : ""}
								{period.filing_date ? ` • Filed ${new Date(period.filing_date).toLocaleDateString()}` : ""}
							</div>
							{renderStatement("Comprehensive Income", period.financials?.comprehensive_income)}
						</TabsContent>
					))}
				</Tabs>
			</TabsContent>
		</Tabs>
	);
}


