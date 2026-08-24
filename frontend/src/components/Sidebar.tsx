import { useState, type FC } from "react"
import type { User } from "../types"
import Avatar from "./ui/avatar"
import confetti from "canvas-confetti"

interface SidebarProps {
  users: User[]
  selectedUserId: string
  onSelectUser: (id: string) => void
  currentUser?: import('../types').MeResponse | null
}

const Sidebar: FC<SidebarProps> = ({
  users,
  selectedUserId,
  onSelectUser,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"new" | "all">("new")

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
      if (activeTab === "new") {
        return a.joinedDaysAgo - b.joinedDaysAgo
      } else {
        return a.displayName.localeCompare(b.displayName)
      }
    })

  return (
    <div className="w-full md:w-72 flex-shrink-0 flex flex-col h-full bg-surface text-text border-r border-border/40 select-none">
      {/* Search Input Section */}
      <div className="p-4 pb-2 space-y-4">
        <div className="flex items-center justify-between text-xs text-muted relative">
          <input
            type="text"
            placeholder="Explore people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-2/60 dark:bg-black/20 border border-border/40 rounded-lg text-text placeholder-muted/60 text-xs px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-[10px] text-muted hover:text-text cursor-pointer ml-1"
            >
              Done
            </button>
          )}
        </div>

        {/* Tab Group */}
        <div className="flex justify-center gap-6 border-b border-border/25 pb-2 text-[11px] font-semibold text-muted">
          <button
            onClick={() => setActiveTab("new")}
            className={`cursor-pointer hover:text-text transition-colors capitalize ${
              activeTab === "new"
                ? "text-text border-b border-text -mb-[9px] pb-[7px]"
                : ""
            }`}
          >
            New
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`cursor-pointer hover:text-text transition-colors capitalize ${
              activeTab === "all"
                ? "text-text border-b border-text -mb-[9px] pb-[7px]"
                : ""
            }`}
          >
            All
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
                  ? "bg-surface-2 border border-border/60 text-text"
                  : "hover:bg-surface-2/40 text-muted hover:text-text border border-transparent"
              }`}
            >
              <Avatar
                initials={user.initials}
                color={user.color}
                src={user.imageURL}

                size="md"
                isOnline={user.isOnline}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-1.5 overflow-hidden">
                  <div className="text-xs font-semibold truncate text-text">
                    {user.displayName}
                  </div>
                  {user.pin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent selecting the user when clicking the pin
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x =
                          (rect.left + rect.width / 2) / window.innerWidth
                        const y =
                          (rect.top + rect.height / 2) / window.innerHeight
                        confetti({
                          origin: { x, y },
                          particleCount: 60,
                          spread: 50,
                          colors: ["#a855f7", "#d8b4fe", "#c084fc", "#f3e8ff"],
                        })
                      }}
                      className="inline-flex items-center justify-center text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border border-purple-500 bg-gradient-to-r from-transparent to-purple-500/20 text-purple-600 dark:text-purple-400 shadow-sm shrink-0 mt-[1px] cursor-pointer hover:to-purple-500/30 transition-colors"
                    >
                      {user.pin}
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-muted truncate">
                  Joined {user.joinedText || "today"}
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
