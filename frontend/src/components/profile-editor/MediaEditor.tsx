import type { FC } from "react"
import { Trash2, Upload, FileImage } from "lucide-react"
import Image from "../ui/Image"

export interface PhotoEditorProps {
  photoBase64: string
  setPhotoBase64: (val: string) => void
  setPhotoFile: (val: File | null) => void
}

export const PhotoEditor: FC<PhotoEditorProps> = ({
  photoBase64,
  setPhotoBase64,
  setPhotoFile,
}) => {
  return (
    <div className="space-y-5 flex-1 relative">
      <h3 className="text-sm text-text mb-4">Profile Photo</h3>

      <div className="space-y-4">
        <label className="text-[11px] text-muted block">
          Upload Photo
        </label>
        {photoBase64 ? (
          <div className="flex items-center gap-6">
            <div className="relative group rounded-full overflow-hidden border border-border bg-surface-2/30 h-28 w-28 shrink-0 shadow-md">
              <Image
                src={photoBase64}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        setPhotoFile(file)
                        const reader = new FileReader()
                        reader.onload = (re) =>
                          setPhotoBase64(re.target?.result as string)
                        reader.readAsDataURL(file)
                      } catch (err) {
                        console.error(err)
                      }
                    }
                  }}
                />
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <button
              onClick={() => {
                setPhotoFile(null)
                setPhotoBase64("")
              }}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors text-xs border border-red-500/20"
              title="Remove Photo"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-surface-2/30 hover:bg-surface-2/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  try {
                    setPhotoFile(file)
                    const reader = new FileReader()
                    reader.onload = (re) =>
                      setPhotoBase64(re.target?.result as string)
                    reader.readAsDataURL(file)
                  } catch (err) {
                    console.error(err)
                  }
                }
              }}
            />
            <FileImage className="w-6 h-6 text-muted mb-2" />
            <span className="text-xs text-muted">
              Click or drag image to upload
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export interface BannerEditorProps {
  selectedBannerId: number
  setSelectedBannerId: (val: number) => void
  availableBanners: any[]
}

export const BannerEditor: FC<BannerEditorProps> = ({
  selectedBannerId,
  setSelectedBannerId,
  availableBanners,
}) => {
  return (
    <div className="space-y-5 flex-1">
      <h3 className="text-sm text-text mb-4">Profile Banner</h3>
      <div className="text-xs text-muted mb-4">
        Select a banner to display at the top of your profile.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setSelectedBannerId(0)}
          className={`h-24 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all bg-surface-2 ${
            selectedBannerId === 0
              ? "border-accent ring-2 ring-accent/30"
              : "border-border hover:border-muted"
          }`}
        >
          <span className="text-xs text-muted ">
            Default Solid Color
          </span>
        </div>
        {availableBanners.map((banner) => (
          <div
            key={banner.id}
            onClick={() => setSelectedBannerId(banner.id)}
            className={`h-24 rounded-lg border-2 cursor-pointer transition-all relative overflow-hidden bg-cover bg-center ${
              selectedBannerId === banner.id
                ? "border-accent ring-2 ring-accent/30"
                : "border-border hover:border-muted"
            }`}
            style={{ backgroundImage: banner.cssBackground }}
          >
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs drop-shadow-md capitalize">
                {banner.name
                  .replace(/\.[^/.]+$/, "")
                  .replace(/[-_]/g, " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
