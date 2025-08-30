# Epic 2: Secure Admin Interface (Local)

**Epic Goal:** To add the secure administrative features for content management, all running within the local Docker Compose environment.

**Stories:**

*   **Story 2.1: Auth Service & Admin User Model:** Create the Auth Service skeleton and the Users schema for the admin user.
*   **Story 2.2: Implement Login & JWT Generation:** Build the /login endpoint on the Auth Service to authenticate the admin and generate a JWT.
*   **Story 2.3: Protect Backend Management APIs:** Secure the POST, PUT, and DELETE endpoints on the Blog Service, requiring a valid JWT for access.
*   **Story 2.4: Implement Admin Frontend UI:** Build the protected frontend pages (/admin/login and /admin/dashboard) for creating, editing, and deleting blog posts.
