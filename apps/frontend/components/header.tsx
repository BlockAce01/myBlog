import Link from "next/link"
import { ThemeToggle } from "./ThemeToggle"

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold font-sans text-foreground hover:text-accent transition-colors">
            Yugan's Tech Blog
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="text-foreground hover:text-accent transition-colors font-medium">
              About
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
