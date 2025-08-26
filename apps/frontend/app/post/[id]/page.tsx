"use client"

import type React from "react"

import { useState } from "react"
import { Layout } from "@/components/layout"
import type { BlogPost, Comment } from "@/lib/types"
import { Eye, Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge" // Import Badge component
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter, type SyntaxHighlighterProps } from "react-syntax-highlighter"
import atomDark from "react-syntax-highlighter/dist/cjs/styles/prism/atom-dark"

// Mock data - in a real app, this would come from an API
const mockPost: BlogPost = {
  id: "1",
  title: "Getting Started with Next.js 14 and App Router",
  summary:
    "Explore the latest features in Next.js 14 and learn how to leverage the App Router for better performance and developer experience.",
  content: `# Getting Started with Next.js 14 and App Router

Next.js 14 introduces several exciting features that make building React applications even more powerful and efficient. In this comprehensive guide, we'll explore the App Router and its benefits.

## What's New in Next.js 14

The latest version of Next.js brings significant improvements:

- **Turbopack**: Faster local development with Rust-based bundling
- **Server Actions**: Simplified server-side mutations
- **Partial Prerendering**: Combine static and dynamic rendering

## App Router Benefits

The App Router provides several advantages over the Pages Router:

> The App Router is a new paradigm that allows you to use React's latest features like Server Components, Streaming, and Suspense.

### Key Features

1. **Nested Layouts**: Create shared UI that persists across routes
2. **Loading UI**: Show instant loading states for route segments
3. **Error Handling**: Graceful error boundaries for route segments

## Code Example

Here's how to create a simple page with the App Router:

\`\`\`tsx
// app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  )
}
\`\`\`

## Server Components vs Client Components

Understanding when to use Server Components versus Client Components is crucial:

- **Server Components**: Default, run on the server, great for data fetching
- **Client Components**: Use \`'use client'\` directive, run in the browser, needed for interactivity

## Conclusion

Next.js 14 with the App Router represents a significant step forward in React development. The combination of Server Components, improved performance, and better developer experience makes it an excellent choice for modern web applications.`,
  publicationDate: "2024-01-15",
  viewCount: 1250,
  likeCount: 89,
  tags: ["Next.js", "App Router", "React", "Web Development"], // Add tags to mockPost
}

const mockComments: Comment[] = [
  {
    id: "1",
    postId: "1",
    authorName: "Sarah Chen",
    commentText: "Great explanation of the App Router! The code examples really helped me understand the concepts.",
    createdAt: "2024-01-16T10:30:00Z",
  },
  {
    id: "2",
    postId: "1",
    authorName: "Mike Johnson",
    commentText: "I was struggling with Server Components vs Client Components. This cleared it up perfectly.",
    createdAt: "2024-01-16T14:45:00Z",
  },
]

export default function PostPage({ params }: { params: { id: string } }) {
  const [post] = useState<BlogPost>(mockPost)
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [newComment, setNewComment] = useState({ name: "", comment: "" })

  const formattedDate = new Date(post.publicationDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.name && newComment.comment) {
      const comment: Comment = {
        id: Date.now().toString(),
        postId: post.id,
        authorName: newComment.name,
        commentText: newComment.comment,
        createdAt: new Date().toISOString(),
      }
      setComments([...comments, comment])
      setNewComment({ name: "", comment: "" })
    }
  }

  return (
    <Layout>
      <article className="max-w-3xl mx-auto">
        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-sans text-foreground mb-4">{post.title}</h1>
          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
            <span>{formattedDate}</span>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount}</span>
            </div>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const { ref, ...restProps } = props;
                const match = /language-(\w+)/.exec(className || "")
                return match ? (
                  <SyntaxHighlighter
                    style={atomDark as any}
                    language={match[1]}
                    PreTag="div"
                    className={className}
                    {...restProps}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...restProps}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Engagement Section */}
        <div className="border-t border-border pt-8 mb-12">
          <div className="flex items-center justify-center">
            <Button
              variant={liked ? "default" : "outline"}
              size="lg"
              onClick={handleLike}
              className="flex items-center space-x-2"
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <section className="border-t border-border pt-8">
          <h2 className="text-2xl font-bold font-sans text-foreground mb-6 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            Comments ({comments.length})
          </h2>

          {/* Existing Comments */}
          <div className="space-y-6 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{comment.authorName}</h4>
                  <span className="text-sm text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-foreground/90 font-serif">{comment.commentText}</p>
              </div>
            ))}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Leave a Comment</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  value={newComment.name}
                  onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
                  Comment
                </label>
                <Textarea
                  id="comment"
                  value={newComment.comment}
                  onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Post Comment
              </Button>
            </div>
          </form>
        </section>
      </article>
    </Layout>
  )
}
