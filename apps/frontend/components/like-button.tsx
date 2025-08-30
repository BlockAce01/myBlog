"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toast } from "sonner"

interface LikeButtonProps {
  initialCount: number
  postId: string
}

export function LikeButton({ initialCount, postId }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isLiked, setIsLiked] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Generate or retrieve user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('userId')
      if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('userId', id)
      }
      setUserId(id)
    }
  }, [])

  // Check if user has already liked this post
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!userId || !postId) return
      
      try {
        const response = await fetch(`/api/posts/${postId}`)
        if (response.ok) {
          const post = await response.json()
          const userHasLiked = post.likedBy?.includes(userId)
          setIsLiked(userHasLiked)
        }
      } catch (error) {
        console.error('Error checking like status:', error)
      }
    }

    checkLikeStatus()
  }, [userId, postId])

  const handleLike = async () => {
    if (!userId || isLoading) return

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.likeCount)
        setIsLiked(data.isLiked)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to like post')
      }
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Failed to like post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 ${
        isLiked ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800" : ""
      }`}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{likeCount}</span>
    </Button>
  )
}
