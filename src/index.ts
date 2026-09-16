// Styles
import './styles/globals.css'

// Utilities
export { cn } from './lib/utils'
export { formatBytes, formatCompactNumber, formatNumber } from './lib/format'

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

export { Checkbox } from './components/Checkbox'
export type { CheckboxProps } from './components/Checkbox'

export { RadioGroup, Radio } from './components/RadioGroup'
export type { RadioGroupProps, RadioProps } from './components/RadioGroup'

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './components/Select'
export type {
  SelectTriggerProps,
  SelectContentProps,
  SelectLabelProps,
  SelectItemProps,
  SelectSeparatorProps,
} from './components/Select'

export { Slider } from './components/Slider'
export type { SliderProps } from './components/Slider'

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/Dialog'
export type {
  DialogOverlayProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
} from './components/Dialog'

export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/Tabs'
export type {
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from './components/Tabs'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
} from './components/DropdownMenu'
export type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuSeparatorProps,
} from './components/DropdownMenu'

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './components/Tooltip'
export type { TooltipContentProps } from './components/Tooltip'

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from './components/Popover'
export type { PopoverContentProps } from './components/Popover'

export {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastViewport,
} from './components/Toast'
export type {
  ToastProps,
  ToastActionProps,
  ToastCloseProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastViewportProps,
} from './components/Toast'

export { Separator } from './components/Separator'
export type { SeparatorProps } from './components/Separator'

export { Empty, EmptyTitle, EmptyDescription } from './components/Empty'
export type {
  EmptyProps,
  EmptyTitleProps,
  EmptyDescriptionProps,
} from './components/Empty'

// AI surfaces — conversation
export {
  Message,
  MessageAvatar,
  MessageContent,
  MessageActions,
} from './components/Message'
export type {
  MessageProps,
  MessageRole,
  MessageAvatarProps,
  MessageContentProps,
  MessageActionsProps,
} from './components/Message'

export { MessageList } from './components/MessageList'
export type { MessageListProps, MessageListHandle } from './components/MessageList'

export {
  Composer,
  ComposerTextarea,
  ComposerToolbar,
  ComposerHint,
  ComposerSubmit,
} from './components/Composer'
export type {
  ComposerProps,
  ComposerTextareaProps,
  ComposerToolbarProps,
  ComposerHintProps,
  ComposerSubmitProps,
} from './components/Composer'

export { StreamingText } from './components/StreamingText'
export type { StreamingTextProps } from './components/StreamingText'

export { TypingIndicator } from './components/TypingIndicator'
export type { TypingIndicatorProps } from './components/TypingIndicator'

export { ScrollArea, ScrollBar } from './components/ScrollArea'
export type { ScrollAreaProps, ScrollBarProps } from './components/ScrollArea'

// AI surfaces — generated output
export { MarkdownRenderer } from './components/MarkdownRenderer'
export type { MarkdownRendererProps } from './components/MarkdownRenderer'

export { CodeBlock } from './components/CodeBlock'
export type { CodeBlockProps } from './components/CodeBlock'

export { Citation, SourceChip } from './components/Citation'
export type { CitationProps, SourceChipProps } from './components/Citation'

export {
  ToolCallCard,
  ToolCallSection,
  ToolCallCode,
  AgentStep,
  AgentStepList,
} from './components/ToolCallCard'
export type {
  ToolCallCardProps,
  ToolCallSectionProps,
  ToolCallCodeProps,
  ToolCallStatus,
  AgentStepProps,
  AgentStepListProps,
} from './components/ToolCallCard'

// AI surfaces — conversation history and context
export {
  ConversationSidebar,
  ConversationSidebarHeader,
  ConversationSidebarContent,
  ConversationSidebarFooter,
  ConversationSidebarGroup,
  ConversationItem,
} from './components/ConversationSidebar'
export type {
  ConversationSidebarProps,
  ConversationSidebarHeaderProps,
  ConversationSidebarContentProps,
  ConversationSidebarFooterProps,
  ConversationSidebarGroupProps,
  ConversationItemProps,
} from './components/ConversationSidebar'

export { AttachmentList, Attachment } from './components/AttachmentList'
export type {
  AttachmentListProps,
  AttachmentProps,
} from './components/AttachmentList'

export { ModelSelector } from './components/ModelSelector'
export type { ModelSelectorProps, ModelOption } from './components/ModelSelector'

// AI surfaces — feedback and control
export { StopButton } from './components/StopButton'
export type { StopButtonProps } from './components/StopButton'

export { Feedback } from './components/Feedback'
export type { FeedbackProps, FeedbackValue } from './components/Feedback'

export { UsageMeter } from './components/UsageMeter'
export type { UsageMeterProps } from './components/UsageMeter'