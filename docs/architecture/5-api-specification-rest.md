# 5. API Specification (REST)

*   **Authentication:** Endpoints marked as **(Protected)** require a valid JWT in an `Authorization: Bearer <token>` header.

#### Blog Service (`/posts`)
*   `GET /posts/upload-url`: Get a secure, pre-signed URL for uploading a cover photo to S3. **(Protected)**
    *   Query Params: `?fileName=...&fileType=...`
    *   Returns: `{ uploadUrl: string, key: string }`
*   `GET /posts`: Get a list of all posts.
    *   Query Params: `?tags=react,devops` for filtering.
*   `GET /posts/:id`: Get a single post by its ID.
*   `POST /posts`: Create a new post. Now expects `coverPhotoUrl` in the body. **(Protected)**
*   `PUT /posts/:id`: Update a post. Now expects `coverPhotoUrl` in the body. **(Protected)**
*   `DELETE /posts/:id`: Delete a post. **(Protected)**
*   `GET /posts/:id/comments`: Get all comments for a post.
*   `POST /posts/:id/comments`: Add a new comment to a post.

#### Analytics Service (`/analytics`)
*   `POST /analytics/views/:id`: Increment the view count for a post.
*   `POST /analytics/likes/:id`: Increment the like count for a post.

#### Auth Service (`/auth`)
*   `POST /auth/login`: Authenticate a user and receive a JWT.
