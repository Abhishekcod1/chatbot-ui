"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AnalyticsChart } from "./analytics-chart"
import { formatDate, truncate } from "@/lib/utils"
import type { LinkRow } from "@/types"

interface LinkCardProps {
  link: LinkRow
  baseUrl: string
  onDelete: (id: string) => void
}

export function LinkCard({ link, baseUrl, onDelete }: LinkCardProps) {
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const shortUrl = `${baseUrl}/${link.slug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "/${link.slug}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/links/${link.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      onDelete(link.id)
      toast.success("Link deleted")
    } catch {
      toast.error("Failed to delete link")
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1 space-y-1">
          {link.title && (
            <p className="text-sm font-medium">{link.title}</p>
          )}
          <div className="flex items-center gap-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-primary hover:underline"
            >
              {shortUrl.replace(/^https?:\/\//, "")}
            </a>
            <button
              onClick={handleCopy}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              title="Copy"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            → {truncate(link.destination, 60)}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
              {link.click_count} click{link.click_count !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(link.created_at)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setShowAnalytics(v => !v)}
            className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs shadow-sm transition-colors hover:bg-accent"
          >
            {showAnalytics ? "Hide" : "Analytics"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex h-8 items-center rounded-md border border-destructive/50 bg-background px-3 text-xs text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>

      {showAnalytics && (
        <div className="border-t px-4 pb-4">
          <AnalyticsChart linkId={link.id} />
        </div>
      )}
    </div>
  )
}
