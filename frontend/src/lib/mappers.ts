import { User, Platform } from "../types"
import { BackendProfile, BackendContribution } from "./types"
import { getJoinedText, stringToColor } from "./utils"

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
  const savedSocials = JSON.parse(
    localStorage.getItem(`socials_${profile.userName}`) || "{}",
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
    statusMessage: profile.asciiArt ? "ASCII PFP Custom Art Loaded" : undefined,
    statusTime: "Recently",
    asciiArt: profile.asciiArt,
    imageURL:
      profile.imageURL ||
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
    isOnline: true,
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
      codeforces: (() => {
        const s = (profile.socials || []).find((s) =>
          s.toLowerCase().startsWith("codeforces:"),
        )
        return s ? `https://codeforces.com/profile/${s.split(":", 2)[1]}` : ""
      })(),
    },
    customSocials: (profile.socials || [])
      .filter(
        (s) =>
          !["github", "leetcode", "codeforces"].includes(
            s.split(":", 1)[0].toLowerCase(),
          ),
      )
      .map((s) => {
        const idx = s.indexOf(":")
        if (idx === -1) return { type: "link", url: s }
        return { type: s.substring(0, idx), url: s.substring(idx + 1) }
      }),
    platformPreferences: typeof profile.displayPreferences === "object" && profile.displayPreferences !== null
      ? profile.displayPreferences
      : typeof profile.displayPreferences === "string" && profile.displayPreferences.trim() !== ""
      ? JSON.parse(profile.displayPreferences)
      : JSON.parse(localStorage.getItem(`platform_prefs_${profile.userName}`) || "{}"),
    heatmapData,
    rawContributions: (profile.contributions || []).map((c) => ({
      platform: c.platform,
      date: c.contributionDate || (c as any).date,
      count: c.count,
    })),
  }
}
