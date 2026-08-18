import React, { useState } from "react"
import { ArrowRight, X } from "lucide-react"

interface ProblemStats {
  total: number
  easy: number
  medium: number
  hard: number
}

interface ProblemsSolvedProps {
  problems: Record<string, ProblemStats>
}

const platformConfig: Record<string, {
  logo: string
  color: string
  label: string
}> = {
  LEETCODE: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/LeetCode_Logo_1.png",
    color: "#FFA116",
    label: "LeetCode",
  },
  CODEFORCES: {
    logo: "https://cdn.iconscout.com/icon/free/png-256/code-forces-3628695-3029920.png",
    color: "#1F8ACB",
    label: "Codeforces",
  },
  HACKERRANK: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png",
    color: "#00EA64",
    label: "HackerRank",
  },
}

const ProblemsSolved: React.FC<ProblemsSolvedProps> = ({ problems }) => {
  const [showAll, setShowAll] = useState(false)
  const platforms = Object.entries(problems || {})

  const displayPlatforms = platforms.slice(0, 4)
  const hasMore = platforms.length > 4

  return (
    <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative min-h-[300px] flex flex-col shadow-sm dark:shadow-none">
      <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans absolute top-5 left-6 z-10">
        Problems Solved
      </span>
      {platforms.length > 0 ? (
        <div className="flex-1 flex flex-wrap items-center justify-center gap-4 mt-10">
          {displayPlatforms.map(([platform, stats], idx) => {
            const config = platformConfig[platform.toUpperCase()] || {
              logo: "",
              color: "#ffffff",
              label: platform,
            }

            return (
              <div
                key={idx}
                className="group relative bg-surface rounded-xl p-4 border border-border/40 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300 hover:border-[var(--hover-color)] hover:shadow-lg w-[200px] h-[200px]"
                style={{ "--hover-color": config.color } as React.CSSProperties}
              >
                {/* Default View */}
                <div className="flex flex-col items-center transition-opacity duration-300 group-hover:opacity-0 group-hover:scale-95">
                  {config.logo ? (
                    <img
                      src={config.logo}
                      alt={config.label}
                      className="w-20 h-20 mb-3 object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 mb-3 rounded-full bg-border flex items-center justify-center text-muted">
                      {platform.charAt(0)}
                    </div>
                  )}
                  <span className="text-2xl font-black text-text mb-1">
                    {stats.total}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 scale-105 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 p-2">
                  <div className="w-full flex flex-col gap-1.5 px-3">
                    {/* Easy */}
                    <div className="flex justify-between items-center w-full text-sm">
                      <span className="text-green-400">Easy</span>
                      <span className="text-text">{stats.easy}</span>
                    </div>
                    {/* Medium */}
                    <div className="flex justify-between items-center w-full text-sm">
                      <span className="text-yellow-400">Medium</span>
                      <span className="text-text">{stats.medium}</span>
                    </div>

                    {/* Hard */}
                    <div className="flex justify-between items-center w-full text-sm">
                      <span className="text-red-400">Hard</span>
                      <span className="text-text">{stats.hard}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="flex flex-col items-center justify-center w-[130px] h-[130px] rounded-xl bg-surface border border-border/40 hover:border-muted hover:shadow-lg transition-all duration-300 group"
            >
              <span className="text-2xl font-black text-text mb-1">
                +{platforms.length - 4}
              </span>
              <span className="text-[10px] text-muted uppercase tracking-wider flex items-center gap-1 group-hover:text-text transition-colors">
                More <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted text-center">
            No problems logged yet.
          </p>
        </div>
      )}

      {showAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setShowAll(false)}
        >
          <div
            className="bg-surface p-6 rounded-2xl border border-border flex flex-col gap-6 w-full max-w-3xl max-h-[85vh] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAll(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-2 text-muted hover:text-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-text text-xl w-full">All Problem Stats</h3>
            <div className="flex flex-wrap justify-center gap-6 overflow-y-auto p-2 custom-scrollbar">
              {platforms.map(([platform, stats], idx) => {
                const config = platformConfig[platform.toUpperCase()] || {
                  logo: "",
                  color: "#ffffff",
                  label: platform,
                }
                return (
                  <div
                    key={idx}
                    className="group relative bg-surface-2 rounded-xl p-4 border border-border/40 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300 hover:border-[var(--hover-color)] hover:shadow-lg w-[140px] h-[140px]"
                    style={
                      { "--hover-color": config.color } as React.CSSProperties
                    }
                  >
                    <div className="flex flex-col items-center transition-opacity duration-300 group-hover:opacity-0 group-hover:scale-95">
                      {config.logo ? (
                        <img
                          src={config.logo}
                          alt={config.label}
                          className="w-12 h-12 mb-3 object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 mb-3 rounded-full bg-border flex items-center justify-center text-muted text-lg">
                          {platform.charAt(0)}
                        </div>
                      )}
                      <span className="text-2xl font-black text-text mb-1">
                        {stats.total}
                      </span>
                      <span className="text-[10px] text-muted uppercase tracking-wider">
                        {config.label}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-surface-2/95 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 scale-105 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 p-3">
                      <span
                        className="text-[10px] mb-3 tracking-wider"
                        style={{ color: config.color }}
                      >
                        {config.label} STATS
                      </span>
                      <div className="w-full flex flex-col gap-2 px-2">
                        <div className="flex justify-between items-center w-full text-xs">
                          <span className="text-red-400 font-medium">Hard</span>
                          <span className="text-text">{stats.hard}</span>
                        </div>
                        <div className="flex justify-between items-center w-full text-xs">
                          <span className="text-yellow-400 font-medium">
                            Medium
                          </span>
                          <span className="text-text">{stats.medium}</span>
                        </div>
                        <div className="flex justify-between items-center w-full text-xs">
                          <span className="text-green-400 font-medium">
                            Easy
                          </span>
                          <span className="text-text">{stats.easy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProblemsSolved
