import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award } from 'lucide-react'
import ContestGraph from '../ContestGraph'
import ProblemsSolved from '../ProblemsSolved'
import BadgeContainer from '../BadgeContainer'
import ProjectShowcase from '../ProjectShowcase'

interface ProfileWidgetsProps {
  activeUser: any
  hasLeetCode: boolean
  hasProjects: boolean
  expandedWidget: 'badges' | 'projects' | null
  setExpandedWidget: (widget: 'badges' | 'projects' | null) => void
}

const ProfileWidgets: React.FC<ProfileWidgetsProps> = ({ activeUser, hasLeetCode, hasProjects, expandedWidget, setExpandedWidget }) => {
  const showRating = hasLeetCode && (activeUser.platformPreferences?.leetcode?.showRating ?? true);
  const showProblems = hasLeetCode && (activeUser.platformPreferences?.leetcode?.showProblems ?? true);
  const showBadges = hasLeetCode && (activeUser.platformPreferences?.leetcode?.showBadges ?? true);
  const showProjects = hasProjects;
  const visibleCount = [showRating, showProblems, showBadges, showProjects].filter(Boolean).length;
  const singleItemClass = visibleCount === 1 ? "md:col-span-2 max-w-xl mx-auto w-full" : "";

  if (visibleCount === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 relative items-start">
      {showRating && (
        <div className={`bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative h-[350px] flex flex-col shadow-sm dark:shadow-none ${singleItemClass}`}>
          <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans absolute top-5 left-6 z-10">Contest Rating</span>
          {activeUser.contests && activeUser.contests.length > 0 && (
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white z-10">
              {activeUser.contests[activeUser.contests.length - 1].rating}
            </span>
          )}
          <div className="mt-10 flex-1 relative flex items-center justify-center">
            {activeUser.contests && activeUser.contests.length > 0 ? (
              <ContestGraph contests={activeUser.contests} />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted">No contests available</div>
            )}
          </div>
        </div>
      )}

      {showProblems && (
        <div className={`h-[350px] ${singleItemClass}`}>
          <ProblemsSolved problems={activeUser.problemsSolved || {}} />
        </div>
      )}

      {showBadges && (
        <div className={`relative w-full h-[350px] ${singleItemClass}`}>
          <motion.div
            layoutId="badges-widget"
            className="w-full h-full bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative flex flex-col shadow-sm dark:shadow-none"
          >
            <div className="flex justify-between items-center absolute top-5 left-6 right-6 z-10">
              <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans whitespace-nowrap">Badges</span>
              <button
                onClick={() => setExpandedWidget('badges')}
                className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none whitespace-nowrap"
              >
                Expand
              </button>
            </div>
            <div className="mt-12 flex-1 relative min-h-0">
              {activeUser.badges && activeUser.badges.length > 0 ? (
                <BadgeContainer badges={activeUser.badges} isExpanded={false} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-surface-2/30 rounded-xl border border-dashed border-border/50">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center mb-3">
                    <Award className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-text">No Badges Yet</h3>
                  <p className="text-xs text-muted mt-1 max-w-[200px]">Link your LeetCode profile to automatically showcase your achievements.</p>
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {expandedWidget === 'badges' && (
              <motion.div
                layoutId="badges-widget"
                className={`absolute top-0 left-0 right-0 ${visibleCount === 1 ? 'z-50' : 'md:-right-[calc(100%+24px)]'} z-50 bg-white dark:bg-[#202020] border border-gray-200 dark:border-white/20 rounded-[20px] p-6 flex flex-col shadow-2xl overflow-hidden h-[350px]`}
              >
                <div className="flex justify-between items-center absolute top-5 left-6 right-6 z-10">
                  <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans whitespace-nowrap">Badges</span>
                  <button
                    onClick={() => setExpandedWidget(null)}
                    className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none whitespace-nowrap"
                  >
                    Collapse
                  </button>
                </div>
                <div className="mt-12 flex-1 relative min-h-0 overflow-y-auto">
                  {activeUser.badges && activeUser.badges.length > 0 ? (
                    <BadgeContainer badges={activeUser.badges} isExpanded={true} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-8">
                      <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4 border border-border/50">
                        <Award className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-text mb-2">No Badges Collected</h3>
                      <p className="text-sm text-muted max-w-sm">Connect your competitive programming accounts like LeetCode in your profile settings to automatically display your earned badges here.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {showProjects && (
        <div className={`relative w-full h-[350px] ${singleItemClass}`}>
          <motion.div
            layoutId="projects-widget"
            className="w-full h-full bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative flex flex-col shadow-sm dark:shadow-none"
          >
            <div className="flex justify-between items-center absolute top-5 left-6 right-6 z-10">
              <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans whitespace-nowrap">Project Showcase</span>
              <button
                onClick={() => setExpandedWidget('projects')}
                className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none whitespace-nowrap"
              >
                Expand
              </button>
            </div>
            <div className="mt-12 flex-1 relative min-h-0">
              <ProjectShowcase
                projects={activeUser.projects || []}
                isExpanded={false}
                onToggleExpand={() => setExpandedWidget('projects')}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {expandedWidget === 'projects' && (
              <motion.div
                layoutId="projects-widget"
                className={`absolute top-0 right-0 left-0 ${visibleCount === 1 ? 'z-50' : 'md:-left-[calc(100%+24px)]'} z-50 bg-white dark:bg-[#202020] border border-gray-200 dark:border-white/20 rounded-[20px] p-6 flex flex-col shadow-2xl overflow-hidden h-[350px]`}
              >
                <div className="flex justify-between items-center absolute top-5 left-6 right-6 z-10">
                  <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans whitespace-nowrap">Project Showcase</span>
                  <button
                    onClick={() => setExpandedWidget(null)}
                    className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none whitespace-nowrap"
                  >
                    Collapse
                  </button>
                </div>
                <div className="mt-12 flex-1 relative min-h-0 overflow-y-auto custom-scrollbar">
                  <ProjectShowcase
                    projects={activeUser.projects || []}
                    isExpanded={true}
                    onToggleExpand={() => setExpandedWidget(null)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default ProfileWidgets
