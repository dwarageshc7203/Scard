import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DsaDevSlideProps {
  initialLeetcode: string
  initialGithub: string
  onNext: (leetcode: string, github: string) => void
  onPrev: () => void
}

type Mode = "menu" | "dsa" | "dev"

export default function DsaDevSlide({
  initialLeetcode,
  initialGithub,
  onNext,
  onPrev,
}: DsaDevSlideProps) {
  const [leetcode, setLeetcode] = useState(initialLeetcode)
  const [github, setGithub] = useState(initialGithub)
  const [mode, setMode] = useState<Mode>("menu")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleBatman = () => {
    window.close()
  }

  const handleNone = () => {
    onNext("", "")
  }

  const handleCheckGithub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!github.trim()) {
      setError("Username cannot be empty")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`https://api.github.com/users/${github.trim()}`)
      if (res.status === 200) {
        onNext("", github.trim())
      } else {
        setError("GitHub user not found")
      }
    } catch (err) {
      setError("Error checking GitHub. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckLeetcode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leetcode.trim()) {
      setError("Username cannot be empty")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/${leetcode.trim()}`)
      if (res.status === 200) {
        const data = await res.json()
        if (data.errors) {
          setError("LeetCode user not found")
        } else {
          onNext(leetcode.trim(), "")
        }
      } else {
        setError("LeetCode user not found")
      }
    } catch (err) {
      setError("Error checking LeetCode. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 py-4 min-h-[300px]">
      <h2 className="text-[44px] md:text-[54px] font-light tracking-tight text-white mb-12 text-center font-sans">
        The DSA/Dev division
      </h2>

      <div className="w-full flex flex-col items-center relative overflow-hidden min-h-[260px]">
        <AnimatePresence mode="wait">
          {mode === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-4 w-full max-w-[340px]"
            >
              <button
                onClick={() => setMode("dsa")}
                className="w-full py-3 bg-[#222222] border border-[#333333] hover:border-white/50 text-[#cccccc] rounded-md transition-all font-sans cursor-pointer"
              >
                DSA
              </button>
              <button
                onClick={() => setMode("dev")}
                className="w-full py-3 bg-[#222222] border border-[#333333] hover:border-white/50 text-[#cccccc] rounded-md transition-all font-sans cursor-pointer"
              >
                Dev
              </button>
              <button
                onClick={handleNone}
                className="w-full py-3 bg-[#222222] border border-[#333333] hover:border-white/50 text-[#cccccc] rounded-md transition-all font-sans cursor-pointer"
              >
                None
              </button>
              <button
                onClick={handleBatman}
                className="w-full py-3 bg-[#111111] border border-red-500/30 hover:border-red-500/60 text-red-400 rounded-md transition-all font-sans cursor-pointer"
              >
                I am Batman
              </button>
            </motion.div>
          )}

          {mode === "dsa" && (
            <motion.form
              key="dsa"
              onSubmit={handleCheckLeetcode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center w-full max-w-[340px]"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[#cccccc] font-sans text-[15px]">LeetCode Username</span>
                <input
                  type="text"
                  value={leetcode}
                  onChange={(e) => {
                    setLeetcode(e.target.value)
                    setError("")
                  }}
                  className="w-48 px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-md outline-none text-white focus:border-[#555555] transition-all font-sans text-[15px]"
                  disabled={loading}
                />
              </div>
              <div className="w-full flex justify-end h-6">
                {error && <span className="text-red-500 text-xs font-sans pl-1">{error}</span>}
              </div>
              <div className="flex justify-between w-full mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setMode("menu")
                    setError("")
                  }}
                  className="px-5 py-2 border border-[#444444] hover:border-white/50 text-[#dddddd] rounded-md text-sm transition-all font-sans cursor-pointer"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-white text-black hover:bg-gray-200 rounded-md text-sm transition-all font-sans cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Checking..." : "Verify & Next"}
                </button>
              </div>
            </motion.form>
          )}

          {mode === "dev" && (
            <motion.form
              key="dev"
              onSubmit={handleCheckGithub}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center w-full max-w-[340px]"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[#cccccc] font-sans text-[15px]">GitHub Username</span>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => {
                    setGithub(e.target.value)
                    setError("")
                  }}
                  className="w-48 px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-md outline-none text-white focus:border-[#555555] transition-all font-sans text-[15px]"
                  disabled={loading}
                />
              </div>
              <div className="w-full flex justify-end h-6">
                {error && <span className="text-red-500 text-xs font-sans pl-1">{error}</span>}
              </div>
              <div className="flex justify-between w-full mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setMode("menu")
                    setError("")
                  }}
                  className="px-5 py-2 border border-[#444444] hover:border-white/50 text-[#dddddd] rounded-md text-sm transition-all font-sans cursor-pointer"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-white text-black hover:bg-gray-200 rounded-md text-sm transition-all font-sans cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Checking..." : "Verify & Next"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-start gap-3 w-full max-w-2xl absolute bottom-0 left-0 p-8">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2 border border-[#444444] hover:border-white/50 text-[#dddddd] rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px]"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
