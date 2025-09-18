import type { Comment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

// Utility function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

interface CommentCardProps {
  comment: Comment
  onReply?: (commentId: string) => void
  showReplies?: boolean
  onToggleReplies?: (commentId: string) => void
}

export function CommentCard({
  comment,
  onReply,
  showReplies = false,
  onToggleReplies
}: CommentCardProps) {
  const [replies, setReplies] = useState<Comment[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  const handleToggleReplies = async () => {
    if (!showReplies && comment.replyCount && comment.replyCount > 0) {
      setLoadingReplies(true)
      try {
        // Fetch replies when expanding - call backend API directly
        const response = await fetch(`http://localhost:3003/api/posts/${comment.postId}/comments/${comment.id}/replies`)
        if (response.ok) {
          const replyData = await response.json()
          setReplies(replyData)
        }
      } catch (error) {
        console.error('Error fetching replies:', error)
      } finally {
        setLoadingReplies(false)
      }
    }
    onToggleReplies?.(comment.id)
  }

  const indentClass = comment.depth > 0 ? `ml-${Math.min(comment.depth * 4, 12)}` : ''

  return (
    <div className={`border-b border-border pb-4 last:border-b-0 ${indentClass}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {comment.userId.profilePicture ? (
              <>
                <img
                  src={`/api/avatar/${encodeURIComponent(comment.userId.profilePicture)}`}
                  alt={comment.userId.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to initial avatar if cached image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center" style={{ display: 'none' }}>
                  <span className="text-sm font-semibold text-primary">
                    {comment.userId.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {comment.userId.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <p className="font-semibold text-foreground">{comment.userId.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {comment.replyCount && comment.replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleReplies}
                className="text-xs"
              >
                {showReplies ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </Button>
            )}
            {/* Only show reply button for top-level comments (depth 0 or undefined) */}
            {(comment.depth === undefined || comment.depth === 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply?.(comment.id)}
                className="text-xs"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">{comment.commentText}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(new Date(comment.createdAt))}
        </p>
      </div>

      {/* Replies Section */}
      {showReplies && (
        <div className="mt-4 ml-6 pl-4 border-l-2 border-muted relative">
          {/* Connecting line indicator */}
          <div className="absolute -left-2 top-0 w-4 h-px bg-muted"></div>

          {loadingReplies ? (
            <div className="text-sm text-muted-foreground py-2">Loading replies...</div>
          ) : (
            <div className="space-y-3">
              {replies.map((reply, index) => (
                <div key={`reply-${reply.id}`} className="relative">
                  {/* Reply connector dot */}
                  <div className="absolute -left-6 top-3 w-2 h-2 bg-muted rounded-full"></div>

                  <CommentCard
                    comment={{
                      ...reply,
                      depth: (comment.depth || 0) + 1
                    }}
                    onReply={onReply}
                    showReplies={false}
                    onToggleReplies={onToggleReplies}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
