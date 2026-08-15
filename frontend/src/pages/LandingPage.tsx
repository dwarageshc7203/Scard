import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'

const LandingPage: FC = () => {
  const navigate = useNavigate()

  // Set up scroll tracking for parallax effect on the video box
  const { scrollY } = useScroll()
  const videoY = useTransform(scrollY, [0, 1000], [0, -150])
  const opacityFade = useTransform(scrollY, [0, 400], [1, 0.4])

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, delayChildren: 0.3 } 
    }
  }

  const textItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } 
    }
  }

  return (
    <div className="min-h-screen bg-[#333333] flex flex-col items-center relative overflow-x-hidden selection:bg-green-500/30">
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full px-6 py-8 flex justify-between items-center absolute top-0 left-0 z-50"
      >
        <div className="flex-1"></div>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 flex-1">
          <div className="bg-white text-black font-bold text-xs px-1.5 py-0.5 rounded-sm tracking-tight">S</div>
          <span className="text-white font-semibold tracking-wide text-lg">Scard</span>
        </div>
        {/* Sign Up */}
        <div className="flex-1 flex justify-end">
          <button 
            onClick={() => navigate('/dwarageshc')}
            className="bg-transparent text-white border border-white/20 hover:bg-white hover:text-black transition-all px-6 py-2.5 rounded-full text-sm font-medium tracking-wide"
          >
            Sign up
          </button>
        </div>
      </motion.header>

      {/* Main Hero Section */}
      <main className="w-full flex-1 flex flex-col items-center pt-40 pb-20 px-4 relative z-10">
        
        {/* Hero Text */}
        <motion.div 
          className="text-center text-[#e5e5e5] leading-tight mb-8 relative"
          style={{ fontFamily: "'Playfair Display', serif" }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={textItemVariants} className="text-5xl md:text-6xl lg:text-[72px] font-normal tracking-tight">
            Your concise <span className="text-[#3b9f3f] italic font-semibold">dev</span>
          </motion.h1>
          <motion.h1 variants={textItemVariants} className="text-5xl md:text-6xl lg:text-[72px] font-normal tracking-tight mt-1 relative">
            profile
            
            {/* Custom Cursor Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
              transition={{ 
                opacity: { duration: 1, delay: 1 },
                scale: { duration: 0.8, delay: 1, type: "spring" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
              }}
              className="absolute -right-8 -bottom-8 md:-right-20 md:-bottom-12 w-16 h-20 md:w-24 md:h-24"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full transform -rotate-[20deg] drop-shadow-2xl">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="#333333"/>
              </svg>
            </motion.div>
          </motion.h1>
        </motion.div>

        {/* Video Placeholder Box with Parallax */}
        <motion.div 
          style={{ y: videoY, opacity: opacityFade }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="w-full max-w-3xl aspect-[16/10] sm:aspect-[16/9] border-[1px] border-[#555555] rounded-3xl flex items-center justify-center bg-[#3a3a3a]/30 mt-16 shadow-2xl backdrop-blur-sm hover:bg-[#3a3a3a]/50 transition-colors z-20"
        >
          <span className="text-[#999999] font-sans text-sm sm:text-base tracking-wide">
            Profile video - attached later
          </span>
        </motion.div>
      </main>

      {/* Section 2: Value Proposition (Scroll Reveal) */}
      <section className="w-full py-40 px-4 flex flex-col items-center justify-center text-center relative z-20 bg-gradient-to-b from-transparent to-[#2c2c2c]/30">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 
            className="text-2xl md:text-[32px] text-[#999999] mb-4 font-normal tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Why multiple profiles?
          </h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="text-3xl md:text-[44px] text-white italic font-normal tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            when it be presented this good :)
          </motion.h3>
        </motion.div>
      </section>

      {/* Contact Section */}
      <footer className="w-full py-24 px-4 flex flex-col items-center justify-center border-t border-[#444444]/40 bg-[#2c2c2c]/80 relative z-20">
        <motion.h3 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl text-[#dddddd] mb-8 font-normal"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Get in touch
        </motion.h3>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-6 items-center"
        >
          <a href="mailto:hello@scard.app" className="px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors font-sans text-sm shadow-lg hover:shadow-xl">
            Contact Us
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#888888] hover:text-white transition-colors">
            Twitter
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#888888] hover:text-white transition-colors">
            GitHub
          </a>
        </motion.div>
      </footer>
    </div>
  )
}

export default LandingPage
