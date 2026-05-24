import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const RESERVED = new Set([
  "login",
  "dashboard",
  "api",
  "auth",
  "_next",
  "favicon.ico",
  "sitemap.xml",
  "robots.txt"
])

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  const { slug } = params

  if (RESERVED.has(slug)) {
    return NextResponse.next()
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: link, error } = await supabaseAdmin
    .from("links")
    .select("id, destination")
    .eq("slug", slug)
    .single()

  if (error || !link) {
    return NextResponse.redirect(new URL("/?error=not_found", request.url))
  }

  // Fire-and-forget — don't block the redirect
  supabaseAdmin
    .rpc("increment_link_click", { p_link_id: link.id })
    .then(({ error: rpcError }) => {
      if (rpcError) console.error("click tracking failed:", rpcError.message)
    })

  return NextResponse.redirect(link.destination, { status: 302 })
}
