"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { GlobalLoading } from "./global-loading"
import { ThemeProvider } from "@/components/theme-provider"

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()

    useEffect(() => {
        // Simulate initial load
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 500) // Reduced from 2000ms to 500ms
        return () => clearTimeout(timer)
    }, [])

    // Don't show loading state on landing page
    const shouldShowLoading = isLoading && pathname !== '/'

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
        >
            <AnimatePresence mode="wait">
                {shouldShowLoading ? (
                    <GlobalLoading key="loader" />
                ) : (
                    <motion.main
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="min-h-screen"
                    >
                        {children}
                    </motion.main>
                )}
            </AnimatePresence>
        </ThemeProvider>
    )
}
