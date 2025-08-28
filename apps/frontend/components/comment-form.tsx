"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CommentFormProps {
  postId: string
  onSubmit?: (name: string, comment: string) => void
}

export function CommentForm({ postId, onSubmit }: CommentFormProps) {
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) return

    setIsSubmitting(true)

    // TODO: In a real app, this would make an API call to save the comment
    if (onSubmit) {
      onSubmit(name, comment)
    }

    // Reset form
    setName("")
    setComment("")
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Comment</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting || !name.trim() || !comment.trim()}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  )
}
