"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 px-0">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 px-0 hover:bg-accent hover:text-accent-foreground"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function ThemeToggleWithText() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="gap-2">
        <Sun className="h-4 w-4" />
        Light Mode
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 transition-all" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 transition-all" />
          Dark Mode
        </>
      )}
    </Button>
  )
}

export function ThemeToggleDropdown() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex flex-col gap-1 p-1">
        <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
          <Sun className="h-4 w-4" />
          Light
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
          <Moon className="h-4 w-4" />
          Dark
        </button>
      </div>
    )
  }

  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
  ]

  return (
    <div className="flex flex-col gap-1 p-1">
      {themes.map(({ name, value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
            theme === value ? "bg-accent text-accent-foreground" : ""
          }`}
          aria-label={`Switch to ${name.toLowerCase()} mode`}
        >
          <Icon className="h-4 w-4" />
          {name}
        </button>
      ))}
    </div>
  )
}