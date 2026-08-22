import React, { useState } from "react"
import confetti from "canvas-confetti"

interface FinishSlideProps {
  onFinish: () => void | Promise<void>
  onPrev?: () => void
}

export default function FinishSlide({ onFinish, onPrev }: FinishSlideProps) {
  const [loading, setLoading] = useState(false)

  const handleFinish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Trigger confetti immediately on click
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    })

    setLoading(true)
    try {
      await onFinish()
    } catch (e) {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 py-4 min-h-[300px] h-full">
      <h2 className="onboarding-subheader">
        Seems we got a great programmer huh?
      </h2>

      <form onSubmit={handleFinish} className="w-full flex flex-col items-center">
        <div className="flex flex-col items-center justify-center w-full mb-12 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3.5 border border-border hover:border-text hover:bg-text hover:text-bg text-text rounded-lg text-base font-medium transition-all font-sans cursor-pointer flex items-center justify-center min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Finishing..." : "Finish up"}
          </button>
        </div>

        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            disabled={loading}
            className="absolute bottom-12 left-12 px-5 py-2 border border-border hover:border-text/50 text-text rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
        )}
      </form>
    </div>
  )
}
