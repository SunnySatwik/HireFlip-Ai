'use client'
import Link from "next/link";
import { motion } from 'framer-motion'
import { ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'

import { useRouter, usePathname } from 'next/navigation'

export function TopNavbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview'
    if (pathname.includes('/candidates')) return 'Candidates'
    if (pathname.includes('/reports')) return 'Reports'
    if (pathname.includes('/settings')) return 'Settings'
    return 'Overview'
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('hireflip_token')
        const res = await fetch('http://localhost:8000/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (err) {
        console.error('Failed to fetch user', err)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('hireflip_token')
    localStorage.removeItem('hireflip_user')
    router.push('/login')
  }

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 bg-card/70 backdrop-blur border-b border-border px-6 py-4"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="hover:text-foreground cursor-default transition-colors">Dashboard</span>
          <span className="text-muted-foreground/40 font-light">/</span>
          <span className="text-foreground font-semibold tracking-tight">{getPageTitle()}</span>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <Link href="/" className="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors">
            Back to Site
          </Link>

          {/* User profile */}
          <div className="relative flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {user?.display_name || user?.email?.split('@')[0] || 'Auditor'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {user?.company_name || 'HireFlip AI'}
              </p>
            </div>

            <motion.button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              whileHover={{ scale: 1.05 }}
              className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-500 p-[2px]"
            >
              <div className="w-full h-full rounded-[10px] bg-card overflow-hidden flex items-center justify-center">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-purple-400" />
                )}
              </div>
            </motion.button>


            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-48 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
              >

                <Link href="/dashboard/settings" className="w-full">
                  <button className="w-full flex items-center gap-2 px-4 py-3 hover:bg-background/50 transition-colors text-sm text-foreground">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </Link>
                <div className="border-t border-border" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-500/10 transition-colors text-sm text-red-400"
                >
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
