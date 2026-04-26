'use client'
import Link from "next/link";
import { motion } from 'framer-motion'
import { ChevronDown, Bell, Search } from 'lucide-react'
import { currentUser, organizations } from '@/data/mock-data'
import { useState } from 'react'

export function TopNavbar() {
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false)
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
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border hover:border-purple-500/30 transition-colors">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-32"
            />
          </div>
        <Link href="/" className="px-3 py-2 rounded-lg border">
          Home
        </Link>
          {/* Notification bell */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg hover:bg-background/50 transition-colors"
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>

          {/* Organization selector */}
          <div className="relative">
            <motion.button
              onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background/50 transition-colors text-sm font-medium text-foreground"
            >
              {organizations[0].name}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.button>

            {isOrgMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
              >
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => setIsOrgMenuOpen(false)}
                    className="w-full text-left px-4 py-3 hover:bg-background/50 transition-colors text-sm text-foreground"
                  >
                    {org.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* User profile */}
          <div className="relative flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
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
                className="absolute right-0 mt-48 w-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
              >
                <button className="w-full text-left px-4 py-2 hover:bg-background/50 transition-colors text-sm text-foreground">
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-background/50 transition-colors text-sm text-foreground">
                  Settings
                </button>
                <div className="border-t border-border" />
                <button className="w-full text-left px-4 py-2 hover:bg-red-500/10 transition-colors text-sm text-red-400">
                  Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
