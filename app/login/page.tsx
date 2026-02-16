"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, UserPlus, LogIn } from "lucide-react"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { GlassCard } from "@/components/shared/glass-card"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const { theme } = useTheme()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      const userRole = data.role.toLowerCase();
      const { setAuth } = useAuthStore.getState();
      setAuth(data.token, userRole, data.user, data.profile);

      window.location.href = `/${userRole}/dashboard`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-background transition-colors duration-500">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" />
      </div>

      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-0 relative z-10"
          >
            {/* Left Side: Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-white/[0.02] dark:bg-black/20 border-y border-l border-white/10 rounded-l-[32px] backdrop-blur-md">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Image 
                      src={theme === 'dark' ? "/TVC logo white.png" : "/TVC Logo Black.png"}
                      alt="TVC Logo" 
                      width={24} 
                      height={24}
                      className="h-6 w-6"
                    />
                  </div>
                  <span className="text-xl font-black tracking-tighter text-foreground">IF Portal</span>
                </div>
                <h1 className="text-5xl font-black leading-tight text-foreground tracking-tighter">
                  Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Future</span> of Recruitment.
                </h1>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">
                 Platform designed to seamlessly connect ambitious students with top-tier internship opportunities.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Secure Infrastructure</p>
                    <p className="text-xs text-muted-foreground font-medium">End-to-end encrypted validation protocols.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <GlassCard className="p-8 lg:p-12 border-white/10 rounded-[32px] lg:rounded-l-none shadow-2xl flex flex-col justify-center">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight text-foreground">Login to your account</h2>
                  <p className="text-muted-foreground font-medium"></p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username (Email)</Label>
                      <Input
                        id="email"
                        placeholder="name@domain.com"
                        type="email"
                        className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-cyan-500/50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" id="password-label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Key (Password)</Label>
                      <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-cyan-500/50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-center uppercase tracking-widest">{error}</motion.p>
                  )}

                  <Button type="submit" className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-foreground/10 group" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Image 
                          src="/TVC logo Black.png"
                          alt="TVC Logo" 
                          width={20} 
                          height={20}
                          className="h-5 w-5 animate-spin"
                        />
                        Signing In...
                      </div>
                    ) : (
                      <>
                        Sign In 
                        <LogIn className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-transparent px-4 text-muted-foreground">Don't Have an Account?</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-12 border-white/10 hover:bg-white/5 rounded-xl font-black uppercase tracking-widest transition-all text-foreground/70"
                  onClick={() => setMode('register')}
                >
                  Sign up
                  <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[600px] relative z-10"
          >
            <GlassCard className="p-8 lg:p-12 border-white/10 rounded-[32px] shadow-2xl">
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
