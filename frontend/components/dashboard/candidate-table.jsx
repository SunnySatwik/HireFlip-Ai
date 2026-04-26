'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { candidates } from '@/data/mock-data'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { ExplanationModal } from './explanation-modal'

export function CandidateTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const itemsPerPage = 5
  const totalPages = Math.ceil(candidates.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedCandidates = candidates.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'In Review':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'Rejected':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="p-6 rounded-lg glass-effect border border-purple-500/20"
      >
        <h3 className="font-semibold mb-6 text-foreground">Candidate Evaluation</h3>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Candidate</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Confidence</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Bias Influence</th>
                <th className="text-left py-4 px-4 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="sync">
                {displayedCandidates.map((candidate, index) => (
                  <motion.tr
                    key={candidate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-card/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-foreground">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-card rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${candidate.confidence}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.05 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                          />
                        </div>
                        <span className="text-purple-400 font-semibold">{candidate.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-muted-foreground text-xs">{candidate.genderInfluence}</span>
                    </td>
                    <td className="py-4 px-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCandidate(candidate)}
                        className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors"
                        title="View explanation"
                      >
                        <Info className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, candidates.length)} of {candidates.length}
          </span>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-background/50 text-foreground'
                  }`}
                >
                  {page}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <ExplanationModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
    </>
  )
}
