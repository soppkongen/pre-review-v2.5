"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Review", href: "/" },
  { name: "Lab", href: "/theory-lab" },
  { name: "Search", href: "/search" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Pre-Review
          </Link>
          
          <nav className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-teal-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          <Button className="bg-teal-700 hover:bg-teal-800">
            Start Review
          </Button>
        </div>
      </div>
    </header>
  )
}
