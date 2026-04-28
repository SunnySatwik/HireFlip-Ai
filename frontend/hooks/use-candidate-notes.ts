import { useState, useCallback } from 'react'

interface CandidateNote {
  text: string
  createdAt: number
  updatedAt: number
}

const BASE_STORAGE_PREFIX = 'candidate_notes_'

export function useCandidateNotes() {
  const getUserId = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('hireflip_user_id')
  }, [])

  const getScopedPrefix = useCallback(() => {
    const userId = getUserId()
    return userId ? `${BASE_STORAGE_PREFIX}${userId}_` : BASE_STORAGE_PREFIX
  }, [getUserId])

  const [notes, setNotes] = useState<Record<string, CandidateNote>>(() => {
    if (typeof window === 'undefined') return {}

    const stored: Record<string, CandidateNote> = {}
    const userId = typeof window !== 'undefined' ? localStorage.getItem('hireflip_user_id') : null
    const scopedPrefix = userId ? `${BASE_STORAGE_PREFIX}${userId}_` : BASE_STORAGE_PREFIX
    
    const keys = Object.keys(localStorage)

    keys.forEach(key => {
      if (key.startsWith(scopedPrefix)) {
        const candidateId = key.replace(scopedPrefix, '')
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

    const scopedPrefix = getScopedPrefix()
    localStorage.setItem(
      `${scopedPrefix}${candidateId}`,
      JSON.stringify(newNote)
    )

    setNotes(prev => ({
      ...prev,
      [candidateId]: newNote,
    }))
  }, [notes, getScopedPrefix])

  const deleteNote = useCallback((candidateId: string) => {
    if (typeof window === 'undefined') return

    const scopedPrefix = getScopedPrefix()
    localStorage.removeItem(`${scopedPrefix}${candidateId}`)

    setNotes(prev => {
      const updated = { ...prev }
      delete updated[candidateId]
      return updated
    })
  }, [getScopedPrefix])

  return {
    notes,
    getNote,
    hasNote,
    addOrUpdateNote,
    deleteNote,
  }
}
