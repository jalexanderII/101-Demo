"use client";

import { useStockStore, type Period } from "@/lib/store";
import { AnimatedCounter, formatters } from "@/components/ui/animated-counter";
import { TrendingUp, TrendingDown, EqualApproximately } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface PriceSummaryData {
    ticker: string;
    period: string;
    current_price: number;
    start_price: number;
    price_change: number;
    percent_change: number;
    data_points: number;
}

export function ProminentPriceDisplay() {
    const { currentStock, selectedPeriod } = useStockStore();
    const [priceSummary, setPriceSummary] = useState<PriceSummaryData | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch price summary when ticker or period changes
    useEffect(() => {
        if (!currentStock?.ticker) return;

        const fetchPriceSummary = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `/api/ticker/${currentStock.ticker}/price-summary?period=${selectedPeriod}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setPriceSummary(data);
                }
            } catch (error) {
                console.error("Error fetching price summary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPriceSummary();
    }, [currentStock?.ticker, selectedPeriod]);

    if (!currentStock || !priceSummary) {
        return null;
    }

    // Match chart logic for trend determination
    const isPositiveTrend = priceSummary.price_change > 0;
    const isNegativeTrend = priceSummary.price_change < 0;
    const isFlatTrend = Math.abs(priceSummary.percent_change) < 0.5; // Less than 0.5% change considered flat

    // Dynamic icon based on trend (same as chart)
    const TrendIcon = isFlatTrend ? EqualApproximately : isPositiveTrend ? TrendingUp : TrendingDown;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="flex flex-col items-center space-y-3"
        >
            {/* Large Price Display */}
            <div className="text-center">
                <div className="text-5xl font-bold tracking-tight">
                    <AnimatedCounter
                        value={priceSummary.current_price}
                        formatter={formatters.price}
                        duration={1.8}
                        delay={0.3}
                    />
                </div>

                {/* Change Display with Animation - Centered */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className={`flex items-center justify-center gap-2 text-xl font-semibold mt-2 ${isFlatTrend ? 'text-muted-foreground' :
                        isPositiveTrend ? 'text-green-600' : 'text-red-600'
                        }`}
                >
                    <motion.div
                        animate={{
                            rotate: isFlatTrend ? 0 : isPositiveTrend ? 0 : 360,
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            rotate: { duration: 0.3 },
                            scale: { duration: 0.6, delay: 0.7 }
                        }}
                    >
                        <TrendIcon className="h-6 w-6" />
                    </motion.div>
                    <span>
                        {isFlatTrend ? '' : isPositiveTrend ? '+' : '-'}
                        <AnimatedCounter
                            value={Math.abs(priceSummary.price_change)}
                            formatter={formatters.price}
                            duration={1.6}
                            delay={0.6}
                        />
                    </span>
                    <span className="text-lg">
                        ({isFlatTrend ? '' : isPositiveTrend ? '+' : '-'}
                        <AnimatedCounter
                            value={Math.abs(priceSummary.percent_change)}
                            formatter={formatters.percentage}
                            duration={1.6}
                            delay={0.7}
                        />
                        )
                    </span>
                </motion.div>
            </div>
        </motion.div>
    );
}