import React, { useState, useEffect, type FC } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { User } from "../types"
import Sidebar from "../components/Sidebar"
import Avatar from "../components/ui/avatar"
import BadgeContainer from "../components/BadgeContainer"
import ContestGraph from "../components/ContestGraph"
import Heatmap from "../components/Heatmap"
import { fetchBanners, fetchProfile } from "../lib/api"
import EditProfileModal from "../components/EditProfileModal"
import ProjectShowcase from "../components/ProjectShowcase"
import ProblemsSolved from "../components/ProblemsSolved"
import ExportCard from "../components/ExportCard"
import {
  Menu,
  Pencil,
  BarChart2,
  Users,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Mail,
  Globe,
  Download,
} from "lucide-react"
import confetti from "canvas-confetti"
import scardLogo from "../images/scard.png"
import { useTheme } from "../context/ThemeContext"
import * as htmlToImage from "html-to-image"
import { saveAs } from "file-saver"

interface ProfilePageProps {
  users: User[]
  variant?: "directory" | "standalone"
  initialUserId?: string
  currentUser?: any
}

const ProfilePage: FC<ProfilePageProps> = ({
  users,
  variant = "directory",
  initialUserId,
  currentUser,
}) => {
  const [selectedUserId, setSelectedUserId] = useState(
    initialUserId || users[0]?.id,
  )
  const [activeOverlay, setActiveOverlay] =
    useState<"analytics" | "menu" | "users" | null>(null)
  const [expandedWidget, setExpandedWidget] =
    useState<"badges" | "projects" | null>(null)
  const [isIconBarVisible, setIsIconBarVisible] = useState(true)
  const [localUsers, setLocalUsers] = useState<User[]>(users)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [analytics, setAnalytics] = useState<any>(null)

  const [availableBanners, setAvailableBanners] = useState<any[]>([])
  const [liveUser, setLiveUser] = useState<User | null>(null)

  const selectedUser =
    localUsers.find((u) => u.id === selectedUserId) ?? localUsers[0]
  const matchedUser =
    variant === "standalone"
      ? localUsers.find((u) => u.id === initialUserId)
      : selectedUser
  const activeUser = liveUser || matchedUser || selectedUser
  const activeBanner = availableBanners.find(
    (b) => b.id === activeUser.bannerId,
  )

  useEffect(() => {
    if (
      activeOverlay === "analytics" &&
      currentUser &&
      activeUser &&
      currentUser.userName === activeUser.username
    ) {
      import("../lib/api").then(({ fetchAnalytics }) => {
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
    if (variant === "standalone" && initialUserId) {
      fetchProfile(initialUserId).then(setLiveUser).catch(console.error)
    } else {
      setLiveUser(null)
    }
  }, [variant, initialUserId])

  if (!matchedUser && variant === "standalone" && !liveUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text space-y-4">
        <h2 className="text-2xl ">404 - Profile Not Found</h2>
        <p className="text-muted">
          The profile you're looking for doesn't exist.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="text-accent underline "
        >
          Go Back Home
        </button>
      </div>
    )
  }

  const availableYears = Array.from(
    new Set(
      (activeUser?.rawContributions || []).map((c) => c.date.substring(0, 4)),
    ),
  )
    .sort()
    .reverse()
  if (availableYears.length === 0)
    availableYears.push(new Date().getFullYear().toString())

  // Remove codeforces from available platforms
  const availablePlatforms = Array.from(
    new Set(
      (activeUser?.rawContributions || []).map((c) => c.platform.toLowerCase()),
    ),
  )
    .filter((p) => p !== "codeforces")
    .sort()

  const [heatmapPlatform, setHeatmapPlatform] = useState<string>("all")
  const [heatmapYear, setHeatmapYear] = useState<string>(availableYears[0])

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(heatmapYear)) {
      setHeatmapYear(availableYears[0])
    }
  }, [availableYears.join(","), heatmapYear])

  const togglePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHeatmapPlatform(e.target.value)
  }

  const toggleYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHeatmapYear(e.target.value)
  }

  const backendContribs =
    activeUser.rawContributions
      ?.filter(
        (c) =>
          heatmapPlatform === "all" ||
          c.platform.toLowerCase() === heatmapPlatform,
      )
      ?.filter((c) => c.platform.toLowerCase() !== "codeforces") // strictly remove cf
      ?.filter((c) => c.date.startsWith(heatmapYear))
      .map((c) => ({
        platform: c.platform,
        contributionDate: c.date,
        count: c.count,
      })) || []
  const countMap = new Map<string, number>()
  backendContribs.forEach((c) => {
    countMap.set(
      c.contributionDate,
      (countMap.get(c.contributionDate) || 0) + c.count,
    )
  })
  const heatmapData = Array.from(countMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))

  const handleExport = () => {
    const node = document.getElementById("export-card-node")
    if (node) {
      htmlToImage
        .toPng(node, { pixelRatio: 2, quality: 1.0 })
        .then(function (dataUrl) {
          saveAs(dataUrl, `${activeUser.username}-scard.png`)
        })
        .catch(function (error) {
          console.error("Failed to export image:", error)
        })
    }
  }


  return (
    <div
      className="flex bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#111] dark:to-[#1a1a1a] text-gray-900 dark:text-gray-200 relative overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {!isIconBarVisible && (
        <div
          className="absolute left-0 top-0 w-8 h-full z-[60] cursor-pointer"
          onMouseEnter={() => setIsIconBarVisible(true)}
        />
      )}

      {/* Floating Icon Sidebar (Desktop) */}
      <nav
        className={`hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-[64px] py-8 bg-white/80 dark:bg-[#252525]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-[32px] flex-col items-center gap-10 z-[60] shadow-lg transition-transform duration-300 ease-in-out ${
          isIconBarVisible ? "translate-x-0" : "-translate-x-[150%]"
        }`}
        onMouseLeave={() => {
          if (activeOverlay !== null && activeOverlay !== "menu") {
            setIsIconBarVisible(false)
          }
        }}
      >
        <img
          onClick={() => (window.location.href = "/")}
          src={scardLogo}
          className="w-8 h-8 rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity"
          alt="Scard Logo"
        />

        <div className="flex flex-col gap-10 flex-1 mt-6">
          {currentUser &&
            activeUser &&
            currentUser.userName === activeUser.username && (
              <button
                onClick={() => {
                  setActiveOverlay("analytics")
                  setIsIconBarVisible(false)
                }}
                className={`transition-colors ${
                  activeOverlay === "analytics"
                    ? "text-accent"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Analytics"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
            )}
          <button
            onClick={() => {
              activeOverlay === "menu"
                ? setActiveOverlay(null)
                : setActiveOverlay("menu")
              setIsIconBarVisible(true)
            }}
            className={`transition-colors ${
              activeOverlay === "menu"
                ? "text-accent"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setActiveOverlay("users")
              setIsIconBarVisible(false)
            }}
            className={`transition-colors ${
              activeOverlay === "users"
                ? "text-accent"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
            title="Users"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Nav... */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-[72px] bg-white/90 dark:bg-[#252525]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-[32px] flex items-center justify-around z-[60] shadow-2xl px-4">
        <img
          onClick={() => (window.location.href = "/")}
          src={scardLogo}
          className="w-8 h-8 rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity"
          alt="Scard Logo"
        />
        {currentUser &&
          activeUser &&
          currentUser.userName === activeUser.username && (
            <button
              onClick={() => {
                setActiveOverlay(
                  activeOverlay === "analytics" ? null : "analytics",
                )
              }}
              className={`transition-colors p-3 rounded-full ${
                activeOverlay === "analytics"
                  ? "bg-accent/10 text-accent"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <BarChart2 className="w-6 h-6" />
            </button>
          )}
        <button
          onClick={() => {
            setActiveOverlay(activeOverlay === "menu" ? null : "menu")
          }}
          className={`transition-colors p-3 rounded-full ${
            activeOverlay === "menu"
              ? "bg-accent/10 text-accent"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Menu className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            setActiveOverlay(activeOverlay === "users" ? null : "users")
          }}
          className={`transition-colors p-3 rounded-full ${
            activeOverlay === "users"
              ? "bg-accent/10 text-accent"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Users className="w-6 h-6" />
        </button>
      </nav>

      {/* Menu Overlay */}
      <div
        className={`fixed md:absolute bottom-[96px] md:bottom-auto left-4 right-4 md:left-28 md:right-auto md:top-1/2 md:-translate-y-1/2 z-50 md:z-40 w-auto md:w-[140px] transition-all duration-300 ease-in-out ${
          activeOverlay === "menu"
            ? "translate-y-0 md:translate-x-0 md:translate-y-[-50%] opacity-100 shadow-2xl"
            : "translate-y-12 md:translate-y-[-50%] md:-translate-x-12 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-surface border md:border border-border/40 md:rounded-xl p-4 md:p-3 w-full flex flex-col gap-3 md:gap-2 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] md:shadow-none">
          <div className="flex border border-border rounded-lg bg-surface/30 p-1 w-full">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${
                theme === "light"
                  ? "bg-surface-2 text-text shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${
                theme === "dark"
                  ? "bg-surface-2 text-text shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex-1 flex items-center justify-center py-1.5 text-xs rounded-md transition-all ${
                theme === "system"
                  ? "bg-surface-2 text-text shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-px bg-border/40 w-full my-1"></div>

          <div className="flex flex-col gap-1">
            {currentUser && currentUser.userName === activeUser.username && (
              <>
                <button
                  onClick={() => {
                    setIsEditModalOpen(true)
                    setActiveOverlay(null)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs  rounded-lg text-text hover:bg-surface-2 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    handleExport()
                    setActiveOverlay(null)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs  rounded-lg text-text hover:bg-surface-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PNG
                </button>
              </>
            )}

            {currentUser ? (
              <button
                onClick={() => (window.location.href = "/logout")}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs  rounded-lg text-red-500/80 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            ) : (
              <button
                onClick={() =>
                  (window.location.href = "/oauth2/authorization/google")
                }
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs  rounded-lg text-accent hover:bg-accent/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log in
              </button>
            )}
          </div>
        </div>
      </div>

      {activeOverlay !== null && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity cursor-pointer"
          onClick={() => {
            setActiveOverlay(null)
            setIsIconBarVisible(true)
          }}
        />
      )}

      {/* Main Layout Area - Minimalist Card Centered */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:py-12 w-full flex justify-center items-start custom-scrollbar">
        {/* The Card */}
        <div className="w-full max-w-[640px] bg-white dark:bg-[#1C1C1C] rounded-[32px] shadow-2xl dark:shadow-none border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col mb-24 md:mb-0 relative">
          {/* Banner */}
          <div
            className="w-full h-[180px] bg-gray-200 dark:bg-[#2A2A2A] relative"
            style={
              activeBanner
                ? {
                    background: activeBanner.cssBackground,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
          >
            {/* Socials inside banner bottom right */}
            {activeUser.customSocials &&
              activeUser.customSocials.length > 0 && (
                <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                  {activeUser.customSocials.map((social, idx) => (
                    <a
                      key={idx}
                      href={
                        social.type.toLowerCase() === "email" ||
                        social.type.toLowerCase() === "mail"
                          ? `mailto:${social.url}`
                          : social.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full transition-colors text-white shadow-sm"
                      title={social.type}
                    >
                      {social.type.toLowerCase() === "linkedin" ? (
                        <svg
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      ) : social.type.toLowerCase() === "twitter" ? (
                        <svg
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ) : social.type.toLowerCase() === "email" ||
                        social.type.toLowerCase() === "mail" ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </a>
                  ))}
                </div>
              )}
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col items-center -mt-16 relative z-10 text-center">
              <Avatar
                initials={activeUser.initials}
                color={activeUser.color}
                src={activeUser.imageURL}
                asciiArt={activeUser.asciiArt}
                size="xl"
                isOnline={activeUser.isOnline}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-[#1C1C1C] shadow-lg bg-white dark:bg-[#1C1C1C]"
              />
              <div className="mt-4 flex items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {activeUser.displayName}
                </h1>
                {activeUser.pin && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 self-center">
                    {activeUser.pin}
                  </span>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-[15px] mt-1 font-medium">
                {activeUser.title}
              </p>
            </div>

            <div className="w-full h-px bg-gray-100 dark:bg-white/5 my-8"></div>

            {/* Sections */}
            <div className="flex flex-col gap-8">
              {/* Heatmap Section */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[14px] font-semibold tracking-wide uppercase text-gray-400 dark:text-gray-500">
                    Activity
                  </h3>
                  <div className="flex gap-2">
                    <select
                      value={heatmapPlatform}
                      onChange={togglePlatform}
                      className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-[12px] rounded-md px-2 py-1 outline-none"
                    >
                      <option value="all">All</option>
                      {availablePlatforms.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={heatmapYear}
                      onChange={toggleYear}
                      className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300 text-[12px] rounded-md px-2 py-1 outline-none"
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-[#252525] rounded-2xl p-4 overflow-x-auto border border-gray-100 dark:border-transparent">
                  <Heatmap data={heatmapData} year={heatmapYear} />
                </div>
              </section>

              {/* Problems Solved */}
              {activeUser.problemsSolved &&
                Object.keys(activeUser.problemsSolved).length > 0 && (
                  <section>
                    <h3 className="text-[14px] font-semibold tracking-wide uppercase text-gray-400 dark:text-gray-500 mb-4">
                      Problem Solving
                    </h3>
                    <div className="bg-gray-50 dark:bg-[#252525] rounded-2xl p-4 border border-gray-100 dark:border-transparent">
                      <ProblemsSolved problems={activeUser.problemsSolved} />
                    </div>
                  </section>
                )}

              {/* Projects */}
              {activeUser.projects && activeUser.projects.length > 0 && (
                <section>
                  <h3 className="text-[14px] font-semibold tracking-wide uppercase text-gray-400 dark:text-gray-500 mb-4">
                    Projects
                  </h3>
                  <ProjectShowcase
                    projects={activeUser.projects}
                    isExpanded={false}
                    onToggleExpand={() => {}}
                  />
                </section>
              )}

              {/* Badges */}
              {activeUser.badges && activeUser.badges.length > 0 && (
                <section>
                  <h3 className="text-[14px] font-semibold tracking-wide uppercase text-gray-400 dark:text-gray-500 mb-4">
                    Badges
                  </h3>
                  <div className="bg-gray-50 dark:bg-[#252525] rounded-2xl p-4 border border-gray-100 dark:border-transparent">
                    <BadgeContainer
                      badges={activeUser.badges}
                      isExpanded={false}
                    />
                  </div>
                </section>
              )}
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
            if (variant === "standalone") {
              setLiveUser(updatedUser)
            } else {
              const newUsers = [...localUsers]
              const idx = newUsers.findIndex((u) => u.id === updatedUser.id)
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
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <ExportCard user={activeUser} banner={activeBanner} />
      </div>
    </div>
  )
}

export default ProfilePage
