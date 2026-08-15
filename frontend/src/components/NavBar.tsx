import type { FC } from 'react'
import Button from './ui/button'
import { Compass, User, LogIn, Sparkles, Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import scardLogo from '../images/scard.png'

type Page = 'landing' | 'directory' | 'standalone'

interface NavBarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const NavBar: FC<NavBarProps> = ({ currentPage, onNavigate }) => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('system')
  }

  const renderThemeIcon = () => {
    if (theme === 'system') return <Laptop className="w-4 h-4 text-muted" />
    if (theme === 'light') return <Sun className="w-4 h-4 text-yellow-500 animate-spin-slow" />
    return <Moon className="w-4 h-4 text-accent" />
  }

  return (
    <nav className="border-b border-border bg-surface/30 backdrop-blur-md sticky top-0 z-30 transition-all duration-350">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="text-lg tracking-tight text-text hover:opacity-90 flex items-center gap-2 cursor-pointer select-none transition-all duration-200"
        >
          <img src={scardLogo} alt="Scard Logo" className="w-8 h-8 object-contain rounded-[8px] drop-shadow-md" />
          <span className="bg-gradient-to-r from-text via-text to-muted bg-clip-text text-transparent">Scard</span>
        </button>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={cycleTheme}
            className="w-9 h-9 border-border/60 hover:bg-surface-2 transition-all duration-300"
            title={`Theme: ${theme} (Click to change)`}
          >
            {renderThemeIcon()}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/oauth2/authorization/google'} 
            className="hidden md:inline-flex gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Log in</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
