import type { Post, Comment } from "@/lib/types"

// Placeholder data for blog posts (in a real app, this would come from a database)
export const posts: Post[] = [
  {
    id: "building-scalable-react-apps",
    title: "Building Scalable React Applications with TypeScript and Next.js",
    publicationDate: "December 15, 2024",
    summary:
      "Exploring best practices for architecting large-scale React applications using TypeScript, Next.js, and modern development patterns.",
    content: `# Building Scalable React Applications with TypeScript and Next.js

When building large-scale React applications, architecture decisions made early in the project can significantly impact maintainability, performance, and developer experience. In this post, I'll share key strategies I've learned for creating scalable React applications.

## Project Structure

A well-organized project structure is crucial for scalability. Here's the structure I recommend:

\`\`\`
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   └── layout/       # Layout components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
└── app/              # Next.js app directory
\`\`\`

## TypeScript Best Practices

TypeScript provides excellent developer experience and catches errors early. Here are some key practices:

### 1. Define Clear Interfaces

\`\`\`typescript
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
}
\`\`\`

### 2. Use Generic Components

\`\`\`typescript
interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
}

function Table<T>({ data, columns, onRowClick }: TableProps<T>) {
  // Component implementation
}
\`\`\`

## Performance Optimization

Performance is critical for user experience. Key strategies include:

- **Code splitting** with dynamic imports
- **Memoization** with React.memo and useMemo
- **Lazy loading** for images and components
- **Bundle analysis** to identify optimization opportunities

## State Management

For complex applications, consider these state management patterns:

1. **Local state** for component-specific data
2. **Context API** for shared application state
3. **External libraries** like Zustand or Redux Toolkit for complex state logic

## Conclusion

Building scalable React applications requires thoughtful planning and consistent patterns. By following these practices, you can create applications that are maintainable, performant, and enjoyable to work with.

What strategies have you found most effective for scaling React applications? I'd love to hear your thoughts in the comments below!`,
    viewCount: 1247,
    likeCount: 89,
  },
  {
    id: "docker-kubernetes-deployment",
    title: "From Docker to Kubernetes: A Complete Deployment Guide",
    publicationDate: "November 28, 2024",
    summary:
      "A comprehensive walkthrough of containerizing applications with Docker and orchestrating them with Kubernetes.",
    content: `# From Docker to Kubernetes: A Complete Deployment Guide

Container orchestration has become essential for modern application deployment. This guide walks through the journey from Docker containers to Kubernetes orchestration.

## Getting Started with Docker

Docker containers provide consistency across environments. Here's a basic Dockerfile:

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Kubernetes Fundamentals

Kubernetes manages containerized applications at scale. Key concepts include:

- **Pods**: The smallest deployable units
- **Services**: Network access to pods
- **Deployments**: Manage pod replicas
- **ConfigMaps**: Configuration management

## Deployment Example

Here's a basic Kubernetes deployment:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: myapp:latest
        ports:
        - containerPort: 3000
\`\`\`

This deployment ensures high availability and scalability for your applications.`,
    viewCount: 892,
    likeCount: 67,
  },
  {
    id: "aws-serverless-architecture",
    title: "Designing Serverless Architectures on AWS",
    publicationDate: "November 10, 2024",
    summary: "Deep dive into serverless computing with AWS Lambda, API Gateway, and DynamoDB.",
    content: `# Designing Serverless Architectures on AWS

Serverless computing has revolutionized how we build and deploy applications. Let's explore how to design effective serverless architectures on AWS.

## Core AWS Serverless Services

### AWS Lambda
Functions that run in response to events without managing servers.

### API Gateway
Managed service for creating and managing APIs.

### DynamoDB
NoSQL database that scales automatically.

## Architecture Patterns

### 1. API-Driven Architecture

\`\`\`
Client → API Gateway → Lambda → DynamoDB
\`\`\`

### 2. Event-Driven Architecture

\`\`\`
S3 → Lambda → SQS → Lambda → DynamoDB
\`\`\`

## Best Practices

- Keep functions small and focused
- Use environment variables for configuration
- Implement proper error handling
- Monitor with CloudWatch

Serverless architectures offer excellent scalability and cost-effectiveness when designed properly.`,
    viewCount: 1456,
    likeCount: 112,
  },
  {
    id: "terraform-infrastructure-as-code",
    title: "Infrastructure as Code with Terraform: Best Practices",
    publicationDate: "October 22, 2024",
    summary: "Master infrastructure automation using Terraform with advanced patterns and best practices.",
    content: `# Infrastructure as Code with Terraform: Best Practices

Infrastructure as Code (IaC) has become essential for managing cloud resources efficiently. Terraform is one of the most popular tools for this purpose.

## Why Terraform?

- **Multi-cloud support**
- **Declarative syntax**
- **State management**
- **Large ecosystem**

## Basic Example

\`\`\`hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1d0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "WebServer"
  }
}
\`\`\`

## Best Practices

1. **Use modules** for reusable components
2. **Manage state remotely** with S3 and DynamoDB
3. **Implement proper naming conventions**
4. **Use variables and outputs effectively**

## Advanced Patterns

- **Workspace management** for multiple environments
- **Data sources** for existing resources
- **Conditional resources** with count and for_each

Terraform enables reliable, repeatable infrastructure management that scales with your organization.`,
    viewCount: 734,
    likeCount: 45,
  },
]

// Placeholder comments data
export const comments: Comment[] = [
  {
    id: "1",
    postId: "building-scalable-react-apps",
    authorName: "Sarah Chen",
    commentText:
      "Great article! I've been struggling with project structure in my React apps. The folder organization you suggested makes a lot of sense. Do you have any recommendations for managing shared state across deeply nested components?",
  },
  {
    id: "2",
    postId: "building-scalable-react-apps",
    authorName: "Mike Rodriguez",
    commentText:
      "The TypeScript examples are really helpful. I especially like the generic Table component approach. We've been using something similar at work and it's made our codebase much more maintainable.",
  },
  {
    id: "3",
    postId: "building-scalable-react-apps",
    authorName: "Alex Kim",
    commentText:
      "Thanks for sharing this! One question about performance optimization - have you experimented with React Server Components in Next.js 13+? I'm curious about your thoughts on when to use them vs traditional client components.",
  },
]
