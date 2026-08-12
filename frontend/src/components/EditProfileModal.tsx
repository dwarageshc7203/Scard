import { useState, useEffect, type FC } from 'react'
import { X, Globe, Link as LinkIcon, Trash2, Sun, Moon, Monitor } from 'lucide-react'
import Button from './ui/button'
import Input from './ui/input'
import type { User } from '../types'
import { updateProfile, syncPlatform, fetchProfile } from '../lib/api'
import { useTheme } from '../context/ThemeContext'

interface EditProfileModalProps {
  user: User
  onClose: () => void
  onSave: (updatedUser: User) => void
}

const EditProfileModal: FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile')
  const [activeSection, setActiveSection] = useState<'details' | 'connections'>('details')

  // Theme support
  const { theme, setTheme } = useTheme()

  // Load saved connection links from localStorage or user object
  const savedSocials = JSON.parse(localStorage.getItem(`socials_${user.username}`) || '{}')
  
  // Form Fields
  const [username, setUsername] = useState(user.username || '')
  const [designation, setDesignation] = useState(user.designation || '')
  const [website, setWebsite] = useState(user.socials?.github || user.pdfUrl || '')
  
  // Connections
  const [githubUrl, setGithubUrl] = useState(savedSocials.githubUrl || user.socials?.github || '')
  const [leetcodeUrl, setLeetcodeUrl] = useState(savedSocials.leetcodeUrl || user.socials?.leetcode || '')
  const [codeforcesUrl, setCodeforcesUrl] = useState(savedSocials.codeforcesUrl || user.socials?.codeforces || '')

  const [saving, setSaving] = useState(false)

  // Freeze underlay scrolling on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const mainContainer = document.querySelector('main')
    let originalMainOverflow = ''
    if (mainContainer) {
      originalMainOverflow = mainContainer.style.overflow
      mainContainer.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = ''
      if (mainContainer) {
        mainContainer.style.overflow = originalMainOverflow
      }
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Save connection links to localStorage
      localStorage.setItem(
        `socials_${user.username}`,
        JSON.stringify({ githubUrl, leetcodeUrl, codeforcesUrl })
      )

      // 2. Patch designation and profileURL (website) to backend
      try {
        await updateProfile(designation, website)
      } catch (e) {
        console.error('Failed to update designation/website in backend:', e)
      }
      
      // Helper to extract username from a URL or raw input
      const extractUsername = (val: string) => {
        if (!val) return ''
        const trimmed = val.trim()
        if (trimmed.includes('/')) {
          const parts = trimmed.split('/')
          return parts[parts.length - 1] || parts[parts.length - 2] || ''
        }
        return trimmed
      }

      const ghUser = extractUsername(githubUrl)
      const lcUser = extractUsername(leetcodeUrl)
      const cfUser = extractUsername(codeforcesUrl)

      // 3. Sync platforms with backend
      if (ghUser) {
        try {
          await syncPlatform('GITHUB', ghUser)
        } catch (e) {
          console.error('GitHub sync failed:', e)
        }
      }
      if (lcUser) {
        try {
          await syncPlatform('LEETCODE', lcUser)
        } catch (e) {
          console.error('LeetCode sync failed:', e)
        }
      }
      if (cfUser) {
        try {
          await syncPlatform('CODEFORCES', cfUser)
        } catch (e) {
          console.error('Codeforces sync failed:', e)
        }
      }

      // 4. Fetch updated profile from backend if possible, else create local update
      let updatedUser: User
      try {
        updatedUser = await fetchProfile(user.username)
      } catch (e) {
        console.error('Failed to fetch updated profile, using local state update:', e)
        updatedUser = {
          ...user,
          username,
          designation,
          title: designation,
        }
      }

      // Merge local connections state into updatedUser socials so they are immediately displayed
      updatedUser.socials = {
        github: githubUrl || updatedUser.socials?.github,
        leetcode: leetcodeUrl || updatedUser.socials?.leetcode,
        codeforces: codeforcesUrl || updatedUser.socials?.codeforces
      }

      onSave(updatedUser)
      onClose()
    } catch (err) {
      console.error('Failed to save profile:', err)
      alert('Failed to save profile changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action is permanent.')) {
      alert('Account deletion requested.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl h-[70vh] bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-fade-in-blur">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-2/80 text-muted hover:text-text transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Main Grid */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-[220px] border-r border-border bg-surface/30 flex flex-col overflow-y-auto">
            {/* Main Tabs */}
            <div className="flex border-b border-border p-3 gap-2">
              <button
                onClick={() => {
                  setActiveTab('profile')
                  setActiveSection('details')
                }}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-surface-2 text-text border border-border'
                    : 'text-muted hover:text-text'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'account'
                    ? 'bg-surface-2 text-text border border-border'
                    : 'text-muted hover:text-text'
                }`}
              >
                Account
              </button>
            </div>

            {/* Section Options based on Tab */}
            <div className="p-2 space-y-1">
              {activeTab === 'profile' ? (
                <>
                  <button
                    onClick={() => setActiveSection('details')}
                    className={`w-full flex items-center px-3 py-2 text-left text-xs font-medium rounded-md transition-all ${
                      activeSection === 'details'
                        ? 'bg-surface-2 text-text border border-border'
                        : 'text-muted hover:text-text hover:bg-surface/50'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveSection('connections')}
                    className={`w-full flex items-center px-3 py-2 text-left text-xs font-medium rounded-md transition-all ${
                      activeSection === 'connections'
                        ? 'bg-surface-2 text-text border border-border'
                        : 'text-muted hover:text-text hover:bg-surface/50'
                    }`}
                  >
                    Connections
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 text-[10px] uppercase font-mono tracking-widest text-muted">
                  Settings
                </div>
              )}
            </div>
          </div>

          {/* Form Content Panel */}
          <div className="flex-1 bg-surface p-6 sm:p-8 overflow-y-auto flex flex-col">
            
            {activeTab === 'profile' ? (
              activeSection === 'details' ? (
                <div className="space-y-5 flex-1">
                  <h3 className="text-sm font-bold text-text mb-4">Profile Details</h3>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted">Username</label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="bg-surface border-border"
                    />
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted">Designation</label>
                    <Input
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="bg-surface border-border"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted">Website</label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. https://dwaragesh.me"
                      className="bg-surface border-border"
                      icon={<Globe className="w-3.5 h-3.5 text-muted" />}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5 flex-1">
                  <h3 className="text-sm font-bold text-text mb-4">Connections</h3>

                  {/* GitHub URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted">GitHub Profile URL</label>
                    <Input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="bg-surface border-border"
                      icon={<LinkIcon className="w-3.5 h-3.5 text-muted" />}
                    />
                  </div>

                  {/* LeetCode URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted">LeetCode Profile URL</label>
                    <Input
                      value={leetcodeUrl}
                      onChange={(e) => setLeetcodeUrl(e.target.value)}
                      placeholder="https://leetcode.com/username"
                      className="bg-surface border-border"
                      icon={<LinkIcon className="w-3.5 h-3.5 text-muted" />}
                    />
                  </div>

                  {/* Codeforces URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted">Codeforces Profile URL</label>
                    <Input
                      value={codeforcesUrl}
                      onChange={(e) => setCodeforcesUrl(e.target.value)}
                      placeholder="https://codeforces.com/profile/username"
                      className="bg-surface border-border"
                      icon={<LinkIcon className="w-3.5 h-3.5 text-muted" />}
                    />
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-6 flex-1">
                <h3 className="text-sm font-bold text-text mb-4">Account Settings</h3>

                {/* Theme Settings selector mimicking a shadcn tab/select */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted block">System Theme</label>
                  <div className="flex border border-border rounded-lg bg-surface/30 p-1 max-w-sm">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        theme === 'light'
                          ? 'bg-surface text-text border border-border shadow-sm'
                          : 'text-muted hover:text-text'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        theme === 'dark'
                          ? 'bg-surface text-text border border-border shadow-sm'
                          : 'text-muted hover:text-text'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        theme === 'system'
                          ? 'bg-surface text-text border border-border shadow-sm'
                          : 'text-muted hover:text-text'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>System</span>
                    </button>
                  </div>
                </div>

                {/* Danger Zone / Delete Account */}
                <div className="pt-6 border-t border-border space-y-3">
                  <div className="text-xs font-bold text-red-500">Danger Zone</div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Permanently delete your Scard account and all related developer profiles, badge data, and contribution consolidations.
                  </p>
                  <Button
                    onClick={handleDeleteAccount}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 font-semibold text-xs flex items-center gap-1.5 h-9 px-4"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Bottom Actions (Only for Profile saving) */}
            {activeTab === 'profile' && (
              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-accent hover:bg-accent/90 text-white font-semibold text-xs py-1.5 px-4 rounded"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}

export default EditProfileModal
