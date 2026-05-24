"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

interface AnalyticsChartProps {
  linkId: string
}

export function AnalyticsChart({ linkId }: AnalyticsChartProps) {
  const [data, setData] = useState<{ date: string; clicks: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/links/${linkId}/analytics`)
      .then(r => r.json())
      .then(({ clicks }) => {
        const grouped = (clicks as { clicked_at: string }[]).reduce(
          (acc: Record<string, number>, c) => {
            const d = c.clicked_at.slice(0, 10)
            acc[d] = (acc[d] ?? 0) + 1
            return acc
          },
          {}
        )

        const days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (29 - i))
          return d.toISOString().slice(0, 10)
        })

        setData(days.map(date => ({ date, clicks: grouped[date] ?? 0 })))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [linkId])

  if (loading) {
    return <div className="h-40 animate-pulse rounded-md bg-muted" />
  }

  return (
    <div className="pt-2">
      <p className="mb-2 text-xs text-muted-foreground">Clicks — last 30 days</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={d => d.slice(5)}
            interval={4}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
          <Tooltip
            labelFormatter={l => `Date: ${l}`}
            formatter={(v: number) => [v, "clicks"]}
          />
          <Bar
            dataKey="clicks"
            fill="hsl(var(--primary))"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
