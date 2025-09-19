"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Layout } from "@/components/layout"
import { LikeButton } from "@/components/like-button"
import { CommentCard } from "@/components/comment-card"
import { CommentForm } from "@/components/comment-form"

import HTMLRenderer from "@/components/HTMLRenderer"
import { getPost, getComments } from "@/lib/data"
import type { BlogPost, Comment } from "@/lib/types"

interface BlogPostPageProps {
  params: {
    id: string
  }
}

function renderContent(content: string) {
  // All content is now from TinyMCE, so render as HTML using HTMLRenderer
  return <HTMLRenderer html={content} />;
}

export default function ClientBlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postData, commentsData] = await Promise.all([
          getPost(params.id),
          getComments(params.id)
        ]);

        if (!postData) {
          notFound();
          return;
        }



        setPost(postData);
        setComments(commentsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    notFound();
    return null;
  }



  return (
    <Layout>
      <article className="max-w-3xl mx-auto">
        {/* Post Header */}
        <header className="mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">{post.title}</h1>
          <p className="text-muted-foreground">{post.publicationDate}</p>
        </header>

        {/* Post Content */}
        <div className="mb-8">
          {renderContent(post.content)}
        </div>

        {/* Like Button */}
        <div className="mb-12 flex justify-start">
          <LikeButton initialCount={post.likeCount} postId={post.id} />
        </div>

        {/* Comments Section */}
        <section className="space-y-8">
          <h2 className="text-2xl font-serif font-semibold text-foreground">Comments</h2>

          {/* Existing Comments */}
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
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
              postId={post.id}
              onCommentAdded={() => {
                // Refresh comments after adding a new one
                getComments(params.id).then(setComments);
              }}
            />
          </div>
        </section>
      </article>
    </Layout>
  )
}
