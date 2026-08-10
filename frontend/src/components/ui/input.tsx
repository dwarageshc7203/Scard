import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  suffixHint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, suffixHint, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-9',
            suffixHint && 'pr-12',
            className
          )}
          ref={ref}
          {...props}
        />
        {suffixHint && (
          <span
            className="absolute right-3 text-[10px] text-muted border border-border rounded px-1.5 py-0.5 font-mono select-none pointer-events-none"
          >
            {suffixHint}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export default Input
