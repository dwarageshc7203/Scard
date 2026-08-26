import React from 'react'
import { Mail, Globe } from 'lucide-react'
import confetti from 'canvas-confetti'
import Avatar from '../ui/avatar'
import { sanitizeUrl } from '../../lib/urlUtils'

interface ProfileHeaderProps {
  activeUser: any
  activeBanner: any
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ activeUser, activeBanner }) => {
  return (
    <div className="relative pt-[40px]">
      {/* Banner Background */}
      <div
        className="absolute top-0 left-0 right-0 h-[220px] bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none transition-all duration-300"
        style={activeBanner ? { background: activeBanner.cssBackground, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {/* Social Icons Bottom Right of Banner */}
        {activeUser.customSocials && activeUser.customSocials.length > 0 && (
          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            {activeUser.customSocials.map((social: any, idx: number) => (
              <a
                key={idx}
                href={social.type.toLowerCase() === 'email' || social.type.toLowerCase() === 'mail' ? `mailto:${social.url}` : sanitizeUrl(social.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-surface/50 backdrop-blur-md rounded-full hover:bg-surface/80 transition-colors border border-border/40 text-text shadow-sm"
                title={social.type}
              >
                {(social.type.toLowerCase() === 'linkedin' || social.type.toLowerCase() === 'linked_in') ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                ) :
                  social.type.toLowerCase() === 'twitter' ? (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  ) :
                    (social.type.toLowerCase() === 'email' || social.type.toLowerCase() === 'mail') ? <Mail className="w-4 h-4" /> :
                      <Globe className="w-4 h-4" />}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="relative px-8 sm:px-12 flex flex-col sm:flex-row gap-3 sm:gap-8 items-center self-start mt-[140px]">
        {/* Avatar overlapping the banner */}
        <div className="rounded-full bg-gray-50 dark:bg-[#202020] p-2 shrink-0">
          <Avatar
            initials={activeUser.initials}
            color={activeUser.color}
            src={activeUser.imageURL}
            size="xl"
            isOnline={activeUser.isOnline}
            className="w-28 h-28 sm:w-40 sm:h-40 rounded-full shadow-2xl"
          />
        </div>

        {/* Name, Username & Title */}
        <div className="flex flex-col z-10 items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start flex-wrap gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {(activeUser.displayName && activeUser.displayName.trim()) ? activeUser.displayName : activeUser.username}
            </h1>
            {activeUser.pin && (
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = (rect.left + rect.width / 2) / window.innerWidth
                  const y = (rect.top + rect.height / 2) / window.innerHeight
                  confetti({
                    origin: { x, y },
                    particleCount: 100,
                    spread: 70,
                    zIndex: 99999,
                    colors: ["#a855f7", "#d8b4fe", "#c084fc", "#f3e8ff"],
                  })
                }}
                className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border border-purple-500 bg-gradient-to-r from-transparent to-purple-500/20 text-purple-600 dark:text-purple-400 shadow-sm self-center translate-y-[1px] cursor-pointer hover:to-purple-500/30 transition-colors"
              >
                {activeUser.pin}
              </button>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-mono mt-0.5">
            @{activeUser.username}
          </p>
          {activeUser.title && (
            <p className="text-gray-600 dark:text-gray-400 text-base mt-1">
              {activeUser.title}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
