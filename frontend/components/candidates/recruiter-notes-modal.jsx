'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, Clock } from 'lucide-react'

export function RecruiterNotesModal({
  candidate,
  initialNote,
  onSave,
  onDelete,
  onClose,
}) {
  const [noteText, setNoteText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (initialNote?.text) {
      setNoteText(initialNote.text)
    }
  }, [initialNote])

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      onSave(noteText)
      setIsSaving(false)
      onClose()
    }, 300)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete()
      onClose()
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!candidate) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-background/50">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Recruiter Notes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {candidate.name} (ID: {candidate.id})
              </p>
            </div>
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={onClose}
              className="p-2 hover:bg-background/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Meta Info */}
            {initialNote?.updatedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: {formatDate(initialNote.updatedAt)}</span>
              </div>
            )}

            {/* Text Area */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Notes
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add recruiter notes, observations, or follow-up points here..."
                className="w-full h-48 p-4 rounded-lg border border-border bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {noteText.length} characters
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-border bg-background/50">
            {initialNote?.text && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Note
              </motion.button>
            )}

            <div className="flex-1" />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border hover:bg-background/50 text-foreground font-medium transition-colors"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Note'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
