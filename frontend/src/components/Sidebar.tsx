import { useState, type FC } from 'react'
import type { User } from '../data/mockData'
import Avatar from './ui/avatar'

interface SidebarProps {
  users: User[]
  selectedUserId: string
  onSelectUser: (id: string) => void
}

const Sidebar: FC<SidebarProps> = ({
  users,
  selectedUserId,
  onSelectUser
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'activity' | 'new' | 'az'>('new')

  // Filter & Sort logic
  const filteredUsers = users
    .filter((u) => {
      const query = searchTerm.toLowerCase()
      return (
        u.displayName.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        (u.title && u.title.toLowerCase().includes(query)) ||
        (u.designation && u.designation.toLowerCase().includes(query))
      )
    })
    .sort((a, b) => {
      if (activeTab === 'activity') {
        return b.totalContributions - a.totalContributions
      } else if (activeTab === 'new') {
        return a.joinedDaysAgo - b.joinedDaysAgo
      } else {
        return a.displayName.localeCompare(b.displayName)
      }
    })

  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-full bg-[#141414] text-text border-r border-border/40 select-none">
      {/* Search Input Section */}
      <div className="p-4 pb-2 space-y-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <input
            type="text"
            placeholder="Explore people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-text placeholder-muted/60 text-xs py-1.5 focus:outline-none border-b border-border/40"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[10px] text-muted hover:text-text cursor-pointer ml-1"
            >
              Done
            </button>
          )}
        </div>

        {/* Tab Group */}
        <div className="flex gap-4 border-b border-border/25 pb-2 text-[11px] font-semibold text-muted">
          <button
            onClick={() => setActiveTab('activity')}
            className={`cursor-pointer hover:text-text transition-colors capitalize ${
              activeTab === 'activity' ? 'text-text border-b border-text -mb-[9px] pb-[7px]' : ''
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`cursor-pointer hover:text-text transition-colors capitalize ${
              activeTab === 'new' ? 'text-text border-b border-text -mb-[9px] pb-[7px]' : ''
            }`}
          >
            New
          </button>
          <button
            onClick={() => setActiveTab('az')}
            className={`cursor-pointer hover:text-text transition-colors capitalize ${
              activeTab === 'az' ? 'text-text border-b border-text -mb-[9px] pb-[7px]' : ''
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Scrollable User List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {filteredUsers.map((user) => {
          const isSelected = user.id === selectedUserId
          return (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'bg-surface-2 border border-border/60 text-text'
                  : 'hover:bg-surface-2/40 text-muted hover:text-text border border-transparent'
              }`}
            >
              <Avatar
                initials={user.initials}
                color={user.color}
                size="sm"
                isOnline={user.isOnline}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate text-text">
                  {user.displayName}
                </div>
                <div className="text-[10px] text-muted truncate">
                  Joined {user.joinedDaysAgo} days ago
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Sidebar
