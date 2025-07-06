"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Upload, MessageSquare, Info } from "lucide-react";
import { cn } from "@/lib/utils";
const mainNavigation = [
    {
        name: "Home",
        href: "/",
        icon: Home,
    },
    {
        name: "Review Paper",
        href: "/submit",
        icon: Upload,
    },
    {
        name: "Theory Lab",
        href: "/theory-lab",
        icon: MessageSquare,
    },
    {
        name: "About",
        href: "/about",
        icon: Info,
    },
];
export function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const isActive = (href) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(href);
    };
    const NavLink = ({ item, mobile = false, onClick, }) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (<Link href={item.href} onClick={onClick} className={cn("text-sm font-medium transition-colors hover:text-teal-600", active ? "text-teal-600" : "text-gray-600", mobile && "flex items-center gap-3 rounded-lg px-3 py-2")} aria-current={active ? "page" : undefined}>
        {mobile && <Icon className="h-4 w-4"/>}
        <span>{item.name}</span>
      </Link>);
    };
    return (<header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.webp" alt="Pre-Review" className="h-8 w-8"/>
          <span className="text-xl font-bold text-gray-900">Pre-Review</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {mainNavigation.map((item) => (<NavLink key={item.href} item={item}/>))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
            <Link href="/submit">Start Review</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden" size="sm">
              <Menu className="h-5 w-5"/>
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-8">
              <Link href="/" className="flex items-center space-x-2 mb-8" onClick={() => setIsOpen(false)}>
                <div className="h-8 w-8 rounded bg-teal-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-semibold text-gray-900">Pre-Review</span>
              </Link>
              
              {mainNavigation.map((item) => (<NavLink key={item.href} item={item} mobile onClick={() => setIsOpen(false)}/>))}
              
              <div className="pt-4">
                <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  <Link href="/submit" onClick={() => setIsOpen(false)}>Start Review</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>);
}
