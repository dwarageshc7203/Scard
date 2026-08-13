import React, { useState, useEffect, type FC } from 'react'
import type { User } from '../types'
import Sidebar from '../components/Sidebar'
import Avatar from '../components/ui/avatar'
import BadgeContainer from '../components/BadgeContainer'
import ContestGraph from '../components/ContestGraph'
import Heatmap from '../components/Heatmap'
import { mapContributionsToHeatmap } from '../lib/api'
import EditProfileModal from '../components/EditProfileModal'
import { Menu, Pencil, BarChart2, Users } from 'lucide-react'
import scardLogo from '../images/scard.png'

interface ProfilePageProps {
  users: User[]
  variant?: 'directory' | 'standalone'
  initialUserId?: string
  currentUser?: any
}

const ProfilePage: FC<ProfilePageProps> = ({ users, variant = 'directory', initialUserId, currentUser }) => {
  const [selectedUserId, setSelectedUserId] = useState(initialUserId || users[0]?.id)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [localUsers, setLocalUsers] = useState<User[]>(users)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [heatmapPlatforms, setHeatmapPlatforms] = useState<string[]>(['github', 'leetcode', 'codeforces'])

  useEffect(() => {
    setLocalUsers(users)
  }, [users])

  const selectedUser = localUsers.find((u) => u.id === selectedUserId) ?? localUsers[0]
  const activeUser = variant === 'standalone' ? (localUsers.find(u => u.id === initialUserId) || localUsers[0]) : selectedUser

  const [heatmapPlatform, setHeatmapPlatform] = useState<string>('all')
  const [heatmapYear, setHeatmapYear] = useState<string>(new Date().getFullYear().toString())

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
  const { heatmapData } = mapContributionsToHeatmap(backendContribs, 'All')

  return (
    <div className="flex bg-gray-50 dark:bg-[#202020] text-gray-900 dark:text-gray-200 relative overflow-hidden transition-colors duration-300" style={{ height: '100vh' }}>

      {/* Floating Icon Sidebar */}
      <nav className="absolute left-6 top-1/2 -translate-y-1/2 w-[64px] py-8 bg-[#252525] border border-white/10 rounded-[32px] flex flex-col items-center gap-10 z-50 shadow-2xl">
        <img src={scardLogo} className="w-8 h-8 rounded-[8px]" alt="Scard Logo" />

        <div className="flex flex-col gap-10 flex-1 mt-6">
          <button className="text-gray-400 hover:text-white transition-colors" title="Activity">
            <BarChart2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Directory"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors" title="Network">
            <Users className="w-5 h-5" />
          </button>
        </div>

        {currentUser && currentUser.userName === selectedUser.username && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-gray-400 hover:text-white transition-colors mt-8"
            title="Edit Profile"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
      </nav>

      {/* Sliding Directory Overlay */}
      <div
        className={`absolute top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        <div className="h-full bg-surface border-r border-border/40 pl-24 w-[340px]">
          <Sidebar
            users={localUsers}
            selectedUserId={selectedUserId}
            onSelectUser={(id) => {
              setSelectedUserId(id)
              setSidebarOpen(false)
            }}
            currentUser={currentUser}
          />
        </div>
      </div>

      {/* Click outside overlay to close directory */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Layout Area */}
      <main className="flex-1 overflow-y-auto pl-28 pr-6 md:pl-36 md:pr-12 py-12">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Hero Banner & Overlapping Avatar */}
          <div className="relative pt-[40px]">
            {/* Banner Background */}
            <div className="absolute top-0 left-0 right-0 h-[220px] bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none transition-colors duration-300" />

            <div className="relative px-8 sm:px-12 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end -mt-16 sm:mt-[120px]">
              {/* Avatar overlapping the banner */}
              <div className="rounded-full bg-gray-50 dark:bg-[#202020] p-2 -ml-2 shadow-2xl transition-colors duration-300">
                <Avatar
                  initials={selectedUser.initials}
                  color={selectedUser.color}
                  size="xl"
                  isOnline={selectedUser.isOnline}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full"
                />
              </div>

              {/* Name & Title */}
              <div className="flex flex-col mt-4 sm:mt-0 pb-4 sm:pb-6 z-10 w-full sm:w-auto">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors duration-300">
                  {activeUser.displayName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg mt-1 transition-colors duration-300">
                  {activeUser.title}
                </p>
              </div>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

            {/* Contest Rating Widget */}
            <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative min-h-[300px] flex flex-col shadow-sm dark:shadow-none transition-colors duration-300">
              <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans absolute top-5 left-6 z-10">Contest Rating</span>
              <div className="mt-10 flex-1 relative flex items-center justify-center">
                {selectedUser.contests && selectedUser.contests.length > 0 ? (
                  <ContestGraph contests={selectedUser.contests} />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted">No contests available</div>
                )}
              </div>
            </div>

            {/* Badges Widget */}
            <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative min-h-[300px] flex flex-col shadow-sm dark:shadow-none transition-colors duration-300">
              <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans absolute top-5 left-6 z-10">Badges</span>
              <div className="mt-12 flex-1 relative">
                {selectedUser.badges && selectedUser.badges.length > 0 ? (
                  <BadgeContainer badges={selectedUser.badges} />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted">No badges available</div>
                )}
              </div>
            </div>
          </div>

          {/* Full Width Heatmap Widget */}
          <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-[20px] p-6 relative min-h-[250px] overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
            <span className="text-[15px] text-gray-600 dark:text-gray-400 font-sans absolute top-5 left-6 z-10">Heat Map</span>

            {/* Switchers (Top Right) */}
            <div className="absolute top-5 right-6 z-10 flex items-center gap-3">
              <select
                value={heatmapPlatform}
                onChange={togglePlatform}
                className="bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider font-bold rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-white/20 appearance-none cursor-pointer"
                style={{ paddingRight: '2rem', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="all">Current (All)</option>
                <option value="github">GitHub</option>
                <option value="leetcode">LeetCode</option>
                <option value="codeforces">Codeforces</option>
              </select>

              <select
                value={heatmapYear}
                onChange={toggleYear}
                className="bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[11px] uppercase tracking-wider font-bold rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-white/20 appearance-none cursor-pointer"
                style={{ paddingRight: '2rem', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            <div className="mt-14 overflow-x-auto pt-2">
              <Heatmap data={heatmapData} year={heatmapYear} />
            </div>
          </div>

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedUser) => {
            setLocalUsers((prev) =>
              prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            )
          }}
        />
      )}
    </div>
  )
}

export default ProfilePage
