'use client'

import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import {
  anonymizationData,
  genderAcceptanceByDept,
  departmentBiasMap,
} from '@/data/mock-data'

export function ChartsSection() {
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        whileInView="visible"
        className="p-6 rounded-xl bg-card border border-border"
      >
        <h3 className="font-semibold mb-6">Acceptance Rate Trend</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={anonymizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="withNames"
              stroke="#ef4444"
              name="With Names"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="anonymized"
              stroke="#10b981"
              name="Anonymized"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        whileInView="visible"
        className="p-6 rounded-xl bg-card border border-border"
      >
        <h3 className="font-semibold mb-6">
          Gender Acceptance Rates by Department
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={genderAcceptanceByDept}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="male" fill="#a855f7" />
            <Bar dataKey="female" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bias Cards */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        whileInView="visible"
        className="lg:col-span-2 p-6 rounded-xl bg-card border border-border"
      >
        <h3 className="font-semibold mb-6">Department Bias Index</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {departmentBiasMap.map((dept) => (
            <div
              key={dept.department}
              className="p-4 rounded-xl border text-center"
            >
              <p className="text-sm mb-2">{dept.department}</p>
              <p className="text-2xl font-bold text-purple-500">
                {dept.bias}%
              </p>
              <p className="text-xs text-muted-foreground">Bias Index</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}