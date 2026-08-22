import React from "react"

interface FinishSlideProps {
  onFinish: () => void
}

export default function FinishSlide({ onFinish }: FinishSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-8 text-center h-full my-auto">
      <h2 className="onboarding-header animate-fade-in-blur !mb-4">
        You’re all set!
      </h2>
      <p className="onboarding-text mb-6">
        Seems we got a great programmer huh?
      </p>

      <button
        onClick={onFinish}
        className="px-8 py-2.5 bg-text text-bg font-semibold rounded-md text-[15px] transition-all font-sans cursor-pointer flex items-center justify-center gap-2 hover:bg-text/80 shadow-lg"
      >
        Finish
      </button>
    </div>
  )
}
