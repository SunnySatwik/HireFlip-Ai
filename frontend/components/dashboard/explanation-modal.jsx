'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertCircle } from 'lucide-react'

export function ExplanationModal({ candidate, onClose }) {
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-96 overflow-y-auto bg-card border border-purple-500/30 rounded-lg p-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">{candidate.name}</h2>
              <p className="text-muted-foreground">ID: {candidate.id}</p>
            </div>
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={onClose}
              className="p-2 hover:bg-background/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Decision Summary</h3>
              <p className="text-muted-foreground leading-relaxed">{candidate.recommendation}</p>
            </div>

            {/* Factor breakdown */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Factor Breakdown</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(candidate.decisionFactors).map(([factor, score]) => (
                  <motion.div
                    key={factor}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg bg-background/50 border border-border"
                  >
                    <p className="text-xs text-muted-foreground capitalize mb-1">
                      {factor.replace(/([A-Z])/g, ' $1')}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                        />
                      </div>
                      <span className="text-sm font-semibold text-purple-400">{score}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bias analysis */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Fairness Analysis</h3>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-400 mb-1">Gender Influence</p>
                    <p className="text-sm text-muted-foreground">{candidate.genderInfluence}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-400 mb-1">Our Recommendation</p>
                  <p className="text-sm text-muted-foreground">{candidate.recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
            >
              Accept
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-background/50 text-foreground font-semibold transition-colors"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
