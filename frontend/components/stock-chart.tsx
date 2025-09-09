"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { TrendingUp, TrendingDown, EqualApproximately, AlertCircle, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedCounter, formatters } from "@/components/ui/animated-counter";
import { useStockStore, type Period } from "@/lib/store";

interface StockDataPoint {
    date: string;
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
}

interface StockChartData {
    ticker: string;
    period: string;
    data: StockDataPoint[];
    count: number;
}

interface StockChartProps {
    ticker: string;
}

// Period type now imported from store

const PERIOD_LABELS: Record<Period, string> = {
    "7d": "7 Days",
    "3mo": "3 Months",
    "6mo": "6 Months",
    "1y": "1 Year"
};

const chartConfig = {
    price: {
        label: "Price",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

export function StockChart({ ticker }: StockChartProps) {
    const { selectedPeriod, setSelectedPeriod } = useStockStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chartData, setChartData] = useState<StockChartData | null>(null);

    // Fetch chart data whenever ticker or period changes
    useEffect(() => {
        if (!ticker) {
            setChartData(null);
            return;
        }

        void fetchChartData(ticker, selectedPeriod);
    }, [ticker, selectedPeriod]);

    async function fetchChartData(tickerSymbol: string, period: Period) {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/ticker/${tickerSymbol}/history?period=${period}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail?.message || errorData.detail || `Error: ${response.status}`);
            }

            const result: StockChartData = await response.json();
            setChartData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load chart data");
            setChartData(null);
        } finally {
            setLoading(false);
        }
    }

    function handlePeriodChange(period: Period) {
        setSelectedPeriod(period);
    }

    function handleRetry() {
        if (ticker) {
            void fetchChartData(ticker, selectedPeriod);
        }
    }

    // Format date for chart display
    function formatDateForChart(dateString: string): string {
        const date = new Date(dateString);

        if (selectedPeriod === "7d") {
            return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        } else if (selectedPeriod === "3mo" || selectedPeriod === "6mo") {
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } else {
            return date.toLocaleDateString(undefined, { year: '2-digit', month: 'short' });
        }
    }

    // Format chart data for Recharts
    const formattedData = chartData?.data.map(point => ({
        ...point,
        formattedDate: formatDateForChart(point.date),
        price: point.close
    })) || [];

    // Calculate price change
    const priceChange = formattedData.length >= 2
        ? formattedData[formattedData.length - 1].price - formattedData[0].price
        : 0;
    const percentChange = formattedData.length >= 2
        ? (priceChange / formattedData[0].price) * 100
        : 0;

    // Determine trend and colors
    const isPositiveTrend = priceChange > 0;
    const isNegativeTrend = priceChange < 0;
    const isFlatTrend = Math.abs(percentChange) < 0.5; // Less than 0.5% change considered flat

    // Dynamic icon based on trend
    const TrendIcon = isFlatTrend ? EqualApproximately : isPositiveTrend ? TrendingUp : TrendingDown;

    // Dynamic line color
    const lineColor = isFlatTrend ? "#64748b" : isPositiveTrend ? "#047857" : "#991b1b";

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendIcon className={`h-5 w-5 ${isFlatTrend ? 'text-muted-foreground' :
                                isPositiveTrend ? 'text-green-600' : 'text-red-600'
                                }`} />
                            Stock Price Chart
                        </CardTitle>
                        <CardDescription>
                            {ticker ? `Historical price data for ${ticker}` : "Select a ticker to view price chart"}
                        </CardDescription>
                    </div>
                    {/* Removed price display - now handled by ProminentPriceDisplay */}
                </div>

                {/* Period Selection */}
                <div className="flex flex-wrap gap-2 pt-2 relative">
                    {(Object.keys(PERIOD_LABELS) as Period[]).map(period => (
                        <motion.button
                            key={period}
                            className={`relative px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${selectedPeriod === period
                                ? "text-primary-foreground z-10"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePeriodChange(period)}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {selectedPeriod === period && (
                                <motion.div
                                    className="absolute inset-0 bg-primary rounded-full"
                                    layoutId="activeTab"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{PERIOD_LABELS[period]}</span>
                        </motion.button>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                {/* Loading State - with delay to prevent flash */}
                {loading && chartData === null && <ChartSkeleton />}

                {/* Error State */}
                {error && !loading && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                                className="ml-2"
                            >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Empty State */}
                {!ticker && !loading && !error && (
                    <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Enter a ticker symbol to view price history</p>
                    </div>
                )}

                {/* Chart */}
                {chartData && !loading && !error && formattedData.length > 0 && (
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={formattedData}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="formattedDate"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                domain={['dataMin - 5', 'dataMax + 5']}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `$${value.toFixed(0)}`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Line
                                dataKey="price"
                                type="natural"
                                stroke={lineColor}
                                strokeWidth={2}
                                dot={{
                                    fill: lineColor,
                                    strokeWidth: 2,
                                    r: 3,
                                }}
                                activeDot={{
                                    r: 6,
                                    stroke: lineColor,
                                    strokeWidth: 2,
                                    fill: "hsl(var(--background))"
                                }}
                            >
                                <LabelList
                                    dataKey="price"
                                    position="top"
                                    offset={12}
                                    className="fill-foreground text-xs font-bold"
                                    formatter={(value: number, index: number) => {
                                        // Only show labels for first and last points
                                        if (index === 0 || index === formattedData.length - 1) {
                                            return formatters.price(value);
                                        }
                                        return '';
                                    }}
                                />
                            </Line>
                        </LineChart>
                    </ChartContainer>
                )}

                {/* No Data */}
                {chartData && !loading && !error && formattedData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No price data available for the selected period</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ChartSkeleton() {
    return (
        <div className="h-80 space-y-4">
            {/* Line chart skeleton */}
            <div className="relative h-full">
                {/* Chart area */}
                <div className="h-full flex items-end justify-between px-4 pb-8">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center space-y-1">
                            {/* Data point */}
                            <Skeleton
                                className="w-2 h-2 rounded-full"
                            />
                            {/* Connecting line effect */}
                            {i < 6 && (
                                <Skeleton className="w-8 h-0.5" />
                            )}
                        </div>
                    ))}
                </div>
                {/* X-axis skeleton */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-3 w-12" />
                    ))}
                </div>
                {/* Y-axis skeleton */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between py-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-3 w-12" />
                    ))}
                </div>
            </div>
        </div>
    );
}
