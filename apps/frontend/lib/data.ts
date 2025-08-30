import type { BlogPost, Comment } from "@/lib/types";

const API_URL = "http://localhost:3003/api";

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

export async function likePost(postId: string): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/analytics/likes/${postId}`, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error("Failed to like post");
    }
  } catch (error) {
    console.error(error);
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
