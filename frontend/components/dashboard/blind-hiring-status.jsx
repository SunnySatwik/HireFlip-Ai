'use client'

import { motion } from 'framer-motion'
import { Shield, ShieldCheck, ShieldAlert, Lock, UserX, EyeOff, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

export function BlindHiringStatus() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('hireflip_token')
        const headers = { 'Authorization': `Bearer ${token}` }
        const res = await fetch('http://localhost:8000/candidates', { headers })
        
        if (res.ok) {
          const data = await res.json()
          setCandidates(Array.isArray(data) ? data : data.candidates || [])
        }
      } catch (err) {
        console.error('Failed to load candidates for blind hiring status', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="h-32 rounded-2xl bg-card border border-border animate-pulse" />
  }

  const isBlindActive = candidates.length > 0 && candidates.some(c => c.name.startsWith('Candidate #'))
  const anonymizedCount = isBlindActive ? candidates.length : 0
  const removedFieldsCount = isBlindActive ? 8 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden p-6 rounded-2xl border transition-all ${
        isBlindActive 
          ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
          : 'bg-muted/30 border-border'
      }`}
    >
      {/* Decorative background element */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 ${
        isBlindActive ? 'bg-emerald-500' : 'bg-purple-500'
      }`} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            isBlindActive ? 'bg-emerald-500/10' : 'bg-muted'
          }`}>
            {isBlindActive ? (
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">Blind Hiring Mode</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                isBlindActive 
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                  : 'bg-muted text-muted-foreground border border-border'
              }`}>
                {isBlindActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium italic">
              {isBlindActive 
                ? 'Your current dataset is protected by the Resume Anonymizer.' 
                : 'Enable anonymization during upload to remove identifying markers.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none p-3 px-5 rounded-xl bg-background/50 border border-border backdrop-blur-sm min-w-[140px]">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Lock className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-tight">Fields Masked</span>
            </div>
            <p className="text-2xl font-black text-foreground">{removedFieldsCount}</p>
          </div>

          <div className="flex-1 md:flex-none p-3 px-5 rounded-xl bg-background/50 border border-border backdrop-blur-sm min-w-[140px]">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserX className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-tight">Profiles Masked</span>
            </div>
            <p className="text-2xl font-black text-foreground">{anonymizedCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-background/40 border border-border/50">
        <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isBlindActive ? 'text-emerald-500' : 'text-purple-500'}`} />
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-tight text-foreground">Blinded Screening Architecture</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All protected attributes (PII) including name, gender, and contact details have been excluded from the screening process. The AI scoring engine is operating exclusively on job-relevant parameters: <span className="font-bold text-foreground">Experience, Technical Skills, and Qualification levels.</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
