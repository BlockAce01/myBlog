export interface Post {
  id: string
  title: string
  publicationDate: string
  summary: string
  content: string // This will be Markdown content
  viewCount: number
  likeCount: number
}

export interface Comment {
  id: string
  postId: string
  authorName: string
  commentText: string
}
