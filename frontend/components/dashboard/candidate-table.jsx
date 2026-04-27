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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl border border-border bg-card"
      >
        <h3 className="font-semibold mb-6">
          Candidate Evaluation
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Candidate</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Confidence</th>
                <th className="text-left py-3 px-4">Bias Influence</th>
                <th className="text-left py-3 px-4">Action</th>
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
                    className="border-b border-border hover:bg-muted/30"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {candidate.id}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {candidate.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                            style={{
                              width: `${candidate.confidence}%`,
                            }}
                          />
                        </div>

                        <span className="text-purple-500 font-semibold">
                          {candidate.confidence}%
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {candidate.genderInfluence || 'Low'}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() =>
                          setSelectedCandidate(candidate)
                        }
                        className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-500"
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