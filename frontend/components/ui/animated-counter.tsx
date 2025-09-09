"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate, MotionValue } from "motion/react";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    delay?: number;
    formatter?: (value: number) => string;
    className?: string;
}

export function AnimatedCounter({
    value,
    duration = 1.5,
    delay = 0.2,
    formatter,
    className = ""
}: AnimatedCounterProps) {
    const count = useMotionValue(0);
    const [displayValue, setDisplayValue] = useState("0");

    // Transform the motion value to a rounded number
    const rounded = useTransform(count, (latest) => {
        const val = Math.round(latest);
        return formatter ? formatter(val) : val.toLocaleString();
    });

    useEffect(() => {
        // Update display value when rounded changes
        const unsubscribe = rounded.onChange((latest) => {
            setDisplayValue(latest);
        });

        return unsubscribe;
    }, [rounded]);

    useEffect(() => {
        const controls = animate(count, value, {
            duration,
            delay,
            ease: "easeOut",
        });

        return controls.stop;
    }, [count, value, duration, delay]);

    return (
        <motion.span
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay }}
        >
            {displayValue}
        </motion.span>
    );
}

// Utility formatters for common financial numbers
export const formatters = {
    currency: (value: number) => {
        if (value >= 1e12) {
            return `$${(value / 1e12).toFixed(1)}T`;
        } else if (value >= 1e9) {
            return `$${(value / 1e9).toFixed(1)}B`;
        } else if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(1)}M`;
        } else if (value >= 1e3) {
            return `$${(value / 1e3).toFixed(1)}K`;
        } else {
            return `$${value.toFixed(2)}`;
        }
    },

    number: (value: number) => {
        if (value >= 1e12) {
            return `${(value / 1e12).toFixed(1)}T`;
        } else if (value >= 1e9) {
            return `${(value / 1e9).toFixed(1)}B`;
        } else if (value >= 1e6) {
            return `${(value / 1e6).toFixed(1)}M`;
        } else if (value >= 1e3) {
            return `${(value / 1e3).toFixed(1)}K`;
        } else {
            return value.toLocaleString();
        }
    },

    percentage: (value: number) => `${value.toFixed(2)}%`,

    price: (value: number) => `$${value.toFixed(2)}`,

    compact: (value: number) => {
        if (value >= 1e9) {
            return `${(value / 1e9).toFixed(1)}B`;
        } else if (value >= 1e6) {
            return `${(value / 1e6).toFixed(1)}M`;
        } else if (value >= 1e3) {
            return `${(value / 1e3).toFixed(1)}K`;
        } else {
            return value.toLocaleString();
        }
    }
};

