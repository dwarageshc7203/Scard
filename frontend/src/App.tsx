import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'
import LandingPage from './pages/LandingPage'
import ProfilePage from './pages/ProfilePage'
import ThemeProvider from './context/ThemeContext'
import { fetchProfiles, fetchMe, createProfile } from './lib/api'
import type { User } from './types'

type Page = 'landing' | 'directory' | 'standalone'

const PLACEHOLDER_USER: User = {
  id: 'dwarageshc7203',
  username: 'dwarageshc7203',
  displayName: 'Dwarageshc7203',
  title: 'Full Stack Engineer',
  designation: 'Software Engineer',
  initials: 'DW',
  color: '#3B82F6',
  joinedDaysAgo: 1,
  totalContributions: 0,
  badges: [],
  contests: [],
  heatmapData: Array.from({ length: 53 }, () => Array(7).fill(0)),
  isOnline: true
}

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchMe()
      .then(async me => {
        if (me) {
          setCurrentUser(me)
          if (me.hasProfile) {
            if (location.pathname === '/') {
              navigate(`/${me.userName}`)
            }
          } else {
            const suggestedUsername = me.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
            try {
              await createProfile(suggestedUsername, 'Software Engineer')
              const updatedUsers = await fetchProfiles()
              setUsers(updatedUsers)
              navigate(`/${suggestedUsername}`)
            } catch (err) {
              console.error('Error creating profile:', err)
            }
          }
        }
      })
      .catch(err => {
        console.error('Error checking authentication status:', err)
      })
  }, [location.pathname, navigate])

  // Sync current page state with pathnames for NavBar active states
  useEffect(() => {
    const path = location.pathname
    if (path === '/') {
      setCurrentPage('landing')
    } else if (path === '/explore') {
      setCurrentPage('directory')
    } else if (path !== '/' && path !== '/explore') {
      setCurrentPage('standalone')
    }
  }, [location.pathname])

  const handleNavigate = (page: Page) => {
    const firstUserId = users[0]?.id || PLACEHOLDER_USER.id
    if (page === 'landing') navigate('/')
    else if (page === 'directory') navigate('/explore')
    else if (page === 'standalone') navigate(`/${firstUserId}`)
  }

  const featuredUser = users[0] || PLACEHOLDER_USER

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-white">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-xs text-zinc-400">Loading Scard profiles...</p>
      </div>
    )
  }

  return (
    <div className="bg-bg text-text min-h-screen transition-all duration-300">
      {/* <NavBar currentPage={currentPage} onNavigate={handleNavigate} /> */}
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              featuredUser={featuredUser}
              onGetStarted={() => navigate('/explore')}
            />
          }
        />
        <Route
          path="/explore"
          element={
            <ProfilePage users={users.length > 0 ? users : [PLACEHOLDER_USER]} variant="directory" initialUserId={featuredUser.id} currentUser={currentUser} />
          }
        />
        <Route
          path="/:userId"
          element={
            <ProfilePageWrapper users={users.length > 0 ? users : [PLACEHOLDER_USER]} fallback={PLACEHOLDER_USER} currentUser={currentUser} />
          }
        />
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
              <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
              <button
                onClick={() => navigate('/')}
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

function ProfilePageWrapper({ users, fallback, currentUser }: { users: User[], fallback: User, currentUser: any }) {
  const { userId } = useParamsHelper(users[0]?.id || fallback.id)
  return <ProfilePage users={users} variant="standalone" initialUserId={userId} currentUser={currentUser} />
}

function useParamsHelper(defaultId: string) {
  const location = useLocation()
  const parts = location.pathname.split('/')
  const userId = parts[parts.length - 1]
  return { userId: userId && userId !== 'profile' ? userId : defaultId }
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}
