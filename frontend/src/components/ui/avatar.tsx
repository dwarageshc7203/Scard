import * as React from 'react'
import { cn } from '../../lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string
  color?: string
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isOnline?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, initials, color, src, alt, size = 'md', isOnline = false, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-16 w-16 text-lg',
      xl: 'h-20 w-20 text-xl font-bold',
    }

    const dotSizeClasses = {
      sm: 'h-2 w-2 border-[1.5px]',
      md: 'h-2.5 w-2.5 border-[1.5px]',
      lg: 'h-3.5 w-3.5 border-2',
      xl: 'h-4 w-4 border-2',
    }

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center rounded-full shrink-0 select-none bg-surface-2 border border-border overflow-hidden', sizeClasses[size], className)}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt || 'Avatar'} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-semibold tracking-wide text-text/90"
            style={color ? { backgroundColor: color } : undefined}
          >
            {initials || ''}
          </div>
        )}
        {isOnline && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full bg-green-500 border-bg ring-1 ring-bg',
              dotSizeClasses[size]
            )}
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export default Avatar
