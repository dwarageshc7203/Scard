import { useState, useEffect, type FC } from 'react'
import { X, Globe, Link as LinkIcon, Trash2, Sun, Moon, Monitor, FileImage } from 'lucide-react'
import { toast } from 'sonner'
import Button from './ui/button'
import Input from './ui/input'
import type { User } from '../types'
import { updateProfile, syncPlatform, fetchProfile, fetchBanners, checkUsername } from '../lib/api'
import { generateAsciiFromImage, generateAsciiFromBase64 } from '../lib/ascii'
import { useTheme } from '../context/ThemeContext'

interface EditProfileModalProps {
  user: User
  onClose: () => void
  onSave: (updatedUser: User) => void
}

const EditProfileModal: FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile')
  const [activeSection, setActiveSection] = useState<'details' | 'connections' | 'socials' | 'projects' | 'photo' | 'banner'>('details')

  // Theme support
  const { theme, setTheme } = useTheme()

  // Load saved connection links from localStorage or user object
  const savedSocials = JSON.parse(localStorage.getItem(`socials_${user.username}`) || '{}')

  // Form Fields
  const [username, setUsername] = useState(user.username || '')
  const [isUsernameTaken, setIsUsernameTaken] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [profileName, setProfileName] = useState(user.profileName || user.displayName || '')
  const [designation, setDesignation] = useState(user.designation || '')
  const [website, setWebsite] = useState(user.socials?.github || user.pdfUrl || '')

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

  // Connections
  const [githubUser, setGithubUser] = useState(extractUsername(savedSocials.githubUrl || user.socials?.github || ''))
  const [leetcodeUser, setLeetcodeUser] = useState(extractUsername(savedSocials.leetcodeUrl || user.socials?.leetcode || ''))
  const [codeforcesUser, setCodeforcesUser] = useState(extractUsername(savedSocials.codeforcesUrl || user.socials?.codeforces || ''))

  // Custom Socials (Dynamic)
  const [customSocials, setCustomSocials] = useState<{ type: string; url: string }[]>(user.customSocials || [])

  // Projects
  const [projects, setProjects] = useState<any[]>(user.projects || [])

  // New Project Creation State
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    projectImageBase64: '',
    projectUrl: '',
    repoUrl: ''
  })
  
  const handleCloseCreateProject = () => {
    const hasInput = newProject.name || newProject.description || newProject.projectImageBase64 || newProject.projectUrl || newProject.repoUrl;
    if (hasInput) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        return;
      }
    }
    setIsCreatingProject(false);
    setNewProject({ name: '', description: '', projectImageBase64: '', projectUrl: '', repoUrl: '' });
  };

  const handleAddProject = () => {
    if (!newProject.name) {
      toast.error('Project name is required');
      return;
    }
    setProjects([...projects, newProject]);
    setIsCreatingProject(false);
    setNewProject({ name: '', description: '', projectImageBase64: '', projectUrl: '', repoUrl: '' });
  };

  // Photo / ASCII
  const [useAscii, setUseAscii] = useState(!!user.asciiArt && !user.asciiArt.includes('<span'))
  const [generatedAscii, setGeneratedAscii] = useState(() => {
    const initial = user.asciiArt || ''
    // If it contains stale HTML tags from previous version, clear it so it regenerates
    return initial.includes('<span') ? '' : initial
  })
  const [showAsciiPreview, setShowAsciiPreview] = useState(false)
  const [photoBase64, setPhotoBase64] = useState<string>(localStorage.getItem(`avatar_${user.username}`) || '')

  // Banners
  const [availableBanners, setAvailableBanners] = useState<any[]>([])
  const [selectedBannerId, setSelectedBannerId] = useState<number>(user.bannerId || 0)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBanners().then(setAvailableBanners).catch(console.error)
  }, [])

  // Debounced username check
  useEffect(() => {
    if (!username || username === user.username) {
      setIsUsernameTaken(false)
      setIsCheckingUsername(false)
      return
    }
    setIsCheckingUsername(true)
    const timer = setTimeout(async () => {
      try {
        const taken = await checkUsername(username)
        setIsUsernameTaken(taken)
      } catch (e) {
        console.error('Username check failed:', e)
      } finally {
        setIsCheckingUsername(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [username, user.username])

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

  // Auto-generate ASCII from existing photo if missing
  useEffect(() => {
    if (photoBase64 && !generatedAscii) {
      generateAsciiFromBase64(photoBase64)
        .then(setGeneratedAscii)
        .catch(console.error)
    }
  }, [photoBase64, generatedAscii])

  const handleSave = async () => {
    setSaving(true)
    try {
      const githubUrl = githubUser ? `https://github.com/${githubUser}` : ''
      const leetcodeUrl = leetcodeUser ? `https://leetcode.com/${leetcodeUser}` : ''
      const codeforcesUrl = codeforcesUser ? `https://codeforces.com/profile/${codeforcesUser}` : ''

      // 1. Save connection links & avatar to localStorage
      localStorage.setItem(
        `socials_${user.username}`,
        JSON.stringify({ githubUrl, leetcodeUrl, codeforcesUrl })
      )
      if (photoBase64) {
        localStorage.setItem(`avatar_${username}`, photoBase64)
      } else {
        localStorage.removeItem(`avatar_${username}`)
      }

      // 2. Patch details to backend
      try {
        const mappedSocials = customSocials.map(s => `${s.type}:${s.url}`)
        await updateProfile(designation, website, undefined, useAscii ? generatedAscii : '', username, profileName, selectedBannerId, mappedSocials, projects, undefined)
        toast.success('Profile saved successfully!')
      } catch (e: any) {
        console.error('Failed to update details in backend:', e)
        toast.error(`Save unsuccessful: ${e.message || 'Unknown error'}`)
      }

      const ghUser = githubUser
      const lcUser = leetcodeUser
      const cfUser = codeforcesUser

      // 3. Sync platforms with backend in parallel
      const syncPromises = []
      if (ghUser) {
        syncPromises.push(
          syncPlatform('GITHUB', ghUser).catch(e => console.error('GitHub sync failed:', e))
        )
      }
      if (lcUser) {
        syncPromises.push(
          syncPlatform('LEETCODE', lcUser).catch(e => console.error('LeetCode sync failed:', e))
        )
      }
      if (cfUser) {
        syncPromises.push(
          syncPlatform('CODEFORCES', cfUser).catch(e => console.error('Codeforces sync failed:', e))
        )
      }

      await Promise.allSettled(syncPromises)

      // 4. Fetch updated profile from backend if possible, else create local update
      let updatedUser: User
      try {
        updatedUser = await fetchProfile(username)
      } catch (e) {
        console.error('Failed to fetch updated profile, using local state update:', e)
        updatedUser = {
          ...user,
          username,
          profileName,
          displayName: profileName,
          designation,
          title: designation,
          bannerId: selectedBannerId,
        }
      }

      // Merge local connections state into updatedUser socials so they are immediately displayed
      updatedUser.socials = {
        github: githubUrl || updatedUser.socials?.github,
        leetcode: leetcodeUrl || updatedUser.socials?.leetcode,
        codeforces: codeforcesUrl || updatedUser.socials?.codeforces
      }
      updatedUser.customSocials = customSocials
      updatedUser.projects = projects

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
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'profile'
                    ? 'bg-surface-2 text-text border border-border'
                    : 'text-muted hover:text-text'
                  }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'account'
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
                    className={`w-full flex items-center px-3 py-2 text-left text-xs font-medium rounded-md transition-all ${activeSection === 'details'
                        ? 'bg-surface-2 text-text border border-border'
                        : 'text-muted hover:text-text hover:bg-surface/50'
                      }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveSection('connections')}
                    className={`w-full flex items-center px-3 py-2 text-left text-xs font-medium rounded-md transition-all ${activeSection === 'connections'
                        ? 'bg-surface-2 text-text border border-border'
                        : 'text-muted hover:text-text hover:bg-surface/50'
                      }`}
                  >
                    Connections
                  </button>
                  <button
                    onClick={() => setActiveSection('socials')}
                    className={`w-full flex items-center px-3 py-2 text-left text-xs font-medium rounded-md transition-all ${activeSection === 'socials'
                        ? 'bg-surface-2 text-text border border-border'
                        : 'text-muted hover:text-text hover:bg-surface/50'
                      }`}
                  >
                    Socials
                  </button>
                  <button
                    onClick={() => setActiveSection('projects')}
                    className={`w-full flex items-center px-3 py-2 text-left text-xs font-medium rounded-md transition-all ${activeSection === 'projects'
                        ? 'bg-surface-2 text-text border border-border'
                        : 'text-muted hover:text-text hover:bg-surface/50'
                      }`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => setActiveSection('photo')}
                    className={`w-full flex items-center px-3 py-2 text-left text-xs font-medium rounded-md transition-all ${activeSection === 'photo'
                        ? 'bg-surface-2 text-text border border-border'
                        : 'text-muted hover:text-text hover:bg-surface/50'
                      }`}
                  >
                    Photo
                  </button>
                  <button
                    onClick={() => setActiveSection('banner')}
                    className={`w-full flex items-center px-3 py-2 text-left text-xs font-medium rounded-md transition-all ${activeSection === 'banner'
                        ? 'bg-surface-2 text-text border border-border'
                        : 'text-muted hover:text-text hover:bg-surface/50'
                      }`}
                  >
                    Banner
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
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Username (Unique Route)</label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="e.g. dwaragesh"
                      className={`w-full ${isUsernameTaken ? 'border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {isCheckingUsername ? (
                      <p className="text-[10px] text-muted mt-1">Checking availability...</p>
                    ) : username && username !== user.username && !isUsernameTaken ? (
                      <p className="text-[10px] text-green-500 mt-1">Username is good to proceed!</p>
                    ) : isUsernameTaken ? (
                      <p className="text-[10px] text-red-500 mt-1 font-bold">This username is already taken.</p>
                    ) : (
                      <p className="text-[10px] text-muted mt-1">Rules: alphanumeric and no symbols or spaces.</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Display Name</label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Dwaragesh C"
                      className="w-full"
                    />
                    <p className="text-[10px] text-muted mt-1">This is the name displayed on your profile.</p>
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
              ) : activeSection === 'connections' ? (
                <div className="space-y-5 flex-1">
                  <h3 className="text-sm font-bold text-text mb-4">Connections</h3>

                  {/* GitHub URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted">GitHub Username</label>
                    <Input
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      placeholder="e.g. johndoe"
                      className="bg-surface border-border"
                      icon={<LinkIcon className="w-3.5 h-3.5 text-muted" />}
                    />
                  </div>

                  {/* LeetCode URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted">LeetCode Username</label>
                    <Input
                      value={leetcodeUser}
                      onChange={(e) => setLeetcodeUser(e.target.value)}
                      placeholder="e.g. johndoe"
                      className="bg-surface border-border"
                      icon={<LinkIcon className="w-3.5 h-3.5 text-muted" />}
                    />
                  </div>

                  {/* Codeforces URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted">Codeforces Username</label>
                    <Input
                      value={codeforcesUser}
                      onChange={(e) => setCodeforcesUser(e.target.value)}
                      placeholder="e.g. johndoe"
                      className="bg-surface border-border"
                      icon={<LinkIcon className="w-3.5 h-3.5 text-muted" />}
                    />
                  </div>
                </div>
              ) : activeSection === 'socials' ? (
                <div className="space-y-5 flex-1">
                  <div className="flex items-center justify-between mb-4 pr-8">
                    <h3 className="text-sm font-bold text-text">Socials</h3>
                    <Button
                      onClick={() => setCustomSocials([...customSocials, { type: 'linkedin', url: '' }])}
                      variant="outline"
                      className="border-border text-xs h-7 px-2"
                    >
                      + Add Social
                    </Button>
                  </div>

                  {customSocials.length === 0 ? (
                    <div className="text-center text-xs text-muted py-8 border border-dashed border-border rounded-lg">
                      No custom socials added yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customSocials.map((social, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <select
                            className="bg-surface border border-border rounded-md text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent/50 w-28 text-text"
                            value={social.type}
                            onChange={(e) => {
                              const newSocials = [...customSocials]
                              newSocials[idx].type = e.target.value
                              setCustomSocials(newSocials)
                            }}
                          >
                            <option value="linkedin">LinkedIn</option>
                            <option value="twitter">Twitter / X</option>
                            <option value="mail">Email</option>
                            <option value="website">Website</option>
                          </select>
                          <Input
                            value={social.url}
                            onChange={(e) => {
                              const newSocials = [...customSocials]
                              newSocials[idx].url = e.target.value
                              setCustomSocials(newSocials)
                            }}
                            placeholder={social.type === 'mail' ? 'johndoe@example.com' : 'https://...'}
                            className="bg-surface border-border flex-1"
                          />
                          <button
                            onClick={() => {
                              const newSocials = [...customSocials]
                              newSocials.splice(idx, 1)
                              setCustomSocials(newSocials)
                            }}
                            className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeSection === 'projects' ? (
                <div className="space-y-5 flex-1 relative h-full">
                  {!isCreatingProject ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-text">Projects</h3>
                        <Button onClick={() => setIsCreatingProject(true)} variant="outline" className="border-border text-xs h-7 px-3 bg-surface-2 hover:bg-border transition-colors mr-10">
                          + Add Project
                        </Button>
                      </div>
                      {projects.length === 0 ? (
                        <div className="text-center text-xs text-muted py-8 border border-dashed border-border rounded-lg">No projects added yet.</div>
                      ) : (
                        <div className="space-y-4">
                          {projects.map((proj, idx) => (
                            <div key={idx} className="border border-border p-4 rounded-xl relative space-y-2 flex items-center justify-between bg-surface-2/50 hover:bg-surface-2 transition-colors">
                              <div className="flex items-center gap-4">
                                {proj.projectImageBase64 ? (
                                  <img src={proj.projectImageBase64} alt={proj.name} className="w-12 h-12 object-cover rounded-lg border border-border/50 bg-surface" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg border border-border/50 bg-surface flex items-center justify-center text-muted text-[10px] font-bold">Img</div>
                                )}
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm font-bold text-text">{proj.name}</div>
                                  <div className="text-xs text-muted line-clamp-1 max-w-[250px]">{proj.description || 'No description provided.'}</div>
                                </div>
                              </div>
                              <button onClick={() => { const p = [...projects]; p.splice(idx, 1); setProjects(p); }} className="text-muted hover:text-red-500 bg-surface p-2 rounded-md transition-colors border border-border hover:border-red-500/30">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col space-y-4 pb-8 h-full animate-fade-in">
                      <div className="flex items-center justify-between mb-2 mt-1">
                        <h3 className="text-sm text-text">Create New Project</h3>
                        <button onClick={handleCloseCreateProject} className="text-muted hover:text-text p-1 bg-surface-2 rounded-md mr-10">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                        <div>
                          <label className="text-[11px] text-muted uppercase tracking-wider mb-1.5 block">Project Name</label>
                          <Input value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="e.g. Scard" className="w-full text-xs bg-surface-2/50" />
                        </div>
                        
                        <div>
                          <label className="text-[11px] text-muted uppercase tracking-wider mb-1.5 block">Project Image</label>
                          <div className="mt-1">
                            {newProject.projectImageBase64 ? (
                              <div className="relative w-24 h-24 rounded-lg border-2 border-accent overflow-hidden group">
                                <img src={newProject.projectImageBase64} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setNewProject({...newProject, projectImageBase64: ''})} className="text-white bg-red-500/80 p-1.5 rounded-full hover:bg-red-500">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-surface-2/30 hover:bg-surface-2/50 transition-colors cursor-pointer relative overflow-hidden">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      const reader = new FileReader()
                                      reader.onload = (re) => setNewProject({...newProject, projectImageBase64: re.target?.result as string})
                                      reader.readAsDataURL(file)
                                    }
                                  }}
                                />
                                <FileImage className="w-6 h-6 text-muted mb-1" />
                                <span className="text-[9px] text-muted uppercase tracking-wider">Upload</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-muted uppercase tracking-wider mb-1.5 block">Description</label>
                          <textarea 
                            value={newProject.description} 
                            onChange={e => setNewProject({...newProject, description: e.target.value})} 
                            placeholder="Briefly describe what this project does..." 
                            className="w-full h-20 bg-surface-2/50 border border-border rounded-md text-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-accent/50 text-text resize-none" 
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-muted uppercase tracking-wider mb-1.5 block">Live URL</label>
                          <Input value={newProject.projectUrl} onChange={e => setNewProject({...newProject, projectUrl: e.target.value})} placeholder="https://..." className="w-full text-xs bg-surface-2/50" />
                        </div>

                        <div>
                          <label className="text-[11px] text-muted uppercase tracking-wider mb-1.5 block">Repository URL</label>
                          <Input value={newProject.repoUrl} onChange={e => setNewProject({...newProject, repoUrl: e.target.value})} placeholder="https://github.com/..." className="w-full text-xs bg-surface-2/50" />
                        </div>
                      </div>

                      <div className="pt-2 mt-auto">
                        <Button onClick={handleAddProject} className="w-full bg-accent text-white hover:bg-accent/90">
                          Add Project
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeSection === 'photo' ? (
                <div className="space-y-5 flex-1 relative">
                  <h3 className="text-sm font-bold text-text mb-4">Profile Photo</h3>

                  <div className="space-y-4">
                    <label className="text-[11px] font-medium text-muted block">Upload Photo</label>
                    {photoBase64 ? (
                      <div className="flex items-center gap-6">
                        <div className="relative rounded-full overflow-hidden border border-border bg-surface-2/30 h-28 w-28 shrink-0 shadow-md">
                          <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={() => {
                            setPhotoBase64('')
                            setGeneratedAscii('')
                            setUseAscii(false)
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors text-xs font-semibold border border-red-500/20"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <div className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-surface-2/30 hover:bg-surface-2/50 transition-colors cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              try {
                                const ascii = await generateAsciiFromImage(file)
                                setGeneratedAscii(ascii)

                                const reader = new FileReader()
                                reader.onload = (re) => setPhotoBase64(re.target?.result as string)
                                reader.readAsDataURL(file)

                                setUseAscii(true)
                              } catch (err) {
                                console.error(err)
                              }
                            }
                          }}
                        />
                        <FileImage className="w-6 h-6 text-muted mb-2" />
                        <span className="text-xs text-muted">Click or drag image to upload</span>
                      </div>
                    )}
                  </div>

                  {photoBase64 && generatedAscii && (
                    <>
                      <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-surface-2/30 mt-4">
                        <div>
                          <div className="text-xs font-semibold">Use ASCII Art</div>
                          <div className="text-[10px] text-muted">Convert profile photo to ASCII</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={useAscii} onChange={(e) => setUseAscii(e.target.checked)} />
                          <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-accent peer-focus:ring-2 peer-focus:ring-accent/30 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                      </div>

                      {useAscii && (
                        <div className="mt-2">
                          <Button onClick={() => setShowAsciiPreview(true)} variant="outline" className="w-full border-border text-xs font-semibold h-9">
                            Try Out
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {showAsciiPreview && (
                    <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm z-10 rounded-lg p-4 flex flex-col items-center justify-center animate-fade-in-blur">
                      <button onClick={() => setShowAsciiPreview(false)} className="absolute top-2 right-2 p-1.5 text-muted hover:text-text bg-surface-2 rounded-full shadow-md z-20">
                        <X className="w-4 h-4" />
                      </button>
                      <h4 className="text-xs font-bold mb-4">ASCII Preview</h4>
                      <div className="bg-surface-2 p-4 rounded-lg overflow-auto max-w-full max-h-[250px] shadow-lg border border-border">
                        <pre className="text-[6px] sm:text-[8px] font-mono leading-[1.1] text-text whitespace-pre">
                          {generatedAscii}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeSection === 'banner' ? (
                <div className="space-y-5 flex-1">
                  <h3 className="text-sm font-bold text-text mb-4">Profile Banner</h3>
                  <div className="text-xs text-muted mb-4">Select a banner to display at the top of your profile.</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setSelectedBannerId(0)}
                      className={`h-24 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all bg-surface-2 ${selectedBannerId === 0 ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:border-muted'}`}
                    >
                      <span className="text-xs text-muted font-medium">Default Solid Color</span>
                    </div>
                    {availableBanners.map(banner => (
                      <div
                        key={banner.id}
                        onClick={() => setSelectedBannerId(banner.id)}
                        className={`h-24 rounded-lg border-2 cursor-pointer transition-all relative overflow-hidden bg-cover bg-center ${selectedBannerId === banner.id ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:border-muted'}`}
                        style={{ background: banner.cssBackground }}
                      >
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold drop-shadow-md">{banner.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            ) : (
              <div className="space-y-6 flex-1">
                <h3 className="text-sm font-bold text-text mb-4">Account Settings</h3>

                {/* Theme Settings selector mimicking a shadcn tab/select */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted block">System Theme</label>
                  <div className="flex border border-border rounded-lg bg-surface/30 p-1 max-w-sm">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${theme === 'light'
                          ? 'bg-surface text-text border border-border shadow-sm'
                          : 'text-muted hover:text-text'
                        }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${theme === 'dark'
                          ? 'bg-surface text-text border border-border shadow-sm'
                          : 'text-muted hover:text-text'
                        }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${theme === 'system'
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
                  disabled={saving || isUsernameTaken || isCheckingUsername}
                  className={`bg-accent hover:bg-accent/90 text-white font-semibold text-xs py-1.5 px-4 rounded ${isUsernameTaken ? 'opacity-50 cursor-not-allowed' : ''}`}
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
