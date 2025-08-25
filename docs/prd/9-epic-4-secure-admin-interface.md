# 9. Epic 4: Secure Admin Interface

**Epic Goal:** To develop a secure, private interface for the blog owner to create, edit, and delete posts. This involves creating a new **Auth Service**, protecting the content management APIs, and building the necessary frontend views for administration.

### **Story 4.1: Auth Service Scaffolding**
**As a** developer,
**I want** to set up the initial structure for the authentication microservice,
**so that** I have a dedicated service for handling all user authentication and authorization logic.

**Acceptance Criteria:**
1.  A new Express.js application for the "Auth Service" is created.
2.  The service is configured to run on a unique port.
3.  A basic health-check endpoint (e.g., `/health`) is created.

### **Story 4.2: Admin User Model & Registration**
**As a** developer,
**I want** a way to create an admin user in the database,
**so that** there is an identity that can be authenticated to manage content.

**Acceptance Criteria:**
1.  The Auth Service connects to the MongoDB Atlas database.
2.  A Mongoose schema is defined for `Users` which includes `username` and `password` (hashed).
3.  A secure method for creating the first admin user is implemented.
4.  Passwords are securely hashed using `bcrypt`.

### **Story 4.3: Login Endpoint & JWT Generation**
**As a** developer,
**I want** a login endpoint that validates credentials and provides an authentication token,
**so that** the admin user can securely sign in.

**Acceptance Criteria:**
1.  A `POST /login` endpoint is created on the Auth Service.
2.  The endpoint accepts a `username` and `password`.
3.  It validates the credentials.
4.  On success, it returns a JSON Web Token (JWT).

### **Story 4.4: Protected API Endpoints**
**As a** developer,
**I want** to secure the content management endpoints on the Blog Service,
**so that** only authenticated users can manage posts.

**Acceptance Criteria:**
1.  The Blog Service is updated to validate JWTs.
2.  `POST /posts`, `PUT /posts/:id`, and `DELETE /posts/:id` endpoints now require a valid JWT.
3.  Requests to these endpoints without a valid JWT are rejected.

### **Story 4.5: Admin Frontend Views**
**As an** admin,
**I want** a user interface to log in and manage my blog posts,
**so that** I can easily add new content.

**Acceptance Criteria:**
1.  A new `/admin/login` route is created in the React app.
2.  After login, the JWT is securely stored.
3.  A protected `/admin/dashboard` route is created for logged-in users.
4.  The dashboard provides an interface to create, edit, and delete posts.

### **Story 4.6: Automate Auth Service Deployment**
**As a** DevOps engineer,
**I want** to integrate the new Auth Service into the CI/CD pipeline,
**so that** the entire authentication system is deployed automatically.

**Acceptance Criteria:**
1.  A `Dockerfile` is created for the Auth Service.
2.  The GitHub Actions workflow is updated to build and deploy the Auth Service.
3.  The Ansible playbook is updated to run the Auth Service container.
