import React from 'react'
import Sidebar from '../Sidebar'
import { User } from '../../types'

interface UsersOverlayProps {
  isOpen: boolean
  localUsers: User[]
  selectedUserId?: string
  onSelectUser: (id: string) => void
  currentUser?: import('../../types').MeResponse | null
}

const UsersOverlay: React.FC<UsersOverlayProps> = ({ isOpen, localUsers, selectedUserId, onSelectUser, currentUser }) => {
  return (
    <div
      className={`absolute inset-y-0 left-0 h-full w-full md:w-72 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
    >
      <div className="h-full bg-white dark:bg-[#252525] border-r border-gray-200 dark:border-white/10 w-full overflow-hidden flex flex-col">
        <Sidebar
          users={localUsers}
          selectedUserId={selectedUserId}
          onSelectUser={onSelectUser}
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}

export default UsersOverlay
