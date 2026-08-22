import { motion, AnimatePresence } from "framer-motion"

interface ValidationTooltipProps {
  message: string
  visible: boolean
}

/**
 * A small floating tooltip rendered above its parent container.
 * The parent must have `position: relative` set.
 * Uses CSS theme variables automatically (light + dark safe).
 */
export default function ValidationTooltip({ message, visible }: ValidationTooltipProps) {
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          key="tooltip"
          initial={{ opacity: 0, y: 4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.97 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "0",
            right: "0",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          {/* Tooltip box */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "6px",
              padding: "6px 10px",
              fontSize: "12px",
              color: "#ef4444",
              lineHeight: "1.4",
              boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              wordBreak: "break-word",
            }}
          >
            {message}
          </div>
          {/* Caret */}
          <div
            style={{
              position: "absolute",
              bottom: "-5px",
              left: "16px",
              width: "8px",
              height: "8px",
              background: "var(--surface)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderTop: "none",
              borderLeft: "none",
              transform: "rotate(45deg)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
