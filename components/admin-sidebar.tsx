"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Key,
  CreditCard,
  LogOut,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "Soumyadeep Mahata",
    email: "mahata@synaxg.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Home Tech",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: (
        <TerminalSquareIcon
        />
      ),
      isActive: true,
      items: []
    },
    {
      title: "Models",
      url: "#",
      icon: (
        <BotIcon
        />
      ),
      items: [],
    },
    {
      title: "Endpoints",
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [],
    },
    {
      title: "Grid Management",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
      items: [],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}
const navItems = [
  { title: "Dashboard", url: "/admin-dashboard", icon: LayoutDashboard },
  { title: "Models", url: "/admin-dashboard/models", icon: Bot },
  { title: "Grid Management", url: "/admin-dashboard/grid-management", icon: BarChart3 },
  { title: "User Management", url: "/admin-dashboard/user-management", icon: BarChart3 },
  { title: "System Health", url: "/admin-dashboard/system-health", icon: Key },
]
export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    // Get the current URL path for active link highlighting
  const pathname = usePathname()
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
