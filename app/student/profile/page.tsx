"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store/auth"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { File as FileIcon, Loader2, Sparkles, User, GraduationCap, Briefcase, Link as LinkIcon, Upload, CheckCircle2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { studentApi } from "@/lib/api/student"
import { GlassCard } from "@/components/shared/glass-card"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"

export default function StudentProfilePage() {
  const { user, token } = useAuthStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    rollNo: "",
    branch: "",
    year: "",
    cgpa: "",
    phone: "",
    bio: "",
    github: "",
    linkedin: "",
    skills: ""
  })

  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string | null>(null)
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    if (!token) return

    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await studentApi.getProfile()
        if (data && (data.student || data)) {
          const s = data.student || data
          setFormData({
            name: user?.name ?? "",
            rollNo: s.rollNo || "",
            branch: s.branch || "",
            year: s.year || "",
            cgpa: s.cgpa?.toString() || "",
            phone: s.phone || "",
            bio: s.bio || "",
            github: s.github || "",
            linkedin: s.linkedin || "",
            skills: s.skills?.join(", ") || ""
          })
          if (s.resumeUrl) {
            const url = s.resumeUrl.startsWith('http')
              ? s.resumeUrl
              : `${process.env.NEXT_PUBLIC_API_URL}${s.resumeUrl.startsWith('/') ? '' : '/'}${s.resumeUrl}`
            setUploadedResumeUrl(url)
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err)
      } finally {
        setTimeout(() => setIsLoading(false), 600)
      }
    }

    fetchProfile()
  }, [token, user])

  useEffect(() => {
    // Calculate completion
    const fields = Object.values(formData)
    const filled = fields.filter(f => f.trim() !== "").length
    const total = fields.length + (uploadedResumeUrl ? 1 : 0)
    setCompletion(Math.round(((filled + (uploadedResumeUrl ? 1 : 0)) / (fields.length + 1)) * 100))
  }, [formData, uploadedResumeUrl])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!token) return
    setIsSaving(true)
    try {
      await studentApi.updateProfile(formData)
      toast.success("Profile updated successfully ✅")
    } catch (err) {
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    try {
      setIsUploading(true)
      const data = await studentApi.uploadResume(file)
      if (data.success) {
        const url = data.resume.startsWith('http')
          ? data.resume
          : `${process.env.NEXT_PUBLIC_API_URL}${data.resume}`
        setUploadedResumeUrl(url)
        toast.success("Resume uploaded successfully! 📁")
      }
    } catch (err) {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-10 min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-cyan-500" />
        <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">Synchronizing profile data...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-10 min-h-screen">
      {/* Header & Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 bg-foreground/5 border border-border rounded-[32px] p-6 sm:p-8 lg:p-12 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-cyan-500">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">User Details</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground tracking-tight">Student Profile</h1>
          <p className="text-muted-foreground font-medium">Manage your professional credentials and academic summary.</p>
        </div>

        <div className="relative z-10 w-full lg:w-72 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Completion</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-500">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2 bg-foreground/5" />
          <p className="text-[10px] text-muted-foreground/50 font-medium text-right uppercase tracking-[0.1em]">Verified Profile Status</p>
        </div>

        {/* Background Accent */}
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-cyan-500/5 to-transparent z-0" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8"
      >
        <div className="xl:col-span-2 space-y-6 lg:space-y-10">
          {/* Academic Info */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 sm:p-8 space-y-6 sm:space-y-8 border-border bg-card/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <GraduationCap className="h-5 w-5 text-cyan-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Academic Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-10 sm:h-12 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email (Read-only)</Label>
                  <Input value={user?.email} disabled className="h-12 bg-foreground/[0.02] border-border rounded-2xl text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Roll Number</Label>
                  <Input
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    placeholder="21BCS001"
                    className="h-10 sm:h-12 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Branch</Label>
                  <Input
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    placeholder="Computer Science"
                    className="h-10 sm:h-12 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Year</Label>
                  <Input
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="3rd Year"
                    className="h-10 sm:h-12 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">CGPA</Label>
                  <Input
                    name="cgpa"
                    type="number"
                    step="0.01"
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    placeholder="8.50"
                    className="h-10 sm:h-12 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Professional Info */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-8 space-y-8 border-border bg-card/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Briefcase className="h-5 w-5 text-cyan-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Professional Profile</h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Bio</Label>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Describe your interests and goals..."
                    rows={4}
                    className="bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50 p-4 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Skills (Comma separated)</Label>
                  <Input
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="React, Node.js, Python"
                    className="h-10 sm:h-12 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">GitHub URL</Label>
                    <div className="relative group">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                      <Input
                        name="github"
                        value={formData.github}
                        onChange={handleInputChange}
                        placeholder="github.com/username"
                        className="h-12 pl-12 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">LinkedIn URL</Label>
                    <div className="relative group">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                      <Input
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        placeholder="linkedin.com/in/username"
                        className="h-12 pl-12 bg-foreground/5 border-border rounded-2xl text-foreground focus:ring-cyan-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 sm:p-8 border-border bg-card/50 shadow-2xl">
              <div className="space-y-2 mb-8">
                <h3 className="text-xl font-bold text-foreground">Resume</h3>
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Document</p>
              </div>

              <div className="space-y-6">
                <div className="relative group border-2 border-dashed border-border rounded-[28px] p-6 sm:p-8 sm:p-10 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/[0.02] flex flex-col items-center">
                  <Input
                    type="file"
                    accept=".pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleResumeUpload}
                  />
                  <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${isUploading ? 'bg-cyan-500/20' : 'bg-foreground/5 group-hover:bg-cyan-500/10'}`}>
                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-cyan-500" /> : <Upload className="h-6 w-6 text-muted-foreground group-hover:text-cyan-500" />}
                  </div>
                  <p className="text-sm font-bold text-foreground group-hover:text-cyan-500 transition-colors">Select PDF</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-widest">Max size 5MB</p>
                </div>

                <AnimatePresence mode="wait">
                  {uploadedResumeUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="pt-2"
                    >
                      <a
                        href={uploadedResumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 p-5 bg-foreground/5 border border-border rounded-2xl group hover:bg-foreground/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-5 w-5 text-cyan-500" />
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground">View Resume</span>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard className="p-8 bg-gradient-to-br from-cyan-500/10 via-background to-background border-border">
              <div className="flex items-start gap-4">
                <div className="bg-foreground/10 p-2 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-cyan-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground text-sm">Privacy Information</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Your profile is private. Your data is only shared with companies you explicitly apply to.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-16 bg-foreground text-background hover:bg-foreground/90 rounded-full text-sm font-black tracking-[0.2em] uppercase shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Save Profile"
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}


