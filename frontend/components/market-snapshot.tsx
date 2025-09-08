"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Clock, DollarSign, Activity, BarChart3 } from "lucide-react";

interface SnapshotData {
  status: string;
  ticker?: {
    ticker: string;
    todaysChange: number;
    todaysChangePerc: number;
    updated: number;
    day?: {
      o: number;
      h: number;
      l: number;
      c: number;
      v: number;
      vw: number;
    };
    lastTrade?: {
      p: number;
      s: number;
      t: number;
    };
    lastQuote?: {
      P: number;
      S: number;
      p: number;
      s: number;
      t: number;
    };
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
}

function formatPrice(price?: number): string {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatVolume(volume?: number): string {
  if (!volume) return "N/A";
  if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(2)}K`;
  return volume.toFixed(0);
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function MarketSnapshot({ data, ticker }: MarketSnapshotProps) {
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
  const trendColor = isPositive ? "text-green-600" : "text-red-600";
  const bgColor = isPositive ? "bg-green-50" : "bg-red-50";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Current Price & Change */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Last Price</p>
              <Badge variant="outline" className="text-xs">
                {ticker}
              </Badge>
            </div>
            <p className="text-2xl font-bold">
              {formatPrice(snapshot.lastTrade?.p || snapshot.day?.c)}
            </p>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="font-medium">
                {formatPrice(Math.abs(snapshot.todaysChange))}
              </span>
              <span className="text-sm">
                ({isPositive ? "+" : ""}{snapshot.todaysChangePerc.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Day Range */}
          {snapshot.day && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Day Range
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Low</span>
                  <span className="font-medium">{formatPrice(snapshot.day.l)}</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-primary rounded-full"
                    style={{
                      left: `${((snapshot.day.o - snapshot.day.l) / (snapshot.day.h - snapshot.day.l)) * 100}%`,
                      width: `${((snapshot.day.c - snapshot.day.o) / (snapshot.day.h - snapshot.day.l)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>High</span>
                  <span className="font-medium">{formatPrice(snapshot.day.h)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Volume */}
          {snapshot.day && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Volume
              </p>
              <p className="text-xl font-semibold">{formatVolume(snapshot.day.v)}</p>
              <p className="text-xs text-muted-foreground">
                Avg: {formatPrice(snapshot.day.vw)}
              </p>
            </div>
          )}

          {/* Last Update */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last Update
            </p>
            <p className="text-sm font-medium">
              {formatTime(snapshot.lastTrade?.t || snapshot.updated)}
            </p>
            {snapshot.lastQuote && (
              <div className="text-xs space-y-0.5">
                <p>
                  Bid: {formatPrice(snapshot.lastQuote.p)} ({snapshot.lastQuote.s})
                </p>
                <p>
                  Ask: {formatPrice(snapshot.lastQuote.P)} ({snapshot.lastQuote.S})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        {(snapshot.prevDay || snapshot.min) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t">
            {snapshot.day && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Open</p>
                  <p className="font-medium">{formatPrice(snapshot.day.o)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Close</p>
                  <p className="font-medium">{formatPrice(snapshot.day.c)}</p>
                </div>
              </>
            )}
            {snapshot.prevDay && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Prev Close</p>
                  <p className="font-medium">{formatPrice(snapshot.prevDay.c)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prev Volume</p>
                  <p className="font-medium">{formatVolume(snapshot.prevDay.v)}</p>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
