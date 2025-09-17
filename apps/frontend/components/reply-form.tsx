'use client'

import type React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface ReplyFormProps {
  postId: string
  parentCommentId: string
  onReplyAdded?: () => void
  onCancel?: () => void
}

export function ReplyForm({ postId, parentCommentId, onReplyAdded, onCancel }: ReplyFormProps) {
  const { data: session } = useSession()
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !session) return

    setIsSubmitting(true)

    try {
      // Use the backend token from NextAuth session
      const token = session.backendToken

      if (!token) {
        console.error('No backend token available')
        return
      }

      const response = await fetch(`http://localhost:3003/api/posts/${postId}/comments/${parentCommentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ commentText: replyText }),
      })

      if (response.ok) {
        setReplyText("")
        onReplyAdded?.()
        onCancel?.()
      } else {
        console.error('Failed to submit reply')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <Label htmlFor="reply" className="text-sm font-medium">
          Write a reply
        </Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          id="reply"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          required
          className="resize-none"
        />
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !replyText.trim()}
          >
            {isSubmitting ? "Posting..." : "Post Reply"}
          </Button>
        </div>
      </form>
    </div>
  )
}
