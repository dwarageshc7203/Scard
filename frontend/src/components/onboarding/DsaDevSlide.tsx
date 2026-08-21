import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DsaDevSlideProps {
  initialLeetcode: string
  initialGithub: string
  onNext: (leetcode: string, github: string) => void
  onPrev: () => void
}

export default function DsaDevSlide({
  initialLeetcode,
  initialGithub,
  onNext,
  onPrev,
}: DsaDevSlideProps) {
  const [leetcode, setLeetcode] = useState(initialLeetcode)
  const [github, setGithub] = useState(initialGithub)

  const [showDsa, setShowDsa] = useState(!!initialLeetcode)
  const [showDev, setShowDev] = useState(!!initialGithub)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleBatman = () => {
    // window.close() is blocked by most browsers if not opened by script.
    // Redirect to a blank page or google as a fallback
    window.location.href = "about:blank"
  }

  const handleNone = () => {
    onNext("", "")
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    let lcValid = true
    let ghValid = true

    // Verify LeetCode
    if (showDsa && leetcode.trim()) {
      try {
        const res = await fetch(`https://alfa-leetcode-api.onrender.com/${leetcode.trim()}`)
        if (res.status === 200) {
          const data = await res.json()
          if (data.errors) lcValid = false
        } else {
          lcValid = false
        }
      } catch (err) {
        lcValid = false
      }
    }

    // Verify GitHub
    if (showDev && github.trim()) {
      try {
        const res = await fetch(`https://api.github.com/users/${github.trim()}`)
        if (res.status !== 200) ghValid = false
      } catch (err) {
        ghValid = false
      }
    }

    setLoading(false)

    if (!lcValid && showDsa && leetcode.trim()) {
      setError("LeetCode user not found")
      return
    }
    if (!ghValid && showDev && github.trim()) {
      setError("GitHub user not found")
      return
    }

    // If they enable a section but leave it completely blank, should we consider it empty or an error?
    // Let's treat blank as empty.
    onNext(
      showDsa ? leetcode.trim() : "",
      showDev ? github.trim() : ""
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-4 min-h-[300px] h-full">
      <h2 className="onboarding-subheader mb-16">
        You do any DSA or Dev?
      </h2>

      <div className="w-full flex justify-center">
        {/* We use translate-x-[166px] because the 2nd column is 300px and the gap is 32px (8). 
            Shifting right by 150px + 16px perfectly centers the 180px first column in the screen! */}
        <div className="grid grid-cols-[180px_300px] gap-x-8 gap-y-4 items-center translate-x-[166px]">
          {/* Row 1: DSA */}
          <button
            type="button"
            onClick={() => setShowDsa(!showDsa)}
            className={`w-full py-2.5 px-4 rounded-md text-center text-[15px] font-sans transition-all border ${
              showDsa
                ? "bg-white text-black border-white"
                : "bg-transparent text-[#cccccc] border-[#333333] hover:border-white/50 hover:text-white"
            }`}
          >
            DSA
          </button>
          <div className="h-[42px] flex items-center">
            <AnimatePresence>
              {showDsa && (
                <motion.input
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  type="text"
                  placeholder="LeetCode username"
                  value={leetcode}
                  onChange={(e) => {
                    setLeetcode(e.target.value)
                    setError("")
                  }}
                  className="w-full bg-transparent border border-[#333333] rounded-md px-4 py-2.5 text-[15px] font-sans text-white focus:border-[#555555] outline-none placeholder:text-[#555555]"
                  disabled={loading}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Row 2: Dev */}
          <button
            type="button"
            onClick={() => setShowDev(!showDev)}
            className={`w-full py-2.5 px-4 rounded-md text-center text-[15px] font-sans transition-all border ${
              showDev
                ? "bg-white text-black border-white"
                : "bg-transparent text-[#cccccc] border-[#333333] hover:border-white/50 hover:text-white"
            }`}
          >
            Dev
          </button>
          <div className="h-[42px] flex items-center">
            <AnimatePresence>
              {showDev && (
                <motion.input
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  type="text"
                  placeholder="GitHub username"
                  value={github}
                  onChange={(e) => {
                    setGithub(e.target.value)
                    setError("")
                  }}
                  className="w-full bg-transparent border border-[#333333] rounded-md px-4 py-2.5 text-[15px] font-sans text-white focus:border-[#555555] outline-none placeholder:text-[#555555]"
                  disabled={loading}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Row 3: None */}
          <button
            type="button"
            onClick={handleNone}
            className="w-full py-2.5 px-4 rounded-md text-center text-[15px] font-sans transition-all border bg-transparent text-[#cccccc] border-[#333333] hover:border-white/50 hover:text-white"
          >
            None
          </button>
          <div></div>

          {/* Row 4: I am Batman */}
          <button
            type="button"
            onClick={handleBatman}
            className="w-full py-2.5 px-4 rounded-md text-center text-[15px] font-sans transition-all border bg-transparent text-red-400 border-red-500/30 hover:border-red-500/60 hover:text-red-300"
          >
            I am Batman
          </button>
          <div></div>
        </div>
      </div>

      <div className="w-full flex justify-center h-8 mt-6">
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>

      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={handleNext}
        disabled={loading || (!showDsa && !showDev)}
        className="absolute bottom-12 right-12 px-5 py-2 border border-[#444444] hover:border-white/50 text-[#dddddd] rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Checking..." : "Next →"}
      </button>

      <button
        type="button"
        onClick={onPrev}
        className="absolute bottom-12 left-12 px-5 py-2 border border-[#444444] hover:border-white/50 text-[#dddddd] rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px]"
      >
        ← Back
      </button>
    </div>
  )
}
