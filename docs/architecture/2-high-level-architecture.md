# 2. High-Level Architecture

### Technical Summary
This project will be a serverless, containerized microservices application deployed on AWS. The frontend is a responsive Next.js web application served statically via **Amazon S3** and distributed by **CloudFront (CDN)** for maximum performance. The backend consists of several independent Node.js microservices (for Blog, Auth, and Analytics) deployed as AWS Lambda functions fronted by an API Gateway. **Cover photos will be uploaded directly to a dedicated S3 bucket.** This architecture is managed via a complete CI/CD pipeline, with infrastructure defined as code.

### Platform and Infrastructure Choice
*   **Platform:** Amazon Web Services (AWS)
*   **Key Services:**
    *   AWS Lambda, Amazon API Gateway
    *   **Amazon S3:** One bucket for the static frontend site, and a **separate bucket for user-uploaded images (cover photos)**.
    *   Amazon CloudFront, Amazon ECR
    *   MongoDB Atlas
*   **Rationale:** This serverless stack is highly scalable, cost-effective, and demonstrates expertise in modern cloud-native development patterns.

### Repository Structure
*   **Structure:** Monorepo
*   **Tool:** pnpm Workspaces
*   **Rationale:** A monorepo is ideal for managing the frontend app, multiple backend services, and shared packages.

### High-Level Architecture Diagram
```mermaid
graph TD
    subgraph "User's Browser"
        A[React/Next.js App]
    end

    subgraph "AWS Cloud"
        B[CloudFront CDN] --> C[S3 Bucket: Static Site];
        A -- 1. Request Upload URL --> D[API Gateway];
        D -- 2. Returns Pre-signed URL --> A;
        A -- 3. Uploads Image Directly --> S3_Images[S3 Bucket: Cover Photos];
        A -- 4. API Call with Image URL --> D;
        D -- "/posts/*" --> E[Blog Service Lambda];
        D -- "/auth/*" --> F[Auth Service Lambda];
        D -- "/analytics/*" --> G[Analytics Service Lambda];
    end

    subgraph "External Services"
        H[MongoDB Atlas]
    end

    E --> H;
    F --> H;
    G --> H;
