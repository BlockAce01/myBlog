# 7. Epic 2: Core Backend Services (Blog, Analytics, Engagement, Tags)

**Epic Goal:** To develop and deploy the backend microservices required for the blog's core functionality. This includes a **Blog Service** for content management, an **Analytics Service** for tracking view counts, and logic for likes, comments, and tags. The outcome will be a set of live, independently deployable API endpoints that the frontend can consume.

### **Story 2.1: Blog Service Scaffolding**
**As a** developer,
**I want** to set up the initial structure for the blog microservice,
**so that** I have a clean foundation for adding the content management features.

**Acceptance Criteria:**
1.  A new Express.js application for the "Blog Service" is created in a new folder under `apps/backend/src/services`.
2.  The service is configured to run on a different port than other services.
3.  A basic health-check endpoint (e.g., `/health`) is created that returns a `200 OK` status.

### **Story 2.2: Blog Post Data Model & Database Connection**
**As a** developer,
**I want** to define the data model for a blog post and connect the Blog Service to the database,
**so that** blog content can be stored and retrieved persistently.

**Acceptance Criteria:**
1.  The Blog Service successfully connects to the MongoDB Atlas database.
2.  A Mongoose schema is defined for `BlogPosts` which includes fields for `title` (String), `content` (String), `summary` (String), `coverPhotoUrl` (String), `tags` (Array of Strings), `publicationDate` (Date), `viewCount` (Number), and `likeCount` (Number).
3.  Database connection strings and secrets are managed securely and are not hardcoded in the repository.

### **Story 2.3: Implement Blog Post CRUD Endpoints**
**As a** developer,
**I want** to create the API endpoints for creating, reading, updating, and deleting blog posts,
**so that** the content can be managed programmatically.

**Acceptance Criteria:**
1.  A `POST /posts` endpoint is created to add a new blog post to the database.
2.  A `GET /posts` endpoint is created to retrieve a list of all blog posts, with optional filtering by tags (`?tags=...`).
3.  A `GET /posts/:id` endpoint is created to retrieve a single blog post by its unique ID.
4.  A `PUT /posts/:id` endpoint is created to update an existing blog post.
5.  A `DELETE /posts/:id` endpoint is created to remove a blog post.
6.  All endpoints are tested and function correctly.

### **Story 2.4: Analytics Service & View Count Logic**
**As a** developer,
**I want** to create a separate Analytics Service to handle view counts,
**so that** the view tracking logic is decoupled from the main blog service.

**Acceptance Criteria:**
1.  A new Express.js application for the "Analytics Service" is created.
2.  The Analytics Service has a `POST /views/:postId` endpoint that increments the `viewCount` for a given post ID.
3.  The Analytics Service has a `GET /views/:postId` endpoint that retrieves the current `viewCount`.

### **Story 2.5: Implement Engagement Features (Likes & Comments)**
**As a** developer,
**I want** to implement the backend logic for likes and comments,
**so that** users can engage with the content.

**Acceptance Criteria:**
1. A `Comments` schema is created.
2. The Analytics Service has a `POST /likes/:postId` endpoint that increments the `likeCount`.
3. The Blog Service has `POST` and `GET` endpoints for `/posts/:postId/comments`.

### **Story 2.6: Automate Microservice Deployments**
**As a** DevOps engineer,
**I want** to update the CI/CD pipeline to automatically deploy all the new microservices,
**so that** any changes are pushed live automatically.

**Acceptance Criteria:**
1.  `Dockerfile`s are created for all backend services.
2.  The GitHub Actions workflow is updated to build and push Docker images for all new services.
3.  The Ansible playbook is updated to pull and run the containers for all new services.
4.  After the workflow runs, all API endpoints are accessible.
