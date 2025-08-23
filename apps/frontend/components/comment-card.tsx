import type { Comment } from "@/lib/types"

interface CommentCardProps {
  comment: Comment
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="border-b border-border pb-4 last:border-b-0">
      <div className="space-y-2">
        <p className="font-semibold text-foreground">{comment.authorName}</p>
        <p className="text-muted-foreground leading-relaxed">{comment.commentText}</p>
      </div>
    </div>
  )
}
