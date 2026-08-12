import React, { useState, useEffect, type FC } from 'react'
import type { User } from '../types'
import Sidebar from '../components/Sidebar'
import Avatar from '../components/ui/avatar'
import Badge from '../components/ui/badge'
import Heatmap from '../components/Heatmap'
import EditProfileModal from '../components/EditProfileModal'
import { Menu, Pencil, FileText, Globe, ExternalLink } from 'lucide-react'

// Simple SVG Icons for coding platforms matching the requested look
const GitHubIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

const LeetCodeIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.102 17.93l-2.69 2.607c-.466.451-1.111.696-1.744.696a2.285 2.285 0 0 1-1.666-.696L5.352 16.03a2.38 2.38 0 0 1 0-3.327l6.652-6.52a2.286 2.286 0 0 1 1.666-.696c.633 0 1.278.245 1.744.696l2.69 2.607a.382.382 0 0 1 0 .54l-1.1 1.069a.377.377 0 0 1-.533 0l-2.8-2.713a.759.759 0 0 0-.583-.231c-.198 0-.401.077-.556.231l-5.902 5.784a.82.82 0 0 0 0 1.15l5.902 5.783c.155.155.358.232.556.232.222 0 .43-.082.583-.232l2.8-2.712a.38.38 0 0 1 .533 0l1.1 1.068a.382.382 0 0 1 0 .541zm3.626-3.623l-1.1 1.069a.382.382 0 0 1-.533 0l-2.8-2.712a.763.763 0 0 0-.584-.232c-.198 0-.4.077-.555.232l-1.1 1.077a.377.377 0 0 1-.534 0L9.82 9.997a.382.382 0 0 1 0-.54l1.1-1.07a.377.377 0 0 1 .533 0l2.8 2.713c.155.154.358.231.556.231.22 0 .428-.083.583-.231l4.137-4.055a.38.38 0 0 1 .533 0l1.1 1.07a.382.382 0 0 1 0 .54l-5.636 5.626z" />
  </svg>
)

const CodeForcesIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 12h3V24h-3zM10.5 0h3v24h-3zM16.5 6h3v18h-3z" />
  </svg>
)

interface ProfilePageProps {
  users: User[]
  variant: 'directory' | 'standalone'
  initialUserId?: string
  currentUser?: any
}

const ProfilePage: FC<ProfilePageProps> = ({ users, variant, initialUserId, currentUser }) => {
  const [selectedUserId, setSelectedUserId] = useState(initialUserId ?? users[0].id)
  const [sidebarOpen, setSidebarOpen] = useState(variant === 'directory')
  const [localUsers, setLocalUsers] = useState<User[]>(users)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    setLocalUsers(users)
  }, [users])

  const selectedUser = localUsers.find((u) => u.id === selectedUserId) ?? localUsers[0]

  return (
    <div className="flex bg-bg/95 relative overflow-hidden" style={{ height: '100vh' }}>

      {/* Sidebar with toggle width */}
      <div
        className={`transition-all duration-300 border-r border-border/40 overflow-hidden h-full ${sidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
          }`}
      >
        <Sidebar
          users={localUsers}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          currentUser={currentUser}
        />
      </div>

      {/* Main panel content matching the reference image layout */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative bg-surface">
        <div className="max-w-[720px] mx-auto space-y-8 pb-24 text-text/80 text-[13px] leading-relaxed">

          {/* Top Profile Header */}
          <div className="flex items-center gap-5">
            <div className="relative">

              <Avatar
                initials={selectedUser.initials}
                color={selectedUser.color}
                size="xl"
                isOnline={selectedUser.isOnline}
                className="w-16 h-16 sm:w-20 sm:h-20"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                {selectedUser.displayName}
              </h1>
              <p className="text-xs text-muted font-medium">
                {selectedUser.title}
              </p>
            </div>
          </div>

          {/* Status Message / Looking for a job */}
          {selectedUser.statusMessage && (
            <div className="p-4 rounded-xl bg-surface border border-border/60 max-w-xl">
              <div className="text-xs font-semibold text-text">
                {selectedUser.statusMessage}
              </div>
              <div className="text-[10px] text-muted mt-1">
                {selectedUser.statusTime || 'Recently'}
              </div>
            </div>
          )}

          {/* Section fields */}
          <div className="space-y-8 pt-4">

            {/* Heatmap Field */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted uppercase tracking-widest font-bold block">Heatmap (Consolidated)</span>
              <div className="p-4 rounded-xl bg-surface border border-border/40 overflow-hidden">
                <Heatmap data={selectedUser.heatmapData} />
              </div>
            </div>

            {/* Badges Field */}
            {selectedUser.badges && selectedUser.badges.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-muted uppercase tracking-widest font-bold block">Badges</span>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.badges.map((badge, idx) => (
                    <Badge key={idx} variant={badge.platform} className="text-[10px] font-medium py-1 px-2.5">
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contests Field */}
            {selectedUser.contests && selectedUser.contests.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-muted uppercase tracking-widest font-bold block">Contests</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedUser.contests.map((contest, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border/40 bg-surface/30">
                      <div className="text-xs font-bold text-text truncate">{contest.name}</div>
                      <div className="text-[10px] text-muted mt-1">
                        Rating: <span className="text-text font-semibold">{contest.rating}</span> · Rank: {contest.rank}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coding Platforms / Socials Field */}
            {selectedUser.socials && (
              <div className="space-y-2">
                <span className="text-[10px] text-muted uppercase tracking-widest font-bold block">Coding Platforms</span>
                <div className="flex items-center gap-4">
                  {selectedUser.socials.github && (
                    <a
                      href={selectedUser.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface border border-border/60 hover:border-text text-text hover:bg-surface-2 transition-all"
                      title="GitHub Profile"
                    >
                      <GitHubIcon className="w-5 h-5" />
                    </a>
                  )}
                  {selectedUser.socials.leetcode && (
                    <a
                      href={selectedUser.socials.leetcode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface border border-border/60 hover:border-text text-text hover:bg-surface-2 transition-all"
                      title="LeetCode Profile"
                    >
                      <LeetCodeIcon className="w-5 h-5" />
                    </a>
                  )}
                  {selectedUser.socials.codeforces && (
                    <a
                      href={selectedUser.socials.codeforces}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface border border-border/60 hover:border-text text-text hover:bg-surface-2 transition-all"
                      title="Codeforces Profile"
                    >
                      <CodeForcesIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Floating menu buttons outside the sidebar sliding dynamically */}
      <div
        className="absolute bottom-6 flex items-center gap-3.5 z-40 transition-all duration-300"
        style={{ left: sidebarOpen ? '280px' : '24px' }}
      >
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="w-11 h-11 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text hover:bg-surface-2 hover:border-text transition-all duration-200 cursor-pointer shadow-lg outline-none"
          aria-label="Toggle Directory Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="w-11 h-11 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text hover:bg-surface-2 hover:border-text transition-all duration-200 cursor-pointer shadow-lg outline-none"
          aria-label="Edit Profile"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

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
