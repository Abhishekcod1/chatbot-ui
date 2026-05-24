import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-lg space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">Link Shortener</h1>
          <p className="text-xl text-muted-foreground">
            Create custom short links with real-time analytics. Your slug, your
            domain.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-primary">✦</div>
            <p className="mt-1 text-sm text-muted-foreground">Custom slugs</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-primary">📊</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Click analytics
            </p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-primary">🌐</div>
            <p className="mt-1 text-sm text-muted-foreground">Custom domain</p>
          </div>
        </div>
      </div>
    </div>
  )
}
