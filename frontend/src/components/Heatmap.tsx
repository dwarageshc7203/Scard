import type { FC } from 'react'
import HeatMap from '@uiw/react-heat-map'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/context/ThemeContext'

interface HeatmapProps {
  data: Array<{ date: string; count: number }>
  year?: string | number
}

const Heatmap: FC<HeatmapProps> = ({ data, year }) => {
  const { resolvedTheme } = useTheme()

  const customTheme = {
    dark: {
      0: '#222222ff', // empty
      1: '#0e4429', // 1-3
      4: '#006d32', // 4-7
      8: '#26a641', // 8-11
      12: '#39d353' // 12+
    },
    light: {
      0: '#ebedf0',
      1: '#9be9a8',
      4: '#40c463',
      8: '#30a14e',
      12: '#216e39'
    },
  }

  // 1. Determine start and end dates for the selected year
  const currentYear = new Date().getFullYear()
  const displayYear = year ? parseInt(year.toString(), 10) : currentYear
  const isCurrentYear = displayYear === currentYear

  // Generate 12 months for the selected year
  const months = Array.from({ length: 12 }, (_, i) => {
    const firstDay = new Date(displayYear, i, 1)
    let lastDay = new Date(displayYear, i + 1, 0)

    // If it's the current year and the current month, end on today
    if (isCurrentYear && i === new Date().getMonth()) {
      lastDay = new Date()
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return {
      name: monthNames[i],
      start: firstDay,
      end: lastDay,
      isFuture: isCurrentYear && i > new Date().getMonth()
    }
  }).filter(m => !m.isFuture) // Hide future months if it's the current year

  // Filter out 0 count so they fall back to emptyColor safely
  const validData = data.filter(d => d.count > 0)

  return (
    <div className="w-full overflow-x-auto pb-4 flex items-center justify-start min-h-[160px] relative" style={{ scrollbarWidth: 'thin' }}>
      <TooltipProvider delayDuration={300}>
        <div className="flex gap-4 px-2 pt-4 min-w-max">
          {months.map((month, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3">
              <div className="relative overflow-visible">
                <HeatMap
                  value={validData}
                  width={month.end.getDate() > 28 ? 100 : 80}
                  startDate={month.start}
                  endDate={month.end}
                  rectSize={14}
                  space={4}
                  rectProps={{ rx: 3 }}
                  style={{ color: 'transparent' }} // Hide built-in labels
                  emptyColor={resolvedTheme === 'dark' ? '#222222' : '#ebedf0'}
                  panelColors={resolvedTheme === 'dark' ? { 0: '#434242ff', 1: '#0e4429', 4: '#006d32', 8: '#26a641', 12: '#39d353' } : { 0: '#ebedf0', 1: '#9be9a8', 4: '#40c463', 8: '#30a14e', 12: '#216e39' }}
                  weekLabels={idx === 0 ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['', '', '', '', '', '', '']}
                  monthPlacement="bottom"
                  monthLabels={['', '', '', '', '', '', '', '', '', '', '', '']} // Hide month labels inside
                  rectRender={(props, data) => (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <rect {...props} />
                      </TooltipTrigger>
                      <TooltipContent side="top" className={`py-2 px-3 shadow-lg border ${resolvedTheme === 'dark' ? 'bg-[#2A2A2A] border-white/10' : 'bg-white border-gray-200'}`}>
                        <span className={`font-bold ${resolvedTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{data.count || 0}</span> submissions on <span className={`font-mono ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{data.date || 'unknown date'}</span>
                      </TooltipContent>
                    </Tooltip>
                  )}
                />
              </div>
              <span className="text-[11px] text-gray-500 font-medium">{month.name}</span>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  )
}

export default Heatmap
