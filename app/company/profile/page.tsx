"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { companyApi } from "@/lib/api/company"
import { Loader2, Upload, Trash2, Sparkles, Building2, Mail, Phone, Globe, MapPin, Info, CheckCircle2, ShieldCheck, Camera } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/shared/glass-card"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface CompanyData {
  name: string
  email: string
  phone: string
  website: string
  location: string
  about: string
  logoUrl?: string
}

export default function CompanyProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    about: ""
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const data = await companyApi.getProfile()
        setCompanyData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          website: data.website || "",
          location: data.location || "",
          about: data.about || "",
          logoUrl: data.logoUrl
        })
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/login')
        toast.error("Authentication required to access profile.")
      } finally {
        setTimeout(() => setIsLoading(false), 800)
      }
    }

    checkAuthAndLoadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64 bg-white/5" />
            <Skeleton className="h-4 w-96 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="md:col-span-2 h-[600px] bg-white/5 rounded-[40px]" />
          <Skeleton className="md:col-span-1 h-[400px] bg-white/5 rounded-[40px]" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompanyData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PNG or JPG file.")
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit.")
      return;
    }

    setLogoFile(file);

    try {
      setIsUploading(true);
      const result = await companyApi.uploadLogo(file);
      setCompanyData(prev => ({
        ...prev,
        logoUrl: result.logoUrl || result.filePath
      }));
      toast.success("Identity updated successfully!")
    } catch (error: any) {
      toast.error("Failed to sync logo.")
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!companyData.logoUrl) return;
    if (!confirm("Remove brand logo?")) return;

    try {
      setIsUploading(true);
      await companyApi.deleteLogo();
      setCompanyData(prev => ({ ...prev, logoUrl: undefined }));
      setLogoFile(null);
      toast.success("Logo removed.")
    } catch (error: any) {
      toast.error("Removal failed.")
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await companyApi.updateProfile(companyData);
      toast.success("Global profile updated!")
    } catch (error) {
      toast.error("Sync failed.")
    } finally {
      setIsSaving(false);
    }
  };

  const backendUrl = process.env.NEXT_PUBLIC_API_URL

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-10 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-500">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground font-medium">Update your organizational preferences and brand identity.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className={`px-4 py-2 rounded-2xl bg-foreground/5 border border-border flex items-center gap-2 text-muted-foreground`}>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Active Account</span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-12 px-6 sm:px-10 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-foreground/10"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          <GlassCard className="p-6 sm:p-8 lg:p-12 space-y-6 sm:space-y-10 border-border bg-card/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-cyan-500 rounded-full" />
              <h3 className="text-2xl font-black text-foreground tracking-tight">Core Details</h3>
            </div>

            <div className="grid gap-6 sm:gap-8 lg:gap-10">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Company Name</Label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
                  <Input
                    id="name"
                    name="name"
                    value={companyData.name}
                    onChange={handleInputChange}
                    className="h-12 sm:h-14 pl-12 bg-foreground/5 border-border rounded-2xl text-foreground font-bold focus:ring-cyan-500/50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Corporate Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={companyData.email}
                      onChange={handleInputChange}
                      className="h-14 pl-12 bg-foreground/5 border-border rounded-2xl text-foreground font-bold focus:ring-cyan-500/50"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Phone Number</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={companyData.phone}
                      onChange={handleInputChange}
                      className="h-14 pl-12 bg-foreground/5 border-border rounded-2xl text-foreground font-bold focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="website" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Website URL</Label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={companyData.website}
                      onChange={handleInputChange}
                      className="h-14 pl-12 bg-foreground/5 border-border rounded-2xl text-foreground font-bold focus:ring-cyan-500/50"
                      placeholder="https://company.ai"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Location</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
                    <Input
                      id="location"
                      name="location"
                      value={companyData.location}
                      onChange={handleInputChange}
                      className="h-14 pl-12 bg-foreground/5 border-border rounded-2xl text-foreground font-bold focus:ring-cyan-500/50"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="about" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  About Company
                </Label>
                <textarea
                  id="about"
                  name="about"
                  value={companyData.about}
                  onChange={handleInputChange}
                  rows={6}
                  className="flex w-full rounded-3xl border border-border bg-foreground/[0.03] text-foreground placeholder:text-muted-foreground/30 px-6 py-4 text-sm focus:ring-cyan-500/50 focus:outline-none transition-all font-medium"
                  placeholder="Tell us about your company..."
                />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-8 space-y-6 flex flex-col items-center border-border bg-card/50">
            <h4 className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Brand Logo</h4>

            <div className="relative w-full aspect-square rounded-[40px] bg-foreground/[0.02] border border-dashed border-border flex items-center justify-center overflow-hidden group">
              <AnimatePresence mode="wait">
                {companyData.logoUrl ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full p-12"
                  >
                    <img
                      src={companyData.logoUrl.startsWith('http') ? companyData.logoUrl : `${backendUrl}${companyData.logoUrl}`}
                      alt="Identity"
                      className="w-full h-full object-contain filter drop-shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleRemoveLogo}
                        className="h-12 w-12 p-0 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                      <Label htmlFor="logo-upload" className="h-12 w-12 flex items-center justify-center rounded-2xl bg-foreground text-background hover:bg-foreground/90 cursor-pointer">
                        <Camera className="h-5 w-5" />
                      </Label>
                    </div>
                  </motion.div>
                ) : (
                  <motion.label
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    htmlFor="logo-upload"
                    className="flex flex-col items-center gap-4 cursor-pointer p-10 text-center"
                  >
                    <div className="p-6 rounded-3xl bg-foreground/5 border border-border text-muted-foreground group-hover:text-cyan-500 group-hover:bg-cyan-500/10 transition-all">
                      <Upload className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-foreground font-black text-xs uppercase tracking-widest">Upload Profile Picture</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SVG, PNG or JPG (Max 5MB)</p>
                    </div>
                  </motion.label>
                )}
              </AnimatePresence>

              {isUploading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Syncing Assets...</p>
                </div>
              )}
            </div>

            <input
              type="file"
              id="logo-upload"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleLogoChange}
              className="hidden"
              disabled={isUploading}
            />

            <div className="w-full p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-2">
              <div className="flex items-center gap-2 text-cyan-500">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Brand Verified</span>
              </div>
              <p className="text-muted-foreground text-[10px] font-medium leading-relaxed">
                Your logo will be visible to all students and partners across the platform.
              </p>
            </div>
          </GlassCard>
        </div>
      </form>
    </div>
  );
}
