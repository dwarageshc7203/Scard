import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle } from "lucide-react"

interface ValidationTooltipProps {
  message: string
  visible: boolean
}

export default function ValidationTooltip({ message, visible }: ValidationTooltipProps) {
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
        >
          <div className="bg-red-500 text-white text-xs font-sans px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{message}</span>
          </div>
          {/* Tooltip arrow */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-red-500 mx-auto" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
