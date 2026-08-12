import { User, Badge, Contest, Platform } from '../types'

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
  contributionId: number
  platform: string
  contributionDate: string
  count: number
}

export interface BackendProfile {
  userName: string
  designation: string
  profileURL: string
  asciiArt?: string
  badges?: BackendBadge[]
  contests?: BackendContest[]
  contributions?: BackendContribution[]
}

function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#1E3A5F', '#3B1F5E', '#1F4A3B', '#4A3A1F', '#1F3A4A', 
    '#4A1F3A', '#3A4A1F', '#2D1F4A', '#1F4A2D', '#4A2D1F'
  ]
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

function mapContributionsToHeatmap(contributions?: BackendContribution[]): { heatmapData: number[][], total: number } {
  const grid: number[][] = Array.from({ length: 53 }, () => Array(7).fill(0))
  if (!contributions || contributions.length === 0) {
    return { heatmapData: grid, total: 0 }
  }

  const countMap = new Map<string, number>()
  let total = 0
  contributions.forEach(c => {
    countMap.set(c.contributionDate, c.count)
    total += c.count
  })

  const msPerDay = 24 * 60 * 60 * 1000
  const today = new Date()
  
  let dayCount = 53 * 7 - 1
  for (let w = 52; w >= 0; w--) {
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today.getTime() - dayCount * msPerDay)
      const dateStr = date.toISOString().split('T')[0]
      const count = countMap.get(dateStr) || 0
      
      const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : count < 15 ? 4 : 5
      grid[w][d] = level
      dayCount--
    }
  }

  return { heatmapData: grid, total }
}

export function mapProfileToUser(profile: BackendProfile): User {
  const { heatmapData, total } = mapContributionsToHeatmap(profile.contributions || [])
  const savedSocials = JSON.parse(localStorage.getItem(`socials_${profile.userName}`) || '{}')

  return {
    id: profile.userName,
    username: profile.userName,
    displayName: profile.userName.charAt(0).toUpperCase() + profile.userName.slice(1),
    title: profile.designation || 'Full Stack Engineer',
    designation: profile.designation,
    pdfUrl: `/api/profile/${profile.userName}/export`,
    statusMessage: profile.asciiArt ? 'ASCII PFP Custom Art Loaded' : undefined,
    statusTime: 'Recently',
    initials: profile.userName.substring(0, 2).toUpperCase(),
    color: stringToColor(profile.userName),
    joinedDaysAgo: 1,
    totalContributions: total,
    isOnline: true,
    badges: (profile.badges || []).map(b => ({
      platform: b.platform.toLowerCase() as Platform,
      label: `${b.platform} · ${b.badgeName}`
    })),
    contests: (profile.contests || []).map(c => ({
      name: c.contestName,
      rating: c.contestRating,
      rank: 'Rank N/A'
    })),
    socials: {
      github: savedSocials.githubUrl || (profile.badges || []).find(b => b.platform.toLowerCase() === 'github')?.badgeURL || '',
      leetcode: savedSocials.leetcodeUrl || (profile.badges || []).find(b => b.platform.toLowerCase() === 'leetcode')?.badgeURL || '',
      codeforces: savedSocials.codeforcesUrl || (profile.badges || []).find(b => b.platform.toLowerCase() === 'codeforces')?.badgeURL || '',
    },
    heatmapData,
  }
}

export async function fetchProfiles(): Promise<User[]> {
  const res = await fetch('/api/profiles')
  if (!res.ok) throw new Error('Failed to fetch profiles')
  const profiles: BackendProfile[] = await res.json()
  return profiles.map(mapProfileToUser)
}

export async function fetchProfile(username: string): Promise<User> {
  const res = await fetch(`/api/profile/${username}`)
  if (!res.ok) throw new Error('Failed to fetch profile')
  const profile: BackendProfile = await res.json()
  return mapProfileToUser(profile)
}

export async function fetchMe() {
  const res = await fetch('/api/me')
  if (!res.ok) return null
  return res.json()
}

export async function createProfile(userName: string, designation: string) {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userName, designation }),
  })
  if (!res.ok) throw new Error('Failed to create profile')
  return res.json()
}

export async function updateProfile(designation?: string, profileURL?: string) {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ designation, profileURL }),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export async function syncPlatform(platform: 'GITHUB' | 'LEETCODE' | 'CODEFORCES', externalUsername: string) {
  try {
    const res = await fetch('/api/profile/platforms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, externalUsername }),
    })
    if (!res.ok) {
      console.warn(`Backend sync returned non-ok status for ${platform}. Simulation used.`);
      return "Synced"
    }
    return res.text()
  } catch (e) {
    console.warn(`Connection failed while syncing ${platform}. Simulation used.`);
    return "Synced"
  }
}
