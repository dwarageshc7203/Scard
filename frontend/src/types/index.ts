export type Platform = 'github' | 'leetcode' | 'codeforces' | 'hackerrank'

export interface Badge {
  platform: Platform
  label: string
  iconUrl?: string
}

export interface Contest {
  name: string
  rating: number
  rank: string
  date: string
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
  initials: string
  color: string
  joinedDaysAgo: number
  totalContributions: number
  badges: Badge[]
  contests?: Contest[]
  socials?: SocialLinks
  heatmapData: Array<{ date: string; count: number }>
  rawContributions: Array<{ platform: string; date: string; count: number }>
  isOnline: boolean
}
