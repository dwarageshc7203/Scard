export type Platform = 'github' | 'leetcode' | 'codeforces' | 'hackerrank'

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
  name: string
  rating: number
  rank: string
  date: string
}

export interface Project {
  name: string
  description: string
  url: string
}

export interface SocialLinks {
  github?: string
  leetcode?: string
  codeforces?: string
}

export interface User {
  id: string
  username: string
  displayName: string
  title: string
  designation?: string
  pdfUrl?: string
  statusMessage?: string
  statusTime?: string
  email?: string
  asciiArt?: string
  imageURL?: string
  bannerId?: number
  initials: string
  color: string
  joinedDaysAgo: number
  totalContributions: number
  badges: Badge[]
  contests?: Contest[]
  projects?: Project[]
  problemsSolved?: Record<string, number>
  anonymousViews?: number
  socials?: SocialLinks
  customSocials?: { type: string; url: string }[]
  heatmapData: Array<{ date: string; count: number }>
  rawContributions: Array<{ platform: string; date: string; count: number }>
  isOnline: boolean
}
