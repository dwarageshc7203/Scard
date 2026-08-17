import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { createProfile, updateProfile, syncPlatform } from '../lib/api'
import confetti from 'canvas-confetti'

export default function OnboardingSlideshow({ currentUser }: { currentUser: any }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    displayName: '',
    title: '',
    github: '',
    leetcode: ''
  })

  const handleNext = () => setStep((s) => s + 1)
  const handlePrev = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    try {
      const suggestedUsername = currentUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
      await createProfile(suggestedUsername, formData.displayName || suggestedUsername, formData.title || 'Developer')
      
      const newSocials = []
      if (formData.github) newSocials.push(`github:${formData.github}`)
      if (formData.leetcode) newSocials.push(`leetcode:${formData.leetcode}`)
      
      if (newSocials.length > 0) {
        await updateProfile(undefined, undefined, undefined, undefined, undefined, undefined, undefined, newSocials)
        if (formData.github) {
          syncPlatform("GITHUB", formData.github).catch(console.error)
        }
        if (formData.leetcode) {
          syncPlatform("LEETCODE", formData.leetcode).catch(console.error)
        }
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      })

      setTimeout(() => {
        navigate(`/${suggestedUsername}`, { replace: true })
      }, 1500)
    } catch (e) {
      console.error(e)
    }
  }

  const slides = [
    {
      id: 'welcome',
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Welcome to Scard!</h1>
          <p className="text-gray-500 dark:text-gray-400">Let's build your awesome dev card. What should we call you?</p>
          <input 
            type="text" 
            placeholder="Display Name" 
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="w-full max-w-sm px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#252525] border-transparent focus:border-accent focus:ring-1 focus:ring-accent outline-none text-text"
          />
        </div>
      )
    },
    {
      id: 'title',
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">What's your role?</h1>
          <p className="text-gray-500 dark:text-gray-400">Software Engineer, Student, Designer...</p>
          <input 
            type="text" 
            placeholder="e.g. Full Stack Developer" 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full max-w-sm px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#252525] border-transparent focus:border-accent focus:ring-1 focus:ring-accent outline-none text-text"
          />
        </div>
      )
    },
    {
      id: 'github',
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center p-3">
             <img src="/logos/github.png" alt="GitHub" className="w-full h-full object-contain dark:invert" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Link your GitHub</h1>
          <p className="text-gray-500 dark:text-gray-400">We'll fetch your contributions and projects.</p>
          <input 
            type="text" 
            placeholder="GitHub Username (optional)" 
            value={formData.github}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            className="w-full max-w-sm px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#252525] border-transparent focus:border-accent focus:ring-1 focus:ring-accent outline-none text-text"
          />
        </div>
      )
    },
    {
      id: 'leetcode',
      content: (
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center p-3">
             <img src="/logos/leetcode.png" alt="LeetCode" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Link your LeetCode</h1>
          <p className="text-gray-500 dark:text-gray-400">Show off your problem-solving skills.</p>
          <input 
            type="text" 
            placeholder="LeetCode Username (optional)" 
            value={formData.leetcode}
            onChange={(e) => setFormData({ ...formData, leetcode: e.target.value })}
            className="w-full max-w-sm px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#252525] border-transparent focus:border-accent focus:ring-1 focus:ring-accent outline-none text-text"
          />
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1C1C1C] rounded-[32px] shadow-2xl dark:shadow-none border border-gray-200 dark:border-white/10 p-8 md:p-12 overflow-hidden relative min-h-[450px] flex flex-col">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-white/5">
           <motion.div 
             className="h-full bg-accent"
             initial={{ width: 0 }}
             animate={{ width: `${((step + 1) / slides.length) * 100}%` }}
             transition={{ duration: 0.3 }}
           />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {slides[step].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-6 border-t border-gray-100 dark:border-white/5">
          <button 
            onClick={handlePrev}
            disabled={step === 0}
            className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${step === 0 ? 'opacity-0 cursor-default' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
          >
            Back
          </button>
          
          {step === slides.length - 1 ? (
            <button 
              onClick={handleSubmit}
              className="px-8 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25"
            >
              Finish
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="px-8 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
