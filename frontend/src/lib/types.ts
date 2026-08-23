export interface BackendBadge {
  badgeId: number
  platform: string
  badgeName: string
  badgeURL: string
  badgeDate: string
}

export interface BackendContest {
  contestId: number
  platform: string
  contestName: string
  contestDate: string
  contestRating: number
}

export interface BackendContribution {
  platform: string
  contributionDate: string
  count: number
}

export interface BackendProfile {
  userName: string
  profileName?: string
  designation?: string
  pin?: string
  profileUrl: string
  imageURL?: string
  email?: string
  badges?: BackendBadge[]
  contests?: BackendContest[]
  projects?: {
    name: string
    description: string
    url?: string
    projectImageBase64?: string
    projectUrl?: string
    repoUrl?: string
  }[]
  problemStats?: Record<string, {
    total: number
    easy: number
    medium: number
    hard: number
  }>
  contributions?: BackendContribution[]
  bannerId?: number
  socials?: string[]
  anonymousViews?: number
  createdAt?: string
  displayPreferences?: any
}
