# 6. Epic 1: The DevOps Foundation & Live Pipeline

**Epic Goal:** To establish a complete, end-to-end CI/CD pipeline from a GitHub monorepo to a live AWS environment. The outcome of this epic will be a fully automated system capable of deploying a simple "Hello World" application. This foundational pipeline will then be used for all subsequent feature development.

### **Story 1.1: Project Scaffolding**
**As a** developer,
**I want** a properly structured monorepo,
**so that** I can manage the frontend, backend services, and shared packages in an organized and scalable way.

**Acceptance Criteria:**
1.  A new GitHub repository is created.
2.  The repository is initialized as a monorepo (e.g., using `npm workspaces`).
3.  The directory structure with `apps/` and `packages/` folders is created.
4.  Base linter and TypeScript configurations are set up for the workspace.

### **Story 1.2: "Hello World" Backend Service**
**As a** developer,
**I want** to create a minimal "Hello World" backend service,
**so that** I have a simple, deployable artifact to test the CI/CD pipeline.

**Acceptance Criteria:**
1.  A new Express.js application is created inside the `apps/` directory.
2.  The application has a single API endpoint at `/` that returns a `200 OK` status with the JSON body `{"message": "Hello World"}`.
3.  The service can be started and run locally.

### **Story 1.3: Containerize the Service**
**As a** DevOps engineer,
**I want** to containerize the "Hello World" service using Docker,
**so that** the application has a portable and consistent runtime environment.

**Acceptance Criteria:**
1.  A `Dockerfile` is created for the "Hello World" service.
2.  The Docker image can be built successfully using the `docker build` command.
3.  The container runs without errors using `docker run`, and the `/` endpoint is accessible.

### **Story 1.4: Provision Basic Infrastructure with Terraform**
**As a** DevOps engineer,
**I want** to define the core AWS infrastructure as code using Terraform,
**so that** the environment is repeatable, version-controlled, and can be created or destroyed on demand.

**Acceptance Criteria:**
1.  Terraform files are created to define an AWS EC2 instance (e.g., `t2.micro`) and a corresponding security group that allows HTTP and SSH access.
2.  `terraform apply` successfully provisions the resources in the AWS account.
3.  The EC2 instance is running and accessible via SSH.

### **Story 1.5: Configure the Server with Ansible**
**As a** DevOps engineer,
**I want** to create an Ansible playbook to configure the server,
**so that** the environment setup is automated and consistent.

**Acceptance Criteria:**
1.  An Ansible playbook is created.
2.  The playbook successfully runs against the EC2 instance provisioned by Terraform.
3.  The playbook installs and starts the Docker service on the EC2 instance.

### **Story 1.6: Create the Automated CI/CD Pipeline**
**As a** DevOps engineer,
**I want** to create a GitHub Actions workflow to automate the entire deployment process,
**so that** any push to the `main` branch automatically deploys the latest version of the application.

**Acceptance Criteria:**
1.  A GitHub Actions workflow file is created in `.github/workflows/`.
2.  On a push to the `main` branch, the workflow triggers and successfully completes the following steps:
    a. Builds the Docker image from the "Hello World" service.
    b. Pushes the image to a container registry (e.g., Docker Hub or AWS ECR).
    c. Runs `terraform apply` to ensure the infrastructure is active.
    d. Runs the Ansible playbook to pull the latest Docker image from the registry and run it on the EC2 instance.
3.  After the workflow completes, the "Hello World" service is publicly accessible on the EC2 instance's IP address.
