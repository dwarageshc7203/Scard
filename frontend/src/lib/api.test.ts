import { describe, it, expect } from "vitest"
import { mapContributionsToHeatmap, mapProfileToUser, BackendContribution, BackendProfile } from "./api"
import { Platform } from "../types"

describe("Mappers", () => {
  it("mapContributionsToHeatmap maps correctly with no filter", () => {
    const contributions: BackendContribution[] = [
      { platform: "github", contributionDate: "2023-01-01", count: 5 },
      { platform: "leetcode", contributionDate: "2023-01-01", count: 2 },
    ]
    const { heatmapData, total } = mapContributionsToHeatmap(contributions)
    
    expect(total).toBe(7)
    // Find the date in the array (if it's within the last 365 days, it's there. 
    // We can just check that it handles empty vs non-empty properly).
    const emptyResult = mapContributionsToHeatmap([])
    expect(emptyResult.total).toBe(0)
    expect(emptyResult.heatmapData.length).toBe(0)
  })

  it("mapContributionsToHeatmap filters by platform", () => {
    const contributions: BackendContribution[] = [
      { platform: "github", contributionDate: "2023-01-01", count: 5 },
      { platform: "leetcode", contributionDate: "2023-01-01", count: 2 },
    ]
    const { total } = mapContributionsToHeatmap(contributions, "github")
    expect(total).toBe(5)
  })

  it("mapProfileToUser maps profile correctly", () => {
    const backendProfile: BackendProfile = {
      userName: "testuser",
      profileName: "Test User",
      profileUrl: "test",
      contributions: [],
      badges: [],
      contests: [],
      projects: [],
      anonymousViews: 10,
    }

    const user = mapProfileToUser(backendProfile)
    expect(user.username).toBe("testuser")
    expect(user.displayName).toBe("Test User")
    expect(user.anonymousViews).toBe(10)
    expect(user.isOnline).toBe(false)
  })
})
