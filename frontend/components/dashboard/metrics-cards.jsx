'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState, useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useCandidateDecisions } from '../../hooks/use-candidate-decisions'

function AnimatedNumber({ end, duration = 1.5 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp

      const progress = Math.min(
        (timestamp - startTime) / (duration * 1000),
        1
      )

      setCount(Math.round(end * progress))

      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return <span ref={ref}>{count}</span>
}

export function MetricsCards() {
  const [metrics, setMetrics] = useState(null)
  const [candidates, setCandidates] = useState([])
  const { decisions, getAppliedStatus } = useCandidateDecisions()
  
  const decisionCount = useMemo(() => Object.keys(decisions).length, [decisions])

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('hireflip_token')
        const headers = { 'Authorization': `Bearer ${token}` }
        const [metRes, candRes] = await Promise.all([
          fetch('http://localhost:8000/metrics', { headers }),
          fetch('http://localhost:8000/candidates', { headers })
        ])
        
        if (metRes.ok && candRes.ok) {
          const metData = await metRes.json()
          const candData = await candRes.json()
          setMetrics(metData)
          setCandidates(Array.isArray(candData) ? candData : candData.candidates || [])
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err)
      }
    }

    loadData()
  }, [])

  const adjustedMetrics = useMemo(() => {
    if (!metrics || !candidates.length) return metrics;
    
    // Calculate total manual interventions that improved candidate status
    const manualImprovements = candidates.filter(c => {
      const applied = getAppliedStatus(c.id, c.status)
      // Improvement if moved to Shortlisted from anything else, or In Review from Rejected
      return (applied === 'Shortlisted' && c.status !== 'Shortlisted') || 
             (applied === 'In Review' && c.status === 'Rejected')
    }).length;

    const boost = manualImprovements * 0.4;
    const percentageBoost = manualImprovements * 0.01;
    
    return {
      ...metrics,
      fairnessScore: Math.min(100, (metrics.fairnessScore || 0) + boost),
      demographicParity: Math.min(1, (metrics.demographicParity || 0) + percentageBoost),
      equalizedOdds: Math.min(1, (metrics.equalizedOdds || 0) + percentageBoost),
      manualImprovements
    };
  }, [metrics, candidates, getAppliedStatus]);

  if (!adjustedMetrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-card/50 border border-border rounded-xl" />
        ))}
      </div>
    )
  }

  const metricsData = [
    {
      label: 'Fairness Score',
      value: adjustedMetrics.fairnessScore || 0,
      unit: '',
      trend: adjustedMetrics.manualImprovements > 0 ? `+${(adjustedMetrics.manualImprovements * 0.4).toFixed(1)}` : '+0',
      trendPositive: true,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Demographic Parity',
      value: Math.round((adjustedMetrics.demographicParity || 0) * 100),
      unit: '%',
      trend: adjustedMetrics.manualImprovements > 0 ? `+${(adjustedMetrics.manualImprovements * 1).toFixed(1)}%` : 'Audit Target',
      trendPositive: true,
      color: 'from-emerald-500 to-cyan-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Equalized Odds',
      value: Math.round((adjustedMetrics.equalizedOdds || 0) * 100),
      unit: '%',
      trend: adjustedMetrics.manualImprovements > 0 ? `+${(adjustedMetrics.manualImprovements * 1).toFixed(1)}%` : 'Statistical Goal',
      trendPositive: true,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Bias Risk Level',
      value: adjustedMetrics.biasRiskLevel || 'N/A',
      unit: '',
      trend: 'Calculated Risk',
      trendPositive: true,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
    },
  ]

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {metricsData.map((metric) => (
        <motion.div
          key={metric.label}
          whileHover={{ y: -5 }}
          className={`p-6 rounded-xl border border-border ${metric.bgColor}`}
        >
          <div className="flex justify-between mb-4">
            <h3 className="text-sm text-muted-foreground">
              {metric.label}
            </h3>

            {metric.trendPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>

          <div
            className={`text-4xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-3`}
          >
            {typeof metric.value === 'string' ? (
              metric.value
            ) : (
              <AnimatedNumber end={metric.value} />
            )}
            {metric.unit}
          </div>

          <div className="text-sm">
            <span className="text-green-500 font-semibold">
              {metric.trend}
            </span>
            <span className="text-muted-foreground text-xs ml-2">
              vs last upload
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}