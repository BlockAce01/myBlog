"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface LikeButtonProps {
  initialCount: number
}

export function LikeButton({ initialCount }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1)
      setIsLiked(false)
    } else {
      setLikeCount((prev) => prev + 1)
      setIsLiked(true)
    }
    // TODO: In a real app, this would make an API call to update the like count
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      className={`flex items-center gap-2 ${
        isLiked ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800" : ""
      }`}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{likeCount}</span>
    </Button>
  )
}
