"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Home,
  Search,
  Upload,
  MessageSquare,
  Zap,
  Info,
  Phone,
  HelpCircle,
  Activity,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mainNavigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Platform overview and getting started",
  },
  {
    name: "Knowledge Base",
    href: "/knowledge-base",
    icon: Search,
    description: "Search physics concepts and explanations",
  },
  {
    name: "Submit Paper",
    href: "/submit",
    icon: Upload,
    description: "Upload research papers for analysis",
  },
  {
    name: "Theory Lab",
    href: "/theory-lab",
    icon: MessageSquare,
    description: "Interactive AI physics conversations",
  },
  {
    name: "Theory Bootloader",
    href: "/theory-bootloader",
    icon: Zap,
    description: "Accelerated physics learning system",
  },
]

const secondaryNavigation = [
  {
    name: "How It Works",
    href: "/how-it-works",
    icon: BookOpen,
    description: "Learn about our multi-agent system",
  },
  {
    name: "About",
    href: "/about",
    icon: Info,
    description: "About Pre-Review Physics",
  },
  {
    name: "Contact",
    href: "/contact",
    icon: Phone,
    description: "Get in touch with our team",
  },
  {
    name: "FAQ",
    href: "/faq",
    icon: HelpCircle,
    description: "Frequently asked questions",
  },
]

const adminNavigation = [
  {
    name: "Admin Dashboard",
    href: "/admin",
    icon: Activity,
    description: "System monitoring and statistics",
  },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const NavLink = ({
    item,
    mobile = false,
    onClick,
  }: {
    item: (typeof mainNavigation)[0]
    mobile?: boolean
    onClick?: () => void
  }) => {
    const Icon = item.icon
    const active = isActive(item.href)

    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          mobile && "w-full justify-start",
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="h-4 w-4" />
        <span>{item.name}</span>
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-6 w-6 bg-primary rounded" />
            <span className="hidden font-bold sm:inline-block">Pre-Review Physics</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {mainNavigation.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Desktop Secondary Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden lg:flex items-center space-x-2">
            {secondaryNavigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
            {adminNavigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <div className="h-6 w-6 bg-primary rounded" />
                  <span className="font-bold">Pre-Review Physics</span>
                </Link>
              </div>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {/* Main Navigation */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground px-3">Main</h4>
                    {mainNavigation.map((item) => (
                      <NavLink key={item.href} item={item} mobile onClick={() => setIsOpen(false)} />
                    ))}
                  </div>

                  {/* Secondary Navigation */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground px-3">Information</h4>
                    {secondaryNavigation.map((item) => (
                      <NavLink key={item.href} item={item} mobile onClick={() => setIsOpen(false)} />
                    ))}
                  </div>

                  {/* Admin Navigation */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground px-3">Admin</h4>
                    {adminNavigation.map((item) => (
                      <NavLink key={item.href} item={item} mobile onClick={() => setIsOpen(false)} />
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
