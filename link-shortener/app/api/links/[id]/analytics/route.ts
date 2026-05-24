import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify ownership before returning click data
  const { data: link } = await supabase
    .from("links")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const since = new Date()
  since.setDate(since.getDate() - 90)

  const { data: clicks, error } = await supabase
    .from("link_clicks")
    .select("clicked_at")
    .eq("link_id", params.id)
    .gte("clicked_at", since.toISOString())
    .order("clicked_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ clicks: clicks ?? [] })
}
