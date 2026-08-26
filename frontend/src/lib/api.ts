import { User, Badge, Contest, Platform } from "../types"
import { getJoinedText, stringToColor } from "./utils"

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


export function mapContributionsToHeatmap(
  contributions?: BackendContribution[],
  filterPlatform?: string,
): { heatmapData: Array<{ date: string; count: number }>; total: number } {
  if (!contributions || contributions.length === 0) {
    return { heatmapData: [], total: 0 }
  }

  const countMap = new Map<string, number>()
  let total = 0
  contributions.forEach((c) => {
    if (
      !filterPlatform ||
      filterPlatform === "All" ||
      filterPlatform.toLowerCase() === c.platform.toLowerCase()
    ) {
      countMap.set(
        c.contributionDate,
        (countMap.get(c.contributionDate) || 0) + c.count,
      )
      total += c.count
    }
  })

  // Fill in missing days for the last 365 days
  const heatmapData = Array.from({ length: 365 }, (_, i) => {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const dateStr = `${year}-${month}-${day}`

    return {
      date: dateStr,
      count: countMap.get(dateStr) || 0,
    }
  }).reverse()

  return { heatmapData, total }
}

export function mapProfileToUser(profile: BackendProfile): User {
  const { heatmapData, total } = mapContributionsToHeatmap(
    profile.contributions || [],
  )

  return {
    id: profile.userName,
    username: profile.userName,
    profileName: profile.profileName,
    displayName: (profile.profileName && profile.profileName.trim()) ? profile.profileName : profile.userName,
    title: profile.designation || "",
    designation: profile.designation,
    pin: profile.pin,
    email: profile.email,
    pdfUrl: `/api/profile/${profile.userName}/export`,
    statusMessage: undefined,
    statusTime: "Recently",
    imageURL:
      (profile.imageURL?.startsWith('/uploads/')
        ? profile.imageURL.replace('/uploads/', '/api/images/')
        : profile.imageURL) ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.profileName || profile.userName)}&background=random`,
    initials: profile.userName.substring(0, 2).toUpperCase(),
    color: stringToColor(profile.userName),
    joinedDaysAgo: profile.createdAt
      ? Math.floor(
        (Date.now() - new Date(profile.createdAt).getTime()) /
        (1000 * 60 * 60 * 24),
      )
      : 0,
    joinedText: getJoinedText(profile.createdAt),
    totalContributions: total,
    isOnline: false,
    bannerId: profile.bannerId,
    badges: (profile.badges || []).map((b) => ({
      platform: b.platform.toLowerCase() as Platform,
      label: `${b.platform} · ${b.badgeName}`,
      iconUrl: b.badgeURL,
    })),
    contests: (profile.contests || [])
      .map((c) => ({
        platform: c.platform,
        name: c.contestName,
        rating: c.contestRating,
        rank: "Rank N/A",
        date: c.contestDate,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    projects: profile.projects || [],
    problemsSolved: profile.problemStats || {},
    anonymousViews: profile.anonymousViews || 0,
    socials: {
      github: (() => {
        const s = (profile.socials || []).find((s) =>
          s.toLowerCase().startsWith("github:"),
        )
        return s ? `https://github.com/${s.split(":", 2)[1]}` : ""
      })(),
      leetcode: (() => {
        const s = (profile.socials || []).find((s) =>
          s.toLowerCase().startsWith("leetcode:"),
        )
        return s ? `https://leetcode.com/${s.split(":", 2)[1]}` : ""
      })(),

    },
    customSocials: (profile.socials || [])
      .filter(
        (s) =>
          !["github", "leetcode"].includes(
            s.split(":", 1)[0].toLowerCase(),
          ),
      )
      .map((s) => {
        const idx = s.indexOf(":")
        if (idx === -1) return { type: "link", url: s }
        let type = s.substring(0, idx).toLowerCase()
        if (type === "linked_in") type = "linkedin"
        return { type, url: s.substring(idx + 1) }
      }),
    platformPreferences: typeof profile.displayPreferences === "object" && profile.displayPreferences !== null
      ? profile.displayPreferences
      : typeof profile.displayPreferences === "string" && profile.displayPreferences.trim() !== ""
        ? JSON.parse(profile.displayPreferences)
        : {},
    heatmapData,
    rawContributions: (profile.contributions || []).map((c) => ({
      platform: c.platform,
      date: c.contributionDate || (c as any).date,
      count: c.count,
    })),
  }
}

export async function fetchProfiles(): Promise<User[]> {
  const res = await fetch("/api/profiles")
  if (!res.ok) throw new Error("Failed to fetch profiles")
  const data = await res.json()
  const profiles: BackendProfile[] = Array.isArray(data) ? data : (data.content || [])
  return profiles.map(mapProfileToUser)
}

export async function fetchProfile(username: string): Promise<User> {
  const res = await fetch(`/api/profile/${username}`)
  if (!res.ok) throw new Error("Failed to fetch profile")
  const profile: BackendProfile = await res.json()
  return mapProfileToUser(profile)
}

export async function fetchMe() {
  const res = await fetch("/api/me")
  if (!res.ok) return null
  return res.json()
}

export async function fetchBanners() {
  const res = await fetch("/api/banners")
  if (!res.ok) throw new Error("Failed to fetch banners")
  return res.json()
}

export function getCsrfToken() {
  const match = document.cookie.match(new RegExp("(^| )XSRF-TOKEN=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : ""
}

export async function checkUsername(username: string): Promise<boolean> {
  const res = await fetch(
    `/api/profile/check-username?username=${encodeURIComponent(username)}`,
  )
  if (!res.ok) return false
  return res.json()
}

export async function checkLinkedin(username: string): Promise<{ taken: boolean, ownerUsername?: string }> {
  const res = await fetch(`/api/profile/check-linkedin?username=${encodeURIComponent(username)}`)
  if (!res.ok) return { taken: false }
  return res.json()
}

export async function checkGithub(username: string): Promise<{ taken: boolean, ownerUsername?: string }> {
  const res = await fetch(`/api/profile/check-github?username=${encodeURIComponent(username)}`)
  if (!res.ok) return { taken: false }
  return res.json()
}

export async function checkLeetcode(username: string): Promise<{ taken: boolean, ownerUsername?: string }> {
  const res = await fetch(`/api/profile/check-leetcode?username=${encodeURIComponent(username)}`)
  if (!res.ok) return { taken: false }
  return res.json()
}

export async function checkMail(email: string): Promise<{ taken: boolean, ownerUsername?: string }> {
  const res = await fetch(`/api/profile/check-mail?email=${encodeURIComponent(email)}`)
  if (!res.ok) throw new Error(`check-mail returned ${res.status}`)
  return res.json()
}

export async function createProfile(
  userName: string,
  profileName: string,
  designation: string,
) {
  const res = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": getCsrfToken(),
    },
    body: JSON.stringify({ userName, profileName, designation }),
  })
  if (!res.ok) throw new Error("Failed to create profile")
  return res.json()
}

export async function updateProfile(
  designation?: string,
  profileUrl?: string,
  email?: string,
  userName?: string,
  profileName?: string,
  bannerId?: number,
  socials?: string[],
  projects?: any[],
  problemsSolved?: Record<string, number>,
  displayPreferences?: string,
) {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": getCsrfToken(),
    },
    body: JSON.stringify({
      designation,
      profileUrl,
      email,
      userName,
      profileName,
      bannerId,
      socials,
      projects,
      problemsSolved,
      displayPreferences,
    }),
  })
  if (!res.ok) {
    const txt = await res.text()
    console.error("Backend error response:", txt)
    throw new Error(`Failed to update profile: ${txt}`)
  }
  return res.json()
}

export async function fetchAnalytics() {
  const res = await fetch("/api/profile/analytics")
  if (!res.ok) throw new Error("Failed to fetch analytics")
  return res.json()
}

export async function syncPlatform(
  platform: "GITHUB" | "LEETCODE",
  externalUsername: string,
) {
  const res = await fetch("/api/profile/platforms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": getCsrfToken(),
    },
    body: JSON.stringify({ platform, externalUsername }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText)
    throw new Error(`Sync failed for ${platform}: ${body}`)
  }
  return res.text()
}

export async function deleteAccount() {
  const res = await fetch("/api/me", {
    method: "DELETE",
    headers: {
      "X-XSRF-TOKEN": getCsrfToken(),
    },
  })
  if (!res.ok) throw new Error("Failed to delete user")
}

export function logoutUser() {
  localStorage.removeItem("scard_username");
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/logout";

  const token = getCsrfToken();
  if (token) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "_csrf";
    input.value = token;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}
