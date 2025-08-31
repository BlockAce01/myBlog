import type { BlogPost, Comment } from "@/lib/types";

const API_URL = typeof window === 'undefined'
  ? "http://backend:3003/api" // Server-side (inside Docker)
  : "http://localhost:3003/api"; // Client-side (in browser)
  
export async function getPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/posts`);
    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPost(id: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/posts/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch post with id ${id}`);
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const res = await fetch(`${API_URL}/posts/${postId}/comments`);
    if (!res.ok) {
      throw new Error(`Failed to fetch comments for post with id ${postId}`);
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createComment(
  postId: string,
  comment: { authorName: string; commentText: string }
): Promise<Comment | null> {
  try {
    const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    });
    if (!res.ok) {
      throw new Error("Failed to create comment");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function likePost(postId: string): Promise<{ likeCount: number; isLiked: boolean } | null> {
  try {
    // Generate or retrieve user ID from localStorage
    let userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', userId);
      }
    }

    const res = await fetch(`${API_URL}/analytics/likes/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      throw new Error("Failed to like post");
    }

    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function incrementViewCount(postId: string): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/analytics/views/${postId}`, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error("Failed to increment view count");
    }
  } catch (error) {
    console.error(error);
  }
}
