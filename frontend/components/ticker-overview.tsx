"use client";

import {
	Briefcase,
	Building2,
	Calendar,
	ChevronDown,
	ChevronUp,
	DollarSign,
	FileText,
	Globe,
	Hash,
	Link,
	MapPin,
	Phone,
	Users,
} from "lucide-react";
import { useState } from "react";
import { CopyableField } from "@/components/copyable-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatCompactCurrencyTBM, formatNumber } from "@/lib/format";

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

interface TickerOverviewProps {
	data: TickerData;
}

function InfoItem({
	icon: Icon,
	label,
	value,
	className = "",
}: {
	icon: React.ElementType;
	label: string;
	value: string | React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`space-y-1 ${className}`}>
			<p className="text-xs text-muted-foreground flex items-center gap-1">
				<Icon className="h-3 w-3" />
				{label}
			</p>
			<p className="text-sm font-medium break-words">{value}</p>
		</div>
	);
}

export function TickerOverview({ data }: TickerOverviewProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!data.results) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-center text-muted-foreground">No data available</p>
				</CardContent>
			</Card>
		);
	}

	const { results } = data;
	const isLongDescription =
		results.description && results.description.length > 200;

	return (
		<div className="space-y-4">
			{/* Company Header - Compact */}
			<Card>
				<CardContent className="pt-3">
					<div className="flex items-start gap-4">
						{results.branding?.logo_url && (
							<Avatar className="h-12 w-12">
								<AvatarImage
									src={results.branding.logo_url}
									alt={results.name}
								/>
								<AvatarFallback>{results.ticker.slice(0, 2)}</AvatarFallback>
							</Avatar>
						)}
						<div className="flex-1">
							<div className="flex items-start justify-between">
								<div>
									<h2 className="text-xl font-bold">{results.name}</h2>
									<p className="text-sm text-muted-foreground">
										{results.ticker} · {results.primary_exchange}
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Badge variant={results.active ? "default" : "secondary"}>
										{results.active ? "Active" : "Inactive"}
									</Badge>
									<Badge variant="outline">{results.type}</Badge>
									{results.locale ? (
										<Badge variant="outline">
											{results.locale.toUpperCase()}
										</Badge>
									) : null}
									{results.primary_exchange ? (
										<Badge variant="outline">{results.primary_exchange}</Badge>
									) : null}
								</div>
							</div>
							{results.description && (
								<div className="mt-3 space-y-2">
									<p
										className={`text-sm text-muted-foreground leading-relaxed transition-all duration-200 ${!isExpanded && isLongDescription ? "line-clamp-3" : ""}`}
									>
										{results.description}
									</p>
									{isLongDescription && (
										<button
											type="button"
											className="group inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
											onClick={() => setIsExpanded(!isExpanded)}
										>
											<span className="relative">
												{isExpanded ? "Show less" : "Read more"}
												<span className="absolute inset-x-0 -bottom-px h-px bg-current scale-x-0 transition-transform group-hover:scale-x-100" />
											</span>
											{isExpanded ? (
												<ChevronUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
											) : (
												<ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
											)}
										</button>
									)}
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Key Metrics Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* Market Info */}
				<Card>
					<CardHeader className="pb-0">
						<CardTitle className="text-sm font-medium">Market Data</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<InfoItem
							icon={DollarSign}
							label="Market Cap"
							value={formatCompactCurrencyTBM(results.market_cap ?? 0)}
						/>
						<InfoItem
							icon={Briefcase}
							label="Exchange"
							value={results.primary_exchange || "N/A"}
						/>
						<InfoItem
							icon={Globe}
							label="Market"
							value={`${results.market} (${results.currency_name})`}
						/>
						{results.list_date && (
							<InfoItem
								icon={Calendar}
								label="Listed"
								value={new Date(results.list_date).toLocaleDateString()}
							/>
						)}
					</CardContent>
				</Card>

				{/* Company Info */}
				<Card>
					<CardHeader className="pb-0">
						<CardTitle className="text-sm font-medium">Company Info</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{results.sic_description && (
							<InfoItem
								icon={Briefcase}
								label="Industry"
								value={results.sic_description}
							/>
						)}
						{results.total_employees && (
							<InfoItem
								icon={Users}
								label="Employees"
								value={formatNumber(results.total_employees)}
							/>
						)}
						{results.homepage_url && (
							<InfoItem
								icon={Link}
								label="Website"
								value={
									<a
										href={results.homepage_url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline text-xs"
									>
										{results.homepage_url.replace(/^https?:\/\//, "")}
									</a>
								}
							/>
						)}
						{results.phone_number && (
							<InfoItem
								icon={Phone}
								label="Phone"
								value={results.phone_number}
							/>
						)}
					</CardContent>
				</Card>

				{/* Details */}
				<Card>
					<CardHeader className="pb-0">
						<CardTitle className="text-sm font-medium">Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{results.address && (
							<InfoItem
								icon={MapPin}
								label="Location"
								value={[results.address.city, results.address.state]
									.filter(Boolean)
									.join(", ")}
							/>
						)}
						{results.cik && <CopyableField label="CIK" value={results.cik} />}
						{results.sic_code && (
							<CopyableField label="SIC Code" value={results.sic_code} />
						)}
						{results.locale && (
							<InfoItem
								icon={Globe}
								label="Locale"
								value={results.locale.toUpperCase()}
							/>
						)}
					</CardContent>
				</Card>

				{/* Share Information */}
				{(results.share_class_shares_outstanding ||
					results.weighted_shares_outstanding) && (
					<Card className="md:col-span-2 lg:col-span-3">
						<CardHeader className="pb-0">
							<CardTitle className="text-sm font-medium">
								Share Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
								{results.share_class_shares_outstanding && (
									<InfoItem
										icon={DollarSign}
										label="Shares Outstanding"
										value={formatNumber(results.share_class_shares_outstanding)}
									/>
								)}
								{results.weighted_shares_outstanding && (
									<InfoItem
										icon={DollarSign}
										label="Weighted Shares"
										value={formatNumber(results.weighted_shares_outstanding)}
									/>
								)}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
