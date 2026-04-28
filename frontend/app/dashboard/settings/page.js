'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '../../../components/dashboard/sidebar'
import { TopNavbar } from '../../../components/dashboard/top-navbar'
import { AuthGuard } from '../../../components/auth-guard'
import { User, Building, Mail, Lock, Check, ShieldCheck, Camera } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passSaving, setPassSaving] = useState(false)

  const [profileData, setProfileData] = useState({
    display_name: '',
    company_name: '',
    avatar_url: '',
    theme: 'dark'
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('hireflip_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setProfileData({
          display_name: data.display_name || '',
          company_name: data.company_name || '',
          avatar_url: data.avatar_url || '',
          theme: data.theme || 'dark'
        })
      }
    } catch (err) {
      console.error('Failed to fetch user', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('hireflip_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      if (res.ok) {
        toast.success('Profile updated successfully')
        fetchUserData()
      } else {
        const data = await res.json()
        toast.error(data.detail || 'Update failed')
      }
    } catch (err) {
      toast.error('Connection failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    setPassSaving(true)
    try {
      const token = localStorage.getItem('hireflip_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      })

      if (res.ok) {
        toast.success('Password changed successfully')
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      } else {
        const data = await res.json()
        toast.error(data.detail || 'Password update failed')
      }
    } catch (err) {
      toast.error('Connection failed')
    } finally {
      setPassSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                <p className="text-muted-foreground">Manage your profile and security preferences</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-2 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-card border border-border"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <User className="w-5 h-5 text-purple-400" />
                      <h2 className="text-xl font-semibold">Personal Information</h2>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-6 mb-6 items-center">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-full border-2 border-purple-500/30 overflow-hidden bg-background flex items-center justify-center">
                            {profileData.avatar_url ? (
                              <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-10 h-10 text-muted-foreground" />
                            )}
                          </div>
                          <button type="button" className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                            <input
                              type="text"
                              value={profileData.display_name}
                              onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                              placeholder="Your full name"
                              className="w-full bg-background border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Building className="w-3.5 h-3.5" /> Company Name
                          </label>
                          <input
                            type="text"
                            value={profileData.company_name}
                            onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2 opacity-60">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Email Address
                          </label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            readOnly
                            className="w-full bg-muted border border-border rounded-xl py-2 px-4 text-sm cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Profile Image URL</label>
                        <input
                          type="text"
                          value={profileData.avatar_url}
                          onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full bg-background border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        />
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 transition-all"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                          {!saving && <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    </form>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-card border border-border"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Lock className="w-5 h-5 text-emerald-400" />
                      <h2 className="text-xl font-semibold">Security</h2>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          required
                          className="w-full bg-background border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">New Password</label>
                          <input
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                            required
                            className="w-full bg-background border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                            required
                            className="w-full bg-background border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={passSaving}
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 transition-all"
                        >
                          {passSaving ? 'Updating...' : 'Change Password'}
                          {!passSaving && <ShieldCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                    <h3 className="font-semibold mb-2">Workspace Info</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your workspace is currently on the <strong>Pro Plan</strong>. All fairness audits are encrypted and private.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-purple-400">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      Database Connected
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="font-semibold mb-2">Member Since</h3>
                    <p className="text-2xl font-bold text-foreground">
                      {user ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '---'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
