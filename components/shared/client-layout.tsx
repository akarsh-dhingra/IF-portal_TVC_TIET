"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { useAuthStore } from "@/lib/store/auth"

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const hasHydrated = useAuthStore((state) => state._hasHydrated)

    // 🚨 Do not render anything until Zustand hydrates
    if (!hasHydrated) {
        return null
    }

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
        >
            <AnimatePresence mode="wait">
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
            </AnimatePresence>
        </ThemeProvider>
    )
}
