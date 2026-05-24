import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { LinksList } from "@/components/links-list"
import type { LinkRow } from "@/types"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) redirect("/login")

  const { data: links } = await supabase
    .from("links")
    .select("id, user_id, slug, destination, title, click_count, created_at, updated_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Navbar email={session.user.email!} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Your Links</h1>
        <LinksList
          initialLinks={(links as LinkRow[]) ?? []}
          baseUrl={process.env.NEXT_PUBLIC_APP_URL ?? ""}
        />
      </main>
    </div>
  )
}
