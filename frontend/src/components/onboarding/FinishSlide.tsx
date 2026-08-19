import React from "react"

interface FinishSlideProps {
  onFinish: () => void
}

export default function FinishSlide({ onFinish }: FinishSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 py-12 text-center">
      <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4 font-sans animate-fade-in-blur">
        You’re all set!
      </h2>
      <p className="text-gray-400 font-sans text-sm md:text-base mb-10 max-w-sm">
        Seems we got a great programmer huh?
      </p>

      <button
        onClick={onFinish}
        className="px-8 py-2.5 border border-white/20 hover:border-white/50 text-white rounded-md text-sm md:text-base transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5 hover:scale-105"
      >
        Let’s go! →
      </button>
    </div>
  )
}
