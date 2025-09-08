"use client";

import { useState, useEffect } from "react";
import { TickerForm } from "@/components/ticker-form";
import { TickerOverview } from "@/components/ticker-overview";
import { MarketSnapshot } from "@/components/market-snapshot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [snapshotData, setSnapshotData] = useState<any>(null);
  const [currentTicker, setCurrentTicker] = useState<string>("");

  const fetchTickerData = async (ticker: string, date?: string) => {
    setLoading(true);
    setSnapshotLoading(true);
    setError(null);
    setData(null);
    setSnapshotData(null);
    setCurrentTicker(ticker);

    try {
      // Fetch both overview and snapshot in parallel
      const [overviewResponse, snapshotResponse] = await Promise.all([
        fetch(`/api/ticker/${ticker}${date ? `?date=${date}` : ""}`),
        fetch(`/api/ticker/${ticker}/snapshot`)
      ]);
      
      if (!overviewResponse.ok) {
        const errorData = await overviewResponse.json();
        throw new Error(errorData.detail?.message || errorData.detail || `Error: ${overviewResponse.status}`);
      }

      const overviewResult = await overviewResponse.json();
      setData(overviewResult);
      setLoading(false);

      // Handle snapshot separately (don't fail if snapshot fails)
      if (snapshotResponse.ok) {
        const snapshotResult = await snapshotResponse.json();
        setSnapshotData(snapshotResult);
      }
      setSnapshotLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
      setSnapshotLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
            <p className="text-muted-foreground">Real-time stock data powered by Polygon.io</p>
          </div>
          {/* Search Form - Top Right */}
          <div className="bg-card/50 rounded-lg border p-3 sm:min-w-[280px]">
            <TickerForm onSubmit={fetchTickerData} isLoading={loading} />
          </div>
        </div>

        {/* Market Snapshot - Full Width */}
        <div className="mb-6">
          {snapshotLoading && <SnapshotSkeleton />}
          {snapshotData && !snapshotLoading && (
            <MarketSnapshot data={snapshotData} ticker={currentTicker} />
          )}
          {!snapshotData && !snapshotLoading && !error && !data && (
            <div className="bg-muted/30 rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                Search for a ticker to see real-time market data
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content - Company Overview */}
        {loading && <LoadingSkeleton />}
        {data && !loading && <TickerOverview data={data} />}
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card rounded-lg border p-4">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function SnapshotSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}