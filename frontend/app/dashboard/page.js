'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '../../components/dashboard/sidebar'
import { TopNavbar } from '../../components/dashboard/top-navbar'
import { MetricsCards } from '../../components/dashboard/metrics-cards'
import { ChartsSection } from '../../components/dashboard/charts-section'
import { CandidateTable } from '../../components/dashboard/candidate-table'
import { BiasImprovementPanel } from '../../components/dashboard/bias-improvement-panel'
import { UploadSection } from '../../components/dashboard/upload-section'
import { BlindHiringStatus } from '../../components/dashboard/blind-hiring-status'
import { AuthGuard } from '../../components/auth-guard'
import { FileUp, Search } from 'lucide-react'
import { useCandidateDecisions } from '../../hooks/use-candidate-decisions'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [hasData, setHasData] = useState(true)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [candidates, setCandidates] = useState([])
  const { decisions, getAppliedStatus } = useCandidateDecisions()

  const loadDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('hireflip_token')
      const headers = { 'Authorization': `Bearer ${token}` }
      
      const [metRes, candRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/metrics`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/candidates`, { headers })
      ])
      
      if (metRes.status === 404) {
        setHasData(false)
        setLoading(false)
        return
      }

      if (metRes.ok && candRes.ok) {
        const metData = await metRes.json()
        const candData = await candRes.json()
        setMetrics(metData)
        setCandidates(Array.isArray(candData) ? candData : candData.candidates || [])
        setHasData(true)
      }
    } catch (err) {
      console.error('Dashboard data load failed', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData, refreshKey])

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    window.addEventListener('candidate-decision-updated', handleRefresh)
    return () => window.removeEventListener('candidate-decision-updated', handleRefresh)
  }, [handleRefresh])

  const adjustedMetrics = useMemo(() => {
    if (!metrics || !candidates.length) return metrics;
    
    // Calculate total manual interventions that improved candidate status
    const manualImprovements = candidates.filter(c => {
      const applied = getAppliedStatus(c.id, c.status)
      return (applied === 'Shortlisted' && c.status !== 'Shortlisted') || 
             (applied === 'In Review' && c.status === 'Rejected')
    }).length;

    const boost = manualImprovements * 0.4;
    const percentageBoost = manualImprovements * 0.01;
    
    const currentFairness = Math.min(100, (metrics.fairnessScore || metrics.fairness_score || 0) + boost);
    const currentDP = Math.min(1, (metrics.demographicParity || metrics.demographic_parity || 0) + percentageBoost);
    const currentEO = Math.min(1, (metrics.equalizedOdds || metrics.equalized_odds || 0) + percentageBoost);
    
    // Robust risk label resolution
    let riskLabel = metrics.bias_risk || metrics.biasRisk || metrics.risk_level || metrics.bias_risk_level;
    if (!riskLabel || riskLabel === 'N/A') {
      if (currentFairness >= 75) riskLabel = 'Low';
      else if (currentFairness >= 55) riskLabel = 'Moderate';
      else riskLabel = 'High';
    }

    return {
      ...metrics,
      fairnessScore: currentFairness,
      demographicParity: currentDP,
      equalizedOdds: currentEO,
      biasRisk: riskLabel,
      manualImprovements
    };
  }, [metrics, candidates, getAppliedStatus]);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar />

          <motion.main
            className="flex-1 overflow-y-auto p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="max-w-7xl mx-auto space-y-6">
              <motion.div variants={itemVariants} className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Monitor your hiring fairness metrics in real-time
                  </p>
                </div>
              </motion.div>

              {!loading && !hasData ? (
                <motion.div 
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center py-20 bg-card/50 border border-dashed border-border rounded-2xl"
                >
                  <div className="p-4 rounded-full bg-purple-500/10 mb-4">
                    <FileUp className="w-8 h-8 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No data analyzed yet</h2>
                  <p className="text-muted-foreground text-center max-w-sm mb-8">
                    Upload a CSV to begin fairness analysis and unlock your hiring insights.
                  </p>
                  <div className="w-full max-w-md px-6">
                    <UploadSection onUploadSuccess={handleRefresh} />
                  </div>
                </motion.div>
              ) : (
                <>
                  <motion.div variants={itemVariants}>
                    <MetricsCards metrics={adjustedMetrics} loading={loading} />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <BiasImprovementPanel metrics={adjustedMetrics} loading={loading} />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <ChartsSection key={`charts-${refreshKey}`} />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <BlindHiringStatus key={`blind-${refreshKey}`} />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <UploadSection onUploadSuccess={handleRefresh} />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <CandidateTable key={`table-${refreshKey}`} />
                  </motion.div>
                </>
              )}
            </div>
          </motion.main>
        </div>
      </div>
    </AuthGuard>
  )
}
