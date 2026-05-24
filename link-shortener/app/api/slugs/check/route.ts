import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const RESERVED_SLUGS = new Set([
  "login",
  "dashboard",
  "api",
  "auth",
  "_next",
  "favicon.ico",
  "sitemap.xml",
  "robots.txt"
])

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? ""

  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(slug)) {
    return NextResponse.json({ available: false, reason: "invalid_format" })
  }

  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return NextResponse.json({ available: false, reason: "reserved" })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from("links")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle()

  return NextResponse.json({ available: data === null })
}
