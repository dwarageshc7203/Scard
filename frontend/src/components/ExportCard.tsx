import React from "react"
import { User, Banner } from "../types"
import Avatar from "./ui/avatar"
import BadgeContainer from "./BadgeContainer"
import ProblemsSolved from "./ProblemsSolved"
import { Mail, Globe } from "lucide-react"
import Image from "./ui/Image"

interface ExportCardProps {
  user: User
  banner: Banner | undefined
}

const ExportCard: React.FC<ExportCardProps> = ({ user, banner }) => {
  const latestRating =
    user.contests && user.contests.length > 0
      ? user.contests[user.contests.length - 1].rating
      : 0

  let totalProblems = 0
  if (user.problemsSolved) {
    totalProblems = Object.values(user.problemsSolved).reduce(
      (sum, item) => sum + item.total,
      0,
    )
  }

  // To support proper imageUrl handling
  const userImageUrl = (user as any).imageUrl || user.imageURL

  return (
    <div
      id="export-card-node"
      className="w-[900px] bg-gray-50 dark:bg-[#202020] overflow-hidden font-sans relative flex flex-col border border-gray-200 dark:border-[#333]"
      style={{ borderRadius: "12px" }}
    >
      {/* Top Banner section */}
      <div
        className="h-[180px] relative bg-[#333]"
        style={
          banner
            ? {
                background: banner.cssBackground,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      ></div>

      {/* Overlapping Profile Info */}
      <div className="relative px-12 flex -mt-[110px]">
        {/* Avatar */}
        <div className="w-[220px] h-[220px] rounded-full overflow-hidden border-[4px] border-gray-50 dark:border-[#202020] bg-gray-200 dark:bg-[#333] flex items-center justify-center shrink-0 shadow-lg">
          {userImageUrl ? (
            <Image
              src={userImageUrl}
              alt={user.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-7xl text-gray-400 font-bold">
              {user.displayName.charAt(0)}
            </span>
          )}
        </div>

        {/* Name and Designation */}
        <div className="ml-8 mt-[110px] flex flex-col justify-center">
          <h1
            className="text-6xl font-extrabold text-gray-900 dark:text-white leading-none tracking-tight"
          >
            {user.displayName}
          </h1>
          {user.designation && (
            <p className="text-2xl text-gray-600 dark:text-gray-400 mt-3 font-medium tracking-wide">
              {user.designation}
            </p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {!!(user as any).socials?.leetcode && (
      <div className="grid grid-cols-3 gap-8 px-12 pt-12 pb-20 mt-2">
        {/* Contest Rating */}
        <div className="flex flex-col items-center justify-start">
          <span className="text-[26px] text-gray-700 dark:text-gray-300 mb-8 font-medium">
            Contest Rating
          </span>
          <span
            className="text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            {latestRating || "-"}
          </span>
        </div>

        {/* Problems Solved */}
        <div className="flex flex-col items-center justify-start">
          <span className="text-[26px] text-gray-700 dark:text-gray-300 mb-8 font-medium">
            Problems solved
          </span>
          <span
            className="text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            {totalProblems || "-"}
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-center justify-start">
          <span className="text-[26px] text-gray-700 dark:text-gray-300 mb-8 font-medium">
            Badges
          </span>
          <div className="flex items-center gap-6">
            {user.badges && user.badges.length > 0 ? (
              user.badges.slice(0, 3).map((badge, idx) => (
                <div
                  key={idx}
                  className="w-[85px] h-[85px] flex items-center justify-center"
                >
                  {badge.iconUrl ? (
                    <Image
                      src={badge.iconUrl}
                      alt={badge.label}
                      className="w-full h-full object-contain drop-shadow-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 dark:bg-[#333] border border-gray-300 dark:border-white/10 flex items-center justify-center">
                      <span className="text-sm uppercase font-bold text-gray-500">
                        {badge.platform.substring(0, 3)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <span className="text-4xl text-gray-500 font-light">-</span>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default ExportCard
