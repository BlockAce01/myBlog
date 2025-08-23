import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Eye, Heart } from "lucide-react"
import type { BlogPost } from "@/lib/types"

interface BlogPostPreviewProps {
  post: BlogPost
}

export function BlogPostPreview({ post }: BlogPostPreviewProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="flex-1 p-6">
        <div className="space-y-3">
          {/* Title */}
          <Link href={`/post/${post.id}`}>
            <h2 className="text-xl font-serif font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h2>
          </Link>

          {/* Publication Date */}
          <p className="text-sm text-muted-foreground">{post.publicationDate}</p>

          {/* Summary */}
          <p className="text-muted-foreground leading-relaxed line-clamp-3">{post.summary}</p>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{post.likeCount}</span>
          </div>
        </div>

        {/* Read More Link */}
        <Link
          href={`/post/${post.id}`}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Read More →
        </Link>
      </CardFooter>
    </Card>
  )
}
