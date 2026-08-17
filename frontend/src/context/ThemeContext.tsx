import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return localStorage.getItem("theme") as Theme || "system"
  })

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")

  const applyTheme = (currentTheme: Theme) => {
    const root = window.document.documentElement
    let computedTheme: "light" | "dark" = "dark"

    if (currentTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      computedTheme = systemTheme
    } else {
      computedTheme = currentTheme
    }

    if (computedTheme === "dark") {
      root.classList.remove("light")
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
    }

    setResolvedTheme(computedTheme)
  }

  // Wrapped transition helper
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme)

    // Check if view transitions are supported
    // @ts-ignore
    if (document.startViewTransition) {
      // @ts-ignore
      document.startViewTransition(() => {
        setThemeState(newTheme)
        applyTheme(newTheme)
      })
    } else {
      setThemeState(newTheme)
      applyTheme(newTheme)
    }
  }

  useEffect(() => {
    applyTheme(theme)

    // Listen to real-time system/browser theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleSystemChange = () => {
      if (theme === "system") {
        // @ts-ignore
        if (document.startViewTransition) {
          // @ts-ignore
          document.startViewTransition(() => {
            applyTheme("system")
          })
        } else {
          applyTheme("system")
        }
      }
    }

    mediaQuery.addEventListener("change", handleSystemChange)
    return () => mediaQuery.removeEventListener("change", handleSystemChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export default ThemeProvider
