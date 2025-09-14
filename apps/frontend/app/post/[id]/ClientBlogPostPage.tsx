"use client"

import { notFound } from "next/navigation"
import { Layout } from "@/components/layout"
import { LikeButton } from "@/components/like-button"
import { CommentCard } from "@/components/comment-card"
import { CommentForm } from "@/components/comment-form"
import { CodeBlock } from "@/components/code-block"
import { posts, comments } from "@/lib/data"

interface BlogPostPageProps {
  params: {
    id: string
  }
}

function renderContent(content: string) {
  // Split content by code blocks (```language\ncode\n```)
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // Check if this part is a code block
    const codeBlockMatch = part.match(/^```(\w+)?\n([\s\S]*?)```$/);
    if (codeBlockMatch) {
      const [, language = 'javascript', code] = codeBlockMatch;
      return (
        <CodeBlock
          key={index}
          code={code.trim()}
          language={language}
          className="my-4"
        />
      );
    }

    // Regular text - split by newlines and render paragraphs
    const paragraphs = part.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, pIndex) => (
      <p key={`${index}-${pIndex}`} className="mb-4">
        {paragraph.split('\n').map((line, lIndex) => (
          <span key={lIndex}>
            {line}
            {lIndex < paragraph.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  });
}

export default function ClientBlogPostPage({ params }: BlogPostPageProps) {
  const post = posts.find((p) => p.id === params.id)

  if (!post) {
    notFound()
  }

  // Filter comments for this specific post
  const postComments = comments.filter((comment) => comment.postId === post.id)

  return (
    <Layout>
      <article className="max-w-3xl mx-auto">
        {/* Post Header */}
        <header className="mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">{post.title}</h1>
          <p className="text-muted-foreground">{post.publicationDate}</p>
        </header>

        {/* Post Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
          <div className="font-serif leading-relaxed">
            {renderContent(post.content)}
          </div>
        </div>

        {/* Like Button */}
        <div className="mb-12 flex justify-start">
          <LikeButton initialCount={post.likeCount} postId={post.id} />
        </div>

        {/* Comments Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-serif font-semibold text-foreground">Comments</h2>

          {/* Existing Comments */}
          {postComments.length > 0 ? (
            <div className="space-y-6">
              {postComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          )}

          {/* Comment Form */}
          <div className="border-t border-border pt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Leave a Comment</h3>
            <CommentForm
              onSubmit={(name, comment) => {
                console.log("New comment:", { name, comment, postId: post.id })
                // In a real app, this would save the comment to a database
              }}
            />
          </div>
        </section>
      </article>
    </Layout>
  )
}
