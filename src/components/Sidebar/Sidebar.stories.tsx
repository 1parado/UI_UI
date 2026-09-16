import type { Meta, StoryObj } from '@storybook/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
} from './Sidebar'
import { Badge } from '@/components/Badge'
import { Separator } from '@/components/Separator'
import {
  CalendarIcon,
  ChevronRightIcon,
  FileIcon,
  HomeIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
} from '@/lib/icons'

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Sidebar>

const navItems = [
  { title: 'Home', icon: HomeIcon, active: true },
  { title: 'Search', icon: SearchIcon },
  { title: 'Files', icon: FileIcon },
  { title: 'Calendar', icon: CalendarIcon },
  { title: 'Settings', icon: SettingsIcon },
]

function SidebarDemo({ collapsible }: { collapsible?: 'icon' | 'offcanvas' }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible={collapsible}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#workspace">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <HomeIcon className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">Acme</span>
                    <span className="text-xs text-muted-foreground">Workspace</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Add project">
              <PlusIcon />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={item.active} tooltip={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.title === 'Files' && <SidebarMenuBadge>12</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium">Home</span>
        </header>
        <main className="flex-1 p-6">
          <p className="max-w-prose text-sm text-muted-foreground">
            Press ⌘B (or Ctrl+B) to toggle the rail. On a narrow viewport it becomes an overlay
            sheet instead of reflowing the page.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export const Default: Story = {
  render: () => <SidebarDemo />,
}

/** Collapses to a 3rem icon rail; each button surfaces its label as a tooltip. */
export const CollapsibleToIcons: Story = {
  render: () => <SidebarDemo collapsible="icon" />,
}

/** Right-hand rail that slides away entirely. */
export const RightSidebar: Story = {
  render: () => (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-14 items-center justify-end border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6 text-sm text-muted-foreground">Content sits on the left.</main>
      </SidebarInset>
      <Sidebar side="right">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Inspector</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Properties</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>Layout</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Typography</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
}

/** Nested navigation with an inline sub-menu and hover-revealed row actions. */
export const WithSubmenuAndActions: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Design system">
                    <FileIcon />
                    <span>Design system</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontalIcon />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive>Tokens</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Components</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton size="sm">Changelog</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Marketing site">
                    <FileIcon />
                    <span>Marketing site</span>
                    <ChevronRightIcon className="ml-auto" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Badge variant="secondary">Beta</Badge>
                <span>Feedback</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="p-6 text-sm text-muted-foreground">Nested navigation.</main>
      </SidebarInset>
    </SidebarProvider>
  ),
}

/** First paint before data arrives — the rail keeps its shape so nothing jumps. */
export const Loading: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Recent</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 6 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="p-6 text-sm text-muted-foreground">Loading navigation…</main>
      </SidebarInset>
    </SidebarProvider>
  ),
}
