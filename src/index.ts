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

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './components/Accordion'
export type {
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from './components/Accordion'

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogClose,
} from './components/AlertDialog'
export type {
  AlertDialogOverlayProps,
  AlertDialogContentProps,
  AlertDialogHeaderProps,
  AlertDialogFooterProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogCloseProps,
} from './components/AlertDialog'

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './components/Breadcrumb'
export type {
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
  BreadcrumbEllipsisProps,
} from './components/Breadcrumb'

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './components/Collapsible'
export type {
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from './components/Collapsible'

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandLoading,
} from './components/Command'
export type {
  CommandDialogProps,
  CommandInputProps,
  CommandListProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandItemProps,
  CommandSeparatorProps,
  CommandShortcutProps,
  CommandLoadingProps,
} from './components/Command'

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './components/ContextMenu'
export type {
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuCheckboxItemProps,
  ContextMenuRadioItemProps,
  ContextMenuLabelProps,
  ContextMenuSeparatorProps,
  ContextMenuShortcutProps,
  ContextMenuSubContentProps,
  ContextMenuSubTriggerProps,
} from './components/ContextMenu'

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from './components/HoverCard'
export type { HoverCardContentProps } from './components/HoverCard'

export {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
  addonVariants,
} from './components/InputGroup'
export type {
  InputGroupProps,
  InputGroupInputProps,
  InputGroupAddonProps,
  InputGroupTextProps,
} from './components/InputGroup'

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from './components/InputOTP'
export type {
  InputOTPGroupProps,
  InputOTPSlotProps,
  InputOTPSeparatorProps,
} from './components/InputOTP'

export { Kbd, KbdGroup } from './components/Kbd'
export type { KbdProps, KbdGroupProps } from './components/Kbd'

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  getPaginationRange,
} from './components/Pagination'
export type {
  PaginationProps,
  PaginationContentProps,
  PaginationItemProps,
  PaginationLinkProps,
  PaginationPreviousProps,
  PaginationNextProps,
  PaginationEllipsisProps,
  PaginationRangeItem,
  GetPaginationRangeOptions,
} from './components/Pagination'

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
} from './components/Sheet'
export type {
  SheetOverlayProps,
  SheetContentProps,
  SheetHeaderProps,
  SheetFooterProps,
  SheetTitleProps,
  SheetDescriptionProps,
} from './components/Sheet'

export { Spinner, spinnerVariants } from './components/Spinner'
export type { SpinnerProps } from './components/Spinner'

export { Toggle, toggleVariants } from './components/Toggle'
export type { ToggleProps } from './components/Toggle'

export { ToggleGroup, ToggleGroupItem } from './components/ToggleGroup'
export type { ToggleGroupProps, ToggleGroupItemProps } from './components/ToggleGroup'

export {
  Heading,
  Text,
  Small,
  Blockquote,
  InlineCode,
  textVariants,
} from './components/Typography'
export type {
  HeadingProps,
  TextProps,
  SmallProps,
  BlockquoteProps,
  InlineCodeProps,
} from './components/Typography'

// Components — layout and data
export { AspectRatio } from './components/AspectRatio'
export type { AspectRatioProps } from './components/AspectRatio'

export { ButtonGroup, ButtonGroupSeparator, buttonGroupVariants } from './components/ButtonGroup'
export type { ButtonGroupProps, ButtonGroupSeparatorProps } from './components/ButtonGroup'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/Table'
export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableHeadProps,
  TableRowProps,
  TableCellProps,
  TableCaptionProps,
} from './components/Table'

export { DataTable } from './components/DataTable'
export type { DataTableColumn, DataTableProps, SortDirection } from './components/DataTable'

export { Calendar, CalendarDayButton, CalendarChevron } from './components/Calendar'
export type { CalendarProps } from './components/Calendar'

export { DatePicker, DateRangePicker, formatDay } from './components/DatePicker'
export type { DatePickerProps, DateRangePickerProps } from './components/DatePicker'

export { Combobox, ComboboxMultiple } from './components/Combobox'
export type { ComboboxOption, ComboboxProps, ComboboxMultipleProps } from './components/Combobox'

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from './components/Drawer'
export type {
  DrawerContentProps,
  DrawerOverlayProps,
  DrawerHeaderProps,
  DrawerFooterProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
} from './components/Drawer'

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarItemIndicator,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarGroup,
  MenubarPortal,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from './components/Menubar'
export type {
  MenubarTriggerProps,
  MenubarContentProps,
  MenubarItemProps,
  MenubarCheckboxItemProps,
  MenubarRadioItemProps,
  MenubarLabelProps,
  MenubarSeparatorProps,
  MenubarShortcutProps,
  MenubarSubTriggerProps,
  MenubarSubContentProps,
} from './components/Menubar'

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from './components/NavigationMenu'

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  sidebarMenuButtonVariants,
  useSidebar,
} from './components/Sidebar'
export type {
  SidebarContextValue,
  SidebarMenuButtonProps,
  SidebarMenuSubButtonProps,
  SidebarProps,
  SidebarProviderProps,
  SidebarTriggerProps,
} from './components/Sidebar'

// Components — status and data display
export { Timeline, TimelineItem } from './components/Timeline'
export type { TimelineProps, TimelineItemProps } from './components/Timeline'
export { Descriptions, DescriptionsItem } from './components/Descriptions'
export type {
  DescriptionsProps,
  DescriptionsItemProps,
} from './components/Descriptions'
export { Stepper, StepperItem } from './components/Stepper'
export type { StepperProps, StepperItemProps, StepperState } from './components/Stepper'
export { Rating } from './components/Rating'
export type { RatingProps } from './components/Rating'
export { TagInput } from './components/TagInput'
export type { TagInputProps } from './components/TagInput'
export { Sparkline } from './components/Sparkline'
export type { SparklineProps } from './components/Sparkline'
export { RingProgress } from './components/RingProgress'
export type { RingProgressProps } from './components/RingProgress'
export { Stat } from './components/Stat'
export type { StatProps } from './components/Stat'
export { ColorPicker, ColorSwatch, DEFAULT_COLOR_PRESETS } from './components/ColorPicker'
export type { ColorPickerProps, ColorSwatchProps } from './components/ColorPicker'
export { TimePicker, TimeColumns, DateTimePicker, parseTime, formatTime } from './components/TimePicker'
export type {
  TimePickerProps,
  TimeColumnsProps,
  TimeColumnsLabels,
  DateTimePickerProps,
} from './components/TimePicker'
export { MultiSelect } from './components/MultiSelect'
export type {
  MultiSelectProps,
  MultiSelectOption,
  MultiSelectLabels,
} from './components/MultiSelect'
export {
  NotificationCenter,
  NotificationList,
  notificationToneVariants,
} from './components/NotificationCenter'
export type {
  NotificationCenterProps,
  NotificationListProps,
  NotificationListLabels,
  NotificationItem,
} from './components/NotificationCenter'

// Colour maths — used by ColorPicker, exported for callers doing their own
export {
  rgbToHex,
  parseHex,
  rgbToHsv,
  hsvToRgb,
  hexToHsv,
  readableInk,
  type Rgb,
  type Hsv,
} from './lib/color'

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

// AI surfaces — code, files and process output
export { Diff, CodeDiff } from './components/Diff'
export type { DiffProps, CodeDiffProps, DiffView, DiffLabels } from './components/Diff'

export { Tree, FileTree } from './components/Tree'
export type { TreeProps, TreeNode, FileTreeProps } from './components/Tree'

export { Terminal, LogViewer } from './components/Terminal'
export type {
  TerminalProps,
  TerminalLabels,
  LogLine,
  LogViewerProps,
  LogViewerLabels,
  LogEntry,
} from './components/Terminal'

export { FileUpload } from './components/FileUpload'
export type {
  FileUploadProps,
  FileUploadLabels,
  UploadItem,
  UploadStatus,
  UploadHandler,
  UploadHandlerOptions,
  UploadRejection,
  UploadRejectReason,
} from './components/FileUpload'

// Diff, ANSI, log levels and paths — the maths behind the components above,
// exported for callers doing their own rendering.
export {
  diffLines,
  diffStats,
  formatUnifiedDiff,
  hasChanges,
  splitLines,
  toHunks,
  toSplitRows,
  type DiffHunk,
  type DiffLine,
  type DiffLineType,
  type DiffSplitRow,
  type DiffStats,
  type UnifiedTextOptions,
} from './lib/diff'

export {
  ANSI_NAMED,
  paletteColor,
  parseAnsi,
  stripAnsi,
  type AnsiColor,
  type AnsiToken,
} from './lib/ansi'

export {
  LOG_LEVELS,
  countLevels,
  parseLogLevel,
  type LogLevel,
} from './lib/log'

export {
  buildFileTree,
  collectDirectoryIds,
  fileExtension,
  fileKind,
  splitPath,
  type BuildFileTreeOptions,
  type FileKind,
  type FileTreeEntry,
} from './lib/file-tree'

export {
  describeAccept,
  matchesAccept,
  parseAccept,
  type AcceptGroups,
} from './lib/upload'

// Forms, direction and the list primitives that compose them.
export {
  Controller,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useFormField,
  useWatch,
} from './components/Form'
export type {
  ControllerProps,
  FieldError,
  FieldErrors,
  FieldPath,
  FieldValues,
  FormControlProps,
  FormDescriptionProps,
  FormItemProps,
  FormLabelProps,
  FormMessageProps,
  SubmitHandler,
  UseFormReturn,
} from './components/Form'

export { NativeSelect } from './components/NativeSelect'
export type { NativeSelectProps } from './components/NativeSelect'

export {
  DirectionProvider,
  resolveDirection,
  useDirection,
  useDirectionControls,
} from './components/Direction'
export type {
  Direction,
  DirectionControls,
  DirectionProviderProps,
} from './components/Direction'

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './components/Item'
export type {
  ItemActionsProps,
  ItemContentProps,
  ItemDescriptionProps,
  ItemFooterProps,
  ItemGroupProps,
  ItemHeaderProps,
  ItemMediaProps,
  ItemProps,
  ItemSeparatorProps,
  ItemTitleProps,
} from './components/Item'

export { Marker } from './components/Marker'
export type { MarkerProps } from './components/Marker'

export { Bubble, BubbleGroup, BubbleMeta } from './components/Bubble'
export type {
  BubbleGroupProps,
  BubbleLabels,
  BubbleMetaProps,
  BubbleProps,
  BubbleSide,
  BubbleStatus,
} from './components/Bubble'

export { Questionnaire } from './components/Questionnaire'
export type {
  Question,
  QuestionAnswer,
  QuestionOption,
  QuestionnaireAnswers,
  QuestionnaireLabels,
  QuestionnaireMessages,
  QuestionnaireProgress,
  QuestionnaireProps,
  QuestionType,
} from './components/Questionnaire'

export { VirtualList } from './components/VirtualList'
export type { VirtualListProps } from './components/VirtualList'

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from './components/Carousel'
export type {
  CarouselApi,
  CarouselArrowProps,
  CarouselContentProps,
  CarouselItemProps,
  CarouselLabels,
  CarouselProps,
} from './components/Carousel'

export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/Resizable'
export type { ResizableHandleProps, ResizablePanelGroupProps } from './components/Resizable'

export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  chartPalette,
  useChart,
} from './components/Chart'
export type {
  ChartConfig,
  ChartContainerProps,
  ChartLegendProps,
  ChartSeriesConfig,
  ChartTooltipContentProps,
  ChartTooltipItem,
  ChartTooltipProps,
} from './components/Chart'

export { QRCode } from './components/QRCode'
export type { QRCodeImageSettings, QRCodeLevel, QRCodeProps } from './components/QRCode'

// Navigation, pinning and end-states — the pieces a long page needs.
export { Segmented, SegmentedItem } from './components/Segmented'
export type {
  SegmentedItemProps,
  SegmentedLabels,
  SegmentedOption,
  SegmentedProps,
} from './components/Segmented'

export { Affix } from './components/Affix'
export type { AffixProps } from './components/Affix'

export { Anchor } from './components/Anchor'
export type { AnchorItem, AnchorProps } from './components/Anchor'

export {
  BackTop,
  FloatButton,
  FloatButtonGroup,
  floatButtonVariants,
} from './components/FloatButton'
export type {
  BackTopProps,
  FloatButtonGroupProps,
  FloatButtonProps,
  FloatPosition,
} from './components/FloatButton'

export { Result } from './components/Result'
export type { ResultProps, ResultStatus } from './components/Result'

export { Watermark } from './components/Watermark'
export type { WatermarkFont, WatermarkProps } from './components/Watermark'

export {
  pickActiveAnchor,
  scrollTargetFor,
  type AnchorSection,
} from './lib/anchor'

// Pickers that read trees or two lists — cascaders, transfers, suggestions.
export { Cascader, cascaderVariants } from './components/Cascader'
export type { CascaderProps } from './components/Cascader'

export {
  columnsFor,
  findOptionPath,
  isLeaf,
  leafPaths,
  optionLabels,
  searchLeafPaths,
  type CascaderLeafPath,
  type CascaderOption,
} from './lib/cascader'

export { TreeSelect, treeSelectVariants } from './components/TreeSelect'
export type { TreeSelectProps } from './components/TreeSelect'

export {
  applyToggle,
  filterTree,
  nodeState,
  visibleRows,
  type TreeRow,
  type TreeSelectNode,
} from './lib/tree-select'

export { Transfer } from './components/Transfer'
export type { TransferProps } from './components/Transfer'

export {
  filterItems,
  targetKeysAfterMove,
  toggleSelectAll,
  type TransferDirection,
  type TransferItem,
} from './lib/transfer'

export { AutoComplete } from './components/AutoComplete'
export type { AutoCompleteProps } from './components/AutoComplete'

export {
  groupOptions,
  matchOptions,
  optionText,
  type AutoCompleteFilter,
  type AutoCompleteOption,
} from './lib/autocomplete'
