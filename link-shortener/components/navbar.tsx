"use client"

import { supabase } from "@/lib/supabase/browser-client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Navbar({ email }: { email: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-semibold">
          Link Shortener
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:block">
            {email}
          </span>
          <button
            onClick={handleSignOut}
            className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}
