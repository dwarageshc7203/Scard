import React, { useState, useEffect } from "react"
import { checkUsername } from "../../lib/api"
import { motion } from "framer-motion"
import { Loader2, Check, X } from "lucide-react"
import ValidationTooltip from "../ui/ValidationTooltip"

interface UsernameSlideProps {
  initialValue: string
  onNext: (username: string) => void
}

export default function UsernameSlide({ initialValue, onNext }: UsernameSlideProps) {
  const [username, setUsername] = useState(initialValue)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    let isMounted = true
    const check = async () => {
      if (!username.trim()) {
        if (isMounted) {
          setError("")
          setIsChecking(false)
          setIsSuccess(false)
        }
        return
      }

      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")
      if (cleanUsername !== username.toLowerCase()) {
        if (isMounted) {
          setError("Username can only contain alphanumeric characters, underscores, or hyphens")
          setIsChecking(false)
          setIsSuccess(false)
        }
        return
      }

      try {
        const isTaken = await checkUsername(cleanUsername)
        if (isMounted) {
          if (isTaken) {
            setError("Username is already taken")
            setIsSuccess(false)
          } else {
            setError("")
            setIsSuccess(true)
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Error checking username.")
          setIsSuccess(false)
        }
      } finally {
        if (isMounted) setIsChecking(false)
      }
    }

    setIsChecking(true)
    setIsSuccess(false)
    const timer = setTimeout(check, 500)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isChecking || error || !username.trim()) return

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")
    setLoading(true)
    onNext(cleanUsername)
  }

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 py-4 mt-8 h-full"
    >
      <h2 className="onboarding-subheader">
        What should we call you?
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center relative min-h-[200px]">
        <div className="flex flex-col w-full max-w-[340px] mb-8">
          <div className="flex items-center justify-between w-full">
            <span className="onboarding-text mr-4">
              Username
            </span>
            {/* Input wrapper — relative so tooltip is positioned against it */}
            <div className="relative flex items-center">
              <div className="relative">
                <ValidationTooltip message={error} visible={!!error && !isChecking} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError("")
                    setIsSuccess(false)
                  }}
                  className={`w-56 px-3 py-1.5 bg-[#222222] border ${error ? "border-red-500" : isSuccess ? "border-green-500" : "border-[#333333]"} rounded-md outline-none text-white focus:border-[#555555] transition-all font-sans text-[15px]`}
                  disabled={loading}
                />
              </div>
              <div className="absolute -right-6 flex items-center justify-center">
                {isChecking && <Loader2 className="w-4 h-4 animate-spin text-[#aaaaaa]" />}
                {!isChecking && isSuccess && <Check className="w-5 h-5 text-green-500" />}
                {!isChecking && error && <X className="w-5 h-5 text-red-500" />}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || isChecking || !!error || !username.trim()}
          className="absolute bottom-12 right-12 px-5 py-2 border border-[#444444] hover:border-white/50 text-[#dddddd] rounded-md text-sm transition-all font-sans flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Checking..." : "Next →"}
        </button>
      </form>
    </motion.div>
  )
}
