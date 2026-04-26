'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BarChart3, Zap, Users, FileText, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { icon: BarChart3, label: 'Overview', href: '#', active: true },
  { icon: Zap, label: 'Audits', href: '#', active: false },
  { icon: Users, label: 'Candidates', href: '#', active: false },
  { icon: FileText, label: 'Reports', href: '#', active: false },
  { icon: Settings, label: 'Settings', href: '#', active: false },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-sidebar border-r border-sidebar-border h-screen overflow-y-auto p-6 flex flex-col"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
          HireFlip
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Audit Dashboard</p>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * (index + 1) }}
              whileHover={{ x: 4 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                item.active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/30'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.a>
          )
        })}
      </nav>

      {/* Bottom section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 pt-4 border-t border-sidebar-border"
      >
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors text-sm font-medium">
          <Settings className="w-5 h-5" />
          Support
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:text-red-400 transition-colors text-sm font-medium">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </motion.div>
    </motion.aside>
  )
}
