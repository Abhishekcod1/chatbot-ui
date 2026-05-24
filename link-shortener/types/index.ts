export interface LinkRow {
  id: string
  user_id: string
  slug: string
  destination: string
  title: string | null
  click_count: number
  created_at: string
  updated_at: string | null
}

export interface LinkClickRow {
  id: string
  link_id: string
  clicked_at: string
  referrer: string | null
  user_agent: string | null
  country: string | null
}

export interface CreateLinkPayload {
  slug: string
  destination: string
  title?: string
}

export interface SlugCheckResult {
  available: boolean
  reason?: "invalid_format" | "reserved"
}
