import type { FC } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Contest } from '../types'
import { useTheme } from '@/context/ThemeContext'

interface ContestGraphProps {
  contests: Contest[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-2/90 backdrop-blur-sm border border-border/60 p-3 rounded-lg shadow-xl shadow-black/20">
        <p className="text-xs text-muted mb-1 font-mono">{label}</p>
        <p className="text-sm text-text mb-0.5">{payload[0].payload.name}</p>
        <p className="text-xs text-accent font-semibold">Rating: {payload[0].value}</p>
      </div>
    )
  }
  return null
}

const ContestGraph: FC<ContestGraphProps> = ({ contests }) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (!contests || contests.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-muted border border-dashed border-border/40 rounded-xl">
        No contest data available. Link your platforms to see your rating history!
      </div>
    )
  }

  // Find min and max for Y axis scaling to make graph look better
  const minRating = Math.min(...contests.map(c => c.rating))
  const maxRating = Math.max(...contests.map(c => c.rating))

  // Calculate buffer for Y axis (approx 5% padding)
  const yDomainMin = Math.max(0, Math.floor(minRating * 0.95))
  const yDomainMax = Math.ceil(maxRating * 1.05)

  return (
    <div className="w-full h-64 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={contests}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e5e7eb'} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: isDark ? '#888' : '#6b7280' }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[yDomainMin, yDomainMax]}
            tick={{ fontSize: 10, fill: isDark ? '#888' : '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="linear"
            dataKey="rating"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#60a5fa', stroke: '#1d4ed8', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ContestGraph
