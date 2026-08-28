import React from 'react'
import Heatmap from '../Heatmap'
import ErrorBoundary from '../ErrorBoundary'

interface HeatmapWidgetProps {
  heatmapData: { date: string; count: number }[]
  availablePlatforms: string[]
  availableYears: string[]
  heatmapPlatform: string
  heatmapYear: string
  setHeatmapPlatform: (platform: string) => void
  setHeatmapYear: (year: string) => void
}

const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({
  heatmapData,
  availablePlatforms,
  availableYears,
  heatmapPlatform,
  heatmapYear,
  setHeatmapPlatform,
  setHeatmapYear
}) => {
  return (
    <div className="md:col-span-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative min-h-[250px] overflow-hidden shadow-sm dark:shadow-none">
      <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans absolute top-5 left-6 z-10">Heat Map</span>
      <div className="absolute top-5 right-6 z-10 flex items-center gap-3">
        <select
          value={heatmapPlatform}
          onChange={(e) => setHeatmapPlatform(e.target.value)}
          className="bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[13px] tracking-wider rounded-md px-3 py-1.5 focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
          style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
        >
          <option value="all">All</option>
          {availablePlatforms.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <select
          value={heatmapYear}
          onChange={(e) => setHeatmapYear(e.target.value)}
          className="bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[13px] tracking-wider rounded-md px-3 py-1.5 focus:ring-2 focus:ring-accent appearance-none cursor-pointer min-w-[100px]"
          style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="mt-14 overflow-x-auto pt-2 custom-scrollbar">
        <ErrorBoundary>
          <Heatmap data={heatmapData} year={heatmapYear} />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default HeatmapWidget
