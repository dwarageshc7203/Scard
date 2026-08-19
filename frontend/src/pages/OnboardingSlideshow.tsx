import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { createProfile, updateProfile, syncPlatform } from "../lib/api"
import UsernameSlide from "../components/onboarding/UsernameSlide"
import SocialsSlide from "../components/onboarding/SocialsSlide"
import DsaDevSlide from "../components/onboarding/DsaDevSlide"
import PfpSlide from "../components/onboarding/PfpSlide"
import FinishSlide from "../components/onboarding/FinishSlide"

interface OnboardingSlideshowProps {
  currentUser: any
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
}

export default function OnboardingSlideshow({ currentUser }: OnboardingSlideshowProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const navigate = useNavigate()

  // State to hold data across slides
  const [username, setUsername] = useState("")
  const [linkedUsername, setLinkedUsername] = useState("")
  const [mailAddress, setMailAddress] = useState("")
  const [leetcode, setLeetcode] = useState("")
  const [github, setGithub] = useState("")
  const [pfpUrl, setPfpUrl] = useState("")

  const nextStep = (customDirection = 1) => {
    setDirection(customDirection)
    setStep((s) => s + 1)
  }

  const prevStep = () => {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  // Slide 1: Create profile
  const handleUsernameNext = async (selectedUsername: string) => {
    setUsername(selectedUsername)
    try {
      await createProfile(selectedUsername, selectedUsername, "Developer")
      nextStep()
    } catch (e) {
      console.error("Error creating initial profile:", e)
    }
  }

  // Slide 2: Save socials temporarily
  const handleSocialsNext = (lu: string, ma: string) => {
    setLinkedUsername(lu)
    setMailAddress(ma)
    nextStep()
  }

  // Slide 3: Save DSA/Dev temporarily
  const handleDsaDevNext = (lc: string, gh: string) => {
    setLeetcode(lc)
    setGithub(gh)
    nextStep()
  }

  // Slide 4: Save PFP temporarily
  const handlePfpNext = (url: string) => {
    setPfpUrl(url)
    nextStep()
  }

  // Slide 5: Submit all remaining changes to backend and redirect
  const handleFinish = async () => {
    try {
      const socialsList: string[] = []
      if (github) socialsList.push(`GITHUB:${github}`)
      if (leetcode) socialsList.push(`LEETCODE:${leetcode}`)
      if (linkedUsername) socialsList.push(`LINKED_IN:${linkedUsername}`)

      const finalDesignation = github === "batman" ? "Batman" : "Developer"

      await updateProfile(
        finalDesignation,
        undefined,
        mailAddress || undefined,
        undefined,
        username,
        username,
        undefined,
        socialsList
      )

      // Async sync platforms
      if (github && github !== "batman") {
        syncPlatform("GITHUB", github).catch(console.error)
      }
      if (leetcode) {
        syncPlatform("LEETCODE", leetcode).catch(console.error)
      }

      localStorage.setItem("scard_username", username)
      // Force reload or navigate
      window.location.href = `/${username}`
    } catch (e) {
      console.error("Error finishing onboarding:", e)
      navigate(`/${username}`)
    }
  }

  const slides = [
    <UsernameSlide initialValue={username} onNext={handleUsernameNext} />,
    <SocialsSlide
      initialLinkedUsername={linkedUsername}
      initialMailAddress={mailAddress}
      onNext={handleSocialsNext}
      onPrev={prevStep}
    />,
    <DsaDevSlide
      initialLeetcode={leetcode}
      initialGithub={github}
      onNext={handleDsaDevNext}
      onPrev={prevStep}
    />,
    <PfpSlide initialImageUrl={pfpUrl} onNext={handlePfpNext} onPrev={prevStep} />,
    <FinishSlide onFinish={handleFinish} />,
  ]

  // Render progress bar fill width
  const progressPercent = step === 4 ? 100 : (step / 4) * 100

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-between items-center py-12 px-6 overflow-hidden">
      {/* Top Header Logo */}
      <div className="flex items-center gap-2 mb-8 select-none">
        <img src="/logos/scard.png" alt="Scard logo" className="w-6 h-6 object-contain" />
        <span className="text-white text-xl font-medium font-sans tracking-wide">Scard</span>
      </div>

      {/* Progress Bar Line */}
      {step < 4 && (
        <div className="w-full max-w-xl h-[3px] bg-white/10 rounded-full mb-8 overflow-hidden relative">
          <motion.div
            className="absolute top-0 left-0 h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Slides Content */}
      <div className="flex-1 w-full flex items-center justify-center relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", ease: "easeInOut", duration: 0.4 },
              opacity: { duration: 0.3 },
            }}
            className="w-full absolute flex justify-center items-center"
          >
            {slides[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Buffer */}
      <div className="h-8 w-full" />
    </div>
  )
}
