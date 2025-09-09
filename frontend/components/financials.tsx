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

// Define proper income statement structure
interface IncomeStatementSection {
	title: string;
	items: Array<{
		key: string;
		label: string;
		altKeys?: string[]; // Alternative field names to look for
		indent?: boolean;
		bold?: boolean;
		isSubtotal?: boolean;
	}>;
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

	// Income statement structure following GAAP presentation
	const INCOME_STATEMENT_STRUCTURE: IncomeStatementSection[] = [
		{
			title: "Revenue",
			items: [
				{ key: "revenues", label: "Total Revenue", altKeys: ["total_revenue", "net_revenues", "revenue"], bold: true },
				{ key: "cost_of_revenue", label: "Cost of Revenue", altKeys: ["cost_of_goods_sold", "cost_of_sales"] },
				{ key: "gross_profit", label: "Gross Profit", isSubtotal: true, bold: true },
			]
		},
		{
			title: "Operating Expenses",
			items: [
				{ key: "research_and_development_expenses", label: "Research & Development", altKeys: ["research_development", "rd_expenses"] },
				{ key: "selling_general_and_administrative_expenses", label: "Selling, General & Administrative", altKeys: ["sg_a_expenses", "sga_expenses", "selling_and_marketing_expenses"] },
				{ key: "operating_expenses", label: "Total Operating Expenses", altKeys: ["total_operating_expenses"], bold: true },
			]
		},
		{
			title: "Operating Income",
			items: [
				{ key: "operating_income_loss", label: "Operating Income", altKeys: ["operating_income", "income_from_operations"], isSubtotal: true, bold: true },
			]
		},
		{
			title: "Non-Operating Items",
			items: [
				{ key: "interest_income_expense_after_provision_for_losses", label: "Interest Income (Expense)", altKeys: ["interest_expense", "net_interest_expense", "interest_income"] },
				{ key: "other_than_temporary_impairment_losses_investments_available_for_sale_securities", label: "Investment Losses", altKeys: ["investment_losses"] },
				{ key: "nonoperating_income_loss", label: "Other Income (Expense)", altKeys: ["other_income", "non_operating_income"] },
			]
		},
		{
			title: "Pre-Tax and Net Income",
			items: [
				{ key: "income_loss_from_continuing_operations_before_tax", label: "Income Before Taxes", altKeys: ["pretax_income", "earnings_before_taxes"], isSubtotal: true, bold: true },
				{ key: "income_tax_expense_benefit", label: "Income Tax Expense", altKeys: ["tax_expense", "provision_for_taxes"] },
				{ key: "net_income_loss", label: "Net Income", altKeys: ["net_income", "net_earnings"], isSubtotal: true, bold: true },
			]
		},
		{
			title: "Per Share Data",
			items: [
				{ key: "basic_earnings_per_share", label: "Basic EPS", altKeys: ["earnings_per_share_basic", "basic_eps"] },
				{ key: "diluted_earnings_per_share", label: "Diluted EPS", altKeys: ["earnings_per_share_diluted", "diluted_eps"] },
				{ key: "weighted_average_shares", label: "Weighted Avg Shares (Basic)", altKeys: ["weighted_average_shares_outstanding_basic", "basic_shares_outstanding"] },
				{ key: "weighted_average_shares_diluted", label: "Weighted Avg Shares (Diluted)", altKeys: ["weighted_average_shares_outstanding_diluted", "diluted_shares_outstanding"] },
			]
		}
	];

	function findFinancialPoint(statement: Statement, item: { key: string; altKeys?: string[] }): FinancialPoint | null {
		// First try the primary key
		if (statement[item.key]) {
			return statement[item.key];
		}
		
		// Then try alternative keys
		if (item.altKeys) {
			for (const altKey of item.altKeys) {
				if (statement[altKey]) {
					return statement[altKey];
				}
			}
		}
		
		return null;
	}

	function renderIncomeStatement(title: string, statement?: Statement) {
		if (!statement) return null;

		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{INCOME_STATEMENT_STRUCTURE.map((section, sectionIdx) => {
							// Filter items that exist in the data
							const availableItems = section.items.filter(item => {
								const point = findFinancialPoint(statement, item);
								return point && point.value !== null && point.value !== undefined;
							});

							if (availableItems.length === 0) return null;

							return (
								<div key={sectionIdx} className="space-y-2">
									<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-1">
										{section.title}
									</h4>
									<div className="space-y-1">
										{availableItems.map((item, itemIdx) => {
											const point = findFinancialPoint(statement, item)!;
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
												<div 
													key={`${sectionIdx}-${itemIdx}`} 
													className={`flex items-center justify-between py-1 ${
														item.isSubtotal ? 'border-t border-border pt-2 mt-2' : ''
													} ${
														item.indent ? 'pl-4' : ''
													}`}
												>
													<span className={`text-sm leading-5 ${
														item.bold ? 'font-semibold text-foreground' : 'text-muted-foreground'
													}`}>
														{item.label}
													</span>
													<div className="text-right">
														<span className={`text-sm whitespace-nowrap ${
															item.bold ? 'font-semibold' : 'font-medium'
														}`}>
															{value}
														</span>
														{unitIndicator && (
															<span className="text-xs text-muted-foreground ml-1">{unitIndicator}</span>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
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
							{renderIncomeStatement("Income Statement", period.financials?.income_statement)}
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


