"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface TickerFormProps {
  onSubmit: (ticker: string, date?: string) => void;
  isLoading?: boolean;
}

export function TickerForm({ onSubmit, isLoading }: TickerFormProps) {
  const [ticker, setTicker] = useState("");
  const [date, setDate] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      // Format date as YYYY-MM-DD if selected
      const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined;
      onSubmit(ticker.trim().toUpperCase(), formattedDate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Enter ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          disabled={isLoading}
          className="pr-10 h-9"
          required
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={date ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-9 w-9",
              !date && "text-muted-foreground"
            )}
            disabled={isLoading}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            disabled={(date) => 
              date > new Date() || date < new Date("1900-01-01")
            }
          />
          {date && (
            <div className="p-3 pt-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setDate(undefined)}
              >
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Button type="submit" disabled={isLoading || !ticker.trim()} size="sm" className="h-9">
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}