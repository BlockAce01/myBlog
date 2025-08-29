# 3. Tech Stack

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (React) | 14.x | Building the user interface. | Modern, performant, and aligns with the AI-generated codebase. |
| **Styling** | Tailwind CSS | 3.x | CSS framework for rapid UI development. | Used in the generated code; excellent for professional, responsive design. |
| **Backend Runtime** | Node.js | 20.x (LTS) | JavaScript runtime for backend services. | Consistent language across the stack (JavaScript/TypeScript). |
| **Backend Framework** | Express.js | 4.x | Web framework for creating APIs. | Minimal, flexible, and the de-facto standard for Node.js APIs. |
| **API Style** | REST | N/A | API design paradigm. | Simple, well-understood, and suitable for this application's needs. |
| **Database** | MongoDB | N/A | Primary data store. | Document-based, flexible schema, and works seamlessly with Node.js. To be used via MongoDB Atlas. |
| **Containerization** | Docker | Latest | Packaging applications. | Creates portable, consistent environments for all services. |
| **IaC** | Terraform | Latest | Infrastructure as Code. | The industry standard for provisioning cloud infrastructure declaratively. |
| **Config. Management**| Ansible | Latest | Server configuration. | Automates the setup of our deployment targets. |
| **CI/CD** | GitHub Actions | N/A | Automation pipeline. | Natively integrated with our source control. |
| **Authentication** | JWT (jsonwebtoken) | 9.x | Secure token-based authentication. | Standard for stateless authentication in microservices. |
| **Password Hashing** | bcrypt | 5.x | Securely hashing user passwords. | Industry-standard for password security. |
| **Testing** | Jest, React Testing Library | Latest | Unit and integration testing. | Standard testing tools for the React and Node.js ecosystems. |
| **Package Manager** | pnpm | Latest | Efficient dependency management for monorepos. | Faster, more disk-space efficient, and better for monorepos than npm/yarn. |
| **Cloud SDK** | AWS SDK for JavaScript | v3 | Interacting with AWS services (S3). | Required for generating pre-signed URLs securely from the backend. |
