import React, { useState, useEffect } from "react"
import { checkLinkedin, checkMail } from "../../lib/api"
import { Loader2, Check, X } from "lucide-react"
import ValidationTooltip from "@/components/ui/ValidationTooltip"

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

  const [loadingLinked, setLoadingLinked] = useState(false)
  const [loadingMail, setLoadingMail] = useState(false)
  const [errorLinked, setErrorLinked] = useState("")
  const [errorMail, setErrorMail] = useState("")
  const [successLinked, setSuccessLinked] = useState(false)
  const [successMail, setSuccessMail] = useState(false)

  useEffect(() => {
    let isMounted = true
    const check = async () => {
      if (!linkedUsername.trim()) {
        if (isMounted) {
          setErrorLinked("")
          setLoadingLinked(false)
          setSuccessLinked(false)
        }
        return
      }
      try {
        const result = await checkLinkedin(linkedUsername.trim())
        if (isMounted) {
          if (result.taken) {
            setErrorLinked(`Already linked to ${result.ownerUsername} — contact scard@dwaragesh.me`)
            setSuccessLinked(false)
          } else {
            setErrorLinked("")
            setSuccessLinked(true)
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorLinked("Error checking LinkedIn")
          setSuccessLinked(false)
        }
      } finally {
        if (isMounted) setLoadingLinked(false)
      }
    }

    setLoadingLinked(true)
    setSuccessLinked(false)
    const timer = setTimeout(check, 500)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [linkedUsername])

  useEffect(() => {
    let isMounted = true
    const check = async () => {
      if (!mailAddress.trim()) {
        if (isMounted) {
          setErrorMail("")
          setLoadingMail(false)
          setSuccessMail(false)
        }
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(mailAddress.trim())) {
        if (isMounted) {
          setErrorMail("Please enter a valid email address")
          setSuccessMail(false)
          setLoadingMail(false)
        }
        return
      }

      try {
        const result = await checkMail(mailAddress.trim())
        if (isMounted) {
          if (result.taken) {
            setErrorMail(`Already linked to ${result.ownerUsername} — contact scard@dwaragesh.me`)
            setSuccessMail(false)
          } else {
            setErrorMail("")
            setSuccessMail(true)
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMail("Error checking email")
          setSuccessMail(false)
        }
      } finally {
        if (isMounted) setLoadingMail(false)
      }
    }

    setLoadingMail(true)
    setSuccessMail(false)
    const timer = setTimeout(check, 500)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [mailAddress])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loadingLinked || loadingMail || errorLinked || errorMail) return
    onNext(linkedUsername, mailAddress)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 py-4 h-full">
      <h2 className="onboarding-subheader">
        Let's link your socials
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div className="flex flex-col items-center gap-6 w-full max-w-[460px] lg:max-w-[540px] xl:max-w-[600px] mb-12 transition-all">
          {/* LinkedIn */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-[280px] sm:max-w-none gap-2 sm:gap-0 mx-auto">
            <span className="onboarding-text mr-4 whitespace-nowrap">
              LinkedIn Profile Link
            </span>
            <div className="relative flex items-center">
              {/* Tooltip anchor wrapper */}
              <div className="relative">
                <ValidationTooltip message={errorLinked} visible={!!errorLinked && !loadingLinked} />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedUsername}
                  onChange={(e) => {
                    setLinkedUsername(e.target.value)
                    setErrorLinked("")
                    setSuccessLinked(false)
                  }}
                  className={`w-[240px] sm:w-[280px] lg:w-[340px] xl:w-[380px] px-3 py-2 bg-transparent border ${errorLinked ? "border-red-500" : successLinked ? "border-green-500" : "border-border"} rounded-md outline-none text-text focus:border-text/50 transition-all font-sans text-[15px] lg:text-[16px]`}
                />
              </div>
              <div className="absolute -right-6 flex items-center justify-center">
                {loadingLinked && <Loader2 className="w-4 h-4 animate-spin text-[#aaaaaa]" />}
                {!loadingLinked && successLinked && <Check className="w-5 h-5 text-green-500" />}
                {!loadingLinked && errorLinked && <X className="w-5 h-5 text-red-500" />}
              </div>
            </div>
          </div>

          {/* Mail */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-[280px] sm:max-w-none gap-2 sm:gap-0 mx-auto">
            <span className="onboarding-text mr-4 whitespace-nowrap">
              Mail address
            </span>
            <div className="relative flex items-center">
              {/* Tooltip anchor wrapper */}
              <div className="relative">
                <ValidationTooltip message={errorMail} visible={!!errorMail && !loadingMail} />
                <input
                  type="email"
                  value={mailAddress}
                  onChange={(e) => {
                    setMailAddress(e.target.value)
                    setErrorMail("")
                    setSuccessMail(false)
                  }}
                  className={`w-[240px] sm:w-[280px] lg:w-[340px] xl:w-[380px] px-3 py-2 bg-transparent border ${errorMail ? "border-red-500" : successMail ? "border-green-500" : "border-border"} rounded-md outline-none text-text focus:border-text/50 transition-all font-sans text-[15px] lg:text-[16px]`}
                />
              </div>
              <div className="absolute -right-6 flex items-center justify-center">
                {loadingMail && <Loader2 className="w-4 h-4 animate-spin text-[#aaaaaa]" />}
                {!loadingMail && successMail && <Check className="w-5 h-5 text-green-500" />}
                {!loadingMail && errorMail && <X className="w-5 h-5 text-red-500" />}
              </div>
            </div>
          </div>

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
          disabled={loadingLinked || loadingMail || !!errorLinked || !!errorMail}
          className="absolute bottom-6 right-6 md:bottom-12 md:right-12 px-5 py-2 border border-border hover:border-text/50 text-text rounded-md text-sm transition-all font-sans cursor-pointer flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingLinked || loadingMail ? "Checking..." : "Next →"}
        </button>
      </form>
    </div>
  )
}
