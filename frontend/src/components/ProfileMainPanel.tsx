import { useState, type FC } from "react"
import type { User } from "../types"
import Avatar from "./ui/avatar"
import Badge from "./ui/badge"
import Button from "./ui/button"
import Card, { CardContent, CardHeader } from "./ui/card"
import Heatmap from "./Heatmap"
import { mapContributionsToHeatmap } from "../lib/api"
import BadgeContainer from "./BadgeContainer"
import ContestGraph from "./ContestGraph"
import { Terminal, Image, Globe, Star } from "lucide-react"

interface ProfileMainPanelProps {
  user: User
}

const ASCII_FACE = `  .---------.
 /  ◉    ◉  \\
|     __     |
|    (  )    |
 \\   ----   /
  '---------'`

const SectionLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="text-[10px] text-muted uppercase tracking-widest mb-4 flex items-center gap-1.5"
    style={{ letterSpacing: "0.14em" }}
  >
    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
    {children}
  </div>
)

const ProfileMainPanel: FC<ProfileMainPanelProps> = ({ user }) => {
  const [showAscii, setShowAscii] = useState(false)
  const [heatmapPlatform, setHeatmapPlatform] = useState<string>("All")

  // Recompute heatmap based on filter
  // We need to map rawContributions to BackendContribution format
  const backendContribs = user.rawContributions.map((c) => ({
    platform: c.platform,
    contributionDate: c.date,
    count: c.count,
  }))
  const { heatmapData } = mapContributionsToHeatmap(
    backendContribs,
    heatmapPlatform,
  )

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-bg to-surface/20 transition-all duration-300">
      <div className="px-6 py-8 lg:px-12 lg:py-12 max-w-[900px] mx-auto space-y-8">
        {/* Main profile card */}
        <Card className="bg-surface/40 backdrop-blur-md border-border/60 overflow-hidden relative group">
          {/* Subtle colored top bar */}
          <div
            className="h-1.5 w-full transition-all duration-500"
            style={{ backgroundColor: user.color }}
          />

          <CardHeader className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex gap-6 items-center">
              <div className="relative">
                {showAscii ? (
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-surface-2 border border-border rounded-xl font-mono text-accent overflow-hidden transition-all duration-300"
                    style={{ fontSize: "7px", lineHeight: "10px" }}
                  >
                    <pre className="select-none leading-none">{ASCII_FACE}</pre>
                  </div>
                ) : (
                  <Avatar
                    initials={user.initials}
                    color={user.color}
                    size="xl"
                    isOnline={user.isOnline}
                    className="shadow-xl ring-2 ring-border/80"
                  />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl tracking-tight text-text">
                    {user.displayName}
                  </h1>
                  {user.isOnline && (
                    <Badge
                      variant="default"
                      className="text-[9px] px-2 py-0 animate-pulse bg-green-500/10 text-green-400 border-green-500/25"
                    >
                      Online
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted font-medium">
                  {user.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted font-mono pt-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{user.username}.scard.app</span>
                  <span>·</span>
                  <span className="font-semibold text-text/80">
                    {user.totalContributions.toLocaleString()} contributions
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAscii((v) => !v)}
              className="font-mono text-[10px] px-3 gap-1.5 self-start sm:self-center h-8"
            >
              {showAscii ? (
                <>
                  <Image className="w-3.5 h-3.5 text-accent" />
                  <span>View Photo</span>
                </>
              ) : (
                <>
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  <span>ASCII Mode</span>
                </>
              )}
            </Button>
          </CardHeader>
        </Card>

        {/* Contributions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionLabel>Contributions Activity</SectionLabel>
            <div className="flex bg-surface-2/50 p-1 rounded-lg text-[10px] font-semibold border border-border/40">
              {["All", "GitHub", "LeetCode", "CodeForces"].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setHeatmapPlatform(platform)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    heatmapPlatform === platform
                      ? "bg-accent text-white shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
          <Card className="bg-surface/20 border-border/50">
            <CardContent className="p-6 overflow-x-auto">
              <Heatmap data={heatmapData} />
            </CardContent>
          </Card>
        </section>

        {/* Contest Ratings */}
        <section className="space-y-4">
          <SectionLabel>Contest Ratings</SectionLabel>
          <Card className="bg-surface/20 border-border/50">
            <CardContent className="p-6">
              <ContestGraph contests={user.contests || []} />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <SectionLabel>Badges</SectionLabel>
          <BadgeContainer badges={user.badges} />
        </section>
      </div>
    </main>
  )
}

export default ProfileMainPanel
