import { useState, type FC } from 'react'
import type { Badge as BadgeType } from '../types'
import Badge from './ui/badge'
import { ArrowRight } from 'lucide-react'

interface BadgeContainerProps {
  badges: BadgeType[]
}

const BadgeContainer: FC<BadgeContainerProps> = ({ badges }) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (!badges || badges.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-muted border border-dashed border-border/40 rounded-xl h-full">
        No badges earned yet.
      </div>
    )
  }

  const displayBadges = badges.slice(0, 3)
  const hasMore = badges.length > 3

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="grid grid-cols-2 gap-6 p-2 mx-auto">
        {displayBadges.map((badge, i) => (
          <button
            key={i}
            onClick={() => setSelectedBadge(badge)}
            className="relative flex items-center justify-center w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] rounded-full bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30 transition-all duration-300 outline-none hover:scale-105 shadow-lg"
          >
            {badge.iconUrl ? (
              <img
                src={badge.iconUrl}
                alt={badge.label}
                className="w-[68px] h-[68px] sm:w-[80px] sm:h-[80px] object-contain"
              />
            ) : (
              <Badge variant={badge.platform} className="text-[10px] uppercase tracking-wider px-2">
                {badge.platform.substring(0, 3)}
              </Badge>
            )}
          </button>
        ))}
        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="flex flex-col items-center justify-center w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] text-gray-500 hover:text-gray-700 dark:hover:text-white font-bold rounded-full bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-white/10 transition-colors shadow-lg hover:scale-105"
          >
            <span className="text-[10px] uppercase font-mono tracking-widest mt-1 mb-1">+{badges.length - 3} More</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {showAll && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-[#252525]/90 backdrop-blur-md rounded-[16px] animate-in fade-in zoom-in-95 duration-200" onClick={() => setShowAll(false)}>
           <div className="bg-white dark:bg-[#2A2A2A] p-6 rounded-[20px] border border-gray-200 dark:border-white/10 flex flex-col items-center gap-6 max-w-[90%] max-h-[90%] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg w-full text-center">All Collected Badges</h3>
              <div className="flex flex-wrap gap-6 justify-center max-w-sm">
                {badges.map((b, idx) => (
                   <div key={idx} className="flex flex-col items-center gap-2">
                      {b.iconUrl && <img src={b.iconUrl} alt={b.label} className="w-20 h-20 object-contain drop-shadow-md" />}
                      <span className="text-[10px] text-gray-400 font-mono text-center max-w-[80px] break-words">{b.label}</span>
                   </div>
                ))}
              </div>
              <button onClick={() => setShowAll(false)} className="mt-2 px-4 py-1.5 rounded-full border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all">Close</button>
           </div>
        </div>
      )}

      {selectedBadge && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-[#252525]/90 backdrop-blur-md rounded-[16px] animate-in fade-in zoom-in-95 duration-200" onClick={() => setSelectedBadge(null)}>
          <div className="bg-white dark:bg-[#2A2A2A] p-6 rounded-[20px] border border-gray-200 dark:border-white/10 flex flex-col items-center gap-4 max-w-[90%] shadow-2xl" onClick={e => e.stopPropagation()}>
            {selectedBadge.iconUrl && <img src={selectedBadge.iconUrl} alt={selectedBadge.label} className="w-32 h-32 object-contain drop-shadow-xl" />}
            <div className="text-center space-y-1 mt-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">{selectedBadge.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono uppercase tracking-widest">{selectedBadge.platform} Badge</p>
            </div>
            <button onClick={() => setSelectedBadge(null)} className="mt-4 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BadgeContainer
