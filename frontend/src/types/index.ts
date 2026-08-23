export type Platform = "github" | "leetcode" | "hackerrank"

export interface Badge {
  platform: Platform
  label: string
  iconUrl?: string
}

export interface Banner {
  id: number
  name: string
  cssBackground: string
}

export interface Contest {
  platform: string
  name: string
  rating: number
  rank: string
  date: string
}

export interface Project {
  name: string
  description: string
  url?: string
  projectImageBase64?: string
  projectUrl?: string
  repoUrl?: string
}

export interface SocialLinks {
  github?: string
  leetcode?: string
}

export interface User {
  id: string
  username: string
  profileName?: string
  displayName: string
  title: string
  designation?: string
  pin?: string
  pdfUrl?: string
  statusMessage?: string
  statusTime?: string
  email?: string
  imageURL?: string
  bannerId?: number
  initials: string
  color: string
  joinedDaysAgo: number
  joinedText?: string
  totalContributions: number
  badges: Badge[]
  contests?: Contest[]
  projects?: Project[]
  problemsSolved?: Record<string, {
    total: number
    easy: number
    medium: number
    hard: number
  }>
  anonymousViews?: number
  socials?: SocialLinks
  customSocials?: { type: string; url: string }[]
  platformPreferences?: {
    leetcode?: {
      showRating?: boolean
      showProblems?: boolean
      showHeatmap?: boolean
      showBadges?: boolean
    }
  }
  heatmapData: Array<{ date: string; count: number }>
  rawContributions: Array<{ platform: string; date: string; count: number }>
  isOnline: boolean
}
