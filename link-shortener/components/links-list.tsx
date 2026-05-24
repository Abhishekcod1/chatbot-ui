"use client"

import { useState } from "react"
import { LinkForm } from "./link-form"
import { LinkCard } from "./link-card"
import type { LinkRow } from "@/types"

interface LinksListProps {
  initialLinks: LinkRow[]
  baseUrl: string
}

export function LinksList({ initialLinks, baseUrl }: LinksListProps) {
  const [links, setLinks] = useState<LinkRow[]>(initialLinks)

  const handleCreated = (link: LinkRow) => {
    setLinks(prev => [link, ...prev])
  }

  const handleDelete = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="space-y-6">
      <LinkForm onCreated={handleCreated} />

      <div className="space-y-3">
        {links.map(link => (
          <LinkCard
            key={link.id}
            link={link}
            baseUrl={baseUrl}
            onDelete={handleDelete}
          />
        ))}

        {links.length === 0 && (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="text-muted-foreground">
              No links yet. Create your first short link above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
