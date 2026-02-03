"use client";

import { Clock, RefreshCcw, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatNumber } from "@/lib/format";

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
		min?: {
			o: number;
			h: number;
			l: number;
			c: number;
			v: number;
			vw: number;
			t: number;
			n: number;
		};
		prevDay?: {
			o: number;
			h: number;
			l: number;
			c: number;
			v: number;
			vw: number;
		};
	};
}

interface MarketSnapshotProps {
	data: SnapshotData;
	ticker: string;
	onRefresh?: () => Promise<void> | void;
}

function formatTime(timestamp?: number): string {
	if (!timestamp) return "N/A";
	return new Date(timestamp).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

export function MarketSnapshot({
	data,
	ticker,
	onRefresh,
}: MarketSnapshotProps) {
	const [loading, setLoading] = useState(false);

	if (!data.ticker) {
		return (
			<Card>
				<CardContent className="pt-6">
					<p className="text-center text-muted-foreground">
						No snapshot data available
					</p>
				</CardContent>
			</Card>
		);
	}

	const snapshot = data.ticker;
	const isPositive = snapshot.todaysChange >= 0;
	const TrendIcon = isPositive ? TrendingUp : TrendingDown;
	const changeColor = isPositive ? "text-green-600" : "text-red-600";

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
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="text-xs">
							{ticker}
						</Badge>
						<span className="text-xs text-muted-foreground flex items-center gap-1">
							<Clock className="h-3 w-3" /> Last update{" "}
							{formatTime(snapshot.lastTrade?.t || snapshot.updated)}
						</span>
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
										<RefreshCcw
											className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
										/>
										<span>Refresh</span>
									</button>
								</TooltipTrigger>
								<TooltipContent>Fetch latest snapshot</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>

				<div className="grid gap-4 md:grid-cols-4">
					<Stat
						label="Last Price"
						value={formatCurrency(snapshot.lastTrade?.p || snapshot.day?.c, {
							maximumFractionDigits: 2,
						})}
					/>
					<Stat
						label="Change"
						value={
							<div className={`inline-flex items-center gap-1 ${changeColor}`}>
								<TrendIcon className="h-4 w-4" />
								<span>
									{formatCurrency(Math.abs(snapshot.todaysChange), {
										maximumFractionDigits: 2,
									})}
								</span>
								<span className="text-sm">
									({isPositive ? "+" : ""}
									{snapshot.todaysChangePerc.toFixed(2)}%)
								</span>
							</div>
						}
					/>
					{snapshot.day && (
						<Stat
							label="Volume"
							value={formatNumber(snapshot.day.v)}
							help={`VWAP ${formatCurrency(snapshot.day.vw, { maximumFractionDigits: 4 })}`}
						/>
					)}
					{snapshot.day && (
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
											{formatCurrency(snapshot.day.l, {
												maximumFractionDigits: 2,
											})}
										</span>
										<span>
											{formatCurrency(snapshot.day.h, {
												maximumFractionDigits: 2,
											})}
										</span>
									</div>
								</div>
							}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
