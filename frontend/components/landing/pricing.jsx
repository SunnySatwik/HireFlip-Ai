'use client'

import { motion } from 'framer-motion'
import { pricingTiers } from '@/data/mock-data'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Pricing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <section className="py-20 px-4 bg-background relative">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-4 text-pretty"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Choose the plan that fits your hiring volume
          </motion.p>

          {/* Billing toggle could go here */}
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative group ${tier.recommended ? 'md:scale-105' : ''}`}
              whileHover={{
                y: tier.recommended ? -12 : -8,
                transition: { duration: 0.3 },
              }}
            >
              {/* Recommended badge */}
              {tier.recommended && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: -30 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                >
                  <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </motion.div>
              )}

              {/* Card */}
              <div
                className={`h-full p-8 rounded-xl transition-all duration-300 ${
                  tier.recommended
                    ? 'glass-effect border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-emerald-500/5'
                    : 'glass-effect border-purple-500/20 hover-glow'
                } ${tier.recommended ? 'ring-2 ring-purple-500/30' : ''}`}
              >
                {/* Tier name */}
                <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>

                {/* Price */}
                <div className="mb-8">
                  {tier.price ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">${tier.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-foreground">Custom pricing</div>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full mb-8 font-semibold py-3 rounded-lg transition-all ${
                    tier.recommended
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'border border-purple-500/30 text-foreground hover:bg-purple-500/10 bg-transparent'
                  }`}
                  variant={tier.recommended ? 'default' : 'outline'}
                >
                  {tier.cta}
                </Button>

                {/* Features list */}
                <div className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center p-6 rounded-lg bg-card/30 border border-border"
        >
          <p className="text-foreground mb-2 font-semibold">Need a custom plan?</p>
          <p className="text-muted-foreground text-sm">
            Contact our sales team for enterprise solutions tailored to your needs.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
