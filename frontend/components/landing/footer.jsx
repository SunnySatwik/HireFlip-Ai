'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Linkedin, Twitter, Github } from 'lucide-react'

export function Footer() {
  const footerLinks = {
    Product: ['Features', 'Pricing', 'Security', 'API'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Resources: ['Documentation', 'Guides', 'FAQ', 'Support'],
    Legal: ['Privacy', 'Terms', 'Compliance', 'GDPR'],
  }

  const socialLinks = [
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Github, href: '#' },
  ]

  return (
    <footer className="bg-card/80 border-t border-border relative overflow-hidden pt-20 pb-8">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-1"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                HireFlip
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                Building fair hiring systems powered by AI.
              </p>
            </div>

            {/* Social icons */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 rounded-lg bg-card border border-purple-500/20 hover:border-purple-500/50 flex items-center justify-center text-muted-foreground hover:text-purple-400 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links], columnIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (columnIndex + 1) }}
            >
              <h3 className="font-semibold text-foreground mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="text-muted-foreground hover:text-purple-400 text-sm transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-lg glass-effect border border-purple-500/20 mb-12"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Stay Updated</h3>
              <p className="text-muted-foreground text-sm">Get the latest on hiring fairness and product updates.</p>
            </div>
            <div className="flex flex-1 md:flex-initial gap-2 min-w-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom divider */}
        <div className="border-t border-border" />

        {/* Bottom footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm"
        >
          <p>&copy; 2026 HireFlip. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-purple-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              Cookie Settings
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
