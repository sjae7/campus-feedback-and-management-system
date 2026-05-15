import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type MetricCardProps = {
  label: string
  value: number
  icon?: LucideIcon
}

export function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <CardTitle className="min-w-0 text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon ? <Icon className="text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
