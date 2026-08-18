import * as React from "react"
import { cn } from "../../lib/utils"

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

export const Tabs =
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    value: string
    onValueChange: (value: string) => void
  }>(({ children, value, onValueChange, className, ...props }, ref) => {
    return (
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  })
Tabs.displayName = "Tabs"

export const TabsList =
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
      return (
        <div
          ref={ref}
          className={cn(
            "inline-flex h-9 items-center justify-center rounded-lg bg-surface-2 p-1 text-muted border border-border",
            className,
          )}
          {...props}
        />
      )
    },
  )
TabsList.displayName = "TabsList"

export const TabsTrigger =
  React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }>(({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsTrigger must be used within Tabs")

    const isActive = context.value === value

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => context.onValueChange(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          isActive ? "bg-bg text-text shadow-sm" : "text-muted hover:text-text",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  })
TabsTrigger.displayName = "TabsTrigger"

export const TabsContent =
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }>(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsContent must be used within Tabs")

    if (context.value !== value) return null

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className,
        )}
        {...props}
      />
    )
  })
TabsContent.displayName = "TabsContent"

const TabsWrapper = Object.assign(Tabs, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})

export default TabsWrapper
