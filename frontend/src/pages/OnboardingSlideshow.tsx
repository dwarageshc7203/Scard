import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import confetti from "canvas-confetti"
import { createProfile, updateProfile, syncPlatform, getCsrfToken, logoutUser } from "../lib/api"
import UsernameSlide from "../components/onboarding/UsernameSlide"
import SocialsSlide from "../components/onboarding/SocialsSlide"
import DsaDevSlide from "../components/onboarding/DsaDevSlide"
import PfpSlide from "../components/onboarding/PfpSlide"
import FinishSlide from "../components/onboarding/FinishSlide"
import Image from "../components/ui/Image"

interface OnboardingSlideshowProps {
  currentUser?: import('../types').MeResponse | null
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
  const [leetcode, setLeetcode] = useState("")
  const [github, setGithub] = useState("")
  const [pfpUrl, setPfpUrl] = useState("")

  const [designation, setDesignation] = useState("")
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
  const handleSocialsNext = (lu: string) => {
    setLinkedUsername(lu)
    nextStep()
  }

  // Slide 3: Save DSA/Dev temporarily
  const handleDsaDevNext = (lc: string, gh: string) => {
    setLeetcode(lc)
    setGithub(gh)
    nextStep()
  }

  // Slide 4: Save PFP temporarily
  const handlePfpNext = (url: string, desig: string, tag: string) => {
    setPfpUrl(url)
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

      const finalDesignation = designation || ""

      await createProfile(username, tagline || username, finalDesignation)

      await updateProfile(
        finalDesignation,
        undefined, // profileUrl should not be the base64 PFP
        username,
        tagline || username,
        undefined,
        socialsList
      )

      if (pfpUrl && pfpUrl.startsWith("data:image")) {
        try {
          const pfpRes = await fetch(pfpUrl)
          const blob = await pfpRes.blob()
          const formData = new FormData()
          formData.append("file", blob, "profile.png")
          // Upload custom PFP
          await fetch("/api/profile/pfp", {
            method: "POST",
            headers: {
              "X-XSRF-TOKEN": getCsrfToken()
            },
            body: formData
          })
        } catch (err) {
          console.error("Failed to upload custom PFP:", err)
        }
      }

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
    <FinishSlide onFinish={handleFinish} onPrev={prevStep} />,
  ]

  // Render progress bar fill width
  const progressPercent = step === 4 ? 100 : (step / 4) * 100

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center py-12 px-6 overflow-hidden relative">
      {/* Top Header Logo */}
      <div className="flex items-center gap-3 mb-16 select-none mt-4">
        <Image src="/logos/scard-1.png" alt="Scard Logo" className="w-8 h-8 rounded-lg cursor-pointer" onClick={logoutUser} />
        <span className="text-text text-2xl font-bold font-sans tracking-wide">Scard</span>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl h-[4px] bg-border rounded-full mb-8 overflow-hidden relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Main Title */}
      <h1 className="onboarding-header">
        {step < 4 ? "Let’s start with your onboarding" : "You’re all set!"}
      </h1>

      {/* Slides Content */}
      <div className="flex-1 w-full flex items-center justify-center relative">
        <AnimatePresence initial={false} custom={direction}>
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
