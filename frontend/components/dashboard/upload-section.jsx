'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Shield, Lock, Eye, EyeOff, X, ArrowRight, Info } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'

export function UploadSection({ onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [error, setError] = useState('')
  const [anonymize, setAnonymize] = useState(true)
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const processFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.')
      return
    }

    setError('')
    setSelectedFile(file)

    if (!anonymize) {
      uploadFile(file)
      return
    }

    // Process for anonymization preview
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('The CSV file appears to be empty.')
          return
        }

        const originalData = results.data.slice(0, 3) // Preview first 3 rows
        const anonymizedData = originalData.map((row, idx) => anonymizeRow(row, idx + 1))

        setPreview({
          original: originalData,
          anonymized: anonymizedData,
          totalRows: results.data.length,
          fullData: results.data,
          columns: results.meta.fields
        })
      },
      error: (err) => {
        setError('Failed to parse CSV: ' + err.message)
      }
    })
  }

  const anonymizeRow = (row, id) => {
    const newRow = { ...row }
    // Detect common columns such as: name, full_name, email, phone, gender, college, university, address
    const sensitiveKeys = ['name', 'full_name', 'email', 'phone', 'gender', 'college', 'university', 'address']

    Object.keys(newRow).forEach(key => {
      const lowerKey = key.toLowerCase()
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        if (lowerKey.includes('name')) {
          newRow[key] = `Candidate #${id}`
        } else if (lowerKey.includes('college') || lowerKey.includes('university')) {
          newRow[key] = '[INSTITUTION HIDDEN]'
        } else {
          newRow[key] = '[HIDDEN]'
        }
      }
    })
    return newRow
  }

  const handleConfirmUpload = () => {
    if (!preview) return

    const anonymizedFullData = preview.fullData.map((row, idx) => anonymizeRow(row, idx + 1))
    const csvString = Papa.unparse(anonymizedFullData)
    const blob = new Blob([csvString], { type: 'text/csv' })
    const anonymizedFile = new File([blob], selectedFile.name, { type: 'text/csv' })

    uploadFile(anonymizedFile)
  }

  const uploadFile = async (file) => {
    setIsUploading(true)
    setUploadSuccess(false)
    setUploadProgress(10)
    setPreview(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate step-by-step progress for better feedback
      setUploadProgress(30)
      const token = localStorage.getItem('hireflip_token')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/upload-csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      setUploadProgress(70)
      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || 'Upload failed')

      setUploadProgress(100)
      setRowCount(data.rowCount || 0)
      setUploadSuccess(true)
      setIsUploading(false)

      toast.success('Audit Pool Synchronized', {
        description: anonymize ? 'Privacy filters applied to all incoming profiles.' : `${data.rowCount} candidates added to current dataset.`,
      })

      if (onUploadSuccess) onUploadSuccess()
    } catch (err) {
      setError(err.message)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-2xl bg-card border border-border shadow-sm relative overflow-hidden"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="font-bold text-xl tracking-tight">Dataset Importer</h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Upload CSV to refresh fairness audit metrics</p>
          </div>

          <div className="flex items-center gap-4 p-1 px-1 rounded-2xl bg-muted/50 border border-border">
            <div className={`flex items-center gap-2.5 p-2 px-4 rounded-xl transition-all ${anonymize ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-muted-foreground'}`}>
              <Shield className={`w-4 h-4 ${anonymize ? 'text-white' : 'text-purple-500'}`} />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Resume Anonymizer</span>
                <span className={`text-[8px] font-medium leading-none ${anonymize ? 'text-purple-100' : 'text-purple-500/60'}`}>
                  {anonymize ? 'Enabled (Secure)' : 'Disabled'}
                </span>
              </div>
              <button
                onClick={() => setAnonymize(!anonymize)}
                className={`ml-2 w-8 h-4 rounded-full relative transition-colors ${anonymize ? 'bg-purple-400' : 'bg-muted-foreground/30'}`}
              >
                <motion.div
                  animate={{ x: anonymize ? 16 : 2 }}
                  className="absolute top-1 w-2 h-2 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Main Interaction Zone */}
        {!preview && !uploadSuccess && !isUploading && (
          <div className="space-y-6">
            <div
              onDrop={(e) => { e.preventDefault(); processFile(e.dataTransfer.files[0]) }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current.click()}
              className="group relative border-2 border-dashed border-purple-500/20 hover:border-purple-500/50 rounded-3xl p-12 text-center cursor-pointer transition-all hover:bg-purple-500/[0.03] active:scale-[0.99]"
            >
              <div className="space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-all group-hover:rotate-6">
                  <Upload className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold text-lg">Drop candidate CSV here</p>
                  <p className="text-xs text-muted-foreground mt-2 max-w-[240px] mx-auto">
                    Supports standardized HR formats. PII will be masked if Anonymizer is enabled.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-purple-500 transition-colors">
                  <FileText className="w-3 h-3" /> Select File
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => processFile(e.target.files[0])}
              />
            </div>

            {anonymize && (
              <div className="flex gap-3 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 items-start">
                <Info className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] leading-relaxed text-purple-900/70">
                  <span className="font-bold text-purple-700">Privacy Mode:</span> When enabled, names, contact info, and gender tags are masked locally before upload. Your fairness audit will be conducted on anonymized profiles to ensure zero bias.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Anonymization Preview Stage */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="p-5 rounded-2xl bg-muted/40 border border-border">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-tight">PII Masking Preview</h4>
                      <p className="text-[10px] text-muted-foreground">Verification step for {preview.totalRows} profiles</p>
                    </div>
                  </div>
                  <button onClick={() => setPreview(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Raw Input</p>
                      <Eye className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="p-4 rounded-xl bg-background border border-border text-[9px] font-mono space-y-3 opacity-40 select-none pointer-events-none">
                      {preview.original.map((row, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-[8px] text-muted-foreground/50">{i + 1}</span>
                          <span className="truncate">{Object.values(row).slice(0, 4).join(', ')}...</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Anonymized Output</p>
                      <Shield className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 text-[9px] font-mono space-y-3 text-emerald-700 shadow-inner">
                      {preview.anonymized.map((row, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-[8px] text-emerald-500/30">{i + 1}</span>
                          <span className="truncate font-bold">{Object.values(row).slice(0, 4).join(', ')}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Protected Fields</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {['Name', 'Email', 'Phone', 'Gender', 'College'].map(f => (
                        <span key={f} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Preserved Data</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {['Exp', 'Skills', 'Qualification', 'Salary'].map(f => (
                        <span key={f} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[8px] font-black uppercase">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmUpload}
                  className="flex-1 group relative py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  Confirm & Sync Audit Pool
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="px-8 py-4 rounded-2xl border border-border hover:bg-muted font-bold transition-all text-sm"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Stage */}
        {isUploading && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-4 border-purple-500/10 border-t-purple-500"
                />
                <Shield className="w-6 h-6 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <p className="font-bold text-lg tracking-tight">Generating Secure Audit Context</p>
                <p className="text-xs text-muted-foreground mt-1">Normalizing features and applying privacy constraints...</p>
              </div>
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-purple-500/70">
                <span>Data Integrity Check</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Success Stage */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping"
                />
                <CheckCircle className="w-10 h-10 text-emerald-500 relative z-10" />
              </div>
              <h4 className="font-black text-2xl tracking-tighter text-foreground">Audit Ready</h4>
              <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
                {rowCount} profiles successfully ingested into your secure workspace.
              </p>

              <div className="mt-8 flex flex-col gap-3 w-full max-w-[200px]">
                <button
                  onClick={() => { setUploadSuccess(false); setPreview(null); if (onUploadSuccess) onUploadSuccess() }}
                  className="w-full py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  View Live Dashboard
                </button>
                <button
                  onClick={() => { setUploadSuccess(false); setPreview(null) }}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-purple-500 transition-colors"
                >
                  Upload Another Batch
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Feedback */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex gap-4 items-center text-rose-500"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-tight">Sync Failed</p>
              <p className="text-[11px] font-medium opacity-80">{error}</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Footer Info */}
      {!isUploading && !uploadSuccess && !preview && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-5 px-8 rounded-3xl bg-muted/30 border border-border group hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.open('/sample-template.csv', '_blank')}>
          <div className="flex gap-4 items-center mb-4 sm:mb-0">
            <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight">Standard Schema v1.4</p>
              <p className="text-[10px] text-muted-foreground font-medium italic">Optimized for high-fidelity bias detection</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-500 group-hover:translate-x-1 transition-transform">
            Get Template <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  )
}