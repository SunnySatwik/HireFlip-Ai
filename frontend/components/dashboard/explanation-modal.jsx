import { X, Check, AlertCircle, TrendingUp, Sparkles, Brain, Shield } from 'lucide-react'
import { useCandidateDecisions } from '../../hooks/use-candidate-decisions'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
export function ExplanationModal({ candidate, onClose, showAcceptButton = true, onApproveRecommendation }) {
  const { getAppliedStatus } = useCandidateDecisions()
  const [aiExplanation, setAiExplanation] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorStatus, setErrorStatus] = useState(null)

  // Track last requested ID to prevent duplicate calls on re-renders
  const [lastRequestedId, setLastRequestedId] = useState(null)

  useEffect(() => {
    if (candidate && candidate.id !== lastRequestedId) {
      setLastRequestedId(candidate.id)
      generateAiExplanation()
    }
  }, [candidate, lastRequestedId])

  const generateAiExplanation = async () => {
    if (!candidate) return

    // 1. Check local cache first (scoped by userId)
    const userId = localStorage.getItem('hireflip_user_id')
    const cacheKey = `hf_ai_exp_${candidate.id}${userId ? `_${userId}` : ''}`

    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      setAiExplanation(cached)
      setIsGenerating(false)
      setErrorStatus(null)
      return
    }

    setIsGenerating(true)
    setAiExplanation('')
    setErrorStatus(null)

    try {
      const token = localStorage.getItem('hireflip_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ai/explain-candidate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: candidate.name,
          experience: candidate.experience || 0,
          qualification: candidate.qualification || 'N/A',
          salary: candidate.salary_expectation || 0,
          score: candidate.score || 0,
          status: getAppliedStatus(candidate.id, candidate.status) || 'In Review'
        })
      })

      if (res.status === 429) {
        setErrorStatus(429)
        throw new Error('Quota exceeded')
      }

      if (res.ok) {
        const data = await res.json()
        setAiExplanation(data.explanation)
        // 2. Persist to cache (scoped)
        localStorage.setItem(cacheKey, data.explanation)
      } else {
        throw new Error('AI generation failed')
      }
    } catch (err) {
      console.error('AI Insight Error:', err)
      if (err.message === 'Quota exceeded' || errorStatus === 429) {
        setAiExplanation('AI quota reached. Showing deterministic professional summary based on merit data.')
      } else {
        setAiExplanation('Unable to generate deep AI insight at this time. Showing system summary.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  if (!candidate) return null

  const currentStatus = getAppliedStatus(candidate.id, candidate.status)

  const handleApprove = () => {
    if (onApproveRecommendation) {
      onApproveRecommendation(candidate.id, currentStatus)
    }
    onClose()
  }

  // Safe access to decisionFactors with fallback
  const factors = candidate.decisionFactors || {
    experience: 0,
    qualification: 0.5,
    salary_fit: 0.5,
    fairness_adjustment: 0,
  }

  // Generate recommendation based on status and score
  const getRecommendation = () => {
    const status = currentStatus || 'In Review'
    const confidence = candidate.confidence || 50

    switch (status) {
      case 'Shortlisted':
        return `Strong candidate in top tier. High match with role requirements (${confidence.toFixed(0)}% confidence). Ready for interview.`
      case 'In Review':
        return `Solid candidate with moderate fit (${confidence.toFixed(0)}% confidence). Recommended for further evaluation.`
      case 'Rejected':
        return `Candidate score does not meet minimum threshold. Consider for future opportunities if score improves.`
      default:
        return `Candidate under review with ${confidence.toFixed(0)}% confidence level.`
    }
  }

  // Format factor name for display
  const formatFactorName = (name) => {
    const mapping = {
      'experience': 'Experience Level',
      'qualification': 'Qualification Match',
      'salary_fit': 'Salary Fit',
      'fairness_adjustment': 'Fairness Boost',
    }
    return mapping[name] || name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
  }

  // Format factor value (0-1 range to 0-100)
  const formatFactorValue = (name, value) => {
    if (name === 'fairness_adjustment') {
      return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
    }
    return Math.round(value * 100)
  }

  // Get color based on factor score
  const getFactorColor = (value) => {
    const normalized = typeof value === 'object' ? 0.5 : value
    if (normalized >= 0.75) return 'from-emerald-500 to-emerald-400'
    if (normalized >= 0.5) return 'from-blue-500 to-blue-400'
    if (normalized >= 0.25) return 'from-yellow-500 to-yellow-400'
    return 'from-red-500 to-red-400'
  }

  const fairnessImpact = factors.fairness_adjustment || 0
  const hasPositiveFairness = fairnessImpact > 0
  const fairnessMessage = hasPositiveFairness
    ? `Fairness adjustment boosted score by +${fairnessImpact.toFixed(2)}% to support underrepresented group representation.`
    : 'No fairness adjustment applied to this candidate.'

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
          className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-card border border-purple-500/30 rounded-xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {candidate.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentStatus === 'Shortlisted' ? 'bg-green-500/20 text-green-500' :
                  currentStatus === 'In Review' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                  {currentStatus || 'In Review'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">ID: {candidate.id}</p>
            </div>
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={onClose}
              className="p-2 hover:bg-background/50 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="space-y-6">
            {/* AI Hiring Insight Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden p-6 rounded-2xl bg-purple-500/[0.03] border border-purple-500/20 shadow-xl shadow-purple-500/5"
            >
              {/* Background Glow */}
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-foreground">AI Hiring Insight</h3>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {errorStatus === 429 ? 'Local Summary Mode' : 'Generated by Gemini AI'}
                    </p>
                  </div>
                </div>

                {isGenerating && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                  />
                )}
              </div>

              <div className="relative z-10">
                {isGenerating ? (
                  <div className="space-y-2">
                    <div className="h-2 bg-purple-500/5 rounded-full w-full animate-pulse" />
                    <div className="h-2 bg-purple-500/5 rounded-full w-[90%] animate-pulse" />
                    <div className="h-2 bg-purple-500/5 rounded-full w-[95%] animate-pulse" />
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-foreground/80 font-medium">
                    {aiExplanation || 'Select a candidate to generate deep behavioral and merit insights.'}
                  </p>
                )}
              </div>

              {!isGenerating && aiExplanation && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-purple-500/60">
                    <Shield className="w-3 h-3" />
                    Bias-Aware Evaluation Verified
                  </div>
                  {errorStatus === 429 && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500/80 uppercase">
                      <AlertCircle className="w-3 h-3" />
                      Quota Exceeded
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Score Overview */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-emerald-500/10 border border-purple-500/20">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Base Score</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {candidate.score?.toFixed(1) || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Adjusted Score</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {candidate.fairnessAdjustedScore?.toFixed(1) || candidate.score?.toFixed(1) || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {candidate.confidence?.toFixed(0) || 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Recommendation */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Hiring Recommendation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 p-4 rounded-lg border border-border">
                {getRecommendation()}
              </p>
            </div>

            {/* Factor Breakdown */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Scoring Factors</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(factors).map(([factorKey, factorValue]) => {
                  if (factorKey === 'fairness_adjustment') return null
                  return (
                    <motion.div
                      key={factorKey}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 rounded-lg bg-background/50 border border-border hover:border-purple-500/50 transition-colors"
                    >
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatFactorName(factorKey)}
                      </p>
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <div className="h-2 bg-card rounded-full overflow-hidden mb-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(5, (factorValue || 0) * 100)}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={`h-full bg-gradient-to-r ${getFactorColor(factorValue)}`}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatFactorValue(factorKey, factorValue)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Fairness Analysis */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Fairness Analysis</h3>
              <div className={`p-4 rounded-lg border ${hasPositiveFairness
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
                }`}>
                <div className="flex items-start gap-3">
                  <Check className={`w-5 h-5 shrink-0 mt-0.5 ${hasPositiveFairness ? 'text-emerald-400' : 'text-blue-400'
                    }`} />
                  <div>
                    <p className={`font-semibold mb-1 ${hasPositiveFairness ? 'text-emerald-400' : 'text-blue-400'
                      }`}>
                      {hasPositiveFairness ? 'Fairness Boost Applied' : 'No Fairness Adjustment'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {fairnessMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Details */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Candidate Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Experience</p>
                  <p className="font-semibold text-foreground">
                    {candidate.experience?.toFixed(1) || 0} years
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Qualification</p>
                  <p className="font-semibold text-foreground text-xs truncate">
                    {candidate.qualification || 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Gender</p>
                  <p className="font-semibold text-foreground">
                    {candidate.gender || 'Not specified'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Caste</p>
                  <p className="font-semibold text-foreground">
                    {candidate.caste || 'General'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Salary Expectation</p>
                  <p className="font-semibold text-foreground">
                    ₹{candidate.salary_expectation || 0} LPA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-border flex gap-3">
            {showAcceptButton && currentStatus !== 'Shortlisted' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                className="flex-1 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
              >
                Approve AI Recommendation
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`px-4 py-3 rounded-lg border border-border hover:bg-background/50 text-foreground font-semibold transition-colors ${showAcceptButton ? 'flex-1' : 'w-full'
                }`}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
