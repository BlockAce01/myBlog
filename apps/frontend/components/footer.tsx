import Link from "next/link"
export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <p>&copy; 2025 Yugan's Tech Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
