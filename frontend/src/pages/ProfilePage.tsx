import React, { useState, useEffect, type FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '../types'
import Button from '../components/ui/button'
import { fetchBanners, fetchProfile, logoutUser } from '../lib/api'
import EditProfileModal from '../components/EditProfileModal'
import ExportCard from '../components/ExportCard'
import { Menu, Pencil, BarChart2, Users, Sun, Moon, Monitor, LogOut, Download, ArrowLeft } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'sonner'
import * as htmlToImage from 'html-to-image'
import { saveAs } from 'file-saver'
import Image from "../components/ui/Image"
import AnalyticsOverlay from '../components/profile/AnalyticsOverlay'
import UsersOverlay from '../components/profile/UsersOverlay'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileWidgets from '../components/profile/ProfileWidgets'
import HeatmapWidget from '../components/profile/HeatmapWidget'

interface ProfilePageProps {
  users: User[]
  variant?: 'directory' | 'standalone'
  initialUserId?: string
  currentUser?: import('../../types').MeResponse | null
}

const ProfilePage: FC<ProfilePageProps> = ({ users, variant = 'directory', initialUserId, currentUser }) => {
  const [selectedUserId, setSelectedUserId] = useState(initialUserId || users[0]?.id)
  const [activeOverlay, setActiveOverlay] = useState<'analytics' | 'menu' | 'users' | null>(null)
  const [expandedWidget, setExpandedWidget] = useState<'badges' | 'projects' | null>(null)
  const [localUsers, setLocalUsers] = useState<User[]>(users)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { theme, setTheme } = useTheme()
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

  const isLeetcodeHeatmapEnabled = activeUser?.platformPreferences?.leetcode?.showHeatmap ?? true
  const availablePlatforms = Array.from(new Set((activeUser?.rawContributions || [])
    .map(c => c.platform.toLowerCase())
    .filter(p => {
      if (p === 'github' && !hasGithub) return false;
      if (p === 'leetcode' && (!hasLeetCode || !isLeetcodeHeatmapEnabled)) return false;
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

  useEffect(() => {
    if (isEditModalOpen && activeOverlay !== null) setActiveOverlay(null)
  }, [isEditModalOpen])

  useEffect(() => {
    if (activeOverlay !== null && isEditModalOpen) setIsEditModalOpen(false)
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

  const backendContribs = activeUser.rawContributions
    ?.filter(c => isLeetcodeHeatmapEnabled || c.platform.toLowerCase() !== 'leetcode')
    ?.filter(c => heatmapPlatform === 'all' || c.platform.toLowerCase() === heatmapPlatform)
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
      
      {isOwnProfile && (
        <aside className="w-full md:w-[64px] h-[56px] md:h-full flex flex-row md:flex-col items-center justify-around md:justify-between px-2 sm:px-6 md:px-0 py-0 md:py-6 border-t md:border-t-0 md:border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#252525] shrink-0 fixed md:relative bottom-0 left-0 right-0 z-[60]">
          
          {/* Logo - Desktop Only */}
          <div className="hidden md:flex flex-col flex-1 items-center justify-start w-full">
            <Image onClick={() => window.location.href = '/'} src="/logos/scard-1.png" className="w-8 h-8 rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity" alt="Scard Logo" />
          </div>
          
          {/* Center Tools */}
          <div className="flex flex-row md:flex-col gap-0 md:gap-10 flex-1 md:flex-none justify-around md:justify-center items-center w-full">
            <button onClick={() => setActiveOverlay(activeOverlay === 'analytics' ? null : 'analytics')} className={`transition-colors ${activeOverlay === 'analytics' ? 'text-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`} title="Analytics">
              <BarChart2 className="w-5 h-5" />
            </button>
            <div className="relative flex justify-center">
              <button onClick={() => setActiveOverlay(activeOverlay === 'menu' ? null : 'menu')} className={`transition-colors ${activeOverlay === 'menu' ? 'text-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`} title="Menu">
                <Menu className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {activeOverlay === 'menu' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute bottom-16 left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-auto md:left-[60px] md:top-1/2 md:-translate-y-1/2 bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 p-2 w-[160px] rounded-xl shadow-2xl flex flex-col gap-2 z-[70]">
                    <div className="flex border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-[#202020] p-1 w-full">
                      <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Sun className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Moon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setTheme('system')} className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-[#333333] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><Monitor className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-2 text-xs bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"><Download className="w-3.5 h-3.5" /> Export PNG</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setActiveOverlay(activeOverlay === 'users' ? null : 'users')} className={`transition-colors ${activeOverlay === 'users' ? 'text-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`} title="Users">
              <Users className="w-5 h-5" />
            </button>
            <button onClick={() => setIsEditModalOpen(true)} className="transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white" title="Edit Profile">
              <Pencil className="w-5 h-5" />
            </button>
            
            {/* Logout - Mobile Only */}
            <button onClick={logoutUser} className="md:hidden transition-colors text-gray-500 hover:text-red-500 dark:hover:text-red-400" title="Log Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Logout - Desktop Only */}
          <div className="hidden md:flex flex-col flex-1 items-center justify-end w-full">
            <button onClick={logoutUser} className="transition-colors text-gray-500 hover:text-red-500 dark:hover:text-red-400" title="Log Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex relative overflow-hidden w-full">
        {!isOwnProfile && (
          <div className="absolute top-6 left-6 z-[70] hidden md:block">
            <Button variant="outline" className="flex items-center gap-2 bg-white/80 dark:bg-[#252525]/80 backdrop-blur-sm border-gray-200 dark:border-white/10" onClick={() => window.location.href = currentUser ? `/${currentUser?.userName}` : `/`}>
              <ArrowLeft className="w-4 h-4" /> {currentUser ? "Go back" : "Create your own profile?"}
            </Button>
          </div>
        )}

        <AnalyticsOverlay isOpen={activeOverlay === 'analytics'} isOwnProfile={!!isOwnProfile} analytics={analytics} />
        <UsersOverlay isOpen={activeOverlay === 'users'} localUsers={localUsers} selectedUserId={selectedUserId} onSelectUser={(id) => { variant === 'standalone' ? window.location.href = `/${id}` : setSelectedUserId(id) }} currentUser={currentUser} />

        {activeOverlay !== null && (
          <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity cursor-pointer" onClick={() => setActiveOverlay(null)} />
        )}

        <main className="flex-1 overflow-y-auto px-4 pt-6 pb-28 md:px-12 md:py-12 w-full relative z-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 w-full">
            <ProfileHeader activeUser={activeUser} activeBanner={activeBanner} />
            <ProfileWidgets activeUser={activeUser} hasLeetCode={hasLeetCode} hasProjects={hasProjects} expandedWidget={expandedWidget} setExpandedWidget={setExpandedWidget} />
            {(hasGithub || (hasLeetCode && isLeetcodeHeatmapEnabled)) && (
              <HeatmapWidget heatmapData={heatmapData} availablePlatforms={availablePlatforms} availableYears={availableYears} heatmapPlatform={heatmapPlatform} heatmapYear={heatmapYear} setHeatmapPlatform={setHeatmapPlatform} setHeatmapYear={setHeatmapYear} />
            )}
          </div>
        </main>
      </div>

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

      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <ExportCard user={activeUser} banner={activeBanner} />
      </div>
    </div>
  )
}

export default ProfilePage
