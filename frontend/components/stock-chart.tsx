"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/format";

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

type Period = "7d" | "3mo" | "6mo" | "1y";

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
    const [selectedPeriod, setSelectedPeriod] = useState<Period>("7d");
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

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Stock Price Chart
                        </CardTitle>
                        <CardDescription>
                            {ticker ? `Historical price data for ${ticker}` : "Select a ticker to view price chart"}
                        </CardDescription>
                    </div>
                    {chartData && (
                        <div className="text-right text-sm">
                            <div className="font-medium">
                                {formatCurrency(formattedData[formattedData.length - 1]?.price || 0)}
                            </div>
                            <div className={`text-xs ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)} ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%)
                            </div>
                        </div>
                    )}
                </div>

                {/* Period Selection */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {(Object.keys(PERIOD_LABELS) as Period[]).map(period => (
                        <Badge
                            key={period}
                            variant={selectedPeriod === period ? "default" : "outline"}
                            className="cursor-pointer transition-colors hover:bg-muted"
                            onClick={() => handlePeriodChange(period)}
                        >
                            {PERIOD_LABELS[period]}
                        </Badge>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                {/* Loading State */}
                {loading && <ChartSkeleton />}

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
                                stroke="var(--color-price)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-price)",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            />
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
            {/* Chart skeleton */}
            <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-end gap-1">
                        {[...Array(20)].map((_, j) => (
                            <Skeleton
                                key={j}
                                className="w-3"
                                style={{ height: `${Math.random() * 60 + 20}px` }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
