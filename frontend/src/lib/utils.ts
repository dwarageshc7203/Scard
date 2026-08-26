import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getJoinedText(createdAt?: string): string {
  if (!createdAt) return "today"
  
  const createdDate = new Date(createdAt);
  if (isNaN(createdDate.getTime())) return "today";

  const diffDays = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays <= 0) return "today"
  if (diffDays === 1) return "yesterday"
  
  return "on " + createdDate.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
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
