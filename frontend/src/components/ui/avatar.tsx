import * as React from 'react'
import { cn } from '../../lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string
  color?: string
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isOnline?: boolean
  asciiArt?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, initials, color, src, alt, size = 'md', isOnline = false, asciiArt, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-16 w-16 text-lg',
      xl: 'h-20 w-20 text-xl ',
    }

    const dotSizeClasses = {
      sm: 'h-2 w-2 border-[1.5px]',
      md: 'h-2.5 w-2.5 border-[1.5px]',
      lg: 'h-3.5 w-3.5 border-2',
      xl: 'h-4 w-4 border-2',
    }

    const renderNormal = () => (
      <>
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
      </>
    )

    // Fallback cleanup in case stale HTML is passed
    const cleanAsciiArt = asciiArt?.includes('<span') ? '' : asciiArt

    const renderAscii = () => (
      <div className="flex h-full w-full items-center justify-center bg-transparent overflow-hidden @container">
        <pre
          className="font-mono leading-[0.9] text-center text-text whitespace-pre select-none drop-shadow-md"
          style={{ fontSize: 'calc(100cqw / 49.5)' }} // 90 chars * ~0.55 width ratio = ~49.5
        >
          {cleanAsciiArt}
        </pre>
      </div>
    )

    return (
      <div
        ref={ref}
        className={cn(
          'group relative inline-flex items-center justify-center shrink-0 select-none rounded-full',
          sizeClasses[size],
          className
        )}
        style={{ perspective: '1000px' }}
        {...props}
      >
        <div
          className={cn(
            'relative h-full w-full rounded-full transition-transform duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
            cleanAsciiArt ? 'group-hover:[transform:rotateY(180deg)] [transform-style:preserve-3d]' : 'overflow-hidden border border-border bg-surface-2'
          )}
        >
          {/* Front Face */}
          <div
            className={cn(
              'absolute inset-0 h-full w-full rounded-full overflow-hidden',
              cleanAsciiArt ? '[backface-visibility:hidden] border border-border bg-surface-2' : ''
            )}
          >
            {cleanAsciiArt ? renderAscii() : renderNormal()}
          </div>

          {/* Back Face (Only if ASCII exists) */}
          {cleanAsciiArt && (
            <div
              className="absolute inset-0 h-full w-full rounded-full overflow-hidden border border-border bg-surface-2 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            >
              {renderNormal()}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export default Avatar
