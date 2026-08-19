import React, { useRef, useState } from "react"
import { getCsrfToken } from "../../lib/api"

interface PfpSlideProps {
  initialImageUrl: string
  onNext: (uploadedUrl: string) => void
  onPrev: () => void
}

export default function PfpSlide({ initialImageUrl, onNext, onPrev }: PfpSlideProps) {
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError("")

    // Generate local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("ascii", "false")

    try {
      const res = await fetch("/api/profile/pfp", {
        method: "POST",
        body: formData,
        headers: {
          "X-XSRF-TOKEN": getCsrfToken(),
        },
      })
      if (!res.ok) {
        throw new Error("Failed to upload profile photo")
      }
      const uploadedUrl = await res.text()
      setPreviewUrl(uploadedUrl)
    } catch (err) {
      console.error(err)
      setError("Failed to upload photo. You can continue or try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleContainerClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(previewUrl)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-8 text-center font-sans">
        Your sweet profile photo?
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={loading}
        />

        <div
          onClick={handleContainerClick}
          className="w-32 h-32 md:w-36 md:h-36 bg-[#1e1e1e] border border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-all overflow-hidden mb-6 relative group"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
            />
          ) : (
            <svg
              className="w-8 h-8 text-gray-500 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-xs md:text-sm font-sans mb-4 text-center">
            {error}
          </p>
        )}

        <div className="flex justify-between w-full max-w-md mt-6">
          <button
            type="button"
            onClick={onPrev}
            disabled={loading}
            className="px-6 py-1.5 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white rounded-md text-sm transition-all font-sans cursor-pointer disabled:opacity-50"
          >
            ← Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onNext(previewUrl)}
              disabled={loading}
              className="px-6 py-1.5 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white rounded-md text-sm transition-all font-sans cursor-pointer disabled:opacity-50"
            >
              Skip →
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-1.5 border border-white/20 hover:border-white/50 text-white rounded-md text-sm transition-all font-sans cursor-pointer disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
