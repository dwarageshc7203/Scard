import React from 'react'
import { BarChart2 } from 'lucide-react'
import Image from '../ui/Image'

interface AnalyticsOverlayProps {
  isOpen: boolean
  isOwnProfile: boolean
  analytics: any
}

const AnalyticsOverlay: React.FC<AnalyticsOverlayProps> = ({ isOpen, isOwnProfile, analytics }) => {
  const totalViews = (analytics?.anonymousViews || 0) + (analytics?.recentViewers?.length || 0)

  let heading = "Analytics"
  if (analytics != null) {
    if (totalViews === 0) heading = "Seems you are boring..."
    else if (totalViews <= 10) heading = "Guess someone is getting popular?"
    else heading = "That one popular kid.."
  }

  return (
    <div
      className={`absolute inset-y-0 left-0 h-full w-full md:w-72 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
    >
      <div className="h-full bg-white dark:bg-[#252525] border-r border-gray-200 dark:border-white/10 w-full p-6 pt-8 md:pt-12 flex flex-col">
        <h2 className="text-lg font-medium mb-6 leading-tight text-gray-900 dark:text-white">{heading}</h2>
        
        {isOwnProfile ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
            <div className="bg-gray-50 dark:bg-[#202020] rounded-xl p-4 border border-gray-200 dark:border-white/10 text-center">
              <span className="block text-3xl font-black text-gray-900 dark:text-white mb-1">{totalViews}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 tracking-wider">Total Views</span>
            </div>

            <div>
              <h3 className="text-sm text-gray-900 dark:text-white mb-3">Recent Viewers</h3>
              <div className="space-y-3">
                {analytics?.recentViewers && analytics.recentViewers.length > 0 ? (
                  analytics.recentViewers.map((viewer: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      {viewer.imageUrl || viewer.imageURL ? (
                        <Image src={viewer.imageUrl || viewer.imageURL} referrerPolicy="no-referrer" alt={viewer.displayName} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#333333] object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2A2A2A] border border-gray-300 dark:border-white/10 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white uppercase">
                          {viewer.displayName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900 dark:text-white truncate">{viewer.displayName}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(viewer.viewedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4 border border-dashed border-gray-200 dark:border-white/10 rounded-lg">No logged-in viewers yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <BarChart2 className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4 opacity-50" />
            <p className="text-sm text-gray-900 dark:text-white mb-1">Access Denied</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">You can only view analytics for your own profile.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsOverlay
