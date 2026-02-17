"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2, User, Mail, Phone, GraduationCap, Github, Linkedin, FileText, ChevronRight, Sparkles, Filter, X, CheckCircle2, XCircle, Briefcase, ArrowUpRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/shared/glass-card"
import { Skeleton } from "@/components/ui/skeleton"

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  shortlisted: { label: "Shortlisted", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  accepted: { label: "Accepted", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  rejected: { label: "Rejected", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
}

export default function ApplicantsPage() {
  const { token, _hasHydrated } = useAuthStore()
  const [applicants, setApplicants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (!token) return

    const fetchApplicants = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/company/applicants`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) {
          const mapped = data.data.map((app: any) => ({
            id: app._id,
            name: app.studentId?.userId?.name || "Premium Student",
            email: app.studentId?.userId?.email || "Unknown",
            position: app.roleId?.title || "Lead Developer",
            status: app.status || "PENDING",
            appliedDate: new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            university: app.studentId?.branch || "Computer Science",
            resumeUrl: app.resumeUrl,
            studentData: app.studentId
          }))
          setApplicants(mapped)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setTimeout(() => setLoading(false), 800)
      }
    }

    fetchApplicants()
  }, [token])

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/company/applicant/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus.toUpperCase() } : a))
        toast.success(`Applicant ${newStatus} successfully!`)
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const filtered = applicants.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.position.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || a.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64 bg-white/5" />
            <Skeleton className="h-4 w-96 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full bg-white/5 rounded-[32px]" />
          ))}
        </div>
      </div>
    )
  }
  const getResumeUrl = (url?: string) => {
    if (!url) return null
    return url.startsWith("http")
      ? url
      : `${process.env.NEXT_PUBLIC_API_URL}${url.startsWith("/") ? "" : "/"}${url}`
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-500">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Pipeline</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">Applicants</h1>
          <p className="text-muted-foreground font-medium">Review and evaluate candidates for your roles.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Filter candidates..."
              className="h-12 pl-12 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full sm:w-44 bg-foreground/5 border-border rounded-2xl text-foreground">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              <SelectItem value="all">All Applicants</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <GlassCard className="overflow-hidden border-border bg-card/50 backdrop-blur-md rounded-[32px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-foreground/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Candidate</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Position</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">University</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Applied On</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 rounded-full bg-foreground/5">
                          <XCircle className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No matching candidates</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((applicant, idx) => {
                    const config = statusConfig[applicant.status.toLowerCase()] || statusConfig.pending
                    return (
                      <motion.tr
                        key={applicant.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group border-b border-border hover:bg-foreground/[0.04] transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground group-hover:text-cyan-500 transition-colors uppercase tracking-tight">{applicant.name}</p>
                              <p className="text-[10px] font-medium text-muted-foreground lowercase">{applicant.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground/50" />
                            <span className="text-sm font-medium text-foreground">{applicant.position}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground/50" />
                            <span className="text-xs font-medium text-muted-foreground">{applicant.university}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{applicant.appliedDate}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${config.bg} ${config.border}`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${config.color.replace('text-', 'bg-')} shadow-[0_0_8px] shadow-current`} />
                              <span className={`${config.color} text-[10px] font-black uppercase tracking-widest`}>{config.label}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplicant(applicant)
                              setIsProfileOpen(true)
                              setActiveTab("profile")
                            }}
                            className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-5 font-bold text-[10px] uppercase tracking-widest h-9"
                          >
                            View Profile
                          </Button>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] bg-white dark:bg-neutral-900 border border-border shadow-2xl p-0 overflow-hidden rounded-3xl flex flex-col">

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <div className="p-4 lg:p-6 bg-gradient-to-br from-cyan-500/10 via-background to-background border-b border-border shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-[24px] bg-foreground/5 border border-border flex items-center justify-center shadow-2xl relative group">
                      <User className="h-8 w-8 text-foreground transition-transform group-hover:scale-110" />
                      <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <DialogTitle className="text-2xl lg:text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
                        {selectedApplicant?.name}
                      </DialogTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground bg-foreground/5 px-3 py-1 rounded-lg border border-border">
                          <Mail className="h-3.5 w-3.5 text-cyan-500" />
                          {selectedApplicant?.email}
                        </span>
                        {selectedApplicant?.studentData?.phone && (
                          <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground bg-foreground/5 px-3 py-1 rounded-lg border border-border">
                            <Phone className="h-3.5 w-3.5 text-cyan-500" />
                            {selectedApplicant.studentData.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <TabsList className="bg-foreground/5 h-8 p-0.5 rounded-lg border border-border w-auto">
                  <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-[9px] uppercase tracking-[0.15em] rounded-md transition-all px-4 py-1">
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="resume" className="flex-1 data-[state=active]:bg-background data-[state=active]:text-foreground font-bold text-[9px] uppercase tracking-[0.15em] rounded-md transition-all px-4 py-1">
                    Resume
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <TabsContent value="profile" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-8">
                      <section className="p-8 rounded-[32px] bg-foreground/[0.02] border border-border space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Academic Data</h4>
                        <div className="space-y-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Stream</p>
                            <p className="text-lg font-bold text-foreground">{selectedApplicant?.studentData?.branch || "N/A"}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">GPA</p>
                              <p className="text-2xl font-black text-foreground">{selectedApplicant?.studentData?.cgpa || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Year</p>
                              <p className="text-xl font-bold text-foreground">{selectedApplicant?.studentData?.year || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="p-8 rounded-[32px] bg-cyan-500/5 border border-cyan-500/10 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Social Profiles</h4>
                        <div className="flex gap-4">
                          <a href={selectedApplicant?.studentData?.github} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 rounded-2xl transition-all border border-border group">
                            <Github className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                          </a>
                          <a href={selectedApplicant?.studentData?.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 rounded-2xl transition-all border border-border group">
                            <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                          </a>
                        </div>
                      </section>
                    </div>

                    <div className="lg:col-span-2 space-y-10">
                      <section className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                          <div className="h-1.5 w-6 bg-cyan-500 rounded-full" />
                          Bio
                        </h3>
                        <div className="p-8 rounded-[40px] bg-foreground/[0.01] border border-border">
                          <p className="text-muted-foreground leading-relaxed text-lg font-medium italic">
                            "{selectedApplicant?.studentData?.bio || "No bio provided."}"
                          </p>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                          <div className="h-1.5 w-6 bg-cyan-500 rounded-full" />
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-3 p-2">
                          {selectedApplicant?.studentData?.skills?.map((skill: string, i: number) => (
                            <div key={i} className="px-5 py-2.5 bg-foreground/5 rounded-2xl text-xs font-bold text-muted-foreground border border-border hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all">
                              {skill}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="resume" className="h-full m-0 flex flex-col overflow-hidden">
                <ScrollArea className="h-full flex-1">
                  <div className="p-8 lg:p-12 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-cyan-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resume Preview</span>
                      </div>
                      {selectedApplicant?.resumeUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-10 px-6 rounded-xl border-border bg-background hover:bg-foreground/5 font-black text-[10px] uppercase tracking-widest"
                        >
                          <a
                            href={getResumeUrl(selectedApplicant?.resumeUrl) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            Open in New Tab <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                    <div className="w-full h-96 rounded-[32px] border border-border overflow-hidden bg-foreground/[0.02]">
                      {selectedApplicant?.resumeUrl ? (
                        <iframe
                          src={`${getResumeUrl(selectedApplicant?.resumeUrl)}#toolbar=0`}
                          className="w-full h-full border-none"
                          title="Resume Viewer"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground/30">
                          <FileText className="h-16 w-16 opacity-10" />
                          <p className="font-bold uppercase tracking-widest text-[10px]">No document attached</p>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>

            <div className="p-8 bg-background border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
              <div className={`px-5 py-2 rounded-full border ${statusConfig[selectedApplicant?.status?.toLowerCase()]?.bg || 'bg-foreground/5'} ${statusConfig[selectedApplicant?.status?.toLowerCase()]?.border || 'border-border'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${statusConfig[selectedApplicant?.status?.toLowerCase()]?.color || 'text-muted-foreground'}`}>
                  Status: {selectedApplicant?.status}
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={() => setIsProfileOpen(false)}
                  className="text-muted-foreground hover:text-foreground font-bold text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedApplicant.id, 'rejected')
                      setIsProfileOpen(false)
                    }}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-2xl px-6 font-bold text-[10px] uppercase tracking-widest h-12"
                    disabled={selectedApplicant?.status === 'REJECTED'}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedApplicant.id, 'shortlisted')
                      setIsProfileOpen(false)
                    }}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-xl shadow-cyan-500/20 rounded-2xl px-8 font-bold text-[10px] uppercase tracking-widest h-12"
                    disabled={selectedApplicant?.status === 'SHORTLISTED' || selectedApplicant?.status === 'ACCEPTED'}
                  >
                    Shortlist
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedApplicant.id, 'accepted')
                      setIsProfileOpen(false)
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 rounded-2xl px-8 font-bold text-[10px] uppercase tracking-widest h-12"
                    disabled={selectedApplicant?.status === 'ACCEPTED'}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

