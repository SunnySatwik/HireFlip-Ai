'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from "next/link"

export function Hero() {
  const scrollToDemo = () => {
    const demoElement = document.getElementById('demo-preview')
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 pt-28 bg-gradient-to-b from-background to-background/50">
      <motion.div
        className="max-w-5xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Main headline */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-pretty">Hiring AI Shouldn&apos;t</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
              Discriminate.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Detect and eliminate bias in your hiring decisions with AI-powered fairness auditing.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link href="/dashboard">
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-8 text-base font-semibold rounded-lg"
          >
            Start Free Audit
          </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToDemo}
            className="border-purple-400/50 text-foreground hover:bg-purple-500/10 h-12 px-8 text-base font-semibold rounded-lg cursor-pointer"
          >
            Watch Demo
          </Button>
        </motion.div>

        {/* Animated visual */}
        <motion.div
          variants={itemVariants}
          className="relative h-80 md:h-96 rounded-2xl overflow-hidden glass-effect"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-emerald-600/10 to-transparent" />
          
          {/* Animated candidate cards */}
          <motion.div
            className="absolute top-8 left-8 bg-card p-4 rounded-lg border border-purple-500/30 shadow-soft w-48"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <div>
                <p className="font-semibold text-sm text-foreground">Sarah Chen</p>
                <p className="text-xs text-muted-foreground">Score: 94%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-12 right-8 bg-card p-4 rounded-lg border border-emerald-500/30 shadow-soft w-48"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          >
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500" />
              <div>
                <p className="font-semibold text-sm text-foreground">Marcus Johnson</p>
                <p className="text-xs text-muted-foreground">Bias: Minimal</p>
              </div>
            </div>
          </motion.div>

          {/* Center metric display */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-center">
              <motion.div
                className="text-6xl md:text-7xl font-bold text-purple-400 mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                42 → 81
              </motion.div>
              <p className="text-muted-foreground">Fairness Score Improvement</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          <p className="mb-4">Trusted by leading companies:</p>
          <div className="flex flex-wrap gap-6 justify-center items-center opacity-60">
            <span className="font-semibold">TechCorp</span>
            <span className="font-semibold">FortuneScale</span>
            <span className="font-semibold">InnovateLabs</span>
            <span className="font-semibold">FutureBuild</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
