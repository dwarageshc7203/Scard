export function getJoinedText(createdAt?: string): string {
  if (!createdAt) return "today"
  const diffDays = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays <= 0) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return "this week"
  if (diffDays < 30) return "a few weeks ago"
  if (diffDays < 60) return "this month"
  if (diffDays < 365) return "few months ago"
  return "few years ago"
}

export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    "#1E3A5F",
    "#3B1F5E",
    "#1F4A3B",
    "#4A3A1F",
    "#1F3A4A",
    "#4A1F3A",
    "#3A4A1F",
    "#2D1F4A",
    "#1F4A2D",
    "#4A2D1F",
  ]
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export function getCsrfToken() {
  const match = document.cookie.match(new RegExp("(^| )XSRF-TOKEN=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : ""
}
