# Epic 3: The Complete DevOps Automation Pipeline

**Epic Goal:** To take the verified local application and build the entire automated CI/CD pipeline to deploy it to a production-like environment on AWS.

**Stories:**

*   **Story 3.1: Containerize All Services for Production:** Create production-ready Dockerfiles for every service (frontend, blog, analytics, auth).
*   **Story 3.2: Provision AWS Infrastructure with Terraform:** Write the Terraform scripts to create all necessary AWS resources (e.g., ECS/EKS for containers, an API Gateway, IAM roles, security groups, and potentially a managed database like MongoDB Atlas).
*   **Story 3.3: Configure Cloud Environment with Ansible:** Create Ansible playbooks to handle any necessary server configuration, secrets management, and orchestration that Terraform doesn't cover.
*   **Story 3.4: Build the Full CI/CD Pipeline:** Create the GitHub Actions workflow that automates the entire process:
    *   On a push to main, it will run all tests.
    *   If tests pass, it will build all Docker images.
    *   It will push the images to a container registry (like AWS ECR).
    *   It will trigger the Terraform and Ansible scripts to deploy the new versions of the services to AWS.
