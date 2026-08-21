import React from "react"

interface FinishSlideProps {
  onFinish: () => void
}

export default function FinishSlide({ onFinish }: FinishSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-12 text-center mt-12">
      <h2 className="text-[44px] md:text-[54px] font-light tracking-tight text-white mb-8 font-sans animate-fade-in-blur">
        You’re all set!
      </h2>
      <p className="text-[#cccccc] font-sans text-lg mb-12">
        Seems we got a great programmer huh?
      </p>

      <button
        onClick={onFinish}
        className="px-8 py-2.5 bg-white text-black font-semibold rounded-md text-[15px] transition-all font-sans cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-200"
      >
        Finish
      </button>
    </div>
  )
}
