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
  LabelList,
  Cell
} from 'recharts'

import { useState, useEffect } from 'react'

export function ChartsSection() {
  const [chartData, setChartData] = useState({ trend: [], distribution: [] })
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('hireflip_token')
        const headers = {
          'Authorization': `Bearer ${token}`
        }

        const [metricsRes, candidatesRes] = await Promise.all([
          fetch('http://localhost:8000/metrics', { headers }),
          fetch('http://localhost:8000/candidates', { headers })
        ]);
        
        if (metricsRes.ok && candidatesRes.ok) {
          const metricsData = await metricsRes.json();
          const candidatesData = await candidatesRes.json();
          
          setChartData({
            trend: metricsData.acceptanceTrend || [],
            distribution: metricsData.demographicDistribution || []
          })
          setCandidates(candidatesData.candidates || [])
        }
      } catch (err) {
        console.error('Failed to load chart data', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Dynamic experience buckets calculation
  const getDynamicTrend = () => {
    if (!candidates.length) return [];

    const totalCount = candidates.length;
    const buckets = totalCount < 20 
      ? [
          { label: '0-4y', min: 0, max: 4.9 },
          { label: '5-8y', min: 5, max: 8.9 },
          { label: '9y+', min: 9, max: 100 }
        ]
      : [
          { label: '0-2y', min: 0, max: 2.9 },
          { label: '3-5y', min: 3, max: 5.9 },
          { label: '6-8y', min: 6, max: 8.9 },
          { label: '9y+', min: 9, max: 100 }
        ];

    return buckets.map(b => {
      const inBucket = candidates.filter(c => c.experience >= b.min && c.experience <= b.max);
      const shortlisted = inBucket.filter(c => c.fairnessAdjustedScore >= 80).length;
      const total = inBucket.length;
      
      return {
        period: b.label,
        acceptanceRate: total > 0 ? Math.round((shortlisted / total) * 100) : 0,
        shortlistedCount: shortlisted,
        totalInBucket: total,
        isLowSample: total < 2
      };
    });
  };

  const dynamicTrend = getDynamicTrend();
  const totalCandidates = candidates.length;
  const isTooSparse = totalCandidates > 0 && totalCandidates < 8;

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-[400px] rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart - Acceptance Rate by Experience */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        whileInView="visible"
        className="p-6 rounded-xl bg-card border border-border relative overflow-hidden"
      >
        <h3 className="font-semibold mb-6">Acceptance Rate by Experience</h3>

        {isTooSparse ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg bg-muted/5">
            <span className="text-2xl mb-2">📊</span>
            <p className="text-muted-foreground text-sm font-medium">Not enough data for trend analysis</p>
            <p className="text-xs text-muted-foreground/60 mt-1">(Minimum 8 candidates required for reliability)</p>
          </div>
        ) : dynamicTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dynamicTrend} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="period" 
                stroke="#888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#111] border border-[#333] p-3 rounded-lg shadow-xl text-xs">
                        <p className="font-bold mb-2 text-white">Experience: {label}</p>
                        <div className="flex justify-between gap-4 mb-1">
                          <span className="text-muted-foreground">Acceptance Rate:</span>
                          <span className="text-purple-400 font-bold">{data.acceptanceRate}%</span>
                        </div>
                        <div className="flex justify-between gap-4 mb-1">
                          <span className="text-muted-foreground">Shortlisted:</span>
                          <span className="text-white">{data.shortlistedCount} candidates</span>
                        </div>
                        <div className="flex justify-between gap-4 mb-1">
                          <span className="text-muted-foreground">Total Applicants:</span>
                          <span className="text-white">{data.totalInBucket} candidates</span>
                        </div>
                        {data.isLowSample && (
                          <p className="mt-2 pt-2 border-t border-[#333] text-amber-500 font-medium">
                            ⚠️ Low sample size for reliable audit
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="acceptanceRate"
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
                barSize={50}
              >
                <LabelList 
                  dataKey="acceptanceRate" 
                  position="top" 
                  offset={10}
                  content={(props) => {
                    const { x, y, width, value, index } = props;
                    const data = dynamicTrend[index];
                    if (!data) return null;
                    return (
                      <text 
                        x={x + width / 2} 
                        y={y - 10} 
                        fill="#a855f7" 
                        fontSize={10} 
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {`${value}% (${data.shortlistedCount}/${data.totalInBucket})`}
                      </text>
                    );
                  }}
                />
                {dynamicTrend.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill="#a855f7" 
                    fillOpacity={entry.isLowSample ? 0.3 : 1} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
            No trend data available for current dataset
          </div>
        )}
      </motion.div>

      {/* Bar Chart - Hiring Funnel by Demographic */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        whileInView="visible"
        className="p-6 rounded-xl bg-card border border-border"
      >
        <h3 className="font-semibold mb-6">Hiring Funnel by Demographic</h3>

        {isTooSparse ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg bg-muted/5">
            <span className="text-2xl mb-2">🎯</span>
            <p className="text-muted-foreground text-sm font-medium">Insufficient population for funnel audit</p>
            <p className="text-xs text-muted-foreground/60 mt-1">(Add more candidates to see group distribution)</p>
          </div>
        ) : chartData.distribution.filter(d => d.total > 0).length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={chartData.distribution.filter(d => d.total > 0)}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="category" 
                stroke="#888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = payload[0].payload.total;
                    return (
                      <div className="bg-[#111] border border-[#333] p-3 rounded-lg shadow-xl">
                        <p className="font-bold text-sm mb-2 text-white">{label}</p>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex justify-between gap-4 text-xs mb-1">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-medium">{entry.value}</span>
                          </div>
                        ))}
                        <div className="border-t border-[#333] mt-2 pt-2 flex justify-between gap-4 text-xs font-bold text-white">
                          <span>Total Candidates:</span>
                          <span>{total}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
              />
              <Bar dataKey="shortlisted" name="Shortlisted" stackId="a" fill="#10b981" barSize={32} />
              <Bar dataKey="inReview" name="In Review" stackId="a" fill="#f59e0b" barSize={32} />
              <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
            No demographic data available for current dataset
          </div>
        )}
      </motion.div>

      {/* Analytics Insight Card */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        whileInView="visible"
        className="lg:col-span-2 p-6 rounded-xl bg-card border border-border bg-gradient-to-br from-purple-500/5 to-transparent"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Live Analytics Insights</h3>
          <span className="text-xs font-medium px-2 py-1 rounded bg-purple-500/20 text-purple-400">
            Real-time Analysis
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Highest Acceptance</p>
            <p className="text-xl font-bold text-emerald-500">
              {dynamicTrend.length > 0 ? 
                `${Math.max(...dynamicTrend.map(t => t.acceptanceRate))}%` : 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Demographic Groups</p>
            <p className="text-xl font-bold text-purple-500">
              {chartData.distribution.length}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Dataset Status</p>
            <p className="text-xl font-bold text-blue-500">
              {dynamicTrend.length > 0 ? 'Live Processing' : 'Pending Upload'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}