import type { FC } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "../components/ui/Image"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { Sun, Moon, Laptop, Mail } from "lucide-react"

interface LandingPageProps {
  currentUser?: any
}

const LandingPage: FC<LandingPageProps> = ({ currentUser }) => {
  const navigate = useNavigate()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { scrollY } = useScroll()
  const yHeroText = useTransform(scrollY, [0, 1000], [0, -100])
  const yCursor = useTransform(scrollY, [0, 1000], [0, 150])
  const yImage = useTransform(scrollY, [0, 1000], [0, -50])

  const toggleTheme = () => {
    if (resolvedTheme === "dark") setTheme("light")
    else setTheme("dark")
  }

  const renderThemeIcon = () => {
    if (resolvedTheme === "light")
      return <Sun className="w-4 h-4 text-yellow-500 animate-spin-slow" />
    return <Moon className="w-4 h-4 text-accent" />
  }

  return (
    <motion.div
      initial={{ /* scale: 0.9, */ opacity: 0, filter: "blur(10px)" }}
      animate={{ /*scale: 1, */ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-bg text-text flex flex-col items-center relative overflow-x-hidden selection:bg-accent/30 font-sans transition-colors duration-300 scroll-smooth"
    >
      <header className="w-full flex items-center justify-between py-6 px-4 md:px-6 relative z-50">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md hover:bg-surface-2 text-muted hover:text-text transition-colors"
          title={`Theme: ${theme} (Click to change)`}
        >
          {renderThemeIcon()}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <Image
            src="/logos/scard-1.png"
            alt="Scard Logo"
            className="w-6 h-6 rounded-md"
          />
          <span className="text-text font-bold text-xl font-sans tracking-wide">
            Scard
          </span>
        </div>

        {/* Auth Button */}
        <div>
          {currentUser ? (
            <button
              onClick={() => {
                if (currentUser.hasProfile) {
                  navigate(`/${currentUser.userName}`)
                } else {
                  navigate("/onboarding")
                }
              }}
              className="bg-transparent text-text border border-border dark:border-white/40 hover:bg-text hover:text-bg transition-all px-3 py-1 sm:px-5 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium tracking-wide"
            >
              Go to my Card
            </button>
          ) : (
            <button
              onClick={() => {
                window.location.href = "/oauth2/authorization/google"
              }}
              className="bg-transparent text-text border border-border dark:border-white/40 hover:bg-text hover:text-bg transition-all px-3 py-1 sm:px-5 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium tracking-wide"
            >
              Sign up
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full flex-col flex items-center pt-32 md:pt-48 pb-32 px-4 relative z-10">
        <motion.div
          style={{ y: yHeroText }}
          className="text-center leading-[1.1] relative"
        >
          <h1
            className="text-6xl md:text-8xl text-text font-bold"
          >
            Your concise <span className="text-success italic">dev</span>
          </h1>
          <h1
            className="text-6xl md:text-8xl text-text font-bold"
          >
            profile
          </h1>

          {/* Custom Cursor Graphic */}
          <motion.div
            style={{ y: yCursor }}
            className="absolute -right-0.5 top-33 sm:-right-5 sm:top-24 md:top-32 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32"
          >
            <Image
              src="/elements/cursor.png"
              alt="Cursor"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>
      </main>

      {/* Multiple Profiles Section */}
      <section className="w-full flex flex-col items-center justify-center relative z-20 pb-32">
        <div className="flex flex-col items-center max-w-[900px] w-full">
          <h2
            className="text-3xl md:text-4xl text-muted mb-6 self-start pl-8 font-semibold"
          >
            No more logging into <br />
            <span className="text-red-500">multiple</span>{" "}
            platforms
          </h2>

          {/* Static ExportCard Image */}
          <motion.div
            style={{ y: yImage }}
            className="relative w-full flex justify-center drop-shadow-2xl overflow-hidden rounded-[24px]"
          >
            <div className="scale-[0.8] origin-top md:scale-100 flex justify-center w-full px-4 md:px-0">
              <Image
                src="/elements/scard-card-light.png"
                alt="Sample Profile Light"
                className="w-full max-w-[850px] h-auto object-contain rounded-2xl border border-border dark:hidden block"
              />
              <Image
                src="/elements/scard-card-dark.png"
                alt="Sample Profile Dark"
                className="w-full max-w-[850px] h-auto object-contain rounded-2xl border border-border hidden dark:block"
              />
            </div>
          </motion.div>

          <h2
            className="text-3xl md:text-4xl text-muted italic mt-6 self-end pr-8 font-semibold"
          >
            Never looked <br />
            <span className="text-warning font-semibold">this good</span>
          </h2>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="w-full flex flex-col items-center justify-center pb-40 px-4">
        <h2
          className="text-4xl md:text-5xl text-text text-center leading-tight mb-16 max-w-lg font-bold"
        >
          A platform for every developers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] w-full">
          {/* Card 1 */}
          <div className="bg-surface-2 border border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[240px] hover:brightness-110 transition-all drop-shadow-sm dark:drop-shadow-none">
            <h4
              className="text-text text-3xl mb-8 font-bold"
            >
              Your contest ratings
            </h4>
            <div className="flex items-end gap-3 h-[60px]">
              <Image
                src="/logos/leetcode.png"
                alt="LeetCode"
                className="w-10 h-10 object-contain mr-2 mb-1"
              />
              <div className="w-4 h-full bg-warning rounded-t-sm"></div>
              <div className="w-4 h-[70%] bg-success rounded-t-sm"></div>
              <div className="w-4 h-[40%] bg-red-500 rounded-t-sm"></div>
            </div>
          </div>


          {/* Card 2 */}
          <div className="bg-surface-2 border border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[240px] hover:brightness-110 transition-all drop-shadow-sm dark:drop-shadow-none">
            <h4
              className="text-text text-3xl mb-8 font-bold"
            >
              Your contributions
            </h4>
            <div className="flex items-end gap-3 h-[60px]">
              <Image
                src="/logos/github.png"
                alt="GitHub"
                className="w-11 h-11 object-contain mr-1 mb-1 dark:invert"
              />
              <div className="w-4 h-full bg-warning rounded-t-sm"></div>
              <div className="w-4 h-[60%] bg-success rounded-t-sm"></div>
              <div className="w-4 h-[80%] bg-red-500 rounded-t-sm"></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-2 border border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[240px] hover:brightness-110 transition-all drop-shadow-sm dark:drop-shadow-none">
            <h4
              className="text-text text-3xl mb-8 font-bold"
            >
              Your projects
            </h4>
            <div className="flex items-center justify-center h-[60px]">
              <Image
                src="/logos/github.png"
                alt="GitHub"
                className="w-[70px] h-[70px] object-contain opacity-90 dark:invert"
              />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-2 border border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[240px] hover:brightness-110 transition-all drop-shadow-sm dark:drop-shadow-none">
            <h4
              className="text-text text-3xl mb-8 font-bold"
            >
              Your badges
            </h4>
            <div className="flex items-center justify-center h-[60px]">
              <Image
                src="/logos/leetcode.png"
                alt="LeetCode"
                className="w-[60px] h-[60px] object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* See it yourself Section */}
      <section className="w-full flex flex-col items-center justify-center pb-32 px-4 text-center">
        <h3
          className="text-2xl md:text-3xl text-warning italic mb-4 font-semibold"
        >
          Stay ahead.
        </h3>
        <h2
          className="text-5xl md:text-6xl text-text font-bold"
        >
          See it yourself!
        </h2>
      </section>

      {/* Contact Section */}
      <footer className="w-full py-16 px-8 grid grid-cols-1 md:grid-cols-2 gap-12 bg-surface border-t border-border z-20">
        <div className="flex flex-col items-center md:items-end justify-center gap-8 border-r-0 md:border-r border-border pr-0 md:pr-12 md:-translate-x-30">
          <div className="flex items-center gap-4">
            <Image
              src="/logos/scard-1.png"
              alt="Scard"
              className="w-16 h-16 object-contain rounded-[5px]"
            />
            <span
              className="text-text font-semibold tracking-wide text-5xl"

            >
              Scard
            </span>
          </div>
          {currentUser ? (
            <button
              onClick={() => {
                if (currentUser.hasProfile) navigate(`/${currentUser.userName}`)
                else navigate("/onboarding")
              }}
              className="text-text border border-border dark:border-white/40 hover:bg-text hover:text-bg transition-all px-8 py-2 rounded-md text-lg font-medium tracking-wide"
            >
              Go to my Card
            </button>
          ) : (
            <button
              onClick={() => {
                window.location.href = "/oauth2/authorization/google"
              }}
              className="text-text border border-border dark:border-white/40 hover:bg-text hover:text-bg transition-all px-8 py-2 rounded-md text-lg font-medium tracking-wide"
            >
              Sign up
            </button>
          )}
        </div>

        <div className="flex flex-col items-center md:items-start justify-start pt-2 pl-0 md:pl-12 gap-6 text-center md:text-left">
          <h4
            className="text-text text-2xl font-bold"
          >
            Contact the creator
          </h4>
          <div className="flex flex-col gap-4">
            <a
              href="mailto:dwarageshc7203@gmail.com"
              className="flex items-center gap-3 text-muted hover:text-text transition-colors"
            >
              <Mail size={22} />
              <span className="text-lg">dwarageshc7203@gmail.com</span>
            </a>
            <a
              href="https://linkedin.com/in/dwarageshc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-muted hover:text-text transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-[22px] h-[22px]"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span className="text-lg">linkedin.com/in/dwarageshc</span>
            </a>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

export default LandingPage
