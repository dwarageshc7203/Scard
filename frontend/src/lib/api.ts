import { User } from "../types"
import { BackendProfile } from "./types"
import { mapProfileToUser } from "./mappers"
import { getCsrfToken } from "./utils"

export { mapContributionsToHeatmap } from "./mappers"

export async function fetchProfiles(): Promise<User[]> {
  const res = await fetch("/api/profiles")
  if (!res.ok) throw new Error("Failed to fetch profiles")
  const profiles: BackendProfile[] = await res.json()
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
  asciiArt?: string,
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
      asciiArt,
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
  platform: "GITHUB" | "LEETCODE" | "CODEFORCES",
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
  if (!res.ok) throw new Error("Failed to delete account")
}
