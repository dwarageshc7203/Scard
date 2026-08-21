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
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 py-4 mt-8 h-full">
      <h2 className="onboarding-subheader">
        What should we call you?
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center relative min-h-[200px]">
        <div className="flex flex-col w-full max-w-[340px] mb-8">
          <div className="flex items-center justify-between w-full">
            <span className="onboarding-text mr-4">
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError("")
              }}
              className="w-56 px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-md outline-none text-white focus:border-[#555555] transition-all font-sans text-[15px]"
              disabled={loading}
            />
          </div>
          {error && (
            <div className="w-full flex justify-end mt-2">
              <p className="text-red-500 text-xs font-sans w-56 pl-1">
                {error}
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="absolute bottom-12 right-12 px-5 py-2 border border-[#444444] hover:border-white/50 text-[#dddddd] rounded-md text-sm transition-all font-sans flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Checking..." : "Next →"}
        </button>
      </form>
    </div>
  )
}
