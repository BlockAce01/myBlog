export interface BlogPost {
  id: string
  title: string
  summary: string
  content: string // This will contain the HTML content
  publicationDate: string
  viewCount: number
  likeCount: number
  tags: string[] // Add a tags property to the BlogPost interface
  likedBy?: string[] // Track user IDs who liked this post
  slug?: string // URL-friendly identifier
  status?: 'draft' | 'published' | 'hidden' | 'scheduled' // Publication status
  scheduledPublishDate?: string // For scheduled posts
  coverPhotoUrl?: string // Cover image URL
  lastSavedAt?: string // Last save timestamp
  version?: number // Version for optimistic locking
}

export interface Comment {
  id: string
  postId: string
  authorName: string
  commentText: string
  createdAt: string
}
