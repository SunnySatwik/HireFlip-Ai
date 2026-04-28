'use client'
import Link from "next/link";
import { motion } from 'framer-motion'
import { ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { currentUser } from '@/data/mock-data'
import { useState } from 'react'

export function TopNavbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-card/70 backdrop-blur border-b border-border px-6 py-4"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground">
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Overview</span>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <Link href="/" className="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors">
            Back to Site
          </Link>

          {/* User profile */}
          <div className="relative flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.role}</p>
            </div>

            <motion.button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border-2 border-purple-500/30 hover:border-purple-500 transition-colors"
              />
            </motion.button>

            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-48 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
              >
                <button className="w-full flex items-center gap-2 px-4 py-3 hover:bg-background/50 transition-colors text-sm text-foreground">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-3 hover:bg-background/50 transition-colors text-sm text-foreground">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="border-t border-border" />
                <button className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-500/10 transition-colors text-sm text-red-400">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
