import { useState, useCallback } from 'react'

interface CandidateNote {
  text: string
  createdAt: number
  updatedAt: number
}

const STORAGE_PREFIX = 'candidate_notes_'

export function useCandidateNotes() {
  const [notes, setNotes] = useState<Record<string, CandidateNote>>(() => {
    if (typeof window === 'undefined') return {}

    const stored: Record<string, CandidateNote> = {}
    const keys = Object.keys(localStorage)

    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const candidateId = key.replace(STORAGE_PREFIX, '')
        try {
          stored[candidateId] = JSON.parse(localStorage.getItem(key) || '{}')
        } catch (e) {
          console.error(`Failed to parse notes for candidate ${candidateId}`, e)
        }
      }
    })

    return stored
  })

  const getNote = useCallback((candidateId: string) => {
    return notes[candidateId]
  }, [notes])

  const hasNote = useCallback((candidateId: string) => {
    return !!notes[candidateId]?.text
  }, [notes])

  const addOrUpdateNote = useCallback((candidateId: string, text: string) => {
    if (typeof window === 'undefined') return

    const now = Date.now()
    const existingNote = notes[candidateId]

    const newNote: CandidateNote = {
      text,
      createdAt: existingNote?.createdAt || now,
      updatedAt: now,
    }

    localStorage.setItem(
      `${STORAGE_PREFIX}${candidateId}`,
      JSON.stringify(newNote)
    )

    setNotes(prev => ({
      ...prev,
      [candidateId]: newNote,
    }))
  }, [notes])

  const deleteNote = useCallback((candidateId: string) => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(`${STORAGE_PREFIX}${candidateId}`)

    setNotes(prev => {
      const updated = { ...prev }
      delete updated[candidateId]
      return updated
    })
  }, [])

  return {
    notes,
    getNote,
    hasNote,
    addOrUpdateNote,
    deleteNote,
  }
}
