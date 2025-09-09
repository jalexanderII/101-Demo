"use client";

import { motion, Variants } from "motion/react";
import { ReactNode } from "react";

interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    stagger?: number;
}

const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing
        }
    },
};

export function StaggerContainer({
    children,
    className = "",
    delay = 0.2,
    stagger = 0.1
}: StaggerContainerProps) {
    const customContainerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: stagger,
                delayChildren: delay,
            },
        },
    };

    return (
        <motion.div
            className={className}
            variants={customContainerVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = "",
    delay = 0
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const customItemVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay,
            }
        },
    };

    return (
        <motion.div
            className={className}
            variants={customItemVariants}
        >
            {children}
        </motion.div>
    );
}

// Pre-configured variants for common use cases
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: "backOut" }
    }
};

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

