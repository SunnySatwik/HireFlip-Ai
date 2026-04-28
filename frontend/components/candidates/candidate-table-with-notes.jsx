'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Info, Search, ArrowUpDown, X, FileText, Download } from 'lucide-react'
import { ExplanationModal } from '../dashboard/explanation-modal'
import { RecruiterNotesModal } from './recruiter-notes-modal'
import { useCandidateNotes } from '../../hooks/use-candidate-notes'
import { useCandidateDecisions } from '../../hooks/use-candidate-decisions'
import { useToast } from '../../hooks/use-toast'
import { generateCandidateCSV, downloadCSV } from '../../utils/csv-export'

export function CandidateTableWithNotes({ itemsPerPage = 15 } = {}) {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [notesCandidateId, setNotesCandidateId] = useState(null)

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [sortOrder, setSortOrder] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('all')

  // Notes management
  const { notes, getNote, hasNote, addOrUpdateNote, deleteNote } = useCandidateNotes()

  // Decisions management
  const { approveRecommendation, getAppliedStatus } = useCandidateDecisions()

  // Toast notifications
  const { toast } = useToast()

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const token = localStorage.getItem('hireflip_token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/candidates`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          const rawCandidates = Array.isArray(data) ? data : data.candidates || []
          
          // Apply stored decisions to loaded candidates
          const candidatesWithDecisions = rawCandidates.map(c => ({
            ...c,
            status: getAppliedStatus(c.id, c.status)
          }))
          
          setCandidates(candidatesWithDecisions)
        }
      } catch (error) {
        console.error('Failed to load candidates:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCandidates()
  }, [])

  // Filter and sort logic
  const filteredAndSortedCandidates = useMemo(() => {
    let result = [...candidates]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(c => getAppliedStatus(c.id, c.status) === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal

      switch (sortBy) {
        case 'score':
          aVal = a.score || 0
          bVal = b.score || 0
          break
        case 'confidence':
          aVal = a.confidence || 0
          bVal = b.confidence || 0
          break
        case 'fairness':
          aVal = Math.abs(a.genderInfluence || 0)
          bVal = Math.abs(b.genderInfluence || 0)
          break
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'status':
          aVal = getAppliedStatus(a.id, a.status)
          bVal = getAppliedStatus(b.id, b.status)
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [candidates, searchQuery, sortBy, sortOrder, statusFilter, getAppliedStatus])

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border">
        Loading candidates...
      </div>
    )
  }

  const totalPages = Math.ceil(filteredAndSortedCandidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedCandidates = filteredAndSortedCandidates.slice(
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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('score')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const csv = generateCandidateCSV(filteredAndSortedCandidates)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadCSV(csv, `candidates_${timestamp}.csv`)
  }

  const handleApproveRecommendation = (candidateId, currentStatus) => {
    let nextStatus = currentStatus
    
    if (currentStatus === 'In Review') {
      nextStatus = 'Shortlisted'
    } else if (currentStatus === 'Rejected') {
      nextStatus = 'In Review'
    } else {
      // Already Shortlisted or unknown, do nothing as requested
      return 
    }

    approveRecommendation(candidateId, nextStatus)

    // Update local state to reflect the change immediately
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, status: nextStatus } : c
    ))

    // Show success toast
    toast({
      title: 'AI Recommendation Approved',
      description: `Candidate status updated to "${nextStatus}"`,
      variant: 'default',
    })
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl border border-border bg-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">Candidate Evaluation</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredAndSortedCandidates.length} of {candidates.length} candidates
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportCSV}
              disabled={filteredAndSortedCandidates.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-500 text-xs font-medium transition-colors"
              title="Export filtered candidates to CSV"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </motion.button>
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 text-xs font-medium transition-colors"
              >
                <X className="w-3 h-3" />
                Reset Filters
              </motion.button>
            )}
          </div>
        </div>

        {/* Controls: Search, Sort, Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <motion.div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </motion.div>

          {/* Sort */}
          <motion.select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setSortOrder('desc')
              setCurrentPage(1)
            }}
            className="px-4 py-2 rounded-lg border border-border bg-background/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer"
          >
            <option value="score">Sort: Evaluation Score</option>
            <option value="confidence">Sort: Confidence Level</option>
            <option value="fairness">Sort: Fairness Adjustment</option>
            <option value="name">Sort: Name (A-Z)</option>
          </motion.select>

          {/* Status Filter */}
          <motion.div className="flex gap-2">
            {['all', 'Shortlisted', 'In Review', 'Rejected'].map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStatusFilter(status)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-background/50 border border-border hover:border-purple-500/50 text-muted-foreground'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Candidate</th>

                <th
                  onClick={() => toggleSort('score')}
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-purple-500 transition-colors group"
                  title="Click to sort"
                >
                  <div className="flex items-center gap-2">
                    <span>Eval. Score</span>
                    {sortBy === 'score' && (
                      <ArrowUpDown className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                  <p className="text-xs font-normal text-muted-foreground group-hover:text-muted-foreground">0-100 scale</p>
                </th>

                <th className="text-left py-3 px-4 font-semibold">Status</th>

                <th
                  onClick={() => toggleSort('confidence')}
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-purple-500 transition-colors group"
                  title="Click to sort"
                >
                  <div className="flex items-center gap-2">
                    <span>Confidence</span>
                    {sortBy === 'confidence' && (
                      <ArrowUpDown className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                  <p className="text-xs font-normal text-muted-foreground group-hover:text-muted-foreground">Viability %</p>
                </th>

                <th
                  onClick={() => toggleSort('fairness')}
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:text-purple-500 transition-colors group"
                  title="Click to sort"
                >
                  <div className="flex items-center gap-2">
                    <span>Fairness Adj.</span>
                    {sortBy === 'fairness' && (
                      <ArrowUpDown className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                  <p className="text-xs font-normal text-muted-foreground group-hover:text-muted-foreground">Impact %</p>
                </th>

                <th className="text-left py-3 px-4 font-semibold">Recruiter Notes</th>

                <th className="text-center py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence mode="sync">
                {displayedCandidates.length > 0 ? (
                  displayedCandidates.map((candidate, index) => (
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
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-lg ${getScoreColor(candidate.score)}`}>
                            {candidate.score?.toFixed(1) || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            getAppliedStatus(candidate.id, candidate.status)
                          )}`}
                        >
                          {getAppliedStatus(candidate.id, candidate.status) || 'In Review'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${candidate.confidence || 0}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                            />
                          </div>
                          <span className="text-purple-500 font-semibold text-xs w-6 text-right">
                            {candidate.confidence?.toFixed(0) || 0}%
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              (candidate.genderInfluence || 0) > 0
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : (candidate.genderInfluence || 0) < 0
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {formatGenderInfluence(candidate.genderInfluence || 0)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setNotesCandidateId(candidate.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            hasNote(candidate.id)
                              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-500'
                              : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                          }`}
                          title={hasNote(candidate.id) ? 'Edit note' : 'Add note'}
                        >
                          <FileText className="w-4 h-4" />
                        </motion.button>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCandidate(candidate)}
                          className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 transition-colors mx-auto block"
                          title="View detailed breakdown"
                        >
                          <Info className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 px-4 text-center text-muted-foreground">
                      No candidates match your filters
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Showing {displayedCandidates.length > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(
              startIndex + itemsPerPage,
              filteredAndSortedCandidates.length
            )}{' '}
            of {filteredAndSortedCandidates.length}
          </span>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setCurrentPage(Math.max(1, currentPage - 1))
              }
              disabled={currentPage === 1}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-border bg-background/50">
              <span className="text-xs font-medium text-muted-foreground">
                {currentPage} / {Math.max(1, totalPages)}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setCurrentPage(
                  Math.min(totalPages, currentPage + 1)
                )
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <ExplanationModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onApproveRecommendation={handleApproveRecommendation}
      />

      {notesCandidateId && (
        <RecruiterNotesModal
          candidate={displayedCandidates.find(c => c.id === notesCandidateId) ||
                    filteredAndSortedCandidates.find(c => c.id === notesCandidateId)}
          initialNote={getNote(notesCandidateId)}
          onSave={(noteText) => addOrUpdateNote(notesCandidateId, noteText)}
          onDelete={() => deleteNote(notesCandidateId)}
          onClose={() => setNotesCandidateId(null)}
        />
      )}
    </>
  )
}
