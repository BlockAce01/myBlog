# 4. Data Models

### BlogPost
*   **Purpose:** Represents a single article.
*   **TypeScript Interface:**
    ```typescript
    interface BlogPost {
      _id: string;
      title: string;
      summary: string;
      content: string; // Markdown
      coverPhotoUrl: string; // URL to the image in S3
      tags: string[];
      publicationDate: Date;
      viewCount: number;
      likeCount: number;
    }
    ```

### Comment
*   **Purpose:** Represents a single user comment on a post.
*   **TypeScript Interface:**
    ```typescript
    interface Comment {
      _id: string;
      postId: string; // Reference to BlogPost
      authorName: string;
      commentText: string;
      createdAt: Date;
    }
    ```

### User (for Admin)
*   **Purpose:** Represents an administrative user.
*   **TypeScript Interface:**
    ```typescript
    interface User {
      _id: string;
      username: string;
      passwordHash: string;
    }
