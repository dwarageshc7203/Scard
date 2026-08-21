import React, { useState } from "react"

interface SocialsSlideProps {
  initialLinkedUsername: string
  initialMailAddress: string
  onNext: (linkedUsername: string, mailAddress: string) => void
  onPrev: () => void
}

export default function SocialsSlide({
  initialLinkedUsername,
  initialMailAddress,
  onNext,
  onPrev,
}: SocialsSlideProps) {
  const [linkedUsername, setLinkedUsername] = useState(initialLinkedUsername)
  const [mailAddress, setMailAddress] = useState(initialMailAddress)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(linkedUsername, mailAddress)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 py-4 h-full">
      <h2 className="onboarding-subheader">
        Let's link your socials
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div className="flex flex-col gap-6 w-full max-w-[460px] mb-12">
          <div className="flex items-center justify-between w-full">
            <span className="onboarding-text mr-4">
              LinkedIn Username
            </span>
            <input
              type="text"
              value={linkedUsername}
              onChange={(e) => setLinkedUsername(e.target.value)}
              className="w-[280px] px-3 py-1.5 bg-transparent border-b border-[#333333] outline-none text-white focus:border-[#555555] transition-all font-sans text-[15px]"
            />
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="onboarding-text mr-4">
              Mail address
            </span>
            <input
              type="email"
              value={mailAddress}
              onChange={(e) => setMailAddress(e.target.value)}
              className="w-[280px] px-3 py-1.5 bg-transparent border-b border-[#333333] outline-none text-white focus:border-[#555555] transition-all font-sans text-[15px]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onPrev}
          className="absolute bottom-12 left-12 px-5 py-2 border border-[#444444] hover:border-white/50 text-[#dddddd] rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px]"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="absolute bottom-12 right-12 px-5 py-2 border border-[#444444] hover:border-white/50 text-[#dddddd] rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px]"
        >
          Next →
        </button>
      </form>
    </div>
  )
}
