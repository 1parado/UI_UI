import * as React from 'react'
import { cn } from '@/lib/utils'

type AvatarContextValue = {
  imageStatus: 'idle' | 'loading' | 'loaded' | 'error'
  setImageStatus: (status: AvatarContextValue['imageStatus']) => void
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null)

function useAvatarContext(component: string) {
  const ctx = React.useContext(AvatarContext)
  if (!ctx) {
    throw new Error(`\`${component}\` must be used within \`<Avatar>\``)
  }
  return ctx
}

export type AvatarProps = React.HTMLAttributes<HTMLSpanElement>

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, ...props }, ref) => {
    const [imageStatus, setImageStatus] =
      React.useState<AvatarContextValue['imageStatus']>('idle')

    return (
      <AvatarContext.Provider value={{ imageStatus, setImageStatus }}>
        <span
          ref={ref}
          className={cn(
            'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
            className
          )}
          {...props}
        />
      </AvatarContext.Provider>
    )
  }
)
Avatar.displayName = 'Avatar'

export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoad, onError, ...props }, ref) => {
    const { setImageStatus } = useAvatarContext('AvatarImage')

    return (
      <img
        ref={ref}
        className={cn('aspect-square h-full w-full object-cover', className)}
        onLoad={(e) => {
          setImageStatus('loaded')
          onLoad?.(e)
        }}
        onError={(e) => {
          setImageStatus('error')
          onError?.(e)
        }}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = 'AvatarImage'

export type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    const { imageStatus } = useAvatarContext('AvatarFallback')

    // Keep the fallback mounted (for layout stability) but hidden while
    // the image is loading or has loaded successfully.
    if (imageStatus === 'loading' || imageStatus === 'loaded') return null

    return (
      <span
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium',
          className
        )}
        {...props}
      />
    )
  }
)
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }
