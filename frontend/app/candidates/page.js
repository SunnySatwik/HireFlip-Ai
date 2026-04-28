'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '../../components/dashboard/sidebar'
import { TopNavbar } from '../../components/dashboard/top-navbar'
import { CandidateTableWithNotes } from '../../components/candidates/candidate-table-with-notes'
import { AuthGuard } from '../../components/auth-guard'

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

export default function CandidatesPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex h-screen bg-background text-foreground">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopNavbar />
            <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </main>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar />

          <motion.main
            className="flex-1 overflow-y-auto p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="max-w-7xl mx-auto space-y-8">
              <motion.div variants={itemVariants}>
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    All Candidates
                  </h1>
                  <p className="text-muted-foreground">
                    Browse and evaluate all candidates with advanced filtering and sorting options
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <CandidateTableWithNotes itemsPerPage={15} />
              </motion.div>
            </div>
          </motion.main>
        </div>
      </div>
    </AuthGuard>
  )
}
