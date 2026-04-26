'use client'

import { motion } from 'framer-motion'
import { howItWorks } from '@/data/mock-data'
import {
  ArrowRight,
  Database,
  Brain,
  BarChart3,
  CheckCircle,
} from 'lucide-react'

export function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const icons = [Database, Brain, BarChart3, CheckCircle]

  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      {/* background glow */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 blur-3xl rounded-full" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-5"
          >
            How HireFlip Works
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            A simple, transparent workflow to detect, explain, and remove
            hiring bias in minutes.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8"
        >
          {howItWorks.map((step, index) => {
            const Icon = icons[index]

            return (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="relative group"
              >
                {/* Connector line desktop */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden xl:block absolute top-16 -right-5 z-20">
                    <ArrowRight className="w-5 h-5 text-purple-400/50" />
                  </div>
                )}

                {/* Card */}
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-7 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-purple-400/50 group-hover:shadow-2xl group-hover:shadow-purple-500/10">
                  {/* Number */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-emerald-500 text-white flex items-center justify-center font-bold text-sm mb-6 shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                    <Icon className="w-7 h-7 text-purple-400" />
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-20"
        >
          <p className="text-muted-foreground mb-5 text-lg">
            Ready to build a fairer hiring process?
          </p>

          <button className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-emerald-500 hover:scale-105 transition-all duration-300 shadow-xl shadow-purple-500/20">
            Get Started Free
          </button>
        </motion.div>
      </div>
    </section>
  )
}