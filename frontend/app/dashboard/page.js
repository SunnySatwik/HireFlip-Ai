'use client'

import { motion } from 'framer-motion'
import { Sidebar } from '../../components/dashboard/sidebar'
import { TopNavbar } from '../../components/dashboard/top-navbar'
import { MetricsCards } from '../../components/dashboard/metrics-cards'
import { ChartsSection } from '../../components/dashboard/charts-section'
import { CandidateTable } from '../../components/dashboard/candidate-table'
import { UploadSection } from '../../components/dashboard/upload-section'

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
  return (
    <div className="flex h-screen bg-background">
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
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor your hiring fairness metrics in real-time
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <MetricsCards />
            </motion.div>

            <motion.div variants={itemVariants}>
              <ChartsSection />
            </motion.div>

            <motion.div variants={itemVariants}>
              <UploadSection />
            </motion.div>

            <motion.div variants={itemVariants}>
              <CandidateTable />
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  )
}