'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const demoData = [
  { month: 'Jan', named: 0.68, anonymized: 0.71 },
  { month: 'Feb', named: 0.70, anonymized: 0.74 },
  { month: 'Mar', named: 0.65, anonymized: 0.78 },
  { month: 'Apr', named: 0.72, anonymized: 0.81 },
  { month: 'May', named: 0.71, anonymized: 0.84 },
  { month: 'Jun', named: 0.73, anonymized: 0.86 },
]

function AnimatedValue({ end, duration = 2 }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setValue(Math.floor(end * progress))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return <span ref={ref}>{value}</span>
}

export function DemoPreview() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-pretty">
            See Fairness Improvements in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real results from our platform when applying anonymization and bias detection
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Score improvement */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-6">
              <div>
                <p className="text-muted-foreground text-sm mb-2">FAIRNESS SCORE IMPROVEMENT</p>
                <div className="flex items-end gap-4 mb-4">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-red-400 mb-1">42</div>
                    <p className="text-xs text-muted-foreground">Before Anonymization</p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl font-bold text-foreground"
                  >
                    →
                  </motion.div>
                  <div className="flex-1 text-right">
                    <div className="text-3xl font-bold text-emerald-400 mb-1">81</div>
                    <p className="text-xs text-muted-foreground">After Anonymization</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-card rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  />
                </div>
                <p className="text-xs text-emerald-400 font-semibold">+93% improvement</p>
              </div>

              {/* Stats breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    <AnimatedValue end={95} duration={2} />%
                  </div>
                  <p className="text-xs text-muted-foreground">Gender Fairness</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    <AnimatedValue end={92} duration={2} />%
                  </div>
                  <p className="text-xs text-muted-foreground">Race Fairness</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-xl glass-effect border border-purple-500/20"
          >
            <h3 className="font-semibold mb-6 text-foreground">Acceptance Rate Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f9fafb' }}
                />
                <Line
                  type="monotone"
                  dataKey="named"
                  stroke="#ef4444"
                  name="With Names"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="anonymized"
                  stroke="#10b981"
                  name="Anonymized"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            See how much bias we can eliminate from your hiring process
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30">
            Try the Demo
          </button>
        </motion.div>
      </div>
    </section>
  )
}
