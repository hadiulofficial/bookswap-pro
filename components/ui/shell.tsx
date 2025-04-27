import * as React from "react"
import { cn } from "@/lib/utils"

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {}

const Shell = React.forwardRef<HTMLDivElement, ShellProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}>
      {children}
    </div>
  )
})
Shell.displayName = "Shell"

interface ShellHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const ShellHeader = React.forwardRef<HTMLDivElement, ShellHeaderProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
ShellHeader.displayName = "ShellHeader"

interface ShellTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const ShellTitle = React.forwardRef<HTMLHeadingElement, ShellTitleProps>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
))
ShellTitle.displayName = "ShellTitle"

interface ShellDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const ShellDescription = React.forwardRef<HTMLParagraphElement, ShellDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
ShellDescription.displayName = "ShellDescription"

interface ShellContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ShellContent = React.forwardRef<HTMLDivElement, ShellContentProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
ShellContent.displayName = "ShellContent"

interface ShellFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const ShellFooter = React.forwardRef<HTMLDivElement, ShellFooterProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
ShellFooter.displayName = "ShellFooter"

export { Shell, ShellHeader, ShellTitle, ShellDescription, ShellContent, ShellFooter }
