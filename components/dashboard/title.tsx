interface DashboardTitleProps {
  title: string
  description?: string
}

export function DashboardTitle({ title, description }: DashboardTitleProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
  )
}
