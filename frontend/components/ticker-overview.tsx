"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Building2,
	Globe,
	MapPin,
	Phone,
	DollarSign,
	Calendar,
	Hash,
	Users,
	Briefcase,
	FileText,
	Link,
	ChevronDown,
	ChevronUp
} from "lucide-react";
import { CopyableField } from "@/components/copyable-field";
import { formatCompactCurrencyTBM, formatNumber } from "@/lib/format";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-container";
import { AnimatedCounter, formatters } from "@/components/ui/animated-counter";
import { motion } from "motion/react";
import { useStockStore } from "@/lib/store";
import { useEffect } from "react";
import {
	Ticker,
	TickerIcon,
	TickerPrice,
	TickerPriceChange,
	TickerSymbol,
} from "@/components/ui/shadcn-io/ticker";
import { ProminentPriceDisplay } from "@/components/prominent-price-display";
import DecryptedText from "@/components/ui/shadcn-io/decrypted-text";

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
		composite_figi?: string;
		share_class_figi?: string;
		market_cap?: number;
		phone_number?: string;
		address?: { address1?: string; city?: string; state?: string; postal_code?: string };
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

interface TickerOverviewProps { data: TickerData }

function InfoItem({ icon: Icon, label, value, className = "" }: { icon: React.ElementType; label: string; value: string | React.ReactNode; className?: string; }) {
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
	const { setCurrentStock } = useStockStore();

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
	const isLongDescription = results.description && results.description.length > 200;

	// Update global store with current stock data
	useEffect(() => {
		if (results) {
			setCurrentStock({
				ticker: results.ticker,
				name: results.name,
				currentPrice: 0, // Will be set from snapshot data
				priceChange: 0,
				percentChange: 0,
				logo: results.branding?.logo_url,
			});
		}
	}, [results, setCurrentStock]);

	return (
		<div className="space-y-4">
			{/* Company Header - 3 Column Grid Layout */}
			<div className="grid grid-cols-3 gap-4">
				{/* Company Overview Card - Takes 2/3 space */}
				<Card className="col-span-2">
					<CardContent className="pt-6">
						<div className="flex items-start gap-4">
							{results.branding?.logo_url && (
								<Avatar className="h-16 w-16">
									<AvatarImage
										src={`/api/proxy/logo?url=${encodeURIComponent(results.branding.logo_url)}`}
										alt={results.name}
									/>
									<AvatarFallback className="text-lg font-bold">{results.ticker.slice(0, 2)}</AvatarFallback>
								</Avatar>
							)}
							<div className="space-y-2 flex-1">
								<div>
									<h2 className="text-2xl font-bold text-foreground">{results.name}</h2>
									<p className="text-base text-muted-foreground font-medium">
										{results.ticker} · {results.primary_exchange}
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Badge variant={results.active ? "default" : "secondary"}>{results.active ? "Active" : "Inactive"}</Badge>
									<Badge variant="outline">{results.type}</Badge>
									{results.locale ? <Badge variant="outline">{results.locale.toUpperCase()}</Badge> : null}
									{results.primary_exchange ? <Badge variant="outline">{results.primary_exchange}</Badge> : null}
								</div>

								{/* Description Section - Within Card */}
								{results.description && (
									<div className="mt-4 space-y-2">
										<p className={`text-sm text-muted-foreground leading-relaxed transition-all duration-200 ${!isExpanded && isLongDescription ? 'line-clamp-3' : ''}`}>
											{results.description}
										</p>
										{isLongDescription && (
											<button
												type="button"
												className="group inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
												onClick={() => setIsExpanded(!isExpanded)}
											>
												<span className="relative">
													{isExpanded ? 'Show less' : 'Read more'}
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

				{/* Prominent Price Display - Takes 1/3 space, invisible borders */}
				<div className="flex items-center justify-center h-full">
					<ProminentPriceDisplay />
				</div>
			</div>

			{/* Key Metrics Grid */}
			<StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start [&>*]:h-full">
				{/* Market Info */}
				<StaggerItem className="h-full">
					<Card className="h-full flex flex-col">
						<CardHeader className="pb-0">
							<CardTitle className="text-sm font-medium">Market Data</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 flex-1 flex flex-col justify-start">
							<InfoItem
								icon={DollarSign}
								label="Market Cap"
								value={
									<AnimatedCounter
										value={results.market_cap ?? 0}
										formatter={formatters.currency}
										duration={1.8}
										delay={0.4}
									/>
								}
							/>
							<InfoItem icon={Briefcase} label="Exchange" value={results.primary_exchange || "N/A"} />
							<InfoItem icon={Globe} label="Market" value={`${results.market} (${results.currency_name})`} />
							{results.list_date && (
								<InfoItem icon={Calendar} label="Listed" value={new Date(results.list_date).toLocaleDateString()} />
							)}
						</CardContent>
					</Card>
				</StaggerItem>

				{/* Company Info */}
				<StaggerItem className="h-full">
					<Card className="h-full flex flex-col">
						<CardHeader className="pb-0">
							<CardTitle className="text-sm font-medium">Company Info</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 flex-1 flex flex-col justify-start">
							{results.sic_description && (
								<InfoItem icon={Briefcase} label="Industry" value={results.sic_description} />
							)}
							{results.total_employees && (
								<InfoItem
									icon={Users}
									label="Employees"
									value={
										<AnimatedCounter
											value={results.total_employees}
											formatter={formatters.number}
											duration={1.6}
											delay={0.6}
										/>
									}
								/>
							)}
							{results.homepage_url && (
								<InfoItem icon={Link} label="Website" value={<a href={results.homepage_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">{results.homepage_url.replace(/^https?:\/\//, "")}</a>} />
							)}
							{results.phone_number && (
								<InfoItem icon={Phone} label="Phone" value={results.phone_number} />
							)}
						</CardContent>
					</Card>
				</StaggerItem>

				{/* Details */}
				<StaggerItem className="h-full">
					<Card className="h-full flex flex-col">
						<CardHeader className="pb-0">
							<CardTitle className="text-sm font-medium">Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 flex-1 flex flex-col justify-start">
							{results.address && (
								<InfoItem icon={MapPin} label="Location" value={[results.address.city, results.address.state].filter(Boolean).join(", ")} />
							)}
							{results.cik && (
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground flex items-center gap-1">
										<Hash className="h-3 w-3" />
										CIK
									</p>
									<DecryptedText
										text={results.cik}
										className="text-sm font-mono font-medium"
										encryptedClassName="text-sm font-mono text-muted-foreground"
										animateOn="view"
										sequential={true}
										revealDirection="start"
									/>
								</div>
							)}
							{results.sic_code && <InfoItem icon={Hash} label="SIC Code" value={results.sic_code} />}
							{results.locale && <InfoItem icon={Globe} label="Locale" value={results.locale.toUpperCase()} />}
						</CardContent>
					</Card>
				</StaggerItem>

				{/* Share Information */}
				{(results.share_class_shares_outstanding || results.composite_figi) && (
					<StaggerItem className="md:col-span-2 lg:col-span-3 h-full">
						<Card className="h-full flex flex-col">
							<CardHeader className="pb-0">
								<CardTitle className="text-sm font-medium">Share Information</CardTitle>
							</CardHeader>
							<CardContent className="flex-1">
								<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
									{results.share_class_shares_outstanding && (
										<InfoItem
											icon={DollarSign}
											label="Shares Outstanding"
											value={
												<AnimatedCounter
													value={results.share_class_shares_outstanding}
													formatter={formatters.compact}
													duration={1.8}
													delay={0.8}
												/>
											}
										/>
									)}
									{results.weighted_shares_outstanding && (
										<InfoItem
											icon={DollarSign}
											label="Weighted Shares"
											value={
												<AnimatedCounter
													value={results.weighted_shares_outstanding}
													formatter={formatters.compact}
													duration={1.8}
													delay={1.0}
												/>
											}
										/>
									)}
									{results.composite_figi && (
										<div className="space-y-1">
											<p className="text-xs text-muted-foreground flex items-center gap-1">
												<Hash className="h-3 w-3" />
												Composite FIGI
											</p>
											<DecryptedText
												text={results.composite_figi}
												className="text-sm font-mono font-medium"
												encryptedClassName="text-sm font-mono text-muted-foreground"
												animateOn="view"
												sequential={true}
												revealDirection="start"
											/>
										</div>
									)}
									{results.share_class_figi && (
										<div className="space-y-1">
											<p className="text-xs text-muted-foreground flex items-center gap-1">
												<Hash className="h-3 w-3" />
												Share Class FIGI
											</p>
											<DecryptedText
												text={results.share_class_figi}
												className="text-sm font-mono font-medium"
												encryptedClassName="text-sm font-mono text-muted-foreground"
												animateOn="view"
												sequential={true}
												revealDirection="start"
											/>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</StaggerItem>
				)}
			</StaggerContainer>
		</div>
	);
}