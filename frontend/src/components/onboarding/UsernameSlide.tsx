import React, { useState } from "react"
import { checkUsername } from "../../lib/api"

interface UsernameSlideProps {
  initialValue: string
  onNext: (username: string) => void
}

export default function UsernameSlide({ initialValue, onNext }: UsernameSlideProps) {
  const [username, setUsername] = useState(initialValue)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError("Username cannot be empty")
      return
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")
    if (cleanUsername !== username.toLowerCase()) {
      setError("Username can only contain alphanumeric characters, underscores, or hyphens")
      return
    }

    setLoading(true)
    setError("")

    try {
      const isTaken = await checkUsername(cleanUsername)
      if (isTaken) {
        setError("Username is already taken")
      } else {
        onNext(cleanUsername)
      }
    } catch (err) {
      console.error(err)
      setError("Error checking username. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-8 text-center font-sans">
        What should we call you?
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div className="flex items-center w-full max-w-md mb-8">
          <span className="text-gray-400 font-sans text-sm md:text-base mr-4 w-24 text-right">
            Username
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setError("")
            }}
            placeholder="e.g. dev_john"
            className="flex-1 px-4 py-2 bg-[#1e1e1e] border border-white/10 rounded-md outline-none text-white focus:border-white/30 transition-all font-sans text-sm md:text-base placeholder:text-gray-600"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs md:text-sm font-sans mb-4 text-center">
            {error}
          </p>
        )}

        <div className="flex justify-end w-full max-w-md mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-1.5 border border-white/20 hover:border-white/50 text-white rounded-md text-sm transition-all font-sans flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Checking..." : "Next →"}
          </button>
        </div>
      </form>
    </div>
  )
}
