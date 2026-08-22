import { useEffect, useState, useRef } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom"
import ErrorBoundary from "./components/ErrorBoundary"
import NavBar from "./components/NavBar"
import LandingPage from "./pages/LandingPage"
import ProfilePage from "./pages/ProfilePage"
import OnboardingSlideshow from "./pages/OnboardingSlideshow"
import ThemeProvider from "./context/ThemeContext"
import { Toaster } from "sonner"
import { fetchProfiles, fetchMe, createProfile } from "./lib/api"
import type { User } from "./types"

type Page = "landing" | "directory" | "standalone"

const PLACEHOLDER_USER: User = {
  id: "dwarageshc7203",
  username: "dwarageshc7203",
  displayName: "Dwarageshc7203",
  title: "Full Stack Engineer",
  designation: "Software Engineer",
  initials: "DW",
  color: "#3B82F6",
  joinedDaysAgo: 1,
  totalContributions: 0,
  badges: [],
  contests: [],
  heatmapData: Array.from({ length: 365 }, (_, i) => {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      count: Math.floor(Math.random() * 5),
    }
  }).reverse(),
  isOnline: true,
  rawContributions: [],
}

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState<Page>("landing")
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const creatingProfile = useRef(false)

  useEffect(() => {
    fetchMe()
      .then(async (me) => {
        if (me) {
          setCurrentUser(me)
          if (me.userName) {
            localStorage.setItem("scard_username", me.userName)
          }
          if (location.search.includes("login=success")) {
            if (me.hasProfile) {
              navigate(`/${me.userName}`, { replace: true })
            } else if (!creatingProfile.current) {
              // Instead of creating the profile automatically, navigate to onboarding
              navigate("/onboarding", { replace: true })
            }
          }
        }
      })
      .catch((err) => {
        console.error("Error checking authentication status:", err)
      })
  }, []) // run once on mount — not on every navigation

  // Auto-redirect to onboarding if logged in but has no profile/username
  useEffect(() => {
    if (currentUser && !location.pathname.startsWith("/onboarding") && location.pathname !== "/") {
      const uName = currentUser.userName
      if (!uName || uName === "0" || !currentUser.hasProfile) {
        navigate("/onboarding", { replace: true })
      }
    }
  }, [currentUser, location.pathname, navigate])

  // Sync current page state with pathnames for NavBar active states
  useEffect(() => {
    const path = location.pathname
    if (path === "/") {
      setCurrentPage("landing")
    } else if (path === "/explore") {
      setCurrentPage("directory")
    } else if (path !== "/" && path !== "/explore") {
      setCurrentPage("standalone")
    }
  }, [location.pathname])

  const handleNavigate = (page: Page) => {
    const firstUserId = users[0]?.id || PLACEHOLDER_USER.id
    if (page === "landing") navigate("/")
    else if (page === "directory") navigate("/explore")
    else if (page === "standalone") navigate(`/${firstUserId}`)
  }

  const featuredUser =
    (currentUser && users.find((u) => u.username === currentUser.userName)) ||
    users[0] ||
    PLACEHOLDER_USER

  const queryParams = new URLSearchParams(location.search)
  const hasError = queryParams.has("error")

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-bg text-text px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Authentication Error</h2>
        <p className="text-muted max-w-md">
          Authentication failed or was cancelled. Please try again.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors shadow-lg mt-4 cursor-pointer"
        >
          Go Back Home
        </button>
      </div>
    )
  }

  if (
    loading ||
    (location.pathname === "/" && location.search.includes("login=success"))
  ) {
    return (
      <div className="min-h-screen bg-bg p-8 w-full max-w-5xl mx-auto flex flex-col pt-[100px] animate-pulse">
        {/* Profile info skeleton */}
        <div className="w-full flex flex-col sm:flex-row gap-8 items-center sm:items-start mt-12">
          <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-surface-2 shrink-0 border border-border/50"></div>
          <div className="flex flex-col gap-4 w-full items-center sm:items-start mt-4 sm:mt-4">
            <div className="h-10 sm:h-12 w-3/4 sm:w-1/2 bg-surface-2 rounded-md border border-border/50"></div>
            <div className="h-6 w-1/2 sm:w-1/3 bg-surface-2 rounded-md border border-border/50"></div>
          </div>
        </div>
        
        {/* Grid skeletons */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="h-[300px] bg-surface-2 rounded-[20px] border border-border/50"></div>
          <div className="h-[300px] bg-surface-2 rounded-[20px] border border-border/50"></div>
          <div className="h-[350px] bg-surface-2 rounded-[20px] md:col-span-2 border border-border/50"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bg text-text min-h-screen transition-all duration-300">
      {/* <NavBar currentPage={currentPage} onNavigate={handleNavigate} /> */}
      <Routes>
        <Route path="/" element={<LandingPage currentUser={currentUser} />} />
        <Route
          path="/onboarding"
          element={
            <OnboardingSlideshow currentUser={currentUser} />
          }
        />
        <Route
          path="/explore"
          element={
            <ProfilePage
              users={users.length > 0 ? users : [PLACEHOLDER_USER]}
              variant="directory"
              initialUserId={featuredUser.id}
              currentUser={currentUser}
            />
          }
        />
        <Route
          path="/:userId"
          element={
            <ProfilePageWrapper
              users={users.length > 0 ? users : [PLACEHOLDER_USER]}
              fallback={PLACEHOLDER_USER}
              currentUser={currentUser}
            />
          }
        />
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
              <h2 className="text-2xl ">404 - Page Not Found</h2>
              <button
                onClick={() => navigate("/")}
                className="text-accent underline font-semibold cursor-pointer"
              >
                Go Back Home
              </button>
            </div>
          }
        />
      </Routes>
    </div>
  )
}

function ProfilePageWrapper({
  users,
  fallback,
  currentUser,
}: {
  users: User[]
  fallback: User
  currentUser: any
}) {
  const { userId } = useParamsHelper(users[0]?.id || fallback.id)
  return (
    <ProfilePage
      users={users}
      variant="standalone"
      initialUserId={userId}
      currentUser={currentUser}
    />
  )
}

function useParamsHelper(defaultId: string) {
  const location = useLocation()
  const parts = location.pathname.split("/")
  const rawId = parts[parts.length - 1]
  const userId = rawId ? decodeURIComponent(rawId) : ""
  return { userId: userId && userId !== "profile" ? userId : defaultId }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AppContent />
          <Toaster theme="system" />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
