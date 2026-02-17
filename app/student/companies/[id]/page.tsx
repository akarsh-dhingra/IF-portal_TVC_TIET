"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  IndianRupee,
  FileText,
  Upload,
  Globe,
  CheckCircle,
  Loader2,
  ChevronRight,
  Info,
  Sparkles,
  ExternalLink,
  Menu,
  X
} from "lucide-react"
import { toast } from "sonner"
import { studentApi } from "@/lib/api/student"
import { GlassCard } from "@/components/shared/glass-card"
import { motion, AnimatePresence } from "framer-motion"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

export default function CompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string
  const { token } = useAuthStore()
  const { user } = useAuthStore()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [company, setCompany] = useState<any>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [resume, setResume] = useState<File | null>(null)
  const [useExistingResume, setUseExistingResume] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingResume, setExistingResume] = useState<{ name: string; url: string } | null>(null)
  const [appliedRoleIds, setAppliedRoleIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    const loadData = async () => {
      try {
        setLoading(true)
        const compRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student/company/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const compJson = await compRes.json()

        const companyData = compJson?.data?.company || compJson?.company || null
        const rolesData = compJson?.data?.roles || compJson?.roles || []

        setCompany(companyData)
        setRoles(rolesData)
        if (rolesData.length > 0) {
          setSelectedRole(rolesData[0])
        }

        const profData = await studentApi.getProfile()
        const s = profData?.student || profData
        const r = s?.resumeUrl
        if (r) {
          setExistingResume({
            name: r.split("/").pop() || "resume.pdf",
            url: r.startsWith('http') ? r : `${process.env.NEXT_PUBLIC_BACKEND_URL}${r}`,
          })
        }

        const appsData = await studentApi.getApplications()
        if (appsData) {
          const ids = appsData.map((app: any) => app.roleId?._id || app.roleId)
          setAppliedRoleIds(ids)
        }
      } catch (err) {
        toast.error("Failed to load details")
      } finally {
        setTimeout(() => setLoading(false), 600)
      }
    }

    loadData()
  }, [token, companyId])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole || !token) return

    try {
      setIsSubmitting(true)
      const res = await studentApi.applyForRole(selectedRole._id, useExistingResume, resume || undefined)

      if (res.success) {
        toast.success("Application submitted successfully! ✅")
        setAppliedRoleIds(prev => [...prev, selectedRole._id])
        setTimeout(() => {
          router.push('/student/applications')
        }, 1500)
      } else {
        toast.error(res.message || "Failed to submit application")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "An error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 min-h-screen">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <Skeleton className="h-32 w-32 rounded-3xl bg-white/5" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-10 w-1/3 bg-white/5" />
            <Skeleton className="h-6 w-1/4 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Skeleton className="h-64 w-full bg-white/5 rounded-3xl" />
            <Skeleton className="h-96 w-full bg-white/5 rounded-3xl" />
          </div>
          <Skeleton className="h-[500px] w-full bg-white/5 rounded-3xl lg:sticky lg:top-10" />
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <GlassCard className="p-12 max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">Discovery Failed</h2>
          <p className="text-zinc-400 mb-8">We couldn't find the company you're looking for. It might have been unregistered or the link is expired.</p>
          <Button onClick={() => router.back()} className="rounded-full px-8 bg-cyan-500 hover:bg-cyan-600">
            Go Back
          </Button>
        </GlassCard>
      </div>
    )
  }

  const logoUrl = company.logo
    ? (company.logo.startsWith('http') ? company.logo : `${process.env.NEXT_PUBLIC_BACKEND_URL}${company.logo}`)
    : "/favicon.ico"

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] border border-border bg-foreground/5 p-8 lg:p-12"
      >
        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Sparkles className="h-5 w-5 text-cyan-500" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Quick Apply</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-32 w-32 lg:h-40 lg:w-40 rounded-[28px] border border-border bg-white p-6 flex items-center justify-center shrink-0 shadow-2xl"
          >
            <img
              src={logoUrl}
              alt={company.name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => (e.currentTarget.src = "/favicon.ico")}
            />
          </motion.div>

          <div className="text-center md:text-left space-y-4">
            <div className="flex justify-center md:justify-start items-center gap-2 text-cyan-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Partner</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground">
              {company.name}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-5">
              <span className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-rose-500" />
                {company.location || company.address?.city || "Worldwide"}
              </span>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-cyan-500 text-sm transition-colors group"
                >
                  <Globe className="h-4 w-4 text-cyan-500" />
                  {company.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-cyan-500/5 to-transparent z-0" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* About Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-cyan-500 rounded-full" />
              <h2 className="text-2xl font-bold text-foreground tracking-tight">About</h2>
            </div>
            <GlassCard className="p-8 border-border bg-card/50">
              <p className="text-lg leading-relaxed text-muted-foreground font-light">
                {company.about || company.description || "No description provided."}
              </p>
            </GlassCard>
          </section>

          {/* Opportunities Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-cyan-500 rounded-full" />
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Jobs</h2>
              </div>
              <Badge className="bg-foreground/5 border-border text-muted-foreground px-4 py-1.5 rounded-full">
                {roles.length} Openings
              </Badge>
            </div>

            <div className="grid gap-6">
              <AnimatePresence mode="popLayout">
                {roles.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-20 rounded-[32px] border-2 border-dashed border-border text-center bg-foreground/[0.02]"
                  >
                    <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No roles posted at this moment.</p>
                  </motion.div>
                ) : (
                  roles.map((role, idx) => (
                    <motion.div
                      key={role._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setSelectedRole(role)}
                      className={`group relative cursor-pointer rounded-3xl border transition-all duration-300 p-8 ${selectedRole?._id === role._id
                        ? 'border-cyan-500 bg-cyan-500/5'
                        : 'border-border bg-card/50 hover:border-border hover:bg-foreground/[0.04]'
                        }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-foreground group-hover:text-cyan-500 transition-colors">
                              {role.title}
                            </h3>
                            {appliedRoleIds.includes(role._id) && (
                              <Badge className="bg-emerald-500 text-white border-none">Applied</Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 bg-foreground/5 border border-border px-4 py-1.5 rounded-2xl text-muted-foreground text-xs font-medium">
                              {role.currency === 'USD' ? <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> : <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />}
                              {role.stipend} / month
                            </div>
                            <div className="flex items-center gap-2 bg-foreground/5 border border-border px-4 py-1.5 rounded-2xl text-muted-foreground text-xs font-medium">
                              <CheckCircle className="h-3.5 w-3.5 text-cyan-500" />
                              {role.eligibility}
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm line-clamp-2 font-medium">
                            {role.description}
                          </p>
                        </div>

                        <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${selectedRole?._id === role._id ? 'bg-cyan-500' : 'bg-foreground/5 group-hover:bg-foreground/10'
                          }`}>
                          <ChevronRight className={`h-6 w-6 transition-transform ${selectedRole?._id === role._id ? 'text-white translate-x-0.5' : 'text-muted-foreground group-hover:text-foreground'
                            }`} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[280px] bg-sidebar p-6 text-sidebar-foreground"
            side="left"
          >
            {roles.map(role => (
              <div
                key={role._id}
                onClick={() => {
                  setSelectedRole(role)
                  setIsMobileSidebarOpen(false)
                }}
                className="py-3 border-b border-border cursor-pointer hover:text-cyan-500"
              >
                {role.title}
              </div>
            ))}
          </SheetContent>
        </Sheet>


        {/* Sidebar Application */}
        <div className="lg:sticky lg:top-10">
          <GlassCard className="p-6 sm:p-8 border-border bg-card/50 shadow-2xl">
            <div className="space-y-2 mb-8 text-center lg:text-left">
              <h3 className="text-2xl font-bold text-foreground">Apply</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Applying for <span className="text-cyan-500">{selectedRole?.title}</span>
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-8">
              <div className="space-y-6">
                <div className="flex p-1.5 bg-foreground/5 rounded-[20px] gap-1.5 border border-border">
                  <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-[14px] text-xs font-bold tracking-widest uppercase transition-all ${useExistingResume
                      ? 'bg-cyan-500 shadow-lg shadow-cyan-500/20 text-white'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                    onClick={() => setUseExistingResume(true)}
                  >
                    Saved CV
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-[14px] text-xs font-bold tracking-widest uppercase transition-all ${!useExistingResume
                      ? 'bg-cyan-500 shadow-lg shadow-cyan-500/20 text-white'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                    onClick={() => setUseExistingResume(false)}
                  >
                    Upload New
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {useExistingResume ? (
                    <motion.div
                      key="existing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl p-5 border border-border bg-foreground/[0.02]"
                    >
                      {existingResume ? (
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <FileText className="h-5 w-5 text-cyan-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{existingResume.name}</p>
                            <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">From Profile</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 space-y-4">
                          <p className="text-xs text-muted-foreground font-medium">No resume on file</p>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="rounded-full px-6 border-border hover:bg-foreground/5 text-xs h-9"
                            onClick={() => setUseExistingResume(false)}
                          >
                            Add New
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="new"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="relative group"
                    >
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept=".pdf"
                        onChange={(e) => setResume(e.target.files?.[0] || null)}
                      />
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-8 transition-all group-hover:border-cyan-500 group-hover:bg-cyan-500/5 group-hover:scale-[1.02]">
                        <Upload className="h-8 w-8 text-muted-foreground/30 group-hover:text-cyan-500 mb-3 transition-colors" />
                        <p className="text-xs font-bold text-center text-muted-foreground uppercase tracking-widest group-hover:text-foreground">
                          {resume ? resume.name : "Select PDF"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/40 font-medium mt-1">Max 5MB</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                type="submit"
                className={`w-full h-14 text-sm font-black tracking-[0.2em] uppercase rounded-full shadow-2xl transition-all ${appliedRoleIds.includes(selectedRole?._id)
                  ? 'bg-muted text-muted-foreground cursor-not-allowed border-none'
                  : 'bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                disabled={(useExistingResume && !existingResume) || (!useExistingResume && !resume) || isSubmitting || !selectedRole || appliedRoleIds.includes(selectedRole?._id)}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : appliedRoleIds.includes(selectedRole?._id) ? (
                  "Applied"
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>

            {/* Disclaimer */}
            <p className="mt-8 text-[10px] text-center text-muted-foreground/40 font-medium leading-relaxed px-4">
              By submitting, you agree to allow the recruiter to view your profile.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}


