declare module "next-auth" {
  interface Session {
    accessToken?: string;
    backendToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: "admin" | "user";
    };
  }

  interface JWT {
    accessToken?: string;
    backendToken?: string;
    role: "admin" | "user";
  }
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string; // This will contain the HTML content
  publicationDate: string;
  viewCount: number;
  likeCount: number;
  tags: string[]; // Add a tags property to the BlogPost interface
  likedBy?: string[]; // Track user IDs who liked this post
  slug?: string; // URL-friendly identifier
  status?: "draft" | "published" | "hidden" | "scheduled"; // Publication status
  scheduledPublishDate?: string; // For scheduled posts
  coverPhotoUrl?: string; // Cover image URL
  lastSavedAt?: string; // Last save timestamp
  version?: number; // Version for optimistic locking
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: "admin" | "user";
}

export interface Comment {
  id: string;
  postId: string;
  userId: User;
  commentText: string;
  parentId?: string | null;
  depth: number;
  replies?: Comment[];
  replyCount?: number;
  createdAt: string;
}
