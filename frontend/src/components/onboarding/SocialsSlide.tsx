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
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-8 text-center font-sans">
        Your socials?
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div className="flex flex-col gap-6 w-full max-w-md mb-8">
          <div className="flex items-center">
            <span className="text-gray-400 font-sans text-sm md:text-base mr-4 w-32 text-right">
              Linked username
            </span>
            <input
              type="text"
              value={linkedUsername}
              onChange={(e) => setLinkedUsername(e.target.value)}
              placeholder="e.g. dev_john"
              className="flex-1 px-4 py-2 bg-[#1e1e1e] border border-white/10 rounded-md outline-none text-white focus:border-white/30 transition-all font-sans text-sm md:text-base placeholder:text-gray-600"
            />
          </div>

          <div className="flex items-center">
            <span className="text-gray-400 font-sans text-sm md:text-base mr-4 w-32 text-right">
              Mail address
            </span>
            <input
              type="email"
              value={mailAddress}
              onChange={(e) => setMailAddress(e.target.value)}
              placeholder="e.g. john@example.com"
              className="flex-1 px-4 py-2 bg-[#1e1e1e] border border-white/10 rounded-md outline-none text-white focus:border-white/30 transition-all font-sans text-sm md:text-base placeholder:text-gray-600"
            />
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
