import React, { useState } from "react"

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
  
  // Toggles for selections
  const [selectedOptions, setSelectedOptions] = useState({
    dsa: !!initialLeetcode,
    dev: !!initialGithub,
    none: !initialLeetcode && !initialGithub,
    batman: false,
  })

  const handleOptionClick = (option: "dsa" | "dev" | "none" | "batman") => {
    if (option === "none") {
      setSelectedOptions({
        dsa: false,
        dev: false,
        none: true,
        batman: false,
      })
      setLeetcode("")
      setGithub("")
    } else if (option === "batman") {
      setSelectedOptions({
        dsa: false,
        dev: false,
        none: false,
        batman: true,
      })
      setLeetcode("")
      setGithub("batman")
    } else {
      setSelectedOptions((prev) => {
        const updated = {
          ...prev,
          [option]: !prev[option],
          none: false,
          batman: false,
        }
        if (!updated.dsa && !updated.dev) {
          updated.none = true
        }
        return updated
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(
      selectedOptions.dsa ? leetcode : "",
      selectedOptions.dev ? github : selectedOptions.batman ? "batman" : ""
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-8 text-center font-sans">
        You do any DSA or Dev?
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div className="flex flex-col gap-5 w-full max-w-md mb-8">
          {/* Row 1: DSA / LeetCode */}
          <div className="flex items-center justify-between min-h-[44px]">
            <button
              type="button"
              onClick={() => handleOptionClick("dsa")}
              className={`text-left font-sans text-lg cursor-pointer transition-all ${
                selectedOptions.dsa ? "text-white font-medium" : "text-gray-500"
              }`}
            >
              DSA
            </button>
            {selectedOptions.dsa && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-sans">LeetCode username</span>
                <input
                  type="text"
                  value={leetcode}
                  onChange={(e) => setLeetcode(e.target.value)}
                  placeholder="LeetCode username"
                  className="w-48 px-3 py-1.5 bg-[#1e1e1e] border border-white/10 rounded-md outline-none text-white focus:border-white/30 text-xs transition-all font-sans placeholder:text-gray-700"
                />
              </div>
            )}
          </div>

          {/* Row 2: Dev / GitHub */}
          <div className="flex items-center justify-between min-h-[44px]">
            <button
              type="button"
              onClick={() => handleOptionClick("dev")}
              className={`text-left font-sans text-lg cursor-pointer transition-all ${
                selectedOptions.dev ? "text-white font-medium" : "text-gray-500"
              }`}
            >
              Dev
            </button>
            {selectedOptions.dev && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-sans">GitHub username</span>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="GitHub username"
                  className="w-48 px-3 py-1.5 bg-[#1e1e1e] border border-white/10 rounded-md outline-none text-white focus:border-white/30 text-xs transition-all font-sans placeholder:text-gray-700"
                />
              </div>
            )}
          </div>

          {/* Row 3: None */}
          <div className="flex items-center min-h-[44px]">
            <button
              type="button"
              onClick={() => handleOptionClick("none")}
              className={`text-left font-sans text-lg cursor-pointer transition-all ${
                selectedOptions.none ? "text-white font-medium" : "text-gray-500"
              }`}
            >
              None
            </button>
          </div>

          {/* Row 4: I am Batman */}
          <div className="flex items-center min-h-[44px]">
            <button
              type="button"
              onClick={() => handleOptionClick("batman")}
              className={`text-left font-sans text-lg cursor-pointer transition-all ${
                selectedOptions.batman ? "text-white font-medium" : "text-gray-500"
              }`}
            >
              I am Batman
            </button>
          </div>
        </div>

        <div className="flex justify-between w-full max-w-md mt-4">
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-1.5 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white rounded-md text-sm transition-all font-sans cursor-pointer"
          >
            ← Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onNext("", "")}
              className="px-6 py-1.5 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white rounded-md text-sm transition-all font-sans cursor-pointer"
            >
              Skip →
            </button>
            <button
              type="submit"
              className="px-6 py-1.5 border border-white/20 hover:border-white/50 text-white rounded-md text-sm transition-all font-sans cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
