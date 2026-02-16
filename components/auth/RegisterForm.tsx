"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/lib/store/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, User, Building2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [step, setStep] = useState<'role' | 'form' | 'otp'>('role');
  const [role, setRole] = useState<'student' | 'company'>('student');
  const [otp, setOtp] = useState('');
  const [storedProfileData, setStoredProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    rollNo: '',
    year: '',
    branch: '',
    companyName: '',
    industry: '',
    website: '',
    address: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (selectedRole: 'student' | 'company') => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formattedPhone = formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`;
      const baseData = {
        name: role === 'company' ? formData.companyName : formData.name,
        email: formData.email,
        password: formData.password,
        phone: formattedPhone,
        role,
      };

      const roleSpecificData = role === 'student' ? {
        rollNo: formData.rollNo,
        year: formData.year,
        branch: formData.branch,
      } : {
        industry: formData.industry,
        website: formData.website,
        address: formData.address,
        name: formData.companyName,
      };

      // Store profile data for OTP verification step
      setStoredProfileData(roleSpecificData);

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      // Move to OTP verification step
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          otp,
          profileData: storedProfileData 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP verification failed');

      useAuthStore.getState().setAuth(data.token, data.role, data.user, data.profile);
      router.push(`/${data.role}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={
              step === 'form'
                ? () => setStep('role')
                : step === 'otp'
                  ? () => setStep('role')
                  : onSwitchToLogin
            }
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
            {step === 'role' ? 'Sign In' : 'Role Selection'}
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className="h-1 w-1 rounded-full bg-cyan-400" />
            <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">
              Step {step === 'role' ? '01' : step === 'form' ? '02' : '03'}
            </span>
          </div>
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-foreground">
          {step === 'role'
            ? 'Initialize Identity'
            : step === 'form'
              ? `Profile Configuration`
              : 'Verify Identity'}
        </h2>
        <p className="text-muted-foreground font-medium text-sm">
          {step === 'role'
            ? 'Select your operational role within the ecosystem.'
            : step === 'form'
              ? `Establishing your credentials as a ${role}.`
              : `Enter the verification code sent to ${formData.email}.`}
        </p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center uppercase tracking-widest">
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 'role' ? (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid gap-4"
          >
            <button
              onClick={() => handleRoleSelect('student')}
              className="group relative flex items-center gap-6 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-left hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all font-sans"
            >
              <div className="h-14 w-14 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <User className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-foreground uppercase tracking-wider">I am a Student</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">Looking for professional placements and skill validation.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => handleRoleSelect('company')}
              className="group relative flex items-center gap-6 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-left hover:bg-white/[0.08] hover:border-purple-500/30 transition-all font-sans"
            >
              <div className="h-14 w-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Building2 className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-foreground uppercase tracking-wider">I am a Company</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">Seeking high-performance talent and strategic growth.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </button>
          </motion.div>
        ) : step === 'form' ? (
          <motion.form
            key="registration-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleRegister}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {role === 'student' ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                    <Input name="name" required value={formData.name} onChange={handleInputChange} className="h-11 bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Roll Number</Label>
                    <Input name="rollNo" required value={formData.rollNo} onChange={handleInputChange} className="h-11 bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Academics (Year)</Label>
                    <Input name="year" required value={formData.year} onChange={handleInputChange} placeholder="e.g., 3rd" className="h-11 bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Branch</Label>
                    <Input name="branch" required value={formData.branch} onChange={handleInputChange} placeholder="e.g., CSE" className="h-11 bg-white/5 border-white/10 rounded-xl" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Company Name</Label>
                    <Input name="companyName" required value={formData.companyName} onChange={handleInputChange} className="h-11 bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Industry Sector</Label>
                    <Input name="industry" required value={formData.industry} onChange={handleInputChange} className="h-11 bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Web Presence</Label>
                    <Input name="website" type="url" value={formData.website} onChange={handleInputChange} placeholder="https://..." className="h-11 bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">HQ Address</Label>
                    <Input name="address" value={formData.address} onChange={handleInputChange} className="h-11 bg-white/5 border-white/10 rounded-xl" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Communications (Email)</Label>
                <Input name="email" type="email" required value={formData.email} onChange={handleInputChange} className="h-11 bg-white/5 border-white/10 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mobile Number</Label>
                <Input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} placeholder="+91..." className="h-11 bg-white/5 border-white/10 rounded-xl" />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Security Key (Password)</Label>
                <Input name="password" type="password" required value={formData.password} onChange={handleInputChange} className="h-11 bg-white/5 border-white/10 rounded-xl" />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-foreground/10 group font-sans" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="flex items-center gap-2">
                    <Image 
                      src="/TVC logo white.png"
                      alt="TVC Logo" 
                      width={20} 
                      height={20}
                      className="h-5 w-5 animate-spin"
                    />
                    Creating Account...
                  </div>
                </>
              ) : (
                <>
                  Establish Credentials
                  <CheckCircle2 className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="otp-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleVerifyOtp}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                One-Time Passcode
              </Label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                containerClassName="justify-center"
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-[10px] text-muted-foreground text-center">
                Enter the 6-digit code we sent to your registered email address.( Check your spam folder too)
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-foreground/10 group font-sans"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Image 
                      src="/TVC logo white.png"
                      alt="TVC Logo" 
                      width={20} 
                      height={20}
                      className="h-5 w-5 animate-spin"
                    />
                    Verifying Code...
                  </div>
                ) : (
                  <div>
                    Verify Identity
                    <CheckCircle2 className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </div>
                )}
              </Button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mx-auto"
                disabled={isLoading}
              >
                Resend Verification Code
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
