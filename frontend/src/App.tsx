import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { USERS } from './data/mockData'
import NavBar from './components/NavBar'
import LandingPage from './pages/LandingPage'
import ProfilePage from './pages/ProfilePage'
import ThemeProvider from './context/ThemeContext'

type Page = 'landing' | 'directory' | 'standalone'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentPage, setCurrentPage] = useState<Page>('landing')

  // Sync current page state with pathnames for NavBar active states
  useEffect(() => {
    const path = location.pathname
    if (path === '/') {
      setCurrentPage('landing')
    } else if (path === '/explore') {
      setCurrentPage('directory')
    } else if (path.startsWith('/profile')) {
      setCurrentPage('standalone')
    }
  }, [location.pathname])

  const handleNavigate = (page: Page) => {
    if (page === 'landing') navigate('/')
    else if (page === 'directory') navigate('/explore')
    else if (page === 'standalone') navigate(`/profile/${USERS[0].id}`)
  }

  return (
    <div className="bg-bg text-text min-h-screen transition-all duration-300">
      <NavBar currentPage={currentPage} onNavigate={handleNavigate} />
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage
              featuredUser={USERS[0]}
              onGetStarted={() => navigate('/explore')}
            />
          } 
        />
        <Route 
          path="/explore" 
          element={
            <ProfilePage users={USERS} variant="directory" initialUserId={USERS[0].id} />
          } 
        />
        <Route 
          path="/profile/:userId" 
          element={
            <ProfilePageWrapper />
          } 
        />
        <Route 
          path="*" 
          element={
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] space-y-4">
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

// Wrapper to parse routing params for ProfilePage initial state
function ProfilePageWrapper() {
  const { userId } = useParamsHelper()
  return <ProfilePage users={USERS} variant="standalone" initialUserId={userId} />
}

// Helper custom hook to parse route params manually to avoid import dependency issues
function useParamsHelper() {
  const location = useLocation()
  const parts = location.pathname.split('/')
  const userId = parts[parts.length - 1]
  return { userId: userId && userId !== 'profile' ? userId : USERS[0].id }
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
