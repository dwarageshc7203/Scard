import React, { useState, useEffect, type FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '../types'
import Sidebar from '../components/Sidebar'
import Avatar from '../components/ui/avatar'
import BadgeContainer from '../components/BadgeContainer'
import ContestGraph from '../components/ContestGraph'
import Heatmap from '../components/Heatmap'
import { mapContributionsToHeatmap, fetchBanners, fetchProfile } from '../lib/api'
import EditProfileModal from '../components/EditProfileModal'
import ProjectShowcase from '../components/ProjectShowcase'
import ProblemsSolved from '../components/ProblemsSolved'
import ExportCard from '../components/ExportCard'
import { Menu, Pencil, BarChart2, Users, Sun, Moon, Monitor, LogOut, Mail, Globe, Download } from 'lucide-react'
import scardLogo from '../images/scard.png'
import { useTheme } from '../context/ThemeContext'
import * as htmlToImage from 'html-to-image'
import { saveAs } from 'file-saver'

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

  if (!matchedUser && variant === 'standalone' && !liveUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text space-y-4">
        <h2 className="text-2xl ">404 - Profile Not Found</h2>
        <p className="text-muted">The profile you're looking for doesn't exist.</p>
        <button onClick={() => window.location.href = '/'} className="text-accent underline ">Go Back Home</button>
      </div>
    )
  }

  const availableYears = Array.from(new Set((activeUser?.rawContributions || []).map(c => c.date.substring(0, 4)))).sort().reverse()
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear().toString())
  const availablePlatforms = Array.from(new Set((activeUser?.rawContributions || []).map(c => c.platform.toLowerCase()))).sort()

  const [heatmapPlatform, setHeatmapPlatform] = useState<string>('all')
  const [heatmapYear, setHeatmapYear] = useState<string>(availableYears[0])

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(heatmapYear)) {
      setHeatmapYear(availableYears[0])
    }
  }, [availableYears.join(','), heatmapYear])

  const togglePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHeatmapPlatform(e.target.value)
  }

  const toggleYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHeatmapYear(e.target.value)
  }

  // Recompute heatmap based on filtered platforms
  const backendContribs = activeUser.rawContributions
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

  const handleExport = () => {
    const node = document.getElementById('export-card-node');
    if (node) {
      htmlToImage.toPng(node, { pixelRatio: 2, quality: 1.0 })
        .then(function (dataUrl) {
          saveAs(dataUrl, `${activeUser.username}-scard.png`);
        })
        .catch(function (error) {
          console.error('Failed to export image:', error);
        });
    }
  }

  return (
    <div className="flex bg-gray-50 dark:bg-[#202020] text-gray-900 dark:text-gray-200 relative overflow-hidden" style={{ height: '100vh' }}>

      {/* Hover Zone to reveal icon bar */}
      {(!isIconBarVisible) && (
        <div
          className="absolute left-0 top-0 w-8 h-full z-[60] cursor-pointer"
          onMouseEnter={() => setIsIconBarVisible(true)}
        />
      )}

      {/* Floating Icon Sidebar (Desktop) */}
      <nav
        className={`hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-[64px] py-8 bg-white dark:bg-[#252525] border border-gray-200 dark:border-white/10 rounded-[32px] flex-col items-center gap-10 z-[60] shadow-lg dark:shadow-2xl transition-transform duration-300 ease-in-out ${isIconBarVisible ? 'translate-x-0' : '-translate-x-[150%]'}`}
        onMouseLeave={() => {
          if (activeOverlay !== null && activeOverlay !== 'menu') {
            setIsIconBarVisible(false)
          }
        }}
      >
        <img onClick={() => window.location.href = '/'} src={scardLogo} className="w-8 h-8 rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity" alt="Scard Logo" />

        <div className="flex flex-col gap-10 flex-1 mt-6">
          {currentUser && activeUser && currentUser.userName === activeUser.username && (
            <button
              onClick={() => { setActiveOverlay('analytics'); setIsIconBarVisible(false) }}
              className={`transition-colors ${activeOverlay === 'analytics' ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              title="Analytics"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => { activeOverlay === 'menu' ? setActiveOverlay(null) : setActiveOverlay('menu'); setIsIconBarVisible(true); }}
            className={`transition-colors ${activeOverlay === 'menu' ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setActiveOverlay('users'); setIsIconBarVisible(false) }}
            className={`transition-colors ${activeOverlay === 'users' ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            title="Users"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Fixed Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-[72px] bg-white dark:bg-[#252525] border border-gray-200 dark:border-white/10 rounded-[32px] flex items-center justify-around z-[60] shadow-2xl px-4">
        <img onClick={() => window.location.href = '/'} src={scardLogo} className="w-8 h-8 rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity" alt="Scard Logo" />
        {currentUser && activeUser && currentUser.userName === activeUser.username && (
          <button
            onClick={() => { setActiveOverlay(activeOverlay === 'analytics' ? null : 'analytics') }}
            className={`transition-colors p-3 rounded-full ${activeOverlay === 'analytics' ? 'bg-accent/10 text-accent' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <BarChart2 className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={() => { setActiveOverlay(activeOverlay === 'menu' ? null : 'menu') }}
          className={`transition-colors p-3 rounded-full ${activeOverlay === 'menu' ? 'bg-accent/10 text-accent' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <Menu className="w-6 h-6" />
        </button>
        <button
          onClick={() => { setActiveOverlay(activeOverlay === 'users' ? null : 'users') }}
          className={`transition-colors p-3 rounded-full ${activeOverlay === 'users' ? 'bg-accent/10 text-accent' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <Users className="w-6 h-6" />
        </button>
      </nav>

      {/* Sliding Overlays Container */}

      {/* 1. Analytics Overlay */}
      <div
        className={`fixed md:absolute inset-x-0 bottom-0 md:inset-auto md:top-0 md:left-0 h-[85vh] md:h-full w-full md:w-auto z-50 md:z-40 transition-transform duration-300 ease-in-out ${activeOverlay === 'analytics' ? 'translate-y-0 md:translate-x-0 shadow-2xl' : 'translate-y-full translate-x-0 md:translate-y-0 md:-translate-x-full'}`}
      >
        <div className="h-full bg-surface border-r border-border/40 w-full md:w-72 p-6 pt-8 md:pt-12 flex flex-col pb-[110px] md:pb-6 rounded-t-[32px] md:rounded-none">
          {(() => {
            const totalViews = (analytics?.anonymousViews || 0) + (analytics?.recentViewers?.length || 0);
            let heading = "Analytics";
            if (analytics != null) {
              if (totalViews === 0) heading = "Seems you are boring...";
              else if (totalViews <= 10) heading = "Guess someone is getting popular?";
              else heading = "That one popular kid..";
            }
            return <h2 className="text-lg font-medium mb-6 leading-tight">{heading}</h2>;
          })()}
          {currentUser && currentUser.userName === activeUser.username ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
              <div className="bg-surface-2 rounded-xl p-4 border border-border/40 text-center">
                <span className="block text-3xl font-black text-text mb-1">{(analytics?.anonymousViews || 0) + (analytics?.recentViewers?.length || 0)}</span>
                <span className="text-[11px] text-muted  tracking-wider">Total Views</span>
              </div>

              <div>
                <h3 className="text-sm text-text mb-3">Recent Viewers</h3>
                <div className="space-y-3">
                  {analytics?.recentViewers && analytics.recentViewers.length > 0 ? (
                    analytics.recentViewers.map((viewer: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        {viewer.imageUrl || viewer.imageURL ? (
                          <img src={viewer.imageUrl || viewer.imageURL} referrerPolicy="no-referrer" alt={viewer.displayName} className="w-8 h-8 rounded-full bg-surface-2 object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#2A2A2A] border border-white/10 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {viewer.displayName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-text truncate">{viewer.displayName}</p>
                          <p className="text-[10px] text-muted">{new Date(viewer.viewedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted text-center py-4 border border-dashed border-border rounded-lg">No logged-in viewers yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <BarChart2 className="w-12 h-12 text-muted mb-4 opacity-50" />
              <p className="text-sm text-text  mb-1">Access Denied</p>
              <p className="text-xs text-muted">You can only view analytics for your own profile.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Menu Overlay */}
      <div
        className={`fixed md:absolute bottom-[96px] md:bottom-auto left-4 right-4 md:left-28 md:right-auto md:top-1/2 md:-translate-y-1/2 z-50 md:z-40 w-auto md:w-[140px] transition-all duration-300 ease-in-out ${activeOverlay === 'menu' ? 'translate-y-0 md:translate-x-0 md:translate-y-[-50%] opacity-100 shadow-2xl' : 'translate-y-12 md:translate-y-[-50%] md:-translate-x-12 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-surface border md:border border-border/40 md:rounded-xl p-4 md:p-3 w-full flex flex-col gap-3 md:gap-2 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] md:shadow-none">
          {/* Theme Row */}
          <div className="flex border border-border rounded-lg bg-surface/30 p-1 w-full">
            <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${theme === 'light' ? 'bg-surface-2 text-text shadow-sm' : 'text-muted hover:text-text'}`}>
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${theme === 'dark' ? 'bg-surface-2 text-text shadow-sm' : 'text-muted hover:text-text'}`}>
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setTheme('system')} className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${theme === 'system' ? 'bg-surface-2 text-text shadow-sm' : 'text-muted hover:text-text'}`}>
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-px bg-border/40 w-full my-1"></div>

          {/* Action Row */}
          <div className="flex flex-col gap-1">
            {currentUser && currentUser.userName === activeUser.username && (
              <>
                <button
                  onClick={() => { setIsEditModalOpen(true); setActiveOverlay(null) }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs  rounded-lg text-text hover:bg-surface-2 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
                <button
                  onClick={() => { handleExport(); setActiveOverlay(null) }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs  rounded-lg text-text hover:bg-surface-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PNG
                </button>
              </>
            )}

            {currentUser ? (
              <button
                onClick={() => window.location.href = '/logout'}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs  rounded-lg text-red-500/80 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/oauth2/authorization/google'}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs  rounded-lg text-accent hover:bg-accent/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Users Directory Overlay */}
      <div
        className={`fixed md:absolute inset-x-0 bottom-0 md:inset-auto md:top-0 md:left-0 h-[85vh] md:h-full w-full md:w-auto z-50 md:z-40 transition-transform duration-300 ease-in-out ${activeOverlay === 'users' ? 'translate-y-0 md:translate-x-0 shadow-2xl' : 'translate-y-full translate-x-0 md:translate-y-0 md:-translate-x-full'}`}
      >
        <div className="h-full bg-surface border-r border-border/40 w-full md:w-72 pb-[110px] md:pb-0 rounded-t-[32px] md:rounded-none overflow-hidden flex flex-col">
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
          className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity cursor-pointer"
          onClick={() => {
            setActiveOverlay(null)
            setIsIconBarVisible(true)
          }}
        />
      )}

      {/* Main Layout Area */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-28 md:pl-36 md:pr-12 md:py-12 w-full">
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
                      {social.type.toLowerCase() === 'linkedin' ? (
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

            <div className="relative px-8 sm:px-12 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end -mt-16 sm:mt-[120px]">
              {/* Avatar overlapping the banner */}
              <div className="rounded-full bg-gray-50 dark:bg-[#202020] p-2 -ml-0 sm:-ml-2 mt-4 sm:mt-0">
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

              {/* Name & Title */}
              <div className="flex flex-col mt-2 sm:mt-0 pb-4 sm:pb-6 z-10 w-full sm:w-auto items-center sm:items-start text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {activeUser.displayName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400  text-lg mt-1">
                  {activeUser.title}
                </p>
              </div>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

            {/* 1. Contest Rating Widget */}
            <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative min-h-[300px] flex flex-col shadow-sm dark:shadow-none">
              <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans absolute top-5 left-6 z-10">Contest Rating</span>
              {activeUser.contests && activeUser.contests.length > 0 && (
                <span className="absolute top-5 left-1/2 -translate-x-1/2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white z-10" style={{ fontFamily: 'Graphic, sans-serif' }}>
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

            {/* 2. Problems Solved Widget */}
            <ProblemsSolved problems={activeUser.problemsSolved || {}} />

            {/* Row wrapper for Badges & Projects */}
            <div className="md:col-span-2 flex flex-col md:flex-row gap-6 h-auto md:h-[350px] relative">

              {/* 3. Badges Widget Base */}
              <motion.div
                layoutId="badges-widget"
                className="w-full md:w-[calc(50%-12px)] bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative flex flex-col shadow-sm dark:shadow-none min-w-0"
              >
                <div className="flex justify-between items-center absolute top-5 left-6 right-6 z-10">
                  <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans whitespace-nowrap">Badges</span>
                  <button
                    onClick={() => setExpandedWidget('badges')}
                    className="text-[11px] text-gray-400 hover:text-gray-900 dark:hover:text-white tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none whitespace-nowrap"
                  >
                    Expand
                  </button>
                </div>
                <div className="mt-12 flex-1 relative min-h-0">
                  {activeUser.badges && activeUser.badges.length > 0 ? (
                    <BadgeContainer badges={activeUser.badges} isExpanded={false} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted">No badges available</div>
                  )}
                </div>
              </motion.div>

              {/* 4. Project Showcase Widget Base */}
              <motion.div
                layoutId="projects-widget"
                className="w-full md:w-[calc(50%-12px)] bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative flex flex-col shadow-sm dark:shadow-none min-w-0"
              >
                <div className="flex justify-between items-center absolute top-5 left-6 right-6 z-10">
                  <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans whitespace-nowrap">Project Showcase</span>
                  <button
                    onClick={() => setExpandedWidget('projects')}
                    className="text-[11px] text-gray-400 hover:text-gray-900 dark:hover:text-white tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none whitespace-nowrap"
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
                        className="text-[11px] text-gray-400 hover:text-gray-900 dark:hover:text-white tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none whitespace-nowrap"
                      >
                        Collapse
                      </button>
                    </div>
                    <div className="mt-12 flex-1 relative min-h-0 overflow-y-auto">
                      {activeUser.badges && activeUser.badges.length > 0 ? (
                        <BadgeContainer badges={activeUser.badges} isExpanded={true} />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-muted">No badges available</div>
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
                        className="text-[11px] text-gray-400 hover:text-gray-900 dark:hover:text-white tracking-wider transition-colors cursor-pointer bg-transparent border-none outline-none whitespace-nowrap"
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

            {/* 5. Heatmap Widget (Full Width) */}
            <div className="md:col-span-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative min-h-[250px] overflow-hidden shadow-sm dark:shadow-none">
              <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans absolute top-5 left-6 z-10">Heat Map</span>
              <div className="absolute top-5 right-6 z-10 flex items-center gap-3">
                <select
                  value={heatmapPlatform}
                  onChange={togglePlatform}
                  className="bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[13px] tracking-wider rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-white/20 appearance-none cursor-pointer"
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
                  className="bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[13px] tracking-wider rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-white/20 appearance-none cursor-pointer min-w-[100px]"
                  style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="mt-14 overflow-x-auto pt-2">
                <Heatmap data={heatmapData} year={heatmapYear} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
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

      {/* Hidden Export Node */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <ExportCard user={activeUser} banner={activeBanner} />
      </div>

    </div>
  )
}

export default ProfilePage
