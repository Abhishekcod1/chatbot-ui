import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: links, error } = await supabase
    .from("links")
    .select(
      "id, user_id, slug, destination, title, click_count, created_at, updated_at"
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ links })
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as {
    slug: string
    destination: string
    title?: string
  }

  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(body.slug)) {
    return NextResponse.json(
      {
        error:
          "Slug may only contain letters, numbers, hyphens, and underscores (1–100 chars)"
      },
      { status: 400 }
    )
  }

  try {
    new URL(body.destination)
  } catch {
    return NextResponse.json(
      { error: "Invalid destination URL" },
      { status: 400 }
    )
  }

  const { data: link, error } = await supabase
    .from("links")
    .insert({
      user_id: session.user.id,
      slug: body.slug,
      destination: body.destination,
      title: body.title ?? null
    })
    .select(
      "id, user_id, slug, destination, title, click_count, created_at, updated_at"
    )
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ link }, { status: 201 })
}
