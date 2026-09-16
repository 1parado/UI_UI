import * as React from 'react'
import * as MenubarPrimitive from '@radix-ui/react-menubar'
import { cn } from '@/lib/utils'
import { CheckIcon, ChevronRightIcon, CircleIcon } from '@/lib/icons'

/**
 * A horizontal menu bar for application chrome — the desktop-style File / Edit /
 * View strip. Each top-level trigger opens its own menu, and once one menu is
 * open, hovering or arrowing across the bar walks between them without a
 * second click, which is the behaviour users expect from a native menu bar.
 *
 * For a single button that opens one menu, use `DropdownMenu` instead; for
 * in-page navigation use `NavigationMenu`.
 */
const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn('flex h-10 items-center gap-1 rounded-md border bg-background p-1', className)}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

/**
 * The Radix re-exports below carry explicit `typeof` annotations on purpose.
 * Their inferred types reach into `@radix-ui/react-context` through a pnpm
 * store path, which `tsc` cannot name when emitting declarations (TS2742).
 * Spelling out `typeof` keeps the emitted `.d.ts` portable.
 */
const MenubarMenu: typeof MenubarPrimitive.Menu = MenubarPrimitive.Menu
const MenubarGroup: typeof MenubarPrimitive.Group = MenubarPrimitive.Group
const MenubarPortal: typeof MenubarPrimitive.Portal = MenubarPrimitive.Portal
const MenubarSub: typeof MenubarPrimitive.Sub = MenubarPrimitive.Sub
const MenubarRadioGroup: typeof MenubarPrimitive.RadioGroup = MenubarPrimitive.RadioGroup

export type MenubarTriggerProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  MenubarTriggerProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

export type MenubarContentProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  MenubarContentProps
>(({ className, align = 'start', alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        className
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
))
MenubarContent.displayName = MenubarPrimitive.Content.displayName

export type MenubarItemProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item>

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  MenubarItemProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

export type MenubarCheckboxItemProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.CheckboxItem
>

/**
 * An on/off item. `checked` is fully controlled — Radix keeps no state of its
 * own here — so pairing it with `onCheckedChange` is what makes it toggle.
 * Selecting one closes the menu, like any other menu item.
 */
const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  MenubarCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    checked={checked}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

export type MenubarRadioItemProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.RadioItem
>

/** A pick inside a `MenubarRadioGroup`; the group owns the selected value. */
const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  MenubarRadioItemProps
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <CircleIcon className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

/** The tick rendered inside a checked item — use it when an item needs a custom layout. */
const MenubarItemIndicator = MenubarPrimitive.ItemIndicator

export type MenubarLabelProps = React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label>

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  MenubarLabelProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

export type MenubarSeparatorProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Separator
>

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  MenubarSeparatorProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

export type MenubarShortcutProps = React.ComponentPropsWithoutRef<'span'>

/** Trailing keyboard hint on a menu item, right-aligned and muted. */
const MenubarShortcut = React.forwardRef<HTMLSpanElement, MenubarShortcutProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  )
)
MenubarShortcut.displayName = 'MenubarShortcut'

export type MenubarSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.SubTrigger
>

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  MenubarSubTriggerProps
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
      className
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

export type MenubarSubContentProps = React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.SubContent
>

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  MenubarSubContentProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

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
}
