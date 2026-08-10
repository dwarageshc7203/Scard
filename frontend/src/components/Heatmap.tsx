import type { FC } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import { useTheme } from '@/context/ThemeContext'

interface HeatmapProps {
  data: number[][]
}

const Heatmap: FC<HeatmapProps> = ({ data }) => {
  const { resolvedTheme } = useTheme()

  // Convert 2D mock level array to 1D calendar-compatible format with date strings
  const activities: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = []

  const msPerDay = 24 * 60 * 60 * 1000
  // Heatmap starts 53 weeks ago (53 * 7 = 371 days)
  const totalDays = data.length * 7
  const startDate = new Date(Date.now() - totalDays * msPerDay)

  let dayCount = 0
  for (let w = 0; w < data.length; w++) {
    for (let d = 0; d < data[w].length; d++) {
      // react-activity-calendar level accepts 0 to 4
      const level = Math.max(0, Math.min(4, data[w][d])) as 0 | 1 | 2 | 3 | 4
      const currentDate = new Date(startDate.getTime() + dayCount * msPerDay)
      const dateStr = currentDate.toISOString().split('T')[0]

      activities.push({
        date: dateStr,
        count: level === 0 ? 0 : level * 4 + 2,
        level,
      })
      dayCount++
    }
  }

  // Premium color palettes matching our theme variable configuration
  const customTheme = {
    dark: ['#161616', '#0d2f5e', '#1a4db5', '#2563eb', '#60a5fa'],
    light: ['#e4e4e7', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'],
  }

  return (
    <div className="w-full overflow-x-auto py-2 flex items-center justify-center min-h-[140px]" style={{ scrollbarWidth: 'thin' }}>
      <div className="min-w-[720px] px-2">
        <ActivityCalendar
          data={activities}
          theme={customTheme}
          colorScheme={resolvedTheme}
          labels={{
            legend: {
              less: 'Less',
              more: 'More',
            },
          }}
          fontSize={11}
          blockSize={11}
          blockMargin={2.5}
        />
      </div>
    </div>
  )
}

export default Heatmap
