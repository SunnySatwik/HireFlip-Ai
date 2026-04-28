/**
 * Generates a CSV from candidate data
 */
export function generateCandidateCSV(candidates) {
  if (!candidates || candidates.length === 0) {
    return ''
  }

  // Define CSV headers
  const headers = [
    'Candidate Name',
    'Candidate ID',
    'Evaluation Score',
    'Status',
    'Confidence Level (%)',
    'Fairness Adjustment (%)',
    'Experience (Years)',
    'Qualification',
    'Gender',
    'Caste',
    'Salary Expectation (LPA)',
    'Recruiter Notes',
  ]

  // Get notes from localStorage
  const getNoteForCandidate = (candidateId) => {
    try {
      const noteData = localStorage.getItem(`candidate_notes_${candidateId}`)
      if (noteData) {
        const note = JSON.parse(noteData)
        return note.text || ''
      }
    } catch (e) {
      console.error(`Failed to retrieve notes for ${candidateId}`, e)
    }
    return ''
  }

  // Escape CSV values (handle commas, quotes, and newlines)
  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) return ''

    const stringValue = String(value)

    // If value contains comma, quote, or newline, wrap in quotes and escape inner quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  // Build CSV rows
  const csvRows = [headers.map(escapeCSVValue).join(',')]

  candidates.forEach((candidate) => {
    const row = [
      escapeCSVValue(candidate.name),
      escapeCSVValue(candidate.id),
      escapeCSVValue(candidate.score?.toFixed(1) || '0'),
      escapeCSVValue(candidate.status || 'In Review'),
      escapeCSVValue(candidate.confidence?.toFixed(0) || '0'),
      escapeCSVValue((candidate.genderInfluence || 0).toFixed(1)),
      escapeCSVValue(candidate.experience?.toFixed(1) || '0'),
      escapeCSVValue(candidate.qualification || 'N/A'),
      escapeCSVValue(candidate.gender || 'Not specified'),
      escapeCSVValue(candidate.caste || 'General'),
      escapeCSVValue(candidate.salary_expectation || '0'),
      escapeCSVValue(getNoteForCandidate(candidate.id)),
    ]

    csvRows.push(row.map(escapeCSVValue).join(','))
  })

  return csvRows.join('\n')
}

/**
 * Downloads a CSV file
 */
export function downloadCSV(csvContent, filename = 'candidates.csv') {
  if (!csvContent) {
    console.warn('No CSV content to download')
    return
  }

  // Create blob from CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create a temporary URL for the blob
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  // Set link attributes and trigger download
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL
  URL.revokeObjectURL(url)
}
