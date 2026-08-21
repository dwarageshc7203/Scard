import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import confetti from "canvas-confetti"
import { createProfile, updateProfile, syncPlatform } from "../lib/api"
import UsernameSlide from "../components/onboarding/UsernameSlide"
import SocialsSlide from "../components/onboarding/SocialsSlide"
import DsaDevSlide from "../components/onboarding/DsaDevSlide"
import PfpSlide from "../components/onboarding/PfpSlide"
import FinishSlide from "../components/onboarding/FinishSlide"
import Image from "../components/ui/Image"

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
  const [asciiArt, setAsciiArt] = useState("")
  const [designation, setDesignation] = useState("Full Stack Engineer")
  const [tagline, setTagline] = useState("")

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
    nextStep()
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
  const handlePfpNext = (url: string, ascii: string, desig: string, tag: string) => {
    setPfpUrl(url)
    setAsciiArt(ascii)
    setDesignation(desig)
    setTagline(tag)
    nextStep()
  }

  // Slide 5: Submit all remaining changes to backend and redirect
  const handleFinish = async () => {
    try {
      const socialsList: string[] = []
      if (github) socialsList.push(`GITHUB:${github}`)
      if (leetcode) socialsList.push(`LEETCODE:${leetcode}`)
      if (linkedUsername) socialsList.push(`LINKED_IN:${linkedUsername}`)

      const finalDesignation = designation || (github === "batman" ? "Batman" : "Developer")

      await createProfile(username, tagline || username, finalDesignation)

      await updateProfile(
        finalDesignation,
        pfpUrl || undefined,
        mailAddress || undefined,
        asciiArt || undefined,
        username,
        tagline || username,
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
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      })

      // Wait a moment before redirect so they see the confetti
      setTimeout(() => {
        window.location.href = `/${username}`
      }, 1500)
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
    <div className="min-h-screen bg-[#222222] flex flex-col items-center py-12 px-6 overflow-hidden relative">
      {/* Top Header Logo */}
      <div className="flex items-center gap-3 mb-16 select-none mt-4">
        <Image src="/logos/scard.png" alt="Scard Logo" className="w-8 h-8 rounded-lg cursor-pointer" onClick={() => window.location.href = '/'} />
        <span className="text-white text-2xl font-bold font-sans tracking-wide">Scard</span>
      </div>

      {/* Progress Bar Line */}
      {step < 4 && (
        <div className="w-full max-w-2xl h-[4px] bg-[#333333] rounded-full mb-8 overflow-hidden relative">
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#dddddd]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Main Title (Steps 1-4) */}
      {step < 4 && (
        <h1 className="onboarding-header">
          Let’s start with your onboarding
        </h1>
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
            className="w-full h-full absolute flex justify-center items-center"
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
