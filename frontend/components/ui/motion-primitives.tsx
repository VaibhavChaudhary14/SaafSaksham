"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

// FadeIn Component
export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.5,
    direction = "up",
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}) {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
            x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration,
                delay,
                ease: "easeOut" as const,
            },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// 3D Tilt Card
// Neobrutalist Card (No Tilt, Hard Shadow)
export function NeoCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            whileHover={{
                y: -4,
                boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
            }}
            className={cn("border-2 border-black bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all", className)}
        >
            {children}
        </motion.div>
    );
}

// Aurora Background (CSS + Motion)
export function AuroraBackground({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("relative overflow-hidden bg-background", className)}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 pointer-events-none"
            >
                <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[70%] bg-purple-500/20 blur-[120px] rounded-full mix-blend-multiply animate-blob filter" />
                <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[70%] bg-cyan-500/20 blur-[120px] rounded-full mix-blend-multiply animate-blob animation-delay-2000 filter" />
                <div className="absolute -bottom-[50%] left-[20%] w-[70%] h-[70%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-multiply animate-blob animation-delay-4000 filter" />
            </motion.div>
            <div className="relative z-10">{children}</div>
        </div>
    );
}

// Magnetic Button
export function MagneticButton({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
