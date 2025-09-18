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

// Income Statement structure mapping for proper financial statement presentation
interface IncomeStatementSection {
	title: string;
	fields: string[];
	isSubtotal?: boolean;
	emphasis?: boolean;
}

// Balance Sheet structure mapping for proper financial statement presentation
interface BalanceSheetSection {
	title: string;
	fields: string[];
	isSubtotal?: boolean;
	emphasis?: boolean;
	isTotal?: boolean;
}

const BALANCE_SHEET_STRUCTURE: BalanceSheetSection[] = [
	{
		title: "ASSETS",
		fields: [],
		emphasis: true
	},
	{
		title: "Current Assets",
		fields: [
			"cash_and_cash_equivalents",
			"cash",
			"accounts_receivable",
			"inventory",
			"other_current_assets",
			"current_assets"
		]
	},
	{
		title: "Non-Current Assets",
		fields: [
			"fixed_assets",
			"property_plant_and_equipment",
			"intangible_assets",
			"other_non_current_assets",
			"other_noncurrent_assets",
			"noncurrent_assets",
			"non_current_assets"
		]
	},
	{
		title: "Total Assets",
		fields: [
			"assets",
			"total_assets"
		],
		isTotal: true,
		emphasis: true
	},
	{
		title: "LIABILITIES",
		fields: [],
		emphasis: true
	},
	{
		title: "Current Liabilities",
		fields: [
			"accounts_payable",
			"other_current_liabilities",
			"current_liabilities"
		]
	},
	{
		title: "Non-Current Liabilities",
		fields: [
			"long_term_debt",
			"other_non_current_liabilities",
			"other_noncurrent_liabilities",
			"noncurrent_liabilities",
			"non_current_liabilities"
		]
	},
	{
		title: "Total Liabilities",
		fields: [
			"liabilities",
			"total_liabilities"
		],
		isSubtotal: true,
		emphasis: true
	},
	{
		title: "EQUITY",
		fields: [],
		emphasis: true
	},
	{
		title: "Stockholders' Equity",
		fields: [
			"equity",
			"stockholders_equity",
			"equity_attributable_to_parent",
			"equity_attributable_to_noncontrolling_interest",
			"temporary_equity",
			"redeemable_noncontrolling_interest"
		]
	},
	{
		title: "Total Equity",
		fields: [
			"liabilities_and_equity",
			"total_equity"
		],
		isSubtotal: true,
		emphasis: true
	}
];

// Cash Flow Statement structure mapping for proper financial statement presentation
interface CashFlowSection {
	title: string;
	fields: string[];
	isSubtotal?: boolean;
	emphasis?: boolean;
	isTotal?: boolean;
}

const CASH_FLOW_STRUCTURE: CashFlowSection[] = [
	{
		title: "Operating Activities",
		fields: [
			"net_cash_flow_from_operating_activities",
			"net_cash_flow_from_operating_activities_continuing",
			"operating_activities_cash_flow"
		],
		isSubtotal: true,
		emphasis: true
	},
	{
		title: "Investing Activities",
		fields: [
			"net_cash_flow_from_investing_activities",
			"net_cash_flow_from_investing_activities_continuing",
			"investing_activities_cash_flow"
		],
		isSubtotal: true,
		emphasis: true
	},
	{
		title: "Financing Activities",
		fields: [
			"net_cash_flow_from_financing_activities",
			"net_cash_flow_from_financing_activities_continuing",
			"financing_activities_cash_flow"
		],
		isSubtotal: true,
		emphasis: true
	},
	{
		title: "Net Cash Flow",
		fields: [
			"net_cash_flow",
			"net_cash_flow_continuing",
			"cash_flow_net"
		],
		isTotal: true,
		emphasis: true
	}
];

// Comprehensive Income Statement structure mapping for proper financial statement presentation
interface ComprehensiveIncomeSection {
	title: string;
	fields: string[];
	isSubtotal?: boolean;
	emphasis?: boolean;
	isTotal?: boolean;
}

const COMPREHENSIVE_INCOME_STRUCTURE: ComprehensiveIncomeSection[] = [
	{
		title: "Net Income",
		fields: [
			"net_income_loss",
			"net_income_loss_attributable_to_parent",
			"net_income_loss_attributable_to_noncontrolling_interest"
		],
		isSubtotal: true,
		emphasis: true
	},
	{
		title: "Other Comprehensive Income",
		fields: [
			"other_comprehensive_income_loss",
			"other_comprehensive_income_loss_attributable_to_parent",
			"other_comprehensive_income_loss_attributable_to_noncontrolling_interest",
			"foreign_currency_translation_adjustments",
			"unrealized_gains_losses_on_securities",
			"pension_and_other_postretirement_benefit_plans_adjustments"
		]
	},
	{
		title: "Comprehensive Income",
		fields: [
			"comprehensive_income_loss",
			"comprehensive_income_loss_attributable_to_parent",
			"comprehensive_income_loss_attributable_to_noncontrolling_interest"
		],
		isTotal: true,
		emphasis: true
	}
];

const INCOME_STATEMENT_STRUCTURE: IncomeStatementSection[] = [
	{
		title: "Revenue",
		fields: [
			"revenues",
			"net_sales",
			"total_revenue",
			"revenue",
			"sales",
			"operating_revenue"
		]
	},
	{
		title: "Cost of Sales",
		fields: [
			"cost_of_revenue",
			"cost_of_goods_sold",
			"cost_of_sales",
			"costs_and_expenses"
		]
	},
	{
		title: "Gross Profit",
		fields: [
			"gross_profit",
			"gross_margin"
		],
		isSubtotal: true,
		emphasis: true
	},
	{
		title: "Operating Expenses",
		fields: [
			"research_and_development",
			"selling_general_and_administrative_expenses",
			"selling_and_marketing_expenses",
			"general_and_administrative_expenses",
			"benefits_costs_and_expenses",
			"interest_expense_operating",
			"other_operating_expenses",
			"operating_expenses"
		]
	},
	{
		title: "Operating Income",
		fields: [
			"operating_income_loss",
			"income_loss_from_continuing_operations_before_tax",
			"operating_income",
			"operating_profit_loss"
		],
		isSubtotal: true,
		emphasis: true
	},
	{
		title: "Non-Operating Items",
		fields: [
			"interest_expense",
			"interest_income",
			"other_income_expense",
			"investment_income_loss",
			"nonoperating_income_loss"
		]
	},
	{
		title: "Pre-Tax Income",
		fields: [
			"income_loss_from_continuing_operations_before_tax",
			"pretax_income_loss"
		],
		isSubtotal: true,
		emphasis: true
	},
	{
		title: "Income Tax",
		fields: [
			"income_tax_expense_benefit_current",
			"income_tax_expense_benefit_deferred",
			"income_tax_expense_benefit",
			"tax_provision"
		]
	},
	{
		title: "Net Income",
		fields: [
			"income_loss_from_continuing_operations_after_tax",
			"net_income_loss",
			"net_income_loss_attributable_to_parent",
			"net_income_loss_attributable_to_noncontrolling_interest",
			"net_income_loss_available_to_common_stockholders_basic"
		],
		emphasis: true
	},
	{
		title: "Earnings Per Share",
		fields: [
			"basic_earnings_per_share",
			"diluted_earnings_per_share",
			"earnings_per_share",
			"basic_average_shares",
			"diluted_average_shares",
			"weighted_average_shares_outstanding"
		]
	},
	{
		title: "Other Items",
		fields: [
			"preferred_stock_dividends_and_other_adjustments",
			"participating_securities_distributed_and_undistributed_earnings_loss_basic",
			"other_comprehensive_income_loss",
			"comprehensive_income_loss"
		]
	}
];

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

	function renderIncomeStatement(statement?: Statement) {
		if (!statement) return null;
		const statementEntries = Object.entries(statement);
		if (statementEntries.length === 0) return null;

		// Create a map for quick field lookup
		const fieldMap = new Map(statementEntries);

		// Track which fields we've already displayed to show unmapped items at the end
		const displayedFields = new Set<string>();

		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">Income Statement</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1">
					{INCOME_STATEMENT_STRUCTURE.map((section, sectionIndex) => {
						// Find fields that exist in this section
						const sectionFields = section.fields.filter(field => fieldMap.has(field));

						if (sectionFields.length === 0) return null;

						return (
							<div key={section.title} className="space-y-1">
								{/* Section header */}
								<div className={`text-xs font-semibold text-gray-700 pt-3 pb-1 ${sectionIndex > 0 ? 'border-t border-gray-200 mt-3' : ''}`}>
									{section.title}
								</div>

								{/* Section fields */}
								{sectionFields.map(field => {
									const point = fieldMap.get(field)!;
									const label = point.label || field.replace(/_/g, " ");
									const value = formatFinancialValue(point.value, point.unit);
									displayedFields.add(field);

									// Show unit as a subtle indicator when it's not already included in the formatted value
									let unitIndicator = "";
									if (point.unit && !value.includes(point.unit) && value !== "N/A") {
										if (point.unit === "USD") {
											unitIndicator = " USD";
										} else if (point.unit === "shares") {
											unitIndicator = " shares";
										} else if (point.unit.includes("/")) {
											unitIndicator = "";
										} else {
											unitIndicator = ` ${point.unit}`;
										}
									}

									return (
										<div
											key={field}
											className={`flex items-start justify-between gap-4 py-1 ${section.emphasis ? 'font-medium bg-gray-50 px-2 rounded' : ''
												} ${section.isSubtotal ? 'border-t border-gray-300 pt-2 font-medium' : ''
												}`}
										>
											<span className={`text-xs leading-5 ${section.emphasis ? 'text-gray-900 font-medium' : 'text-muted-foreground'
												}`}>
												{label}
											</span>
											<div className="text-right">
												<span className={`text-sm whitespace-nowrap ${section.emphasis ? 'font-semibold text-gray-900' : 'font-medium'
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
						);
					})}

					{/* Display any unmapped fields at the end */}
					{(() => {
						const unmappedFields = statementEntries.filter(([key]) => !displayedFields.has(key));
						if (unmappedFields.length === 0) return null;

						return (
							<div className="space-y-1">
								<div className="text-xs font-semibold text-gray-700 pt-3 pb-1 border-t border-gray-200 mt-3">
									Other Items
								</div>
								{unmappedFields.map(([key, point]) => {
									const label = point.label || key.replace(/_/g, " ");
									const value = formatFinancialValue(point.value, point.unit);

									let unitIndicator = "";
									if (point.unit && !value.includes(point.unit) && value !== "N/A") {
										if (point.unit === "USD") {
											unitIndicator = " USD";
										} else if (point.unit === "shares") {
											unitIndicator = " shares";
										} else if (point.unit.includes("/")) {
											unitIndicator = "";
										} else {
											unitIndicator = ` ${point.unit}`;
										}
									}

									return (
										<div key={key} className="flex items-start justify-between gap-4 py-1">
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
						);
					})()}
				</CardContent>
			</Card>
		);
	}

	function renderBalanceSheet(statement?: Statement) {
		if (!statement) return null;
		const statementEntries = Object.entries(statement);
		if (statementEntries.length === 0) return null;

		// Create a map for quick field lookup
		const fieldMap = new Map(statementEntries);

		// Track which fields we've already displayed to show unmapped items at the end
		const displayedFields = new Set<string>();

		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">Balance Sheet</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1">
					{BALANCE_SHEET_STRUCTURE.map((section, sectionIndex) => {
						// Handle section headers with no fields (like "ASSETS", "LIABILITIES", "EQUITY")
						if (section.fields.length === 0) {
							return (
								<div key={section.title} className="text-sm font-bold text-gray-800 pt-4 pb-2 border-b-2 border-gray-300">
									{section.title}
								</div>
							);
						}

						// Find fields that exist in this section
						const sectionFields = section.fields.filter(field => fieldMap.has(field));

						if (sectionFields.length === 0) return null;

						return (
							<div key={section.title} className="space-y-1">
								{/* Section header */}
								<div className={`text-xs font-semibold text-gray-700 pt-3 pb-1 ${sectionIndex > 0 ? 'border-t border-gray-200 mt-3' : ''}`}>
									{section.title}
								</div>

								{/* Section fields */}
								{sectionFields.map(field => {
									const point = fieldMap.get(field)!;
									const label = point.label || field.replace(/_/g, " ");
									const value = formatFinancialValue(point.value, point.unit);
									displayedFields.add(field);

									// Show unit as a subtle indicator when it's not already included in the formatted value
									let unitIndicator = "";
									if (point.unit && !value.includes(point.unit) && value !== "N/A") {
										if (point.unit === "USD") {
											unitIndicator = " USD";
										} else if (point.unit === "shares") {
											unitIndicator = " shares";
										} else if (point.unit.includes("/")) {
											unitIndicator = "";
										} else {
											unitIndicator = ` ${point.unit}`;
										}
									}

									return (
										<div
											key={field}
											className={`flex items-start justify-between gap-4 py-1 ${section.emphasis ? 'font-medium bg-gray-50 px-2 rounded' : ''
												} ${section.isSubtotal ? 'border-t border-gray-300 pt-2 font-medium' : ''
												} ${section.isTotal ? 'border-t-2 border-gray-400 pt-2 font-bold bg-gray-100 px-2 rounded' : ''
												}`}
										>
											<span className={`text-xs leading-5 ${section.emphasis || section.isTotal ? 'text-gray-900 font-medium' : 'text-muted-foreground'
												}`}>
												{label}
											</span>
											<div className="text-right">
												<span className={`text-sm whitespace-nowrap ${section.isTotal ? 'font-bold text-gray-900' : section.emphasis ? 'font-semibold text-gray-900' : 'font-medium'
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
						);
					})}

					{/* Display any unmapped fields at the end */}
					{(() => {
						const unmappedFields = statementEntries.filter(([key]) => !displayedFields.has(key));
						if (unmappedFields.length === 0) return null;

						return (
							<div className="space-y-1">
								<div className="text-xs font-semibold text-gray-700 pt-3 pb-1 border-t border-gray-200 mt-3">
									Other Items
								</div>
								{unmappedFields.map(([key, point]) => {
									const label = point.label || key.replace(/_/g, " ");
									const value = formatFinancialValue(point.value, point.unit);

									let unitIndicator = "";
									if (point.unit && !value.includes(point.unit) && value !== "N/A") {
										if (point.unit === "USD") {
											unitIndicator = " USD";
										} else if (point.unit === "shares") {
											unitIndicator = " shares";
										} else if (point.unit.includes("/")) {
											unitIndicator = "";
										} else {
											unitIndicator = ` ${point.unit}`;
										}
									}

									return (
										<div key={key} className="flex items-start justify-between gap-4 py-1">
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
						);
					})()}
				</CardContent>
			</Card>
		);
	}

	function renderCashFlowStatement(statement?: Statement) {
		if (!statement) return null;
		const statementEntries = Object.entries(statement);
		if (statementEntries.length === 0) return null;

		// Create a map for quick field lookup
		const fieldMap = new Map(statementEntries);

		// Track which fields we've already displayed to show unmapped items at the end
		const displayedFields = new Set<string>();

		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">Cash Flow Statement</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1">
					{CASH_FLOW_STRUCTURE.map((section, sectionIndex) => {
						// Find fields that exist in this section
						const sectionFields = section.fields.filter(field => fieldMap.has(field));

						if (sectionFields.length === 0) return null;

						return (
							<div key={section.title} className="space-y-1">
								{/* Section header */}
								<div className={`text-xs font-semibold text-gray-700 pt-3 pb-1 ${sectionIndex > 0 ? 'border-t border-gray-200 mt-3' : ''}`}>
									{section.title}
								</div>

								{/* Section fields */}
								{sectionFields.map(field => {
									const point = fieldMap.get(field)!;
									const label = point.label || field.replace(/_/g, " ");
									const value = formatFinancialValue(point.value, point.unit);
									displayedFields.add(field);

									// Show unit as a subtle indicator when it's not already included in the formatted value
									let unitIndicator = "";
									if (point.unit && !value.includes(point.unit) && value !== "N/A") {
										if (point.unit === "USD") {
											unitIndicator = " USD";
										} else if (point.unit === "shares") {
											unitIndicator = " shares";
										} else if (point.unit.includes("/")) {
											unitIndicator = "";
										} else {
											unitIndicator = ` ${point.unit}`;
										}
									}

									return (
										<div
											key={field}
											className={`flex items-start justify-between gap-4 py-1 ${section.emphasis ? 'font-medium bg-gray-50 px-2 rounded' : ''
												} ${section.isSubtotal ? 'border-t border-gray-300 pt-2 font-medium' : ''
												} ${section.isTotal ? 'border-t-2 border-gray-400 pt-2 font-bold bg-gray-100 px-2 rounded' : ''
												}`}
										>
											<span className={`text-xs leading-5 ${section.emphasis || section.isTotal ? 'text-gray-900 font-medium' : 'text-muted-foreground'
												}`}>
												{label}
											</span>
											<div className="text-right">
												<span className={`text-sm whitespace-nowrap ${section.isTotal ? 'font-bold text-gray-900' : section.emphasis ? 'font-semibold text-gray-900' : 'font-medium'
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
						);
					})}

					{/* Display any unmapped fields at the end */}
					{(() => {
						const unmappedFields = statementEntries.filter(([key]) => !displayedFields.has(key));
						if (unmappedFields.length === 0) return null;

						return (
							<div className="space-y-1">
								<div className="text-xs font-semibold text-gray-700 pt-3 pb-1 border-t border-gray-200 mt-3">
									Other Items
								</div>
								{unmappedFields.map(([key, point]) => {
									const label = point.label || key.replace(/_/g, " ");
									const value = formatFinancialValue(point.value, point.unit);

									let unitIndicator = "";
									if (point.unit && !value.includes(point.unit) && value !== "N/A") {
										if (point.unit === "USD") {
											unitIndicator = " USD";
										} else if (point.unit === "shares") {
											unitIndicator = " shares";
										} else if (point.unit.includes("/")) {
											unitIndicator = "";
										} else {
											unitIndicator = ` ${point.unit}`;
										}
									}

									return (
										<div key={key} className="flex items-start justify-between gap-4 py-1">
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
						);
					})()}
				</CardContent>
			</Card>
		);
	}

	function renderComprehensiveIncomeStatement(statement?: Statement) {
		if (!statement) return null;
		const statementEntries = Object.entries(statement);
		if (statementEntries.length === 0) return null;

		// Create a map for quick field lookup
		const fieldMap = new Map(statementEntries);

		// Track which fields we've already displayed to show unmapped items at the end
		const displayedFields = new Set<string>();

		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium">Comprehensive Income Statement</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1">
					{COMPREHENSIVE_INCOME_STRUCTURE.map((section, sectionIndex) => {
						// Find fields that exist in this section
						const sectionFields = section.fields.filter(field => fieldMap.has(field));

						if (sectionFields.length === 0) return null;

						return (
							<div key={section.title} className="space-y-1">
								{/* Section header */}
								<div className={`text-xs font-semibold text-gray-700 pt-3 pb-1 ${sectionIndex > 0 ? 'border-t border-gray-200 mt-3' : ''}`}>
									{section.title}
								</div>

								{/* Section fields */}
								{sectionFields.map(field => {
									const point = fieldMap.get(field)!;
									const label = point.label || field.replace(/_/g, " ");
									const value = formatFinancialValue(point.value, point.unit);
									displayedFields.add(field);

									// Show unit as a subtle indicator when it's not already included in the formatted value
									let unitIndicator = "";
									if (point.unit && !value.includes(point.unit) && value !== "N/A") {
										if (point.unit === "USD") {
											unitIndicator = " USD";
										} else if (point.unit === "shares") {
											unitIndicator = " shares";
										} else if (point.unit.includes("/")) {
											unitIndicator = "";
										} else {
											unitIndicator = ` ${point.unit}`;
										}
									}

									return (
										<div
											key={field}
											className={`flex items-start justify-between gap-4 py-1 ${section.emphasis ? 'font-medium bg-gray-50 px-2 rounded' : ''
												} ${section.isSubtotal ? 'border-t border-gray-300 pt-2 font-medium' : ''
												} ${section.isTotal ? 'border-t-2 border-gray-400 pt-2 font-bold bg-gray-100 px-2 rounded' : ''
												}`}
										>
											<span className={`text-xs leading-5 ${section.emphasis || section.isTotal ? 'text-gray-900 font-medium' : 'text-muted-foreground'
												}`}>
												{label}
											</span>
											<div className="text-right">
												<span className={`text-sm whitespace-nowrap ${section.isTotal ? 'font-bold text-gray-900' : section.emphasis ? 'font-semibold text-gray-900' : 'font-medium'
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
						);
					})}

					{/* Display any unmapped fields at the end */}
					{(() => {
						const unmappedFields = statementEntries.filter(([key]) => !displayedFields.has(key));
						if (unmappedFields.length === 0) return null;

						return (
							<div className="space-y-1">
								<div className="text-xs font-semibold text-gray-700 pt-3 pb-1 border-t border-gray-200 mt-3">
									Other Items
								</div>
								{unmappedFields.map(([key, point]) => {
									const label = point.label || key.replace(/_/g, " ");
									const value = formatFinancialValue(point.value, point.unit);

									let unitIndicator = "";
									if (point.unit && !value.includes(point.unit) && value !== "N/A") {
										if (point.unit === "USD") {
											unitIndicator = " USD";
										} else if (point.unit === "shares") {
											unitIndicator = " shares";
										} else if (point.unit.includes("/")) {
											unitIndicator = "";
										} else {
											unitIndicator = ` ${point.unit}`;
										}
									}

									return (
										<div key={key} className="flex items-start justify-between gap-4 py-1">
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
						);
					})()}
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
							{renderIncomeStatement(period.financials?.income_statement)}
						</TabsContent >
					))
					}
				</Tabs >
			</TabsContent >

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
							{renderBalanceSheet(period.financials?.balance_sheet)}
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
							{renderCashFlowStatement(period.financials?.cash_flow_statement)}
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
							{renderComprehensiveIncomeStatement(period.financials?.comprehensive_income)}
						</TabsContent>
					))}
				</Tabs>
			</TabsContent>
		</Tabs >
	);
}


