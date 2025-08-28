import Link from "next/link"
import type { BlogPost } from "@/lib/types"
import { Eye, Heart } from "lucide-react"

interface PostCardProps {
  post: BlogPost
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.publicationDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <article className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <Link href={`/post/${post.id}`} className="group">
        <h2 className="text-2xl font-bold font-sans text-foreground group-hover:text-accent transition-colors mb-3">
          {post.title}
        </h2>
      </Link>

      <p className="text-muted-foreground text-sm mb-3">{formattedDate}</p>

      <p className="text-foreground/90 font-serif leading-relaxed mb-4">{post.summary}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{post.viewCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{post.likeCount}</span>
          </div>
        </div>

        <Link
          href={`/post/${post.id}`}
          className="text-accent hover:text-accent/80 font-medium text-sm transition-colors"
        >
          Read More →
        </Link>
      </div>
    </article>
  )
}
