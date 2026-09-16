// Styles
import './styles/globals.css'

// Utilities
export { cn } from './lib/utils'

// Components
export { Button, buttonVariants } from './components/Button'
export type { ButtonProps } from './components/Button'

export { Input } from './components/Input'
export type { InputProps } from './components/Input'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/Card'

export { Badge, badgeVariants } from './components/Badge'
export type { BadgeProps } from './components/Badge'

export { Alert, AlertTitle, AlertDescription } from './components/Alert'

export { Skeleton } from './components/Skeleton'

export { Progress } from './components/Progress'
export type { ProgressProps } from './components/Progress'

export { Label } from './components/Label'
export type { LabelProps } from './components/Label'

export { Textarea } from './components/Textarea'
export type { TextareaProps } from './components/Textarea'

export { Switch } from './components/Switch'
export type { SwitchProps } from './components/Switch'

export { Avatar, AvatarImage, AvatarFallback } from './components/Avatar'
export type {
  AvatarProps,
  AvatarImageProps,
  AvatarFallbackProps,
} from './components/Avatar'