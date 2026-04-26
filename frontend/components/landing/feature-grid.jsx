'use client'

import { motion } from 'framer-motion'
import { features } from '@/data/mock-data'
import { Users, Brain, BarChart3, Shield, Zap, Lock } from 'lucide-react'

const iconMap = {
  Users,
  Brain,
  BarChart3,
  Shield,
  Zap,
  Lock,
}

export function FeatureGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

  const iconList = [Users, Brain, BarChart3, Shield, Zap, Lock]

  return (
    <section className="py-20 px-4 bg-card/30">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-4 text-pretty"
          >
            Comprehensive Fairness Audit
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            All the tools you need to create an equitable hiring process
          </motion.p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const IconComponent = iconList[index]
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className="h-full p-6 rounded-xl glass-effect border border-purple-500/20 group-hover:border-purple-500/50 transition-all duration-300 hover-glow">
                  {/* Icon */}
                  <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-emerald-500/10 group-hover:from-purple-500/30 group-hover:to-emerald-500/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-purple-400" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>

                  {/* Hover indicator */}
                  <div className="mt-4 inline-flex items-center gap-2 text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
