'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { ExplanationModal } from './explanation-modal'

export function CandidateTable() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  const itemsPerPage = 5

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const res = await fetch('http://localhost:8000/candidates')
        const data = await res.json()
        console.log(data)

        setCandidates(Array.isArray(data) ? data : data.candidates || [])
      } catch (error) {
        console.error('Failed to load candidates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCandidates()
  }, [])

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border">
        Loading candidates...
      </div>
    )
  }

  const totalPages = Math.ceil(candidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedCandidates = candidates.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-green-500/20 text-green-500'
      case 'In Review':
        return 'bg-yellow-500/20 text-yellow-500'
      case 'Rejected':
        return 'bg-red-500/20 text-red-500'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatGenderInfluence = (influence) => {
    if (!influence && influence !== 0) return '0%'
    return `${influence > 0 ? '+' : ''}${influence.toFixed(1)}%`
  }

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 45) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">
            Candidate Evaluation
          </h3>
          <span className="text-xs text-muted-foreground">
            {candidates.length} candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Candidate</th>
                <th className="text-left py-3 px-4 font-semibold">Score</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Confidence</th>
                <th className="text-left py-3 px-4 font-semibold">Fairness</th>
                <th className="text-center py-3 px-4 font-semibold">Details</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence mode="sync">
                {displayedCandidates.map((candidate, index) => (
                  <motion.tr
                    key={candidate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {candidate.id}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`font-semibold ${getScoreColor(candidate.score)}`}>
                        {candidate.score?.toFixed(1) || 0}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {candidate.status || 'In Review'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                            style={{
                              width: `${candidate.confidence || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-purple-500 font-semibold text-xs">
                          {candidate.confidence?.toFixed(0) || 0}%
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`text-xs font-medium ${
                        (candidate.genderInfluence || 0) > 0
                          ? 'text-emerald-500'
                          : (candidate.genderInfluence || 0) < 0
                          ? 'text-yellow-500'
                          : 'text-muted-foreground'
                      }`}>
                        {formatGenderInfluence(candidate.genderInfluence || 0)}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() =>
                          setSelectedCandidate(candidate)
                        }
                        className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 transition-colors mx-auto block"
                        title="View detailed breakdown"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{' '}
            {Math.min(
              startIndex + itemsPerPage,
              candidates.length
            )}{' '}
            of {candidates.length}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentPage(Math.max(1, currentPage - 1))
              }
              disabled={currentPage === 1}
              className="p-2 rounded-lg border disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(totalPages, currentPage + 1)
                )
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <ExplanationModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </>
  )
}