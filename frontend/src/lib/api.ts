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
  platform: string
  contributionDate: string
  count: number
}

export interface BackendProfile {
  userName: string
  designation: string
  profileURL: string
  email?: string
  asciiArt?: string
  badges?: BackendBadge[]
  contests?: BackendContest[]
  projects?: { name: string; description: string; url: string }[]
  problemsSolved?: Record<string, number>
  contributions?: BackendContribution[]
  bannerId?: number
  socials?: string[]
  anonymousViews?: number
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

export function mapContributionsToHeatmap(contributions?: BackendContribution[], filterPlatform?: string): { heatmapData: Array<{ date: string; count: number }>, total: number } {
  if (!contributions || contributions.length === 0) {
    return { heatmapData: [], total: 0 }
  }

  const countMap = new Map<string, number>()
  let total = 0
  contributions.forEach(c => {
    if (!filterPlatform || filterPlatform === 'All' || filterPlatform.toLowerCase() === c.platform.toLowerCase()) {
      countMap.set(c.contributionDate, (countMap.get(c.contributionDate) || 0) + c.count)
      total += c.count
    }
  })

  // Fill in missing days for the last 365 days
  const heatmapData = Array.from({ length: 365 }, (_, i) => {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    return {
      date: dateStr,
      count: countMap.get(dateStr) || 0
    }
  }).reverse()

  return { heatmapData, total }
}

export function mapProfileToUser(profile: BackendProfile): User {
  const { heatmapData, total } = mapContributionsToHeatmap(profile.contributions || [])
  const savedSocials = JSON.parse(localStorage.getItem(`socials_${profile.userName}`) || '{}')
  const savedAvatar = localStorage.getItem(`avatar_${profile.userName}`)

  return {
    id: profile.userName,
    username: profile.userName,
    displayName: profile.userName.charAt(0).toUpperCase() + profile.userName.slice(1),
    title: profile.designation || 'Full Stack Engineer',
    designation: profile.designation,
    email: profile.email,
    pdfUrl: `/api/profile/${profile.userName}/export`,
    statusMessage: profile.asciiArt ? 'ASCII PFP Custom Art Loaded' : undefined,
    statusTime: 'Recently',
    asciiArt: profile.asciiArt,
    imageURL: savedAvatar || profile.imageURL,
    initials: profile.userName.substring(0, 2).toUpperCase(),
    color: stringToColor(profile.userName),
    joinedDaysAgo: 1,
    totalContributions: total,
    isOnline: true,
    bannerId: profile.bannerId,
    badges: (profile.badges || []).map(b => ({
      platform: b.platform.toLowerCase() as Platform,
      label: `${b.platform} · ${b.badgeName}`,
      iconUrl: b.badgeURL
    })),
    contests: (profile.contests || []).map(c => ({
      name: c.contestName,
      rating: c.contestRating,
      rank: 'Rank N/A',
      date: c.contestDate
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    projects: profile.projects || [],
    problemsSolved: profile.problemsSolved || {},
    anonymousViews: profile.anonymousViews || 0,
    socials: {
      github: savedSocials.githubUrl || (profile.badges || []).find(b => b.platform.toLowerCase() === 'github')?.badgeURL || '',
      leetcode: savedSocials.leetcodeUrl || (profile.badges || []).find(b => b.platform.toLowerCase() === 'leetcode')?.badgeURL || '',
      codeforces: savedSocials.codeforcesUrl || (profile.badges || []).find(b => b.platform.toLowerCase() === 'codeforces')?.badgeURL || '',
    },
    customSocials: (profile.socials || []).map(s => {
      const idx = s.indexOf(':');
      if (idx === -1) return { type: 'link', url: s };
      return { type: s.substring(0, idx), url: s.substring(idx + 1) };
    }),
    heatmapData,
    rawContributions: (profile.contributions || []).map(c => ({ platform: c.platform, date: c.contributionDate || (c as any).date, count: c.count }))
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

export async function fetchBanners() {
  const res = await fetch('/api/banners')
  if (!res.ok) throw new Error('Failed to fetch banners')
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

export async function updateProfile(designation?: string, profileURL?: string, email?: string, asciiArt?: string, userName?: string, bannerId?: number, socials?: string[], projects?: any[], problemsSolved?: Record<string, number>) {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ designation, profileURL, email, asciiArt, userName, bannerId, socials, projects, problemsSolved }),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export async function fetchAnalytics() {
  const res = await fetch('/api/profile/analytics')
  if (!res.ok) throw new Error('Failed to fetch analytics')
  return res.json()
}

export async function syncPlatform(platform: 'GITHUB' | 'LEETCODE' | 'CODEFORCES', externalUsername: string) {
  const res = await fetch('/api/profile/platforms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ platform, externalUsername }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText)
    throw new Error(`Sync failed for ${platform}: ${body}`)
  }
  return res.text()
}
