import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { checkLeetcode, checkGithub } from "../../lib/api"
import { Loader2, Check, X } from "lucide-react"
import ValidationTooltip from "@/components/ui/ValidationTooltip"

interface DsaDevSlideProps {
  initialLeetcode: string
  initialGithub: string
  onNext: (leetcode: string, github: string) => void
  onPrev: () => void
}

/** One 3D flippable card component powered by Framer Motion */
function FlipCard({
  label,
  placeholder,
  value,
  onChange,
  isFlipped,
  onFlip,
  loading,
  error,
  success,
  checking,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  isFlipped: boolean
  onFlip: () => void
  loading: boolean
  error: string
  success: boolean
  checking: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isFlipped) {
      const t = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [isFlipped])

  return (
    <div className="relative w-[280px] h-[46px]">
      {!isFlipped ? (
        <button
          type="button"
          onClick={onFlip}
          className="w-full h-full rounded-lg border border-border bg-transparent text-muted text-[15px] font-sans hover:border-text/50 hover:text-text transition-all cursor-pointer"
        >
          {label}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scaleY: 0.8 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full h-full flex items-center"
        >
          <ValidationTooltip message={error} visible={!!error && !checking} />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
            className={`w-full h-full bg-transparent border ${
              error ? "border-red-500" : success ? "border-green-500" : "border-border"
            } rounded-lg pl-3 pr-9 text-sm text-text outline-none focus:border-text/50 transition-all font-sans placeholder:text-muted`}
          />
          <div className="absolute right-2.5 flex items-center justify-center pointer-events-none">
            {checking && <Loader2 className="w-4 h-4 animate-spin text-[#aaaaaa]" />}
            {!checking && success && <Check className="w-4 h-4 text-green-500" />}
            {!checking && error && <X className="w-4 h-4 text-red-500" />}
          </div>
        </motion.div>
      )}
    </div>
  )
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

  const [loadingDsa, setLoadingDsa] = useState(false)
  const [loadingDev, setLoadingDev] = useState(false)
  const [errorDsa, setErrorDsa] = useState("")
  const [errorDev, setErrorDev] = useState("")
  const [successDsa, setSuccessDsa] = useState(false)
  const [successDev, setSuccessDev] = useState(false)

  // LeetCode check
  useEffect(() => {
    let isMounted = true
    const check = async () => {
      if (!showDsa || !leetcode.trim()) {
        if (isMounted) { setLoadingDsa(false); setErrorDsa(""); setSuccessDsa(false) }
        return
      }
      try {
        const username = leetcode.trim()
        // Try direct LeetCode profile check or public API
        let userExists = false
        try {
          const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`)
          if (res.status === 200) {
            const data = await res.json()
            if (data.status === "success" || data.totalSolved !== undefined) {
              userExists = true
            }
          }
        } catch {
          // Fallback to Alfa API if primary fails
          const res = await fetch(`https://alfa-leetcode-api.onrender.com/${username}`)
          if (res.status === 200) {
            const data = await res.json()
            if (!data.errors && data.username) userExists = true
          }
        }

        if (!userExists) {
          if (isMounted) { setErrorDsa("LeetCode user not found"); setSuccessDsa(false) }
        } else {
          const dbCheck = await checkLeetcode(username)
          if (isMounted) {
            if (dbCheck.taken) {
              setErrorDsa(`Already linked to @${dbCheck.ownerUsername}`)
              setSuccessDsa(false)
            } else {
              setErrorDsa("")
              setSuccessDsa(true)
            }
          }
        }
      } catch {
        if (isMounted) { setErrorDsa("Error checking LeetCode"); setSuccessDsa(false) }
      } finally {
        if (isMounted) setLoadingDsa(false)
      }
    }
    setLoadingDsa(true); setErrorDsa(""); setSuccessDsa(false)
    const timer = setTimeout(check, 500)
    return () => { isMounted = false; clearTimeout(timer) }
  }, [leetcode, showDsa])

  // GitHub check
  useEffect(() => {
    let isMounted = true
    const check = async () => {
      if (!showDev || !github.trim()) {
        if (isMounted) { setLoadingDev(false); setErrorDev(""); setSuccessDev(false) }
        return
      }
      try {
        const username = github.trim()
        const res = await fetch(`https://api.github.com/users/${username}`)
        if (res.status !== 200) {
          if (isMounted) { setErrorDev("GitHub user not found"); setSuccessDev(false) }
        } else {
          const dbCheck = await checkGithub(username)
          if (isMounted) {
            if (dbCheck.taken) {
              setErrorDev(`Already linked to @${dbCheck.ownerUsername}`)
              setSuccessDev(false)
            } else {
              setErrorDev("")
              setSuccessDev(true)
            }
          }
        }
      } catch {
        if (isMounted) { setErrorDev("Error checking GitHub"); setSuccessDev(false) }
      } finally {
        if (isMounted) setLoadingDev(false)
      }
    }
    setLoadingDev(true); setErrorDev(""); setSuccessDev(false)
    const timer = setTimeout(check, 500)
    return () => { isMounted = false; clearTimeout(timer) }
  }, [github, showDev])

  const handleNext = () => {
    if (loadingDsa || loadingDev || errorDsa || errorDev) return
    onNext(
      showDsa ? leetcode.trim() : "",
      showDev ? github.trim() : ""
    )
  }

  const handleNone = () => onNext("", "")

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-4 min-h-[300px] h-full">
      <h2 className="onboarding-subheader mb-12">
        You do any DSA or Dev?
      </h2>

      <div className="flex flex-col gap-4 items-center">
        {/* DSA Flip Card */}
        <FlipCard
          label="DSA"
          placeholder="LeetCode username"
          value={leetcode}
          onChange={(val) => { setLeetcode(val); setSuccessDsa(false) }}
          isFlipped={showDsa}
          onFlip={() => setShowDsa(true)}
          loading={false}
          error={errorDsa}
          success={successDsa}
          checking={loadingDsa}
        />

        {/* Dev Flip Card */}
        <FlipCard
          label="Dev"
          placeholder="GitHub username"
          value={github}
          onChange={(val) => { setGithub(val); setSuccessDev(false) }}
          isFlipped={showDev}
          onFlip={() => setShowDev(true)}
          loading={false}
          error={errorDev}
          success={successDev}
          checking={loadingDev}
        />

        {/* None Button */}
        <button
          type="button"
          onClick={handleNone}
          className="w-[280px] h-[46px] rounded-lg border border-border bg-transparent text-muted text-[15px] font-sans hover:border-text/50 hover:text-text transition-all cursor-pointer"
        >
          None
        </button>
      </div>

      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={handleNext}
        disabled={loadingDsa || loadingDev || !!errorDsa || !!errorDev}
        className="absolute bottom-12 right-12 px-5 py-2 border border-border hover:border-text/50 text-text rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingDsa || loadingDev ? "Checking..." : "Next →"}
      </button>

      <button
        type="button"
        onClick={onPrev}
        className="absolute bottom-12 left-12 px-5 py-2 border border-border hover:border-text/50 text-text rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px]"
      >
        ← Back
      </button>
    </div>
  )
}
