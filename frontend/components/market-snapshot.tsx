"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Activity, BarChart3, RefreshCcw } from "lucide-react";
import { Stat } from "@/components/stat";
import { formatCompactCurrencyTBM, formatCurrency, formatNumber } from "@/lib/format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-container";
import { AnimatedCounter, formatters } from "@/components/ui/animated-counter";
// Removed store imports and ticker components since we're using dedicated endpoint now

interface SnapshotData {
	status: string;
	ticker?: {
		ticker: string;
		todaysChange: number;
		todaysChangePerc: number;
		updated: number;
		day?: { o: number; h: number; l: number; c: number; v: number; vw: number };
		lastTrade?: { p: number; s: number; t: number };
		lastQuote?: { P: number; S: number; p: number; s: number; t: number };
		min?: { o: number; h: number; l: number; c: number; v: number; vw: number; t: number; n: number };
		prevDay?: { o: number; h: number; l: number; c: number; v: number; vw: number };
	};
}

interface MarketSnapshotProps {
	data: SnapshotData;
	ticker: string;
	onRefresh?: () => Promise<void> | void;
}

function formatTime(timestamp?: number): string {
	if (!timestamp) return "N/A";
	return new Date(timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function MarketSnapshot({ data, ticker, onRefresh }: MarketSnapshotProps) {
	const [loading, setLoading] = useState(false);

	if (!data.ticker) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-center text-muted-foreground">No snapshot data available</p>
				</CardContent>
			</Card>
		);
	}

	const snapshot = data.ticker;
	const isPositive = snapshot.todaysChange >= 0;
	const TrendIcon = isPositive ? TrendingUp : TrendingDown;
	const changeColor = isPositive ? "text-green-600" : "text-red-600";

	// Price data now handled by dedicated endpoint and global store

	async function handleRefresh() {
		if (!onRefresh) return;
		setLoading(true);
		await onRefresh();
		setLoading(false);
	}

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-2 mb-3">
					<div className="flex items-center gap-3">
						<Badge variant="outline" className="text-xs">{ticker}</Badge>
						<span className="text-xs text-muted-foreground flex items-center gap-1">
							<Clock className="h-3 w-3" /> Last update {formatTime(snapshot.lastTrade?.t || snapshot.updated)}
						</span>
						{/* Removed ticker display - simplified for cleaner layout */}
					</div>
					{onRefresh && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										className="inline-flex h-8 items-center gap-1 rounded-md border bg-background px-2 text-sm hover:bg-muted"
										onClick={handleRefresh}
										aria-label="Refresh snapshot"
										disabled={loading}
									>
										<RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
										<span>Refresh</span>
									</button>
								</TooltipTrigger>
								<TooltipContent>Fetch latest snapshot</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>

				<StaggerContainer className="grid gap-4 md:grid-cols-4">
					<StaggerItem>
						<Stat
							label="Last Price"
							value={
								<AnimatedCounter
									value={snapshot.lastTrade?.p || snapshot.day?.c || 0}
									formatter={formatters.price}
									duration={1.4}
									delay={0.2}
								/>
							}
						/>
					</StaggerItem>
					<StaggerItem>
						<Stat
							label="Change"
							value={
								<div className={`inline-flex items-center gap-1 ${changeColor}`}>
									<TrendIcon className="h-4 w-4" />
									<span>
										<AnimatedCounter
											value={Math.abs(snapshot.todaysChange)}
											formatter={formatters.price}
											duration={1.4}
											delay={0.3}
										/>
									</span>
									<span className="text-sm">
										({isPositive ? "+" : ""}{snapshot.todaysChangePerc.toFixed(2)}%)
									</span>
								</div>
							}
						/>
					</StaggerItem>
					{snapshot.day && (
						<StaggerItem>
							<Stat
								label="Volume"
								value={
									<AnimatedCounter
										value={snapshot.day.v}
										formatter={formatters.compact}
										duration={1.6}
										delay={0.4}
									/>
								}
								help={`VWAP ${formatCurrency(snapshot.day.vw, { maximumFractionDigits: 4 })}`}
							/>
						</StaggerItem>
					)}
					{snapshot.day && (
						<StaggerItem>
							<Stat
								label="Day Range"
								value={
									<div className="w-full">
										<div className="relative h-2 w-full rounded-full bg-muted">
											<div
												className="absolute h-full rounded-full bg-primary"
												style={{
													left: `${((snapshot.day.o - snapshot.day.l) / (snapshot.day.h - snapshot.day.l)) * 100}%`,
													width: `${((snapshot.day.c - snapshot.day.o) / (snapshot.day.h - snapshot.day.l)) * 100}%`,
												}}
											/>
										</div>
										<div className="mt-1 flex justify-between text-xs text-muted-foreground">
											<span>
												<AnimatedCounter
													value={snapshot.day.l}
													formatter={formatters.price}
													duration={1.4}
													delay={0.5}
												/>
											</span>
											<span>
												<AnimatedCounter
													value={snapshot.day.h}
													formatter={formatters.price}
													duration={1.4}
													delay={0.6}
												/>
											</span>
										</div>
									</div>
								}
							/>
						</StaggerItem>
					)}
				</StaggerContainer>
			</CardContent>
		</Card>
	);
}
