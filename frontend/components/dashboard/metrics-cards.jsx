'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

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

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const token = localStorage.getItem('hireflip_token')
        const res = await fetch('http://localhost:8000/metrics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch (err) {
        console.error('Failed to load metrics', err)
      }
    }

    loadMetrics()
  }, [])

  if (!metrics) {
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
      value: metrics.fairnessScore || 0,
      unit: '',
      trend: '+0',
      trendPositive: true,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Demographic Parity',
      value: Math.round((metrics.demographicParity || 0) * 100),
      unit: '%',
      trend: 'Audit Target',
      trendPositive: true,
      color: 'from-emerald-500 to-cyan-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Equalized Odds',
      value: Math.round((metrics.equalizedOdds || 0) * 100),
      unit: '%',
      trend: 'Statistical Goal',
      trendPositive: true,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Bias Risk Level',
      value: metrics.biasRiskLevel || 'N/A',
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