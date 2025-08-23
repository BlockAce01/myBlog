import Link from "next/link"
export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2024 John Doe's Tech Blog. All rights reserved.</p>
          <Link href="/admin" className="hover:text-accent transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
