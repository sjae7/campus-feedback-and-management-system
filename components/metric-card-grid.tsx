import {
  CheckCircle2Icon,
  Clock3Icon,
  type LucideIcon,
} from "lucide-react"

import { MetricCard } from "@/components/metric-card"
import type { StatusCounts } from "@/lib/types"

type MetricCardConfig = {
  key: string
  label: string
  icon?: LucideIcon
  value: (counts: StatusCounts) => number
}

const studentMetricCards = [
  {
    key: "total",
    label: "Total suggestions",
    value: (counts) => counts.total,
  },
  {
    key: "new",
    label: "New",
    icon: Clock3Icon,
    value: (counts) => counts.new,
  },
  {
    key: "reviewing",
    label: "Reviewing",
    value: (counts) => counts.reviewing,
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2Icon,
    value: (counts) => counts.approved + counts.resolved,
  },
] satisfies MetricCardConfig[]

const adminMetricCards = [
  {
    key: "total",
    label: "Total suggestions",
    value: (counts) => counts.total,
  },
  {
    key: "new",
    label: "New",
    value: (counts) => counts.new,
  },
  {
    key: "reviewing",
    label: "Reviewing",
    value: (counts) => counts.reviewing,
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2Icon,
    value: (counts) => counts.approved + counts.resolved,
  },
  {
    key: "rejected",
    label: "Rejected",
    value: (counts) => counts.rejected,
  },
] satisfies MetricCardConfig[]

type MetricCardGridProps = {
  counts: StatusCounts
}

export function StudentMetricCardGrid({ counts }: MetricCardGridProps) {
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {studentMetricCards.map((card) => (
        <MetricCard
          key={card.key}
          label={card.label}
          value={card.value(counts)}
          icon={card.icon}
        />
      ))}
    </div>
  )
}

export function AdminMetricCardGrid({ counts }: MetricCardGridProps) {
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {adminMetricCards.map((card) => (
        <MetricCard
          key={card.key}
          label={card.label}
          value={card.value(counts)}
          icon={card.icon}
        />
      ))}
    </div>
  )
}
