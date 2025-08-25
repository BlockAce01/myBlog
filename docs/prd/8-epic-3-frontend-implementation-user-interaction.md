# 8. Epic 3: Frontend Implementation & User Interaction

**Epic Goal:** To build the public-facing React application that allows users to read and interact with the blog content. This epic will consume the APIs from the backend services, presenting the data in a clean, responsive, and professional user interface, including tag filtering and engagement features.

### **Story 3.1: Frontend Application Scaffolding**
**As a** developer,
**I want** to set up the initial structure for the React frontend application within the monorepo,
**so that** I have a modern and efficient development environment for building the UI.

**Acceptance Criteria:**
1.  The existing AI-generated Next.js application in `apps/frontend` is configured to run within the monorepo.
2.  The application runs on a local development server.

### **Story 3.2: Homepage - Blog Post List & Tag Filtering**
**As a** user,
**I want** to see a list of all available blog posts on the homepage and filter them by tags,
**so that** I can easily browse and find relevant articles.

**Acceptance Criteria:**
1.  The homepage fetches and displays a list of all blog posts by calling the `GET /posts` endpoint.
2.  Each post preview displays its `coverPhotoUrl`, `title`, `summary`, `publicationDate`, `viewCount`, and `likeCount`.
3.  A tag filter bar is displayed, populated with all unique tags from the posts.
4.  Selecting a tag filters the list to show only posts with that tag, by calling `GET /posts?tags=...`.

### **Story 3.3: Blog Post Detail Page**
**As a** user,
**I want** to view the full content of a single blog post on a dedicated page,
**so that** I can read the article without distractions.

**Acceptance Criteria:**
1.  A dynamic route is created (e.g., `/post/:id`) that displays a single blog post.
2.  When the page loads, it fetches the post's data from the `GET /posts/:id` endpoint.
3.  Upon loading, the page calls `POST /analytics/views/:id` to increment the view count.
4.  The page displays the post's `coverPhotoUrl`, `title`, `content` (rendered from Markdown), and associated `tags`.

### **Story 3.4: Implement Engagement UI (Likes & Comments)**
**As a** user,
**I want** to like posts and see/leave comments,
**so that** I can engage with the content.

**Acceptance Criteria:**
1.  A "Like" button with the current `likeCount` is displayed on the post detail page.
2.  Clicking "Like" calls `POST /analytics/likes/:id` and updates the count.
3.  The browser's `localStorage` is used to prevent repeat likes from the same browser.
4.  A comments section displays all comments for the post and a form to submit a new one.

### **Story 3.5: "About Me" Page**
**As a** recruiter,
**I want** to easily find information about the blog's author,
**so that** I can quickly understand their skills.

**Acceptance Criteria:**
1.  A static "About" page is created at the `/about` route.
2.  The page displays the user's bio, skills, and contact info.

### **Story 3.6: Automate Frontend Deployment**
**As a** DevOps engineer,
**I want** to integrate the frontend application into the CI/CD pipeline,
**so that** the entire full-stack application is deployed automatically.

**Acceptance Criteria:**
1.  A `Dockerfile` is created for the Next.js frontend application.
2.  The GitHub Actions workflow is updated to build the React application and its Docker image.
3.  The Ansible playbook is updated to deploy the frontend container.
4.  After the workflow runs, the live React application is publicly accessible and functional.
