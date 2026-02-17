"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, Briefcase, ChevronRight, Filter, Search, Sparkles } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export default function CompaniesPage() {
  const { token, _hasHydrated } = useAuthStore()
  const [companies, setCompanies] = useState<any[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState("All")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const companyList = Array.isArray(data) ? data : []
        setCompanies(companyList)

        const uniqueRoles = Array.from(new Set(
          companyList.flatMap(company =>
            company.roles ? company.roles.map((r: any) => r.title) : []
          )
        )).sort()

        setRoles(uniqueRoles as string[])
        setTimeout(() => setLoading(false), 500)
      })
      .catch(err => {
        console.error("Failed to fetch companies:", err)
        setLoading(false)
      })
  }, [token])

  const filtered = companies.filter(c => {
    if (selectedRole === "All") return true
    return c.roles && c.roles.some((r: any) => r.title === selectedRole)
  })

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-500">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Recruiters</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">Companies</h1>
          <p className="text-muted-foreground max-w-lg">Connect with organizations offering internship specialized opportunities.</p>
        </div>

        <div className="group relative w-full md:w-80">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="relative w-full h-14 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50 transition-all">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select a role" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              <SelectItem value="All">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-foreground/[0.02] p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-xl bg-foreground/5" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4 bg-foreground/5" />
                  <Skeleton className="h-4 w-1/2 bg-foreground/5" />
                </div>
              </div>
              <Skeleton className="h-24 w-full bg-foreground/5" />
              <Skeleton className="h-10 w-full bg-foreground/5" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-24 rounded-3xl border border-dashed border-border text-center bg-foreground/[0.02]"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-foreground/5">
                <Search className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-medium">No matches found for "{selectedRole}"</p>
              <button
                onClick={() => setSelectedRole("All")}
                className="text-cyan-500 text-sm font-semibold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        ) : (
          filtered.map((company, idx) => {
            const logoUrl = company.logo
              ? (company.logo.startsWith('http') ? company.logo : `${process.env.NEXT_PUBLIC_API_URL}${company.logo}`)
              : "/favicon.ico"

            return (
              <Link key={company._id} href={`/student/companies/${company._id}`}>
                <GlassCard delay={idx * 0.05} className="h-full flex flex-col p-6 hover:bg-foreground/[0.04] border-border bg-card/50">
                  <div className="flex flex-row items-start gap-4 mb-6">
                    <div className="h-16 w-16 rounded-2xl border border-border bg-white p-3 flex items-center justify-center shrink-0 shadow-sm">
                      <img
                        src={logoUrl}
                        alt={company.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => (e.currentTarget.src = "/favicon.ico")}
                      />
                    </div>
                    <div className="min-w-0 pt-1">
                      <h3 className="text-xl font-bold text-foreground truncate leading-tight group-hover:text-cyan-500 transition-colors">
                        {company.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{company.location || company.address?.city || "Worldwide"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-5">
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <Briefcase className="h-3 w-3" />
                        Positions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {company.roles && company.roles.length > 0 ? (
                          company.roles.slice(0, 3).map((role: any) => (
                            <Badge
                              key={role._id}
                              variant="secondary"
                              className="bg-foreground/5 text-muted-foreground border-border group-hover:bg-cyan-500/10 group-hover:text-cyan-500 transition-colors text-[10px]"
                            >
                              {role.title}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground/30 italic">No roles</span>
                        )}
                        {company.roles && company.roles.length > 3 && (
                          <span className="text-[10px] text-muted-foreground/40 font-medium px-2 py-1">
                            +{company.roles.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between group/btn">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">View Details</span>
                      <div className="h-8 w-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover/btn:bg-cyan-500 transition-all">
                        <ChevronRight className="h-4 w-4 text-white group-hover/btn:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
