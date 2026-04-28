import { useState, useCallback, useEffect } from 'react'

interface CandidateDecision {
  candidateId: string
  status: string
  approvedAt: number
}

const STORAGE_KEY = 'candidate_decisions'

export function useCandidateDecisions() {
  const [decisions, setDecisions] = useState<Record<string, CandidateDecision>>(() => {
    if (typeof window === 'undefined') return {}

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return {}
      
      const parsed = JSON.parse(stored)
      
      // Normalize data: ensure all entries are full CandidateDecision objects
      const normalized: Record<string, CandidateDecision> = {}
      Object.entries(parsed).forEach(([id, value]) => {
        if (typeof value === 'string') {
          normalized[id] = {
            candidateId: id,
            status: value,
            approvedAt: Date.now() // Fallback for legacy data
          }
        } else {
          normalized[id] = value as CandidateDecision
        }
      })
      return normalized
    } catch (e) {
      console.error('Failed to parse decisions from localStorage', e)
      return {}
    }
  })

  // Sync state across all hook instances and tabs
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        setDecisions(stored ? JSON.parse(stored) : {})
      } catch (e) {
        console.error('Failed to sync decisions', e)
      }
    }

    window.addEventListener('candidate-decision-updated', handleUpdate)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) handleUpdate()
    })

    return () => {
      window.removeEventListener('candidate-decision-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const getDecision = useCallback((candidateId: string) => {
    return decisions[candidateId]
  }, [decisions])

  const hasDecision = useCallback((candidateId: string) => {
    return !!decisions[candidateId]
  }, [decisions])

  const approveRecommendation = useCallback((candidateId: string, status: string) => {
    if (typeof window === 'undefined') return

    const decision: CandidateDecision = {
      candidateId,
      status,
      approvedAt: Date.now(),
    }

    // Get fresh data from localStorage to avoid race conditions with other instances
    let currentDecisions = {}
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      currentDecisions = stored ? JSON.parse(stored) : {}
    } catch (e) {
      console.error('Failed to read decisions during update', e)
    }

    const updated = {
      ...currentDecisions,
      [candidateId]: decision,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setDecisions(updated)

    // Trigger a custom event to notify other instances in this tab
    window.dispatchEvent(
      new CustomEvent('candidate-decision-updated', {
        detail: { candidateId, status },
      })
    )
  }, [])

  const removeDecision = useCallback((candidateId: string) => {
    if (typeof window === 'undefined') return

    let currentDecisions = {}
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      currentDecisions = stored ? JSON.parse(stored) : {}
    } catch (e) {
      console.error('Failed to read decisions during remove', e)
    }

    const updated = { ...currentDecisions }
    delete updated[candidateId]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setDecisions(updated)
    
    window.dispatchEvent(new CustomEvent('candidate-decision-updated'))
  }, [])

  const getAppliedStatus = useCallback((candidateId: string, originalStatus: string) => {
    const decision = decisions[candidateId]
    return decision ? decision.status : originalStatus
  }, [decisions])

  return {
    decisions,
    getDecision,
    hasDecision,
    approveRecommendation,
    removeDecision,
    getAppliedStatus,
  }
}
