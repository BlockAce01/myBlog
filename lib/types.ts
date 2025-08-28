export interface BlogPost {
  id: string
  title: string
  summary: string
  content: string // This will contain the Markdown content
  publicationDate: string
  viewCount: number
  likeCount: number
}

export interface Comment {
  id: string
  postId: string
  authorName: string
  commentText: string
  createdAt: string
}
