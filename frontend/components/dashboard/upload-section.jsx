'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Upload, FileText, CheckCircle } from 'lucide-react'

export function UploadSection() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Simulate file upload
    startUpload()
  }

  const startUpload = () => {
    setIsUploading(true)
    setUploadSuccess(false)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadSuccess(true)
          setTimeout(() => setUploadSuccess(false), 3000)
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-lg glass-effect border border-purple-500/20"
    >
      <h3 className="font-semibold mb-6 text-foreground">Import Candidate Data</h3>

      <motion.div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className="border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-lg p-8 text-center transition-colors cursor-pointer group"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block mb-4"
        >
          {uploadSuccess ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center"
            >
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </motion.div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <Upload className="w-6 h-6 text-purple-400" />
            </div>
          )}
        </motion.div>

        {uploadSuccess ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="font-semibold text-emerald-400">Upload successful!</p>
            <p className="text-sm text-muted-foreground">245 candidates imported and analyzed</p>
          </motion.div>
        ) : isUploading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <p className="font-semibold text-foreground">Uploading...</p>
            <div className="w-full h-2 bg-card rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
              />
            </div>
            <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</p>
          </motion.div>
        ) : (
          <motion.div className="space-y-2">
            <p className="font-semibold text-foreground">Drag and drop CSV file here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <p className="text-xs text-muted-foreground pt-2">Max file size: 50MB</p>
          </motion.div>
        )}
      </motion.div>

      {/* File input */}
      <input
        type="file"
        accept=".csv"
        onChange={() => startUpload()}
        className="hidden"
        id="csv-upload"
      />

      {!isUploading && !uploadSuccess && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => document.getElementById('csv-upload').click()}
          className="mt-4 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
        >
          Browse Files
        </motion.button>
      )}

      {/* Template download */}
      <div className="mt-6 p-4 rounded-lg bg-card/30 border border-border">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm mb-1">Need a template?</p>
            <p className="text-xs text-muted-foreground mb-2">Download our CSV template to ensure proper formatting</p>
            <motion.a
              whileHover={{ scale: 1.02 }}
              href="#"
              className="inline-block text-sm text-purple-400 hover:text-purple-300 font-semibold"
            >
              Download Template
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
