import React, { useState, useEffect, type FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '../types'
import Sidebar from '../components/Sidebar'
import Avatar from '../components/ui/avatar'
import Button from '../components/ui/button'
import BadgeContainer from '../components/BadgeContainer'
import ContestGraph from '../components/ContestGraph'
import Heatmap from '../components/Heatmap'
import { mapContributionsToHeatmap, fetchBanners, fetchProfile } from '../lib/api'
import EditProfileModal from '../components/EditProfileModal'
import ProjectShowcase from '../components/ProjectShowcase'
import ProblemsSolved from '../components/ProblemsSolved'
import ExportCard from '../components/ExportCard'
import { Menu, Pencil, BarChart2, Users, Sun, Moon, Monitor, LogOut, Mail, Globe, Download, ArrowLeft, Award, Briefcase } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'sonner'
import * as htmlToImage from 'html-to-image'
import { saveAs } from 'file-saver'
import Image from "../components/ui/Image"

interface ProfilePageProps {
  users: User[]
  variant?: 'directory' | 'standalone'
  initialUserId?: string
  currentUser?: any
}

const ProfilePage: FC<ProfilePageProps> = ({ users, variant = 'directory', initialUserId, currentUser }) => {
  const [selectedUserId, setSelectedUserId] = useState(initialUserId || users[0]?.id)
  const [activeOverlay, setActiveOverlay] = useState<'analytics' | 'menu' | 'users' | null>(null)
  const [expandedWidget, setExpandedWidget] = useState<'badges' | 'projects' | null>(null)
  const [isIconBarVisible, setIsIconBarVisible] = useState(true)
  const [localUsers, setLocalUsers] = useState<User[]>(users)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [heatmapPlatforms, setHeatmapPlatforms] = useState<string[]>(['github', 'leetcode', 'codeforces'])
  const [analytics, setAnalytics] = useState<any>(null)

  const [availableBanners, setAvailableBanners] = useState<any[]>([])
  const [liveUser, setLiveUser] = useState<User | null>(null)

  const selectedUser = localUsers.find((u) => u.id === selectedUserId) ?? localUsers[0]
  const matchedUser = variant === 'standalone' ? localUsers.find(u => u.id === initialUserId) : selectedUser
  const activeUser = liveUser || matchedUser || selectedUser
  const activeBanner = availableBanners.find(b => b.id === activeUser.bannerId)

  useEffect(() => {
    if (activeOverlay === 'analytics' && currentUser && activeUser && currentUser.userName === activeUser.username) {
      import('../lib/api').then(({ fetchAnalytics }) => {
        fetchAnalytics().then(setAnalytics).catch(console.error)
      })
    }
  }, [activeOverlay, currentUser, activeUser?.username])

  useEffect(() => {
    setLocalUsers(users)
  }, [users])

  useEffect(() => {
    fetchBanners().then(setAvailableBanners).catch(console.error)
  }, [])

  useEffect(() => {
    if (variant === 'standalone' && initialUserId) {
      fetchProfile(initialUserId).then(setLiveUser).catch(console.error)
    } else {
      setLiveUser(null)
    }
  }, [variant, initialUserId])

  const availableYears = Array.from(new Set((activeUser?.rawContributions || []).map(c => c.date.substring(0, 4)))).sort().reverse()
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear().toString())
  const hasGithub = !!activeUser?.socials?.github
  const hasLeetCode = !!activeUser?.socials?.leetcode
  const hasProjects = !!(activeUser?.projects && activeUser.projects.length > 0)

  const availablePlatforms = Array.from(new Set((activeUser?.rawContributions || [])
    .map(c => c.platform.toLowerCase())
    .filter(p => {
      if (p === 'github' && !hasGithub) return false;
      if (p === 'leetcode' && !hasLeetCode) return false;
      return true;
    })
  )).sort()
  const [heatmapPlatform, setHeatmapPlatform] = useState<string>('all')
  const [heatmapYear, setHeatmapYear] = useState<string>(availableYears[0])

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(heatmapYear)) {
      setHeatmapYear(availableYears[0])
    }
  }, [availableYears.join(','), heatmapYear])

  // Ensure mutually exclusive UI states
  useEffect(() => {
    if (isEditModalOpen && activeOverlay !== null) {
      setActiveOverlay(null)
    }
  }, [isEditModalOpen])

  useEffect(() => {
    if (activeOverlay !== null && isEditModalOpen) {
      setIsEditModalOpen(false)
    }
  }, [activeOverlay])

  if (!matchedUser && variant === 'standalone' && !liveUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text space-y-4">
        <h2 className="text-2xl ">404 - Profile Not Found</h2>
        <p className="text-muted">The profile you're looking for doesn't exist.</p>
        <button onClick={() => window.location.href = '/'} className="text-accent underline ">Go Back Home</button>
      </div>
    )
  }

  const togglePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHeatmapPlatform(e.target.value)
  }

  const toggleYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHeatmapYear(e.target.value)
  }

  // Recompute heatmap based on filtered platforms and platformPreferences
  const isLeetcodeHeatmapEnabled = activeUser?.platformPreferences?.leetcode?.showHeatmap ?? true
  const backendContribs = activeUser.rawContributions
    ?.filter(c => isLeetcodeHeatmapEnabled || c.platform.toLowerCase() !== 'leetcode')
    ?.filter(c => heatmapPlatform === 'all' || c.platform.toLowerCase() === heatmapPlatform)
    // You can also filter by year here if rawContributions has proper date strings
    ?.filter(c => c.date.startsWith(heatmapYear))
    .map(c => ({
      platform: c.platform,
      contributionDate: c.date,
      count: c.count
    })) || []
  const countMap = new Map<string, number>()
  backendContribs.forEach(c => {
    countMap.set(c.contributionDate, (countMap.get(c.contributionDate) || 0) + c.count)
  })
  const heatmapData = Array.from(countMap.entries()).map(([date, count]) => ({ date, count }))

  const isOwnProfile = currentUser && activeUser && currentUser.userName === activeUser.username;

  const handleExport = () => {
    const node = document.getElementById('export-card-node');
    if (node) {
      toast.promise(
        htmlToImage.toBlob(node, { pixelRatio: 1.5, quality: 0.95 }).then((blob) => {
          if (blob) {
            saveAs(blob, `${activeUser.username}-scard.png`);
          } else {
            throw new Error('Failed to generate image blob');
          }
        }),
        {
          loading: 'Generating your Scard PNG...',
          success: 'Image exported successfully!',
          error: 'Failed to export image.'
        }
      );
    }
  }

  return (
    <div className="flex bg-gray-50 dark:bg-[#202020] text-gray-900 dark:text-gray-200 overflow-hidden" style={{ height: '100vh' }}>

      {/* Static Left Sidebar */}
      {isOwnProfile && (
        <aside className="w-[64px] h-full flex flex-col items-center py-6 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#252525] shrink-0 relative z-[60]">
          <Image onClick={() => window.location.href = '/'} src="/logos/scard-1.png" className="w-8 h-8 rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity" alt="Scard Logo" />

          <div className="flex flex-col gap-10 flex-1 mt-12 justify-center">

            {/* Analytics */}
            <button
              onClick={() => setActiveOverlay(activeOverlay === 'analytics' ? null : 'analytics')}
              className={`transition-colors ${activeOverlay === 'analytics' ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              title="Analytics"
            >
              <BarChart2 className="w-5 h-5" />
            </button>

            {/* Menu Popover Toggle */}
            <div className="relative flex justify-center">
              <button
                onClick={() => setActiveOverlay(activeOverlay === 'menu' ? null : 'menu')}
                className={`transition-colors ${activeOverlay === 'menu' ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                title="Menu"
              >
                <Menu className={`w-5 h-5`} />
              </button>

              {/* Menu Popover */}
              <AnimatePresence>
                {activeOverlay === 'menu' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, y: '-50%' }}
                    animate={{ opacity: 1, x: 0, y: '-50%' }}
                    exit={{ opacity: 0, x: -20, y: '-50%' }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-[50px] top-1/2 bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 p-2 w-[160px] rounded-xl shadow-2xl flex flex-col gap-2 z-[70]"
                  >
                    <div className="flex border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-[#202020] p-1 w-full">
                      <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                        <Moon className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setTheme('system')} className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-2 text-xs bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Export PNG
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Users */}
            <button
              onClick={() => setActiveOverlay(activeOverlay === 'users' ? null : 'users')}
              className={`transition-colors ${activeOverlay === 'users' ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              title="Users"
            >
              <Users className="w-5 h-5" />
            </button>

            {/* Edit Profile */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className={`transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`}
              title="Edit Profile"
            >
              <Pencil className="w-5 h-5" />
            </button>

          </div>

          <div className="mt-auto">
            <button
              onClick={() => {
                localStorage.removeItem('scard_username')
                window.location.href = '/logout'
              }}
              className="transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden w-full">
        {/* Go Back Button (Viewing Others) */}
        {!isOwnProfile && (
          <div className="absolute top-6 left-6 z-[70] hidden md:block">
            {currentUser ? (
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white/80 dark:bg-[#252525]/80 backdrop-blur-sm border-gray-200 dark:border-white/10"
                onClick={() => window.location.href = `/${currentUser?.userName}`}
              >
                <ArrowLeft className="w-4 h-4" />
                Go back
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white/80 dark:bg-[#252525]/80 backdrop-blur-sm border-gray-200 dark:border-white/10"
                onClick={() => window.location.href = `/`}
              >
                <ArrowLeft className="w-4 h-4" />
                Create your own profile?
              </Button>
            )}
          </div>
        )}

        {/* Sliding Overlays Container */}

        {/* 1. Analytics Overlay */}
        <div
          className={`absolute inset-y-0 left-0 h-full w-full md:w-72 z-50 transition-transform duration-300 ease-in-out ${activeOverlay === 'analytics' ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
        >
          <div className="h-full bg-white dark:bg-[#252525] border-r border-gray-200 dark:border-white/10 w-full p-6 pt-8 md:pt-12 flex flex-col">
            {(() => {
              const totalViews = (analytics?.anonymousViews || 0) + (analytics?.recentViewers?.length || 0);
              let heading = "Analytics";
              if (analytics != null) {
                if (totalViews === 0) heading = "Seems you are boring...";
                else if (totalViews <= 10) heading = "Guess someone is getting popular?";
                else heading = "That one popular kid..";
              }
              return <h2 className="text-lg font-medium mb-6 leading-tight text-gray-900 dark:text-white">{heading}</h2>;
            })()}
            {isOwnProfile ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                <div className="bg-gray-50 dark:bg-[#202020] rounded-xl p-4 border border-gray-200 dark:border-white/10 text-center">
                  <span className="block text-3xl font-black text-gray-900 dark:text-white mb-1">{(analytics?.anonymousViews || 0) + (analytics?.recentViewers?.length || 0)}</span>
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

        {/* 2. Users Directory Overlay */}
        <div
          className={`absolute inset-y-0 left-0 h-full w-full md:w-72 z-50 transition-transform duration-300 ease-in-out ${activeOverlay === 'users' ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
        >
          <div className="h-full bg-white dark:bg-[#252525] border-r border-gray-200 dark:border-white/10 w-full overflow-hidden flex flex-col">
            <Sidebar
              users={localUsers}
              selectedUserId={selectedUserId}
              onSelectUser={(id) => {
                if (variant === 'standalone') {
                  window.location.href = `/${id}`
                } else {
                  setSelectedUserId(id)
                }
              }}
              currentUser={currentUser}
            />
          </div>
        </div>

        {/* Click outside overlay to close it */}
        {activeOverlay !== null && (
          <div
            className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setActiveOverlay(null)}
          />
        )}

        {/* Main Layout Area */}
        <main className="flex-1 overflow-y-auto px-4 pt-6 pb-28 md:px-12 md:py-12 w-full relative z-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 w-full">

            {/* Hero Banner & Overlapping Avatar */}
            <div className="relative pt-[40px]">
              {/* Banner Background */}
              <div
                className="absolute top-0 left-0 right-0 h-[220px] bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none transition-all duration-300"
                style={activeBanner ? { background: activeBanner.cssBackground, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {/* Social Icons Bottom Right of Banner */}
                {activeUser.customSocials && activeUser.customSocials.length > 0 && (
                  <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                    {activeUser.customSocials.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.type.toLowerCase() === 'email' || social.type.toLowerCase() === 'mail' ? `mailto:${social.url}` : social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-surface/50 backdrop-blur-md rounded-full hover:bg-surface/80 transition-colors border border-border/40 text-text shadow-sm"
                        title={social.type}
                      >
                        {(social.type.toLowerCase() === 'linkedin' || social.type.toLowerCase() === 'linked_in') ? (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        ) :
                          social.type.toLowerCase() === 'twitter' ? (
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                          ) :
                            (social.type.toLowerCase() === 'email' || social.type.toLowerCase() === 'mail') ? <Mail className="w-4 h-4" /> :
                              <Globe className="w-4 h-4" />}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative px-8 sm:px-12 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center -mt-16 sm:mt-[110px]">
                {/* Avatar overlapping the banner */}
                <div className="rounded-full bg-gray-50 dark:bg-[#202020] p-2 -ml-0 sm:-ml-2 mt-4 sm:mt-0 shrink-0">
                  <Avatar
                    initials={activeUser.initials}
                    color={activeUser.color}
                    src={activeUser.imageURL}
                    asciiArt={activeUser.asciiArt}
                    size="xl"
                    isOnline={activeUser.isOnline}
                    className="w-28 h-28 sm:w-40 sm:h-40 rounded-full shadow-2xl"
                  />
                </div>

                {/* Name, Username & Title */}
                <div className="flex flex-col z-10 w-full sm:w-auto items-center sm:items-start text-center sm:text-left pt-2 sm:pt-16">
                  <div className="flex items-center flex-wrap gap-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      {(activeUser.displayName && activeUser.displayName.trim()) ? activeUser.displayName : activeUser.username}
                    </h1>
                    {activeUser.pin && (
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const x = (rect.left + rect.width / 2) / window.innerWidth
                          const y = (rect.top + rect.height / 2) / window.innerHeight
                          confetti({
                            origin: { x, y },
                            particleCount: 100,
                            spread: 70,
                            colors: ['#a855f7', '#d8b4fe', '#c084fc', '#f3e8ff']
                          })
                        }}
                        className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border border-purple-500 bg-gradient-to-r from-transparent to-purple-500/20 text-purple-600 dark:text-purple-400 shadow-sm self-center translate-y-[1px] cursor-pointer hover:to-purple-500/30 transition-colors"
                      >
                        {activeUser.pin}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-mono mt-0.5">
                    @{activeUser.username}
                  </p>
                  {activeUser.title && (
                    <p className="text-gray-600 dark:text-gray-400 text-base mt-1">
                      {activeUser.title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2-Column Grid */}
            {(hasLeetCode || hasGithub || hasProjects) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                {/* 1. Contest Rating Widget */}
                {hasLeetCode && (activeUser.platformPreferences?.leetcode?.showRating ?? true) && (
                  <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative min-h-[300px] flex flex-col shadow-sm dark:shadow-none">
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

                {/* 2. Problems Solved Widget */}
                {hasLeetCode && (activeUser.platformPreferences?.leetcode?.showProblems ?? true) && (
                  <ProblemsSolved problems={activeUser.problemsSolved || {}} />
                )}

                {/* Row wrapper for Badges & Projects */}
                {((hasLeetCode && (activeUser.platformPreferences?.leetcode?.showBadges ?? true)) || hasProjects) && (
                  <div className={`md:col-span-2 flex flex-col md:flex-row gap-6 h-auto md:h-[350px] relative ${!(hasLeetCode && (activeUser.platformPreferences?.leetcode?.showBadges ?? true)) || !hasProjects ? 'justify-center' : ''}`}>

                    {/* 3. Badges Widget Base */}
                    {hasLeetCode && (activeUser.platformPreferences?.leetcode?.showBadges ?? true) && (
                      <motion.div
                        layoutId="badges-widget"
                        className="w-full md:w-[calc(50%-12px)] max-w-2xl bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative flex flex-col shadow-sm dark:shadow-none min-w-0"
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
                    )}

                    {/* 4. Project Showcase Widget Base */}
                    {hasProjects && (
                      <motion.div
                        layoutId="projects-widget"
                        className="w-full md:w-[calc(50%-12px)] max-w-2xl bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative flex flex-col shadow-sm dark:shadow-none min-w-0"
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
                    )}

                    {/* Expanded Overlays */}
                    <AnimatePresence>
                      {expandedWidget === 'badges' && (
                        <motion.div
                          layoutId="badges-widget"
                          className="absolute inset-0 z-30 bg-white dark:bg-[#202020] border border-gray-200 dark:border-white/20 rounded-[20px] p-6 flex flex-col shadow-2xl overflow-hidden"
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

                      {expandedWidget === 'projects' && (
                        <motion.div
                          layoutId="projects-widget"
                          className="absolute inset-0 z-30 bg-white dark:bg-[#202020] border border-gray-200 dark:border-white/20 rounded-[20px] p-6 flex flex-col shadow-2xl overflow-hidden"
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

                {/* 5. Heatmap Widget (Full Width) */}
                {(hasGithub || hasLeetCode) && (
                  <div className="md:col-span-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative min-h-[250px] overflow-hidden shadow-sm dark:shadow-none">
                    <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans absolute top-5 left-6 z-10">Heat Map</span>
                    <div className="absolute top-5 right-6 z-10 flex items-center gap-3">
                      <select
                        value={heatmapPlatform}
                        onChange={togglePlatform}
                        className="bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[13px] tracking-wider rounded-md px-3 py-1.5 focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
                        style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                        <option value="all">All</option>
                        {availablePlatforms.map(p => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                      <select
                        value={heatmapYear}
                        onChange={toggleYear}
                        className="bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[13px] tracking-wider rounded-md px-3 py-1.5 focus:ring-2 focus:ring-accent appearance-none cursor-pointer min-w-[100px]"
                        style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                        {availableYears.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="mt-14 overflow-x-auto pt-2 custom-scrollbar"
                      style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)', maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
                    >
                      <Heatmap data={heatmapData} year={heatmapYear} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal
            user={activeUser}
            onClose={() => setIsEditModalOpen(false)}
            onSave={(updatedUser) => {
              if (variant === 'standalone') {
                setLiveUser(updatedUser)
              } else {
                const newUsers = [...localUsers]
                const idx = newUsers.findIndex(u => u.id === updatedUser.id)
                if (idx !== -1) {
                  newUsers[idx] = updatedUser
                  setLocalUsers(newUsers)
                }
              }
              setIsEditModalOpen(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Hidden Export Node */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <ExportCard user={activeUser} banner={activeBanner} />
      </div>

    </div>
  )
}

export default ProfilePage
