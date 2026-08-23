import React, { useRef, useState } from "react"
import { Upload, FileImage, Trash2 } from "lucide-react"
import Image from "../ui/Image"

interface PfpSlideProps {
  initialImageUrl: string
  onNext: (uploadedUrl: string, desig: string, tag: string) => void
  onPrev: () => void
}

export default function PfpSlide({ initialImageUrl, onNext, onPrev }: PfpSlideProps) {
  const [photoBase64, setPhotoBase64] = useState(initialImageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // We pass empty strings for designation, and tagline as requested.
    onNext(photoBase64, "", "")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (re) => {
        setPhotoBase64(re.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 py-4 min-h-[300px] h-full">
      <h2 className="onboarding-subheader">
        We're almost there..
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div className="flex flex-col items-center justify-center w-full mb-12">
          
          {photoBase64 ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border border-border group cursor-pointer">
                <Image
                  src={photoBase64}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="w-6 h-6 text-white" />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setPhotoBase64("")}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors text-xs border border-red-500/20 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-2 border-dashed border-border hover:border-text/50 hover:bg-surface-2 transition-colors cursor-pointer relative overflow-hidden group">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileImage className="w-8 h-8 text-muted-foreground group-hover:text-text transition-colors mb-2" />
              <span className="text-[10px] text-muted-foreground group-hover:text-text transition-colors text-center px-2 leading-tight">
                Upload image
              </span>
            </label>
          )}
          <span className="onboarding-text mt-4">
            Upload your profile picture
          </span>
        </div>

        <button
          type="button"
          onClick={onPrev}
          className="absolute bottom-6 left-6 md:bottom-12 md:left-12 px-5 py-2 border border-border hover:border-text/50 text-text rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px]"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="absolute bottom-6 right-6 md:bottom-12 md:right-12 px-5 py-2 border border-border hover:border-text/50 text-text rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px]"
        >
          Next →
        </button>
      </form>
    </div>
  )
}
