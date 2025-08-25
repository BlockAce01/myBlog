# 4. Technical Assumptions

### Repository Structure: Monorepo
The project will be managed within a single monorepo.

*   **Rationale:** A monorepo is the industry-standard approach for managing a microservices project with shared dependencies (like common types or utilities). It simplifies the CI/CD pipeline, allows for atomic commits across the frontend and multiple backend services, and makes it easier to maintain consistency. This choice effectively demonstrates an understanding of modern project management at scale.

### Service Architecture: Microservices
The backend will be composed of multiple independent microservices. For the MVP, this will include at least:
*   A **Blog Service** responsible for all CRUD operations on posts.
*   An **Auth Service** to handle security for the admin interface (even if simple initially).
*   An **Analytics Service** to manage the view counting logic.

*   **Rationale:** While a monolith would be simpler, a microservice architecture directly supports the goal of showcasing advanced backend and DevOps capabilities, including service-to-service communication, container orchestration, and independent deployment strategies.

### Testing Requirements: Unit + Integration
The testing strategy will include both unit tests for individual functions and integration tests to verify interactions between services.

*   **Rationale:** A comprehensive testing strategy is a hallmark of a professional developer. This approach demonstrates the ability to ensure code quality at multiple levels without the overhead of full end-to-end (E2E) tests for the MVP. All tests will be automated and run as part of the CI/CD pipeline.

### Additional Technical Assumptions and Requests
*   All application components (frontend, microservices) will be individually containerized using **Docker**.
*   All AWS infrastructure will be provisioned and managed via **Terraform** (Infrastructure as Code).
*   The deployment and configuration management of the services onto the AWS infrastructure will be handled by **Ansible**.
*   The entire build, test, and deployment process will be automated via **GitHub Actions**.
