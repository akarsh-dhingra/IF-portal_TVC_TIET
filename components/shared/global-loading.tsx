"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function GlobalLoading() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ 
                opacity: 0,
                transition: { duration: 0.3, delay: 2.2 } // Exit after logo flies away
            }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 0 }}
                animate={{ 
                    scale: [1, 1.2, 1, 1.2, 1, 1.2, 1, 1.2, 1, 0.8, 0],
                    opacity: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                    y: [0, -15, 0, -15, 0, -15, 0, -15, 0, -15, -300]
                }}
                transition={{
                    duration: 2.5,
                    times: [0, 0.09, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.72, 0.81, 1],
                    ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut"],
                    repeat: 0, // No repeat - fly away once
                    onComplete: () => {
                        // Page will open naturally after this animation completes
                    }
                }}
                className="relative mb-8 h-24 w-24"
            >
                <Image
                    src="/TVC logo white.png"
                    alt="TVC Logo"
                    fill
                    className="object-contain"
                    priority
                />
                <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl" />
            </motion.div>

            <div className="w-64">
                <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                    />
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-4 text-center text-sm font-medium tracking-widest text-zinc-500 uppercase"
                >
                    Preparing your dashboard...
                </motion.p>
            </div>
        </motion.div>
    )
}
