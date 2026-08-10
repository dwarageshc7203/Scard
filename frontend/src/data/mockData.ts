export type Platform = 'github' | 'leetcode' | 'codeforces' | 'hackerrank'

export interface Badge {
  platform: Platform
  label: string
}

export interface Contest {
  name: string
  rating: number
  rank: string
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
  heatmapData: number[][]
  isOnline: boolean
}

function genHeatmap(seed: number): number[][] {
  let s = seed
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 4294967295
  }
  const data: number[][] = []
  for (let w = 0; w < 53; w++) {
    const week: number[] = []
    for (let d = 0; d < 7; d++) {
      const isWeekend = d === 0 || d === 6
      const r = rand()
      let level: number
      if (isWeekend) {
        level = r < 0.5 ? 0 : r < 0.65 ? 1 : r < 0.78 ? 2 : r < 0.89 ? 3 : r < 0.96 ? 4 : 5
      } else {
        level = r < 0.18 ? 0 : r < 0.32 ? 1 : r < 0.52 ? 2 : r < 0.72 ? 3 : r < 0.9 ? 4 : 5
      }
      week.push(level)
    }
    data.push(week)
  }
  return data
}

export const USERS: User[] = [
  {
    id: 'alexchen',
    username: 'alexchen',
    displayName: 'Alex Chen',
    title: 'Full Stack Engineer · Open to Work',
    designation: 'Computer Engineering Graduate in Dubai, UAE',
    pdfUrl: '#',
    statusMessage: 'Looking for a job.',
    statusTime: '3 days ago',
    initials: 'AC',
    color: '#1E3A5F',
    joinedDaysAgo: 3,
    totalContributions: 2341,
    isOnline: true,
    badges: [
      { platform: 'github', label: 'GitHub · 847 commits' },
      { platform: 'leetcode', label: 'LeetCode · 100 Day Streak' },
      { platform: 'codeforces', label: 'Codeforces · Expert' },
      { platform: 'hackerrank', label: 'HackerRank · 5★ Python' },
    ],
    contests: [
      { name: 'LeetCode Weekly Contest 390', rating: 1982, rank: '1244 / 23000' },
      { name: 'Codeforces Round 940 (Div. 2)', rating: 1654, rank: '890 / 9500' }
    ],
    socials: {
      github: 'https://github.com/alexchen',
      leetcode: 'https://leetcode.com/alexchen',
      codeforces: 'https://codeforces.com/profile/alexchen'
    },
    heatmapData: genHeatmap(42),
  },
  {
    id: 'mariasantos',
    username: 'mariasantos',
    displayName: 'Maria Santos',
    title: 'Backend Engineer · Rust & Go',
    designation: 'Systems Engineer at TechCorp',
    pdfUrl: '#',
    statusMessage: 'Coding in Rust all day.',
    statusTime: '7 days ago',
    initials: 'MS',
    color: '#3B1F5E',
    joinedDaysAgo: 7,
    totalContributions: 1892,
    isOnline: false,
    badges: [
      { platform: 'github', label: 'GitHub · 1,204 commits' },
      { platform: 'codeforces', label: 'Codeforces · Master' },
      { platform: 'leetcode', label: 'LeetCode · Knight' },
    ],
    contests: [
      { name: 'Codeforces Round 930 (Div. 1)', rating: 2154, rank: '402 / 3100' }
    ],
    socials: {
      github: 'https://github.com/mariasantos',
      leetcode: 'https://leetcode.com/mariasantos',
      codeforces: 'https://codeforces.com/profile/mariasantos'
    },
    heatmapData: genHeatmap(73),
  },
  {
    id: 'devpatel',
    username: 'devpatel',
    displayName: 'Dev Patel',
    title: 'ML Engineer · PyTorch',
    designation: 'Research Fellow at AI Lab',
    pdfUrl: '#',
    statusMessage: 'Training deep models.',
    statusTime: '12 days ago',
    initials: 'DP',
    color: '#1F4A3B',
    joinedDaysAgo: 12,
    totalContributions: 3104,
    isOnline: true,
    badges: [
      { platform: 'github', label: 'GitHub · 2,341 commits' },
      { platform: 'leetcode', label: 'LeetCode · Guardian' },
      { platform: 'hackerrank', label: 'HackerRank · 5★ AI' },
    ],
    contests: [
      { name: 'LeetCode Biweekly Contest 120', rating: 2314, rank: '105 / 28000' }
    ],
    socials: {
      github: 'https://github.com/devpatel',
      leetcode: 'https://leetcode.com/devpatel'
    },
    heatmapData: genHeatmap(108),
  },
  {
    id: 'jameswright',
    username: 'jameswright',
    displayName: 'James Wright',
    title: 'Systems Programmer · C & Zig',
    designation: 'Kernel Contributor',
    pdfUrl: '#',
    statusMessage: 'Writing a new OS kernel.',
    statusTime: '15 days ago',
    initials: 'JW',
    color: '#4A3A1F',
    joinedDaysAgo: 15,
    totalContributions: 987,
    isOnline: false,
    badges: [
      { platform: 'github', label: 'GitHub · 432 commits' },
      { platform: 'codeforces', label: 'Codeforces · Specialist' },
    ],
    contests: [
      { name: 'Codeforces Round 938 (Div. 3)', rating: 1492, rank: '120 / 15000' }
    ],
    socials: {
      github: 'https://github.com/jameswright',
      codeforces: 'https://codeforces.com/profile/jameswright'
    },
    heatmapData: genHeatmap(51),
  },
  {
    id: 'yukitanaka',
    username: 'yukitanaka',
    displayName: 'Yuki Tanaka',
    title: 'Frontend Engineer · React & WebGL',
    initials: 'YT',
    color: '#1F3A4A',
    joinedDaysAgo: 21,
    totalContributions: 2876,
    isOnline: true,
    badges: [
      { platform: 'github', label: 'GitHub · 1,877 commits' },
      { platform: 'leetcode', label: 'LeetCode · 365 Day Streak' },
    ],
    heatmapData: genHeatmap(29),
  },
  {
    id: 'sarahkim',
    username: 'sarahkim',
    displayName: 'Sarah Kim',
    title: 'DevOps Engineer · Kubernetes',
    initials: 'SK',
    color: '#4A1F3A',
    joinedDaysAgo: 28,
    totalContributions: 1456,
    isOnline: false,
    badges: [
      { platform: 'github', label: 'GitHub · 923 commits' },
      { platform: 'hackerrank', label: 'HackerRank · 5★ Linux' },
    ],
    heatmapData: genHeatmap(67),
  },
  {
    id: 'omarhassan',
    username: 'omarhassan',
    displayName: 'Omar Hassan',
    title: 'Competitive Programmer',
    initials: 'OH',
    color: '#3A4A1F',
    joinedDaysAgo: 34,
    totalContributions: 4210,
    isOnline: true,
    badges: [
      { platform: 'codeforces', label: 'Codeforces · Grandmaster' },
      { platform: 'leetcode', label: 'LeetCode · Guardian' },
      { platform: 'hackerrank', label: 'HackerRank · 5★ Algorithms' },
    ],
    heatmapData: genHeatmap(88),
  },
  {
    id: 'priyasharma',
    username: 'priyasharma',
    displayName: 'Priya Sharma',
    title: 'Security Engineer · Web3',
    initials: 'PS',
    color: '#2D1F4A',
    joinedDaysAgo: 41,
    totalContributions: 1123,
    isOnline: false,
    badges: [
      { platform: 'github', label: 'GitHub · 654 commits' },
      { platform: 'hackerrank', label: 'HackerRank · 5★ Security' },
    ],
    heatmapData: genHeatmap(34),
  },
  {
    id: 'lucassilva',
    username: 'lucassilva',
    displayName: 'Lucas Silva',
    title: 'Mobile Engineer · Flutter',
    initials: 'LS',
    color: '#1F4A2D',
    joinedDaysAgo: 55,
    totalContributions: 765,
    isOnline: false,
    badges: [
      { platform: 'github', label: 'GitHub · 321 commits' },
      { platform: 'leetcode', label: 'LeetCode · 30 Day Streak' },
    ],
    heatmapData: genHeatmap(55),
  },
  {
    id: 'emmazhang',
    username: 'emmazhang',
    displayName: 'Emma Zhang',
    title: 'Data Engineer · dbt & Spark',
    initials: 'EZ',
    color: '#4A2D1F',
    joinedDaysAgo: 63,
    totalContributions: 1987,
    isOnline: true,
    badges: [
      { platform: 'github', label: 'GitHub · 1,102 commits' },
      { platform: 'leetcode', label: 'LeetCode · Knight' },
    ],
    heatmapData: genHeatmap(71),
  },
  {
    id: 'noahwilliams',
    username: 'noahwilliams',
    displayName: 'Noah Williams',
    title: 'Open Source · Neovim plugins',
    initials: 'NW',
    color: '#1F2D4A',
    joinedDaysAgo: 78,
    totalContributions: 5432,
    isOnline: false,
    badges: [
      { platform: 'github', label: 'GitHub · 4,231 commits' },
    ],
    heatmapData: genHeatmap(99),
  },
  {
    id: 'fatimaalsayed',
    username: 'fatimaalsayed',
    displayName: 'Fatima Al-Sayed',
    title: 'Infrastructure · Terraform',
    initials: 'FA',
    color: '#3A1F4A',
    joinedDaysAgo: 90,
    totalContributions: 892,
    isOnline: false,
    badges: [
      { platform: 'github', label: 'GitHub · 512 commits' },
      { platform: 'hackerrank', label: 'HackerRank · 5★ Shell' },
    ],
    heatmapData: genHeatmap(19),
  },
]
