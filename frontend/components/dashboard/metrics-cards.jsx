'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { metrics } from '@/data/mock-data'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

function AnimatedNumber({ end, duration = 1.5 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.round(end * progress))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return <span ref={ref}>{count}</span>
}

const metricsData = [
  {
    label: 'Fairness Score',
    value: metrics.fairnessScore,
    unit: '',
    trend: `+${metrics.fairnessScore - metrics.fairnessScorePrev}`,
    trendPositive: true,
    icon: 'trend-up',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    label: 'Demographic Parity',
    value: (metrics.demographicParity * 100).toFixed(0),
    unit: '%',
    trend: metrics.demographicParityStatus,
    trendPositive: true,
    icon: 'users',
    color: 'from-emerald-500 to-cyan-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    label: 'Equalized Odds',
    value: (metrics.equalizedOdds * 100).toFixed(0),
    unit: '%',
    trend: metrics.equalizedOddsStatus,
    trendPositive: true,
    icon: 'check',
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    label: 'Bias Risk Level',
    value: metrics.biasRiskLevel,
    unit: '',
    trend: 'Trending Down',
    trendPositive: true,
    icon: 'alert',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
  },
]

export function MetricsCards() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {metricsData.map((metric, index) => (
        <motion.div
          key={metric.label}
          variants={itemVariants}
          whileHover={{ y: -6, transition: { duration: 0.3 } }}
        >
          <div className={`p-6 rounded-lg glass-effect border border-purple-500/20 hover:border-purple-500/40 transition-all ${metric.bgColor}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{metric.label}</h3>
              {metric.trendPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>

            {/* Main value */}
            <div className="mb-4">
              <div className={`text-4xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                {typeof metric.value === 'string' ? (
                  metric.value
                ) : (
                  <AnimatedNumber end={metric.value} />
                )}
                {metric.unit}
              </div>
            </div>

            {/* Trend info */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-400 font-semibold">{metric.trend}</span>
              <span className="text-muted-foreground text-xs">vs last month</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
