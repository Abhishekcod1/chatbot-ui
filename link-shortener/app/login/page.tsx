import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LoginPage({
  searchParams
}: {
  searchParams: { message?: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session) redirect("/dashboard")

  const signIn = async (formData: FormData) => {
    "use server"
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    redirect("/dashboard")
  }

  const signUp = async (formData: FormData) => {
    "use server"
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    redirect(
      `/login?message=${encodeURIComponent("Check your email to confirm your account.")}`
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to manage your short links
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              minLength={6}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {searchParams.message && (
            <p className="rounded-md bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
              {searchParams.message}
            </p>
          )}

          <div className="flex gap-2">
            <button
              formAction={signIn}
              className="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Sign In
            </button>
            <button
              formAction={signUp}
              className="flex-1 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Sign Up
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="underline underline-offset-4 hover:text-primary">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
