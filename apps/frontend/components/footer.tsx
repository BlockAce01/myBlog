import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">© {currentYear} Your Name. All rights reserved.</p>

          {/* Admin Login Link */}
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  )
}
