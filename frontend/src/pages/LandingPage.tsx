import type { FC } from 'react'
import type { User } from '../data/mockData'
import Button from '../components/ui/button'
import Card, { CardHeader, CardContent } from '../components/ui/card'
import Avatar from '../components/ui/avatar'
import Badge from '../components/ui/badge'
import { Sparkles, ArrowRight, Zap, Cpu, Fingerprint, Pencil, Settings2, ShieldCheck } from 'lucide-react'

const HEAT_COLORS = ['#111111', '#0d2f5e', '#1a4db5', '#2563eb', '#3b82f6', '#60a5fa']

const ProfileMockup: FC<{ user: User }> = ({ user }) => (
  <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface/30 p-4 shadow-2xl shadow-zinc-950/15 backdrop-blur-md">
    <div className="border border-border/60 rounded-xl overflow-hidden bg-bg/50">
      {/* Browser bar */}
      <div className="border-b border-border/50 px-4 py-2.5 flex items-center justify-between bg-surface/20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
        </div>
        <span className="text-[10px] text-muted font-mono bg-bg/40 px-3 py-0.5 rounded border border-border/20">
          {user.username}.scard.app
        </span>
        <div className="w-10" />
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar
            initials={user.initials}
            color={user.color}
            size="lg"
            isOnline={user.isOnline}
            className="ring-2 ring-border/80"
          />
          <div>
            <div className="text-base font-bold text-text flex items-center gap-2">
              {user.displayName}
              <Badge variant="default" className="text-[8px] px-1.5 py-0">PRO</Badge>
            </div>
            <div className="text-xs text-muted font-medium">{user.title}</div>
            <div className="text-[10px] text-accent font-mono uppercase tracking-widest font-bold mt-1">
              {user.totalContributions.toLocaleString()} contributions
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-2">
          <div className="text-[9px] text-muted uppercase tracking-widest font-bold font-mono">
            Contributions Activity (Consolidated)
          </div>
          <div className="flex gap-[2.5px] overflow-hidden bg-bg/40 p-3 rounded-lg border border-border/30">
            {user.heatmapData.slice(-24).map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2.5px]">
                {week.map((level, di) => (
                  <div
                    key={di}
                    className="w-[10px] h-[10px] rounded-[2px]"
                    style={{ backgroundColor: HEAT_COLORS[Math.max(0, Math.min(5, level))] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="space-y-2">
          <div className="text-[9px] text-muted uppercase tracking-widest font-bold font-mono">
            Connected platforms
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.badges.map((badge, i) => (
              <Badge key={i} variant={badge.platform} className="text-[10px] font-medium">
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

const FEATURES = [
  {
    icon: <Zap className="w-4 h-4 text-accent" />,
    title: 'Faaast',
    body: 'Aggregates and merges your contributions across platforms in milliseconds.',
  },
  {
    icon: <Cpu className="w-4 h-4 text-accent" />,
    title: 'Powerful',
    body: 'Flexible filters, customizable themes, and full activity charts.',
  },
  {
    icon: <Fingerprint className="w-4 h-4 text-accent" />,
    title: 'Security',
    body: 'sensible privacy defaults and encrypted credentials syncing.',
  },
  {
    icon: <Pencil className="w-4 h-4 text-accent" />,
    title: 'Customization',
    body: 'Aesthetic profile cards and custom subdomains built to share.',
  },
  {
    icon: <Settings2 className="w-4 h-4 text-accent" />,
    title: 'Control',
    body: 'Easily select which platforms, profiles, and activities to display.',
  },
  {
    icon: <Sparkles className="w-4 h-4 text-accent" />,
    title: 'Built for AI',
    body: 'Exportable JSON metrics and clean structure optimized for resumes.',
  },
]

interface LandingPageProps {
  featuredUser: User
  onGetStarted: () => void
}

const LandingPage: FC<LandingPageProps> = ({ featuredUser, onGetStarted }) => {
  return (
    <div className="min-h-screen bg-bg relative overflow-hidden transition-colors duration-300">

      {/* Background glowing decorations */}
      <div aria-hidden="true" className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block pointer-events-none">
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.04)_0,hsla(0,0%,55%,.02)_50%,transparent_80%)]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.03)_0,transparent_80%)] [translate:5%_-50%]" />
      </div>

      <main className="overflow-hidden">

        {/* Hero Section */}
        <section className="relative pt-20 md:pt-32">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-15" />
          <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--bg)_75%)]" />

          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0 space-y-6">
              {/* Giant Heading with Sansation font */}
              <h1 className="mt-8 text-balance text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem] sansation-regular leading-[1.08] tracking-tight animate-fade-in-blur animation-delay-200">
                All your Dev Profiles<br />
                as a Card
              </h1>

              {/* Description */}
              <p className="mx-auto mt-6 max-w-2xl text-balance text-base sm:text-lg text-muted leading-relaxed animate-fade-in-blur animation-delay-400">
                Keep it all together with Scard — one shareable URL, every platform integrated, consolidated daily metrics.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row animate-fade-in-blur animation-delay-600">
                <div className="bg-foreground/5 rounded-xl border border-border p-0.5 shadow-lg">
                  <Button
                    variant="default"
                    onClick={onGetStarted}
                    className="h-10 rounded-lg px-6 text-base font-semibold shadow-md shadow-accent/15 gap-1.5"
                  >
                    <span>Try Scard Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Centered Mockup Frame */}
              <div className="relative mt-12 overflow-hidden px-2 sm:mt-16 md:mt-20 animate-fade-in-blur animation-delay-600">
                <div aria-hidden="true" className="bg-gradient-to-b from-transparent to-bg absolute inset-0 z-10 from-35%" />
                <ProfileMockup user={featuredUser} />
              </div>

            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="py-16 md:py-24 border-t border-border/60 bg-surface/5">
          <div className="mx-auto max-w-5xl space-y-12 px-6">

            <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center">
              <h2 className="text-balance text-3xl font-bold lg:text-4xl sansation-regular">
                The foundation for smarter profile tracking
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Scard merges your developer profiles into a single dashboard — quick setup, automated indexing, and responsive views.
              </p>
            </div>

            <div className="relative mx-auto grid max-w-4xl border border-border divide-x divide-y divide-border/60 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-surface/10 rounded-2xl overflow-hidden">
              {FEATURES.map((f, i) => (
                <div key={i} className="p-8 space-y-3 hover:bg-surface/20 transition-all duration-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                      {f.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-text">{f.title}</h3>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-24 border-t border-border/40">
          <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
            <h2 className="text-balance text-3xl font-bold lg:text-4xl sansation-regular">Start Building</h2>
            <p className="text-sm text-muted max-w-md mx-auto">
              Link your developer profiles now and claim your permanent subdomain portfolio in seconds.
            </p>
            <div className="flex justify-center pt-2">
              <Button variant="default" size="lg" onClick={onGetStarted} className="rounded-xl px-8 shadow-lg shadow-accent/25">
                Get Started
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/80 bg-surface/10 py-10">
          <div className="mx-auto max-w-5xl px-6 flex flex-wrap justify-between gap-6 items-center">
            <span className="text-xs text-muted font-medium">© 2026 Scard, All rights reserved</span>
            <div className="flex gap-6 text-xs text-muted font-medium">
              <a href="#" className="hover:text-text transition-colors">Github</a>
              <a href="#" className="hover:text-text transition-colors">Linkedin</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  )
}

export default LandingPage
