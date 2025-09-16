import type { BlogPost, Comment } from "@/lib/types";

const API_URL = typeof window === 'undefined'
  ? "http://backend:3003/api" // Server-side (inside Docker)
  : "http://localhost:3003/api"; // Client-side (in browser)

// Mock data removed - using API only
export const posts: BlogPost[] = [];
export const comments: Comment[] = [];

// Authentication functions
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export async function login(credentials: LoginRequest): Promise<LoginResponse | null> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      throw new Error("Login failed");
    }
    return res.json();
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export async function register(userData: RegisterRequest): Promise<RegisterResponse | null> {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Registration failed");
    }
    return res.json();
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
  }
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  try {
    // Basic JWT validation - check if token exists and hasn't expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

// Blog post CRUD operations for admin
export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt: string;
  coverPhotoUrl: string;
  tags: string[];
  status: 'draft' | 'published' | 'hidden' | 'scheduled';
  scheduledPublishDate?: string;
}

export interface UpdateBlogPostRequest extends CreateBlogPostRequest {
  id: string;
  version?: number;
}

export async function createBlogPost(postData: CreateBlogPostRequest): Promise<BlogPost | null> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: postData.title,
        content: postData.content,
        summary: postData.excerpt, // Backend expects 'summary' not 'excerpt'
        coverPhotoUrl: postData.coverPhotoUrl || "https://via.placeholder.com/800x400?text=No+Image",
        tags: postData.tags,
        status: postData.status,
        scheduledPublishDate: postData.scheduledPublishDate || undefined,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to create blog post");
    }
    return res.json();
  } catch (error) {
    console.error("Create blog post error:", error);
    return null;
  }
}

export async function updateBlogPost(postData: UpdateBlogPostRequest): Promise<BlogPost | null> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/posts/${postData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: postData.title,
        content: postData.content,
        summary: postData.excerpt, // Map 'excerpt' to 'summary' for backend
        coverPhotoUrl: postData.coverPhotoUrl || "https://via.placeholder.com/800x400?text=No+Image",
        tags: postData.tags,
        status: postData.status,
        scheduledPublishDate: postData.scheduledPublishDate || undefined,
        version: postData.version || 0,
      }),
    });
    if (!res.ok) {
      const errorData = await res.text();
      console.error("Update blog post error response:", errorData);
      throw new Error(`Failed to update blog post: ${errorData}`);
    }
    return res.json();
  } catch (error) {
    console.error("Update blog post error:", error);
    return null;
  }
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_URL}/posts/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return res.ok;
  } catch (error) {
    console.error("Delete blog post error:", error);
    return false;
  }
}

export async function getPosts(tags?: string[], admin: boolean = false): Promise<BlogPost[]> {
  try {
    const tagQuery = tags && tags.length > 0 ? `tags=${tags.join(',')}` : '';
    const adminQuery = admin ? `admin=true` : '';
    const queryString = [tagQuery, adminQuery].filter(Boolean).join('&');
    const url = `${API_URL}/posts${queryString ? `?${queryString}` : ''}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPost(idOrSlug: string, admin: boolean = false): Promise<BlogPost | null> {
  try {
    const url = admin ? `${API_URL}/posts/${idOrSlug}?admin=true` : `${API_URL}/posts/${idOrSlug}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch post with id/slug ${idOrSlug}`);
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
      // Try to get detailed error message from response
      let errorMessage = "Failed to like post";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If we can't parse the error response, use the status text
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  } catch (error) {
    console.error("Like post error:", error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
}

export async function searchPosts(query: string, tags?: string[]): Promise<BlogPost[]> {
  try {
    const tagQuery = tags && tags.length > 0 ? `&tag=${tags.join(',')}` : '';
    const searchQuery = query ? `q=${encodeURIComponent(query)}` : '';
    const url = `${API_URL}/posts/search?${searchQuery}${tagQuery}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json();
      
      throw new Error(`Failed to search posts: ${errorData.message || res.statusText}`);
    }
    return res.json();
  } catch (error) {

    return [];
  }
}

export async function incrementViewCount(postId: string): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/analytics/views/${postId}`, {
      method: "POST",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to increment view count: ${res.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    throw error; // Re-throw so calling code can handle it
  }
}
