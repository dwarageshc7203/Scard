import { FC, useMemo, useRef, useEffect } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "@/context/ThemeContext"

interface HeatmapProps {
  data: Array<{ date: string; count: number }>
  year?: string | number
}

const Heatmap: FC<HeatmapProps> = ({ data, year }) => {
  const { resolvedTheme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [data, year])

  const currentYear = new Date().getFullYear()
  const displayYear = year ? parseInt(year.toString(), 10) : currentYear
  const isCurrentYear = displayYear === currentYear

  // Start on Jan 1st of displayYear
  const startDate = new Date(displayYear, 0, 1)
  // End on Dec 31st (or today if current year)
  const endDate = isCurrentYear ? new Date() : new Date(displayYear, 11, 31)

  // Map data by date string for O(1) lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((d) => map.set(d.date, d.count))
    return map
  }, [data])

  // Generate all days
  const allDays = useMemo(() => {
    const days: Date[] = []
    let current = new Date(startDate)
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [startDate, endDate])

  // Group by month
  const months = useMemo(() => {
    const monthGroups: { name: string; columns: (Date | null)[][] }[] = []
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]

    let currentMonth = -1
    let currentColumn: (Date | null)[] = []

    allDays.forEach((day) => {
      const monthIdx = day.getMonth()
      const dayOfWeek = day.getDay() // 0 = Sun, 6 = Sat

      if (monthIdx !== currentMonth) {
        // Start a new month
        currentMonth = monthIdx
        currentColumn = Array(7).fill(null)
        monthGroups.push({
          name: monthNames[monthIdx],
          columns: [currentColumn],
        })
      }

      currentColumn[dayOfWeek] = day

      if (dayOfWeek === 6) {
        // End of week, start new column
        currentColumn = Array(7).fill(null)
        monthGroups[monthGroups.length - 1].columns.push(currentColumn)
      }
    })

    // Prune trailing empty columns
    monthGroups.forEach((m) => {
      if (
        m.columns.length > 0 &&
        m.columns[m.columns.length - 1].every((d) => d === null)
      ) {
        m.columns.pop()
      }
    })

    return monthGroups
  }, [allDays])

  const getColor = (count: number) => {
    if (count === 0) return resolvedTheme === "dark" ? "#3f3f3fff" : "#ebedf0"
    if (count <= 3) return resolvedTheme === "dark" ? "#0e4429" : "#9be9a8"
    if (count <= 7) return resolvedTheme === "dark" ? "#006d32" : "#40c463"
    if (count <= 11) return resolvedTheme === "dark" ? "#26a641" : "#30a14e"
    return resolvedTheme === "dark" ? "#39d353" : "#216e39"
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-x-auto pb-4 flex items-center justify-start min-h-[160px] relative"
      style={{ scrollbarWidth: "thin" }}
    >
      <div className="flex gap-5 px-2 pt-4 min-w-max">
        {months.map((month, mIdx) => (
          <div key={mIdx} className="flex flex-col items-center gap-3">
            <div className="flex gap-[4px]">
              {month.columns.map((col, cIdx) => (
                <div key={cIdx} className="flex flex-col gap-[4px]">
                  {col.map((day, dIdx) => {
                    if (!day) {
                      return <div key={dIdx} className="w-[14px] h-[14px]" /> // Empty space
                    }
                    const dateStr = formatDate(day)
                    const count = dataMap.get(dateStr) || 0
                    return (
                      <div
                        key={dIdx}
                        title={`${count} submissions on ${dateStr}`}
                        className="w-[14px] h-[14px] rounded-[3px] transition-all hover:ring-1 hover:ring-gray-400 cursor-pointer"
                        style={{ backgroundColor: getColor(count) }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              {month.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Heatmap
