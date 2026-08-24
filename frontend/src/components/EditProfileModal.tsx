import { useState, useEffect, type FC } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Globe,
  Link as LinkIcon,
  Trash2,
  Sun,
  Moon,
  Monitor,
  FileImage,
  Pencil,
  Upload,
  Loader2,
  Check,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import Button from "./ui/button"
import Input from "./ui/input"
import type { User } from "../types"
import {
  getCsrfToken,
  fetchProfile,
  updateProfile,
  syncPlatform,
  checkUsername,
  deleteAccount,
  logoutUser,
  fetchBanners,
  checkGithub,
  checkLeetcode,
  checkLinkedin,
  checkMail,
} from "../lib/api"
import { useTheme } from "../context/ThemeContext"
import Image from "./ui/Image"
import ValidationTooltip from "./ui/ValidationTooltip"

interface EditProfileModalProps {
  user: User
  onClose: () => void
  onSave: (updatedUser: User) => void
}

const EditProfileModal: FC<EditProfileModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "account">("profile")
  const [activeSection, setActiveSection] =
    useState<"yourself" | "photo" | "banner" | "platforms" | "socials" | "projects" | "theme" | "danger">(
      "yourself",
    )

  // Theme support
  const { theme, setTheme } = useTheme()

  // Form Fields
  const [username, setUsername] = useState(user.username || "")
  const [isUsernameTaken, setIsUsernameTaken] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [profileName, setProfileName] = useState(
    user.profileName || user.displayName || "",
  )
  const [designation, setDesignation] = useState(user.designation || "")

  // Helper to extract username from a URL or raw input
  const extractUsername = (val: string) => {
    if (!val) return ""
    const trimmed = val.trim()
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/")
      return parts[parts.length - 1] || parts[parts.length - 2] || ""
    }
    return trimmed
  }

  // Connections
  const [githubUser, setGithubUser] = useState(
    extractUsername(user.socials?.github || ""),
  )
  const [githubChecking, setGithubChecking] = useState(false)
  const [githubError, setGithubError] = useState("")
  const [githubSuccess, setGithubSuccess] = useState(false)

  const [leetcodeUser, setLeetcodeUser] = useState(
    extractUsername(user.socials?.leetcode || ""),
  )
  const [leetcodeChecking, setLeetcodeChecking] = useState(false)
  const [leetcodeError, setLeetcodeError] = useState("")
  const [leetcodeSuccess, setLeetcodeSuccess] = useState(false)


  const [leetcodeAccordionOpen, setLeetcodeAccordionOpen] = useState(false)
  const [leetcodeShowRating, setLeetcodeShowRating] = useState(
    user.platformPreferences?.leetcode?.showRating ?? true,
  )
  const [leetcodeShowProblems, setLeetcodeShowProblems] = useState(
    user.platformPreferences?.leetcode?.showProblems ?? true,
  )
  const [leetcodeShowHeatmap, setLeetcodeShowHeatmap] = useState(
    user.platformPreferences?.leetcode?.showHeatmap ?? true,
  )
  const [leetcodeShowBadges, setLeetcodeShowBadges] = useState(
    user.platformPreferences?.leetcode?.showBadges ?? true,
  )

  // Custom Socials (Dynamic)
  const [customSocials, setCustomSocials] = useState<{
    type: string
    url: string
    checking?: boolean
    error?: string
    success?: boolean
  }[]>(user.customSocials || [])

  // Projects
  const [projects, setProjects] = useState<any[]>(user.projects || [])

  // New Project Creation/Edit State
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [editingProjectIndex, setEditingProjectIndex] = useState<number>(-1)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    projectImageBase64: "",
    projectUrl: "",
    repoUrl: "",
  })

  const handleCloseCreateProject = () => {
    const hasInput =
      newProject.name ||
      newProject.description ||
      newProject.projectImageBase64 ||
      newProject.projectUrl ||
      newProject.repoUrl
    if (hasInput) {
      if (
        !window.confirm(
          "You have unsaved changes. Are you sure you want to discard them?",
        )
      ) {
        return
      }
    }
    setIsCreatingProject(false)
    setNewProject({
      name: "",
      description: "",
      projectImageBase64: "",
      projectUrl: "",
      repoUrl: "",
    })
    setEditingProjectIndex(-1)
  }

  const handleEditProject = (idx: number) => {
    setEditingProjectIndex(idx)
    setNewProject({ ...projects[idx] })
    setIsCreatingProject(true)
  }

  const handleAddProject = () => {
    if (!newProject.name) {
      toast.error("Project name is required")
      return
    }

    const projectToSave = {
      name: newProject.name,
      description: newProject.description,
      projectImageBase64: newProject.projectImageBase64,
      projectUrl: newProject.projectUrl,
      repoUrl: newProject.repoUrl,
    }

    if (editingProjectIndex >= 0) {
      // Editing existing project
      const updatedProjects = [...projects]
      updatedProjects[editingProjectIndex] = projectToSave
      setProjects(updatedProjects)
    } else {
      // Adding new project
      setProjects([...projects, projectToSave])
    }

    setIsCreatingProject(false)
    setEditingProjectIndex(-1)
    setNewProject({
      name: "",
      description: "",
      projectImageBase64: "",
      projectUrl: "",
      repoUrl: "",
    })
  }

  // Photo / ASCII
  const [photoBase64, setPhotoBase64] = useState<string>("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  useEffect(() => {
    if (user.imageURL && user.imageURL.startsWith("data:image")) {
      setPhotoBase64(user.imageURL)
    } else if (user.imageURL && user.imageURL.startsWith("/uploads")) {
      setPhotoBase64(user.imageURL)
    }
  }, [user.imageURL])

  // Banners
  const [availableBanners, setAvailableBanners] = useState<any[]>([])
  const [selectedBannerId, setSelectedBannerId] = useState<number>(
    user.bannerId || 0,
  )

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
        console.error("Username check failed:", e)
      } finally {
        setIsCheckingUsername(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [username, user.username])

  // Debounced GitHub check
  useEffect(() => {
    let isMounted = true
    if (!githubUser.trim() || githubUser === extractUsername(user.socials?.github || "")) {
      setGithubChecking(false)
      setGithubError("")
      setGithubSuccess(false)
      return
    }

    setGithubChecking(true)
    setGithubSuccess(false)
    setGithubError("")

    const check = async () => {
      try {
        const dbCheck = await checkGithub(githubUser.trim())
        if (isMounted) {
          if (dbCheck.taken && dbCheck.ownerUsername !== user.username) {
            setGithubError(`This account is already used by another user - ${dbCheck.ownerUsername}. Contact scard@dwaragesh.me to resolve any queries`)
            return
          }
        }
        
        try {
          const res = await fetch(`https://api.github.com/users/${githubUser.trim()}`)
          if (res.status === 404) {
            if (isMounted) setGithubError("GitHub user not found")
            return
          }
        } catch (e) {
          // Ignore external API errors
        }
        
        if (isMounted) setGithubSuccess(true)
      } catch (err) {
        if (isMounted) setGithubError("Error checking GitHub")
      } finally {
        if (isMounted) setGithubChecking(false)
      }
    }
    const timer = setTimeout(check, 500)
    return () => { isMounted = false; clearTimeout(timer) }
  }, [githubUser, user.socials?.github])

  // Debounced LeetCode check
  useEffect(() => {
    let isMounted = true
    if (!leetcodeUser.trim() || leetcodeUser === extractUsername(user.socials?.leetcode || "")) {
      setLeetcodeChecking(false)
      setLeetcodeError("")
      setLeetcodeSuccess(false)
      return
    }

    setLeetcodeChecking(true)
    setLeetcodeSuccess(false)
    setLeetcodeError("")

    const check = async () => {
      try {
        const dbCheck = await checkLeetcode(leetcodeUser.trim())
        if (isMounted) {
          if (dbCheck.taken && dbCheck.ownerUsername !== user.username) {
            setLeetcodeError(`This account is already used by another user - ${dbCheck.ownerUsername}. Contact scard@dwaragesh.me to resolve any queries`)
            return
          }
        }

        try {
          const res = await fetch(`https://alfa-leetcode-api.onrender.com/${leetcodeUser.trim()}`)
          if (res.status === 404) {
            if (isMounted) setLeetcodeError("LeetCode user not found")
            return
          } else if (res.status === 200) {
            const text = await res.text()
            try {
              const data = JSON.parse(text)
              if (data.errors) {
                if (isMounted) setLeetcodeError("LeetCode user not found")
                return
              }
            } catch (e) {
              // Not JSON (e.g. rate limit text), ignore and let it succeed
            }
          }
        } catch (e) {
          // Ignore external API errors
        }
        
        if (isMounted) setLeetcodeSuccess(true)
      } catch (err) {
        if (isMounted) setLeetcodeError("Error checking LeetCode")
      } finally {
        if (isMounted) setLeetcodeChecking(false)
      }
    }
    const timer = setTimeout(check, 500)
    return () => { isMounted = false; clearTimeout(timer) }
  }, [leetcodeUser, user.socials?.leetcode])

  // Custom Socials Check
  useEffect(() => {
    let isMounted = true
    const timers: NodeJS.Timeout[] = []

    customSocials.forEach((social, idx) => {
      const url = social.url.trim()
      if (!url) return
      if (social.type !== "linkedin" && social.type !== "mail") return

      // Skip if this matches user's initial saved customSocials URL
      const initialSocial = (user.customSocials || []).find(s => s.type === social.type && s.url.trim() === url)
      if (initialSocial) return

      // Wait until checking is synchronously set to true in onChange, and skip if already finished
      if (!social.checking || social.success || social.error) return

      const timer = setTimeout(async () => {
        try {
          let dbCheck = { taken: false, ownerUsername: "" };
          if (social.type === "linkedin") {
            dbCheck = await checkLinkedin(url) as any;
          } else if (social.type === "mail") {
            dbCheck = await checkMail(url) as any;
          }

          if (isMounted) {
            setCustomSocials(prev => {
              const next = [...prev];
              if (next[idx]) {
                if (dbCheck.taken && dbCheck.ownerUsername !== user.username) {
                  next[idx] = { ...next[idx], checking: false, error: `This account is already used by another user - ${dbCheck.ownerUsername}. Contact scard@dwaragesh.me to resolve any queries` };
                } else {
                  next[idx] = { ...next[idx], checking: false, success: true };
                }
              }
              return next;
            });
          }
        } catch (e) {
          if (isMounted) {
            setCustomSocials(prev => {
              const next = [...prev];
              if (next[idx]) {
                next[idx] = { ...next[idx], checking: false, error: "Validation failed" };
              }
              return next;
            });
          }
        }
      }, 600);
      timers.push(timer);
    });

    return () => {
      isMounted = false
      timers.forEach(clearTimeout)
    }
  }, [customSocials, user.customSocials])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const mainContainer = document.querySelector("main")
    let originalMainOverflow = ""
    if (mainContainer) {
      originalMainOverflow = mainContainer.style.overflow
      mainContainer.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = ""
      if (mainContainer) {
        mainContainer.style.overflow = originalMainOverflow
      }
    }
  }, [])


  const handleSave = async () => {
    setSaving(true)
    try {
      const githubUrl = githubUser ? `https://github.com/${githubUser}` : ""
      const leetcodeUrl = leetcodeUser
        ? `https://leetcode.com/${leetcodeUser}`
        : ""
      let uploadFile = photoFile
      if (!uploadFile && photoBase64 && photoBase64.startsWith("data:image")) {
        try {
          const arr = photoBase64.split(",")
          const mime = arr[0].match(/:(.*?);/)?.[1]
          const bstr = atob(arr[1])
          let n = bstr.length
          const u8arr = new Uint8Array(n)
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          uploadFile = new File([u8arr], "avatar.png", { type: mime })
        } catch (e) {
          console.error("Failed to convert base64 to file", e)
        }
      }

      if (uploadFile) {
        const formData = new FormData()
        formData.append("file", uploadFile)
        try {
          await fetch("/api/profile/pfp", {
            method: "POST",
            body: formData,
            headers: { "X-XSRF-TOKEN": getCsrfToken() },
          })
        } catch (e) {
          console.error("Failed to upload custom image:", e)
        }
      } else if (!photoBase64) {
        try {
          await fetch("/api/profile/pfp", {
            method: "DELETE",
            headers: { "X-XSRF-TOKEN": getCsrfToken() },
          })
        } catch (e) {
          console.error("Failed to delete custom image:", e)
        }
      }

      // 2. Patch details to backend
      try {
        const mappedSocials = customSocials.map((s) => `${s.type}:${s.url}`)
        if (githubUser) mappedSocials.push(`GITHUB:${githubUser}`)
        if (leetcodeUser) mappedSocials.push(`LEETCODE:${leetcodeUser}`)

        const platformPreferences = {
          leetcode: {
            showRating: leetcodeShowRating,
            showProblems: leetcodeShowProblems,
            showHeatmap: leetcodeShowHeatmap,
            showBadges: leetcodeShowBadges,
          },
        }
        const displayPreferencesJson = JSON.stringify(platformPreferences)

        await updateProfile(
          designation,
          undefined,
          undefined,
          username,
          profileName,
          selectedBannerId,
          mappedSocials,
          projects,
          undefined,
          displayPreferencesJson,
        )
        toast.success("Profile saved successfully!")

        // 3. Re-fetch user to get latest state
      } catch (e: any) {
        console.error("Failed to update details in backend:", e)
        toast.error(`Save unsuccessful: ${e.message || "Unknown error"}`)
      }

      const ghUser = githubUser
      const lcUser = leetcodeUser


      // 3. Sync platforms with backend in parallel
      const syncPromises = []
      if (ghUser) {
        syncPromises.push(
          syncPlatform("GITHUB", ghUser).catch((e) => {
            console.error("GitHub sync failed:", e)
            toast.error(e.message)
          }),
        )
      }
      if (lcUser) {
        syncPromises.push(
          syncPlatform("LEETCODE", lcUser).catch((e) => {
            console.error("LeetCode sync failed:", e)
            toast.error(e.message)
          }),
        )
      }

      await Promise.allSettled(syncPromises)

      // 4. Fetch updated profile from backend if possible, else create local update
      let updatedUser: User
      try {
        updatedUser = await fetchProfile(username)
      } catch (e) {
        console.error(
          "Failed to fetch updated profile, using local state update:",
          e,
        )
        updatedUser = {
          ...user,
          username,
          profileName,
          displayName: profileName && profileName.trim() ? profileName : username,
          designation,
          title: designation,
          bannerId: selectedBannerId,
        }
      }
      updatedUser.displayName = (updatedUser.profileName && updatedUser.profileName.trim()) ? updatedUser.profileName : (updatedUser.username || username)

      const platformPreferences = {
        leetcode: {
          showRating: leetcodeShowRating,
          showProblems: leetcodeShowProblems,
          showHeatmap: leetcodeShowHeatmap,
          showBadges: leetcodeShowBadges,
        },
      }


      // Merge local connections state into updatedUser socials so they are immediately displayed
      updatedUser.socials = {
        github: githubUrl || updatedUser.socials?.github,
        leetcode: leetcodeUrl || updatedUser.socials?.leetcode,
      }
      updatedUser.customSocials = customSocials
      updatedUser.projects = projects
      updatedUser.platformPreferences = platformPreferences

      onSave(updatedUser)
      onClose()

      if (username && user.username && username !== user.username) {
        window.location.href = "/" + username
      }
    } catch (err) {
      console.error("Failed to save profile:", err)
      toast.error("Failed to save profile changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      toast.success("Account successfully deleted.")
      logoutUser()
    } catch (err) {
      console.error("Failed to delete account:", err)
      toast.error("Failed to delete account. Please try again.")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, filter: "blur(10px)", y: 20 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl h-[70vh] bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-2/80 text-muted hover:text-text transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Main Grid */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar -> Topbar on mobile */}
          <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-border bg-surface/30 flex flex-col overflow-y-hidden md:overflow-y-auto shrink-0">
            {/* Main Tabs */}
            <div className="flex border-b border-border p-2 md:p-3 gap-2 shrink-0">
              {["profile", "account"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as any)
                    if (tab === "profile") setActiveSection("yourself")
                    if (tab === "account") setActiveSection("theme")
                  }}
                  className={`relative flex-1 text-center py-1.5 text-xs rounded-md transition-colors z-10 ${activeTab === tab
                    ? "text-text"
                    : "text-muted hover:text-text"
                    }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="editModalMainTabs"
                      className="absolute inset-0 bg-surface-2 border border-border rounded-md -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  {tab === "profile" ? "Profile" : "Account"}
                </button>
              ))}
            </div>

            {/* Section Options based on Tab */}
            <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible p-2 gap-2 md:gap-0 md:space-y-1 custom-scrollbar shrink-0">
              {activeTab === "profile" ? (
                <>
                  {[
                    { id: "yourself", label: `"Yourself?"` },
                    { id: "photo", label: "Profile Photo" },
                    { id: "banner", label: "Banner" },
                    { id: "platforms", label: "Platforms" },
                    { id: "socials", label: "Socials" },
                    { id: "projects", label: "Projects" },
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as any)}
                      className={`relative shrink-0 md:w-full flex items-center px-3 py-2 text-left text-xs rounded-md transition-colors z-10 ${activeSection === section.id
                        ? "text-text"
                        : "text-muted hover:text-text hover:bg-surface/50"
                        }`}
                    >
                      {activeSection === section.id && (
                        <motion.div
                          layoutId="editModalSectionTabs"
                          className="absolute inset-0 bg-surface-2 border border-border rounded-md -z-10"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      {section.label}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { id: "theme", label: "Theme" },
                    { id: "danger", label: `"Don't touch here"` },
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as any)}
                      className={`relative shrink-0 md:w-full flex items-center px-3 py-2 text-left text-xs rounded-md transition-colors z-10 ${activeSection === section.id
                        ? "text-text"
                        : "text-muted hover:text-text hover:bg-surface/50"
                        }`}
                    >
                      {activeSection === section.id && (
                        <motion.div
                          layoutId="editModalSectionTabs"
                          className="absolute inset-0 bg-surface-2 border border-border rounded-md -z-10"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      {section.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Form Content Panel */}
          <div className="flex-1 bg-surface p-6 sm:p-8 overflow-y-auto flex flex-col">
            {activeTab === "profile" ? (
              activeSection === "yourself" ? (
                <div className="space-y-5 flex-1">
                  <h3 className="text-sm text-text mb-4">"Yourself?"</h3>

                  {/* Username */}
                  <div>
                    <label className="text-[11px] text-muted  tracking-wider mb-2 block">
                      Username
                    </label>
                    <div className="relative">
                      <ValidationTooltip
                        message="This username is already taken."
                        visible={isUsernameTaken && !isCheckingUsername}
                      />
                      <Input
                        value={username}
                        onChange={(e) =>
                          setUsername(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, ""),
                          )
                        }
                        placeholder="e.g. dwaragesh"
                        className={`w-full ${isUsernameTaken
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                          }`}
                      />
                    </div>
                    {isCheckingUsername ? (
                      <p className="text-[10px] text-muted mt-1">
                        Checking availability...
                      </p>
                    ) : username &&
                      username !== user.username &&
                      !isUsernameTaken ? (
                      <p className="text-[10px] text-green-500 mt-1">
                        Username is good to proceed!
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted mt-1">
                        Rules: alphanumeric and no symbols or spaces.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] text-muted  tracking-wider mb-2 block">
                      Display Name
                    </label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Dwaragesh C"
                      className="w-full"
                    />
                    <p className="text-[10px] text-muted mt-1">
                      This is the name displayed on your profile.
                    </p>
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5">
                    <label className="text-[11px]  text-muted">
                      Designation
                    </label>
                    <Input
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="bg-surface border-border"
                    />
                  </div>
                </div>
              ) : activeSection === "platforms" ? (
                <div className="space-y-5 flex-1">
                  <h3 className="text-sm text-text mb-4">Platforms</h3>

                  {/* GitHub URL */}
                  <div className="space-y-1.5 flex flex-col w-full">
                    <label className="text-[11px]  text-muted">
                      GitHub Username
                    </label>
                    <div className="relative">
                      <ValidationTooltip message={githubError} visible={!!githubError && !githubChecking} />
                      <Input
                        value={githubUser}
                        onChange={(e) => setGithubUser(e.target.value)}
                        className={`bg-surface ${githubError ? "border-red-500" : githubSuccess ? "border-green-500" : "border-border"}`}
                        icon={<LinkIcon className="w-3.5 h-3.5 text-muted" />}
                        rightIcon={
                          githubChecking ? <Loader2 className="w-4 h-4 animate-spin text-[#aaaaaa]" /> :
                            githubSuccess ? <Check className="w-4 h-4 text-green-500" /> :
                              githubError ? <X className="w-4 h-4 text-red-500" /> : undefined
                        }
                      />
                    </div>
                  </div>

                  {/* LeetCode URL & Settings Accordion */}
                  <div className="space-y-1.5 flex flex-col w-full border border-border/40 rounded-xl p-3 bg-surface-2/20">
                    <label className="text-[11px] text-muted">
                      LeetCode Username
                    </label>
                    <div className="relative">
                      <ValidationTooltip message={leetcodeError} visible={!!leetcodeError && !leetcodeChecking} />
                      <Input
                        value={leetcodeUser}
                        onChange={(e) => setLeetcodeUser(e.target.value)}
                        className={`bg-surface ${leetcodeError ? "border-red-500" : leetcodeSuccess ? "border-green-500" : "border-border"}`}
                        icon={<LinkIcon className="w-3.5 h-3.5 text-muted" />}
                        rightIcon={
                          leetcodeChecking ? <Loader2 className="w-4 h-4 animate-spin text-[#aaaaaa]" /> :
                            leetcodeSuccess ? <Check className="w-4 h-4 text-green-500" /> :
                              leetcodeError ? <X className="w-4 h-4 text-red-500" /> : undefined
                        }
                      />
                    </div>

                    {/* Accordion Toggle */}
                    <button
                      type="button"
                      onClick={() => setLeetcodeAccordionOpen(!leetcodeAccordionOpen)}
                      className="flex items-center justify-between pt-2 text-xs text-muted hover:text-text cursor-pointer select-none"
                    >
                      <span>Display Preferences</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${leetcodeAccordionOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Accordion Content */}
                    <AnimatePresence>
                      {leetcodeAccordionOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 pt-2 border-t border-border/30 overflow-hidden"
                        >
                          <div className="flex items-center justify-between text-xs py-1">
                            <span className="text-muted">Show Contest Rating</span>
                            <button
                              type="button"
                              onClick={() => setLeetcodeShowRating(!leetcodeShowRating)}
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${leetcodeShowRating ? "bg-accent" : "bg-surface border border-border"
                                }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform ${leetcodeShowRating ? "translate-x-4" : "translate-x-0"
                                  }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs py-1">
                            <span className="text-muted">Show Problem Count</span>
                            <button
                              type="button"
                              onClick={() => setLeetcodeShowProblems(!leetcodeShowProblems)}
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${leetcodeShowProblems ? "bg-accent" : "bg-surface border border-border"
                                }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform ${leetcodeShowProblems ? "translate-x-4" : "translate-x-0"
                                  }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs py-1">
                            <span className="text-muted">Show Heatmap</span>
                            <button
                              type="button"
                              onClick={() => setLeetcodeShowHeatmap(!leetcodeShowHeatmap)}
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${leetcodeShowHeatmap ? "bg-accent" : "bg-surface border border-border"
                                }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform ${leetcodeShowHeatmap ? "translate-x-4" : "translate-x-0"
                                  }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs py-1">
                            <span className="text-muted">Show Badges</span>
                            <button
                              type="button"
                              onClick={() => setLeetcodeShowBadges(!leetcodeShowBadges)}
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${leetcodeShowBadges ? "bg-accent" : "bg-surface border border-border"
                                }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform ${leetcodeShowBadges ? "translate-x-4" : "translate-x-0"
                                  }`}
                              />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : activeSection === "socials" ? (
                <div className="space-y-5 flex-1">
                  <div className="flex items-center justify-between mb-4 pr-8">
                    <h3 className="text-sm text-text">Socials</h3>
                    <Button
                      onClick={() =>
                        setCustomSocials([
                          ...customSocials,
                          { type: "linkedin", url: "" },
                        ])
                      }
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
                        <div key={idx} className="flex flex-col gap-1 w-full relative">
                          <div className="flex gap-2 items-center w-full">
                            <select
                              className="bg-surface border border-border rounded-md text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent/50 w-28 text-text h-9"
                              value={social.type}
                              onChange={(e) => {
                                const newSocials = [...customSocials]
                                newSocials[idx].type = e.target.value
                                newSocials[idx].error = ""
                                newSocials[idx].success = false
                                const isCheckable = e.target.value === "linkedin" || e.target.value === "mail"
                                const url = newSocials[idx].url.trim()
                                const initial = (user.customSocials || []).find(s => s.type === e.target.value && s.url.trim() === url)
                                newSocials[idx].checking = isCheckable && url !== "" && !initial
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
                                newSocials[idx].error = ""
                                newSocials[idx].success = false
                                const isCheckable = newSocials[idx].type === "linkedin" || newSocials[idx].type === "mail"
                                const url = e.target.value.trim()
                                const initial = (user.customSocials || []).find(s => s.type === newSocials[idx].type && s.url.trim() === url)
                                newSocials[idx].checking = isCheckable && url !== "" && !initial
                                setCustomSocials(newSocials)
                              }}
                              placeholder={
                                social.type === "mail"
                                  ? "johndoe@example.com"
                                  : social.type === "linkedin"
                                    ? "https://linkedin.com/in/..."
                                    : "https://..."
                              }
                              className={`bg-surface flex-1 ${social.error ? "border-red-500" : social.success ? "border-green-500" : "border-border"}`}
                              rightIcon={
                                social.checking ? <Loader2 className="w-4 h-4 animate-spin text-[#aaaaaa]" /> :
                                  social.success ? <Check className="w-4 h-4 text-green-500" /> :
                                    social.error ? <X className="w-4 h-4 text-red-500" /> : undefined
                              }
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
                          {social.error && (
                            <div className="relative" style={{ marginTop: 0, height: 0 }}>
                              <ValidationTooltip message={social.error} visible={!!social.error && !social.checking} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeSection === "projects" ? (
                <div className="space-y-5 flex-1 relative h-full">
                  {!isCreatingProject ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm text-text">Projects</h3>
                        <Button
                          onClick={() => setIsCreatingProject(true)}
                          variant="outline"
                          className="border-border text-xs h-7 px-3 bg-surface-2 hover:bg-border transition-colors mr-10"
                        >
                          + Add Project
                        </Button>
                      </div>
                      {projects.length === 0 ? (
                        <div className="text-center text-xs text-muted py-8 border border-dashed border-border rounded-lg">
                          No projects added yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {projects.map((proj, idx) => (
                            <div
                              key={idx}
                              className="border border-border p-4 rounded-xl relative space-y-2 flex items-center justify-between bg-surface-2/50 hover:bg-surface-2 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                {proj.projectImageBase64 ? (
                                  <Image
                                    src={proj.projectImageBase64}
                                    alt={proj.name}
                                    className="w-12 h-12 object-cover rounded-lg border border-border/50 bg-surface"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg border border-border/50 bg-surface flex items-center justify-center text-muted text-[10px] ">
                                    Img
                                  </div>
                                )}
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm text-text">
                                    {proj.name}
                                  </div>
                                  <div className="text-xs text-muted line-clamp-1 max-w-[250px]">
                                    {proj.description ||
                                      "No description provided."}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditProject(idx)}
                                  className="text-muted hover:text-accent bg-surface p-2 rounded-md transition-colors border border-border hover:border-accent/30"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const p = [...projects]
                                    p.splice(idx, 1)
                                    setProjects(p)
                                  }}
                                  className="text-muted hover:text-red-500 bg-surface p-2 rounded-md transition-colors border border-border hover:border-red-500/30"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col space-y-4 pb-8 h-full animate-fade-in">
                      <div className="flex items-center justify-between mb-2 mt-1">
                        <h3 className="text-sm text-text">
                          {editingProjectIndex >= 0
                            ? "Edit Project"
                            : "Create New Project"}
                        </h3>
                        <button
                          onClick={handleCloseCreateProject}
                          className="text-muted hover:text-text p-1 bg-surface-2 rounded-md mr-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4 overflow-y-auto px-1 pr-3 custom-scrollbar flex-1 pb-4">
                        <div>
                          <label className="text-[11px] text-muted  tracking-wider mb-1.5 block">
                            Project Name
                          </label>
                          <Input
                            value={newProject.name}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                name: e.target.value,
                              })
                            }
                            placeholder="e.g. Scard"
                            className="w-full text-xs bg-surface-2/50"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-muted  tracking-wider mb-1.5 block">
                            Project Image
                          </label>
                          <div className="mt-1 flex items-center gap-4">
                            {newProject.projectImageBase64 ? (
                              <>
                                <div className="relative w-20 h-20 rounded-lg border-2 border-border overflow-hidden group shrink-0">
                                  <Image
                                    src={newProject.projectImageBase64}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          const reader = new FileReader()
                                          reader.onload = (re) =>
                                            setNewProject({
                                              ...newProject,
                                              projectImageBase64: re.target
                                                ?.result as string,
                                            })
                                          reader.readAsDataURL(file)
                                        }
                                      }}
                                    />
                                    <Upload className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    setNewProject({
                                      ...newProject,
                                      projectImageBase64: "",
                                    })
                                  }
                                  className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors text-xs border border-red-500/20"
                                >
                                  <Trash2 className="w-4 h-4" /> Remove Image
                                </button>
                              </>
                            ) : (
                              <div className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-surface-2/30 hover:bg-surface-2/50 transition-colors cursor-pointer relative overflow-hidden">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      const reader = new FileReader()
                                      reader.onload = (re) =>
                                        setNewProject({
                                          ...newProject,
                                          projectImageBase64: re.target
                                            ?.result as string,
                                        })
                                      reader.readAsDataURL(file)
                                    }
                                  }}
                                />
                                <FileImage className="w-6 h-6 text-muted mb-2" />
                                <span className="text-xs text-muted">
                                  Click or drag image to upload
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-muted  tracking-wider mb-1.5 block">
                            Description
                          </label>
                          <textarea
                            value={newProject.description}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                description: e.target.value,
                              })
                            }
                            placeholder="Briefly describe what this project does..."
                            className="w-full h-20 bg-surface-2/50 border border-border rounded-md text-xs p-2.5 focus:outline-none focus:ring-1 focus:ring-accent/50 text-text resize-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-muted  tracking-wider mb-1.5 block">
                            Live URL
                          </label>
                          <Input
                            value={newProject.projectUrl}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                projectUrl: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className="w-full text-xs bg-surface-2/50"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-muted  tracking-wider mb-1.5 block">
                            Repository URL
                          </label>
                          <Input
                            value={newProject.repoUrl}
                            onChange={(e) =>
                              setNewProject({
                                ...newProject,
                                repoUrl: e.target.value,
                              })
                            }
                            placeholder="https://github.com/..."
                            className="w-full text-xs bg-surface-2/50"
                          />
                        </div>
                      </div>

                      <div className="pt-2 mt-auto">
                        <Button
                          onClick={handleAddProject}
                          className="w-full bg-accent text-white hover:bg-accent/90"
                        >
                          {editingProjectIndex >= 0
                            ? "Save Project"
                            : "Add Project"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeSection === "photo" ? (
                <div className="space-y-5 flex-1 relative">
                  <h3 className="text-sm text-text mb-4">Profile Photo</h3>

                  <div className="space-y-4">
                    <label className="text-[11px]  text-muted block">
                      Upload Photo
                    </label>
                    {photoBase64 ? (
                      <div className="flex items-center gap-6">
                        <div className="relative group rounded-full overflow-hidden border border-border bg-surface-2/30 h-28 w-28 shrink-0 shadow-md">
                          <Image
                            src={photoBase64}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  try {
                                    setPhotoFile(file)
                                    const reader = new FileReader()
                                    reader.onload = (re) =>
                                      setPhotoBase64(
                                        re.target?.result as string,
                                      )
                                    reader.readAsDataURL(file)
                                  } catch (err) {
                                    console.error(err)
                                  }
                                }
                              }}
                            />
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setPhotoFile(null)
                            setPhotoBase64("")
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors text-xs  border border-red-500/20"
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
                                setPhotoFile(file)
                                const reader = new FileReader()
                                reader.onload = (re) =>
                                  setPhotoBase64(re.target?.result as string)
                                reader.readAsDataURL(file)
                              } catch (err) {
                                console.error(err)
                              }
                            }
                          }}
                        />
                        <FileImage className="w-6 h-6 text-muted mb-2" />
                        <span className="text-xs text-muted">
                          Click or drag image to upload
                        </span>
                      </div>
                    )}
                  </div>


                </div>
              ) : activeSection === "banner" ? (
                <div className="space-y-5 flex-1">
                  <h3 className="text-sm text-text mb-4">Profile Banner</h3>
                  <div className="text-xs text-muted mb-4">
                    Select a banner to display at the top of your profile.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setSelectedBannerId(0)}
                      className={`h-24 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all bg-surface-2 ${selectedBannerId === 0
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-border hover:border-muted"
                        }`}
                    >
                      <span className="text-xs text-muted ">
                        Default Solid Color
                      </span>
                    </div>
                    {availableBanners.map((banner) => (
                      <div
                        key={banner.id}
                        onClick={() => setSelectedBannerId(banner.id)}
                        className={`h-24 rounded-lg border-2 cursor-pointer transition-all relative overflow-hidden bg-cover bg-center ${selectedBannerId === banner.id
                          ? "border-accent ring-2 ring-accent/30"
                          : "border-border hover:border-muted"
                          }`}
                        style={{ backgroundImage: banner.cssBackground }}
                      >
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs drop-shadow-md capitalize">
                            {banner.name
                              .replace(/\.[^/.]+$/, "")
                              .replace(/[-_]/g, " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            ) : activeTab === "account" ? (
              activeSection === "theme" ? (
                <div className="space-y-6 flex-1">
                  <h3 className="text-sm text-text mb-4">Theme Settings</h3>

                  {/* Theme Settings selector mimicking a shadcn tab/select */}
                  <div className="space-y-2">
                    <label className="text-[11px]  text-muted block">
                      System Theme
                    </label>
                    <div className="flex border border-border rounded-lg bg-surface/30 p-1 max-w-sm">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs  rounded-md transition-all ${theme === "light"
                          ? "bg-surface text-text border border-border shadow-sm"
                          : "text-muted hover:text-text"
                          }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>Light</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs  rounded-md transition-all ${theme === "dark"
                          ? "bg-surface text-text border border-border shadow-sm"
                          : "text-muted hover:text-text"
                          }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Dark</span>
                      </button>
                      <button
                        onClick={() => setTheme("system")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs  rounded-md transition-all ${theme === "system"
                          ? "bg-surface text-text border border-border shadow-sm"
                          : "text-muted hover:text-text"
                          }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>System</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeSection === "danger" ? (
                <div className="space-y-6 flex-1">
                  {/* Danger Zone / Delete Account */}
                  <div className="space-y-3">
                    <div className="text-xs text-red-500">Danger Zone</div>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Permanently delete your Scard account and all related
                      developer profiles, badge data, and contribution
                      consolidations.
                    </p>
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60  text-xs flex items-center gap-1.5 h-9 px-4"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Account</span>
                    </Button>
                  </div>
                </div>
              ) : null
            ) : null}

            {/* Bottom Actions (Only for Profile saving) */}
            {activeTab === "profile" && !isCreatingProject && (
              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <Button
                  onClick={handleSave}
                  disabled={saving || isCheckingUsername || isUsernameTaken || githubChecking || !!githubError || leetcodeChecking || !!leetcodeError || customSocials.some(s => s.checking || !!s.error)}
                  className="px-4 py-2 text-sm bg-accent text-white rounded-md hover:bg-accent/90"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Delete Confirmation Overlay */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 rounded-2xl"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">Delete Account</h3>
                <p className="text-sm text-muted mb-6">
                  Are you sure you want to delete your account? This action is permanent and cannot be undone.
                </p>
                <div className="flex items-center gap-3 w-full">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    variant="default"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none"
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default EditProfileModal
