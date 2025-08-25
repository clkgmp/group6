"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Film, Plus, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Watchlist",
      icon: Home,
    },
    {
      href: "/add",
      label: "Add Movie",
      icon: Plus,
    },
  ]

  return (
    <>
      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-12 md:h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Film className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Movie Watchlist</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    asChild
                    className={`flex items-center space-x-2 transition-colors ${
                      pathname === item.href 
                        ? "bg-muted text-foreground font-medium" 
                        : ""
                    } hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                )
              })}
              <ThemeToggle />
            </div>

            {/* Mobile Top Navigation - Only Theme Toggle */}
            <div className="flex md:hidden items-center space-x-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Beautiful Redesign */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-2xl shadow-2xl p-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 px-6 rounded-xl transition-all duration-300 ease-out",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <Icon className={cn(
                    "h-6 w-6 mb-2 transition-transform duration-300",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                  <span className={cn(
                    "text-xs font-semibold leading-tight text-center transition-colors duration-300",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add bottom padding for mobile to account for floating bottom navigation */}
      <div className="md:hidden h-32" />
    </>
  )
}
