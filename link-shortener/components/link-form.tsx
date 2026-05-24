"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { LinkRow } from "@/types"

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid"

const STATUS_COLOR: Record<SlugStatus, string> = {
  idle: "text-muted-foreground",
  checking: "text-yellow-500",
  available: "text-green-600",
  taken: "text-red-500",
  invalid: "text-red-400"
}

const STATUS_TEXT: Record<SlugStatus, string> = {
  idle: "",
  checking: "Checking availability…",
  available: "✓ Available",
  taken: "✗ Already taken",
  invalid: "Letters, numbers, - and _ only (max 100)"
}

interface LinkFormProps {
  onCreated: (link: LinkRow) => void
}

export function LinkForm({ onCreated }: LinkFormProps) {
  const [slug, setSlug] = useState("")
  const [destination, setDestination] = useState("")
  const [title, setTitle] = useState("")
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle")
      return
    }

    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(slug)) {
      setSlugStatus("invalid")
      return
    }

    setSlugStatus("checking")
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/slugs/check?slug=${encodeURIComponent(slug)}`
        )
        const json = await res.json()
        setSlugStatus(json.available ? "available" : "taken")
      } catch {
        setSlugStatus("idle")
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (slugStatus !== "available" || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, destination, title: title || undefined })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to create link")
      }

      const { link } = await res.json()
      onCreated(link)
      setSlug("")
      setDestination("")
      setTitle("")
      setSlugStatus("idle")
      toast.success("Short link created!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold">Create a new short link</h2>

      <div className="space-y-1">
        <label htmlFor="destination" className="text-sm font-medium">
          Destination URL <span className="text-red-500">*</span>
        </label>
        <input
          id="destination"
          type="url"
          required
          value={destination}
          onChange={e => setDestination(e.target.value)}
          placeholder="https://example.com/very/long/url"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="slug" className="text-sm font-medium">
          Custom slug <span className="text-red-500">*</span>
        </label>
        <input
          id="slug"
          type="text"
          required
          value={slug}
          onChange={e => setSlug(e.target.value.toLowerCase())}
          placeholder="my-link"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {slug && (
          <p className={`text-xs ${STATUS_COLOR[slugStatus]}`}>
            {STATUS_TEXT[slugStatus]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium">
          Title{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="My awesome link"
          maxLength={200}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={slugStatus !== "available" || isSubmitting}
        className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Creating…" : "Create Short Link"}
      </button>
    </form>
  )
}
