"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import type { BlogPost, Comment } from "@/lib/types";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import HTMLRenderer from "@/components/HTMLRenderer";

import {
  getPost,
  getComments,
  createComment,
  likePost,
  incrementViewCount,
} from "@/lib/data";
import { useParams } from "next/navigation";

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const hasViewed = useRef(false);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState({ name: "", comment: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && !hasViewed.current) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Normalize ID to lowercase for consistent matching
          const normalizedId = id.toLowerCase();
          
          // Check session storage BEFORE fetching data
          const viewedPosts = JSON.parse(sessionStorage.getItem('blogPostViews') || '{}');
          
          if (!viewedPosts[normalizedId]) {
            // Immediately mark as viewed to prevent concurrent increments
            viewedPosts[normalizedId] = true;
            sessionStorage.setItem('blogPostViews', JSON.stringify(viewedPosts));
            
            // Then increment the view count
            await incrementViewCount(normalizedId);
          }

          const postData = await getPost(normalizedId);

          setPost(postData);

          // Use the actual post ID (not slug) to fetch comments
          if (postData) {
            const commentsData = await getComments(postData.id);
            setComments(commentsData);
          }
          
          if (postData) {
            setLikeCount(postData.likeCount);
            // Check if user has already liked this post
            const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
            if (userId && postData.likedBy?.includes(userId)) {
              setLiked(true);
            }
          }
        } catch (error) {
          console.error("Error loading post:", error);
        } finally {
          setLoading(false);
          hasViewed.current = true;
        }
      };
      fetchData();
    }
  }, [id]);

  const handleLike = async () => {
    if (post) {
      try {
        const result = await likePost(post.id);
        if (result) {
          setLiked(result.isLiked);
          setLikeCount(result.likeCount);
        }
      } catch (error) {
        console.error("Failed to like post:", error);
        // Show user-friendly error message
        alert(`Unable to like post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (post && newComment.name && newComment.comment) {
      const comment = await createComment(post.id, {
        authorName: newComment.name,
        commentText: newComment.comment,
      });
      if (comment) {
        setComments([...comments, comment]);
        setNewComment({ name: "", comment: "" });
      }
    }
  };

  if (loading) {
    return <Layout><div className="text-center">Loading...</div></Layout>;
  }

  if (!post) {
    return <Layout><div className="text-center">Post not found</div></Layout>;
  }
  
  const formattedDate = new Date(post.publicationDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout>
      <article className="max-w-3xl mx-auto">
        {/* Cover Photo */}
        {post.coverPhotoUrl && post.coverPhotoUrl !== "https://via.placeholder.com/800x400?text/No+Image" && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.coverPhotoUrl}
              alt={post.title}
              className="w-full h-auto object-contain"
            />
          </div>
        )}

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
        <div className="mb-12">
          <HTMLRenderer html={post.content} />
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
  );
}
