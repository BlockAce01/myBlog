# 6. Database Schema (MongoDB Collections)

*   **`users`:** Stores admin user documents, matching the `User` interface.
*   **`blog_posts`:** Stores post documents, now including the `coverPhotoUrl` field.
*   **`comments`:** Stores comment documents, matching the `Comment` interface. An index should be created on the `postId` field for efficient lookups.
