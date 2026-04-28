'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function UploadSection({ onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [error, setError] = useState('')

  const uploadFile = async (file) => {
    if (!file) return

    setIsUploading(true)
    setUploadSuccess(false)
    setUploadProgress(20)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      setUploadProgress(45)

      const response = await fetch('http://localhost:8000/upload-csv', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(75)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed')
      }

      setUploadProgress(100)
      setRowCount(data.rowCount || 0)
      setUploadSuccess(true)
      setIsUploading(false)

      toast.success('Candidates imported successfully!', {
        description: `${data.rowCount} new profiles added to the pool.`,
      })

      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (err) {
      setError(err.message)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    uploadFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleInput = (e) => {
    const file = e.target.files[0]
    uploadFile(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-card border border-border"
    >
      <h3 className="font-semibold mb-6">Import Candidate Data</h3>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-purple-500/40 rounded-xl p-8 text-center"
      >
        {uploadSuccess ? (
          <div className="space-y-3">
            <CheckCircle className="mx-auto w-10 h-10 text-green-500" />
            <p className="font-semibold text-green-500">Upload Successful</p>
            <p className="text-sm text-muted-foreground">
              {rowCount} candidates imported
            </p>
          </div>
        ) : isUploading ? (
          <div className="space-y-4">
            <Upload className="mx-auto w-8 h-8 text-purple-500 animate-bounce" />
            <p className="font-medium">Uploading CSV...</p>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {uploadProgress}%
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto w-10 h-10 text-purple-500" />
            <p className="font-semibold">Drag & Drop CSV File</p>
            <p className="text-sm text-muted-foreground">
              or click below to browse
            </p>
          </div>
        )}
      </div>

      {!isUploading && !uploadSuccess && (
        <>
          <input
            type="file"
            accept=".csv"
            id="csv-upload"
            className="hidden"
            onChange={handleInput}
          />

          <button
            onClick={() => document.getElementById('csv-upload').click()}
            className="mt-4 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            Browse Files
          </button>
        </>
      )}

      {error && (
        <div className="mt-4 flex gap-2 items-center text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="mt-6 p-4 rounded-xl border bg-muted/30">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-purple-500 mt-1" />
          <div>
            <p className="font-medium text-sm">Need a template?</p>
            <p className="text-xs text-muted-foreground mb-2">
              Use our sample CSV format
            </p>
            <a
              href="/sample-template.csv"
              download="sample-template.csv"
              className="text-sm text-purple-500 font-semibold"
            >
              Download Template
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}