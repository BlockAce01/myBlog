import { Layout } from "@/components/layout"
import { BlogPostPreview } from "@/components/blog-post-preview"
import type { Post } from "@/lib/types"

// Placeholder data for blog posts
const recentPosts: Post[] = [
  {
    id: "building-scalable-react-apps",
    title: "Building Scalable React Applications with TypeScript and Next.js",
    publicationDate: "December 15, 2024",
    summary:
      "Exploring best practices for architecting large-scale React applications using TypeScript, Next.js, and modern development patterns. Learn how to structure your codebase for maintainability and performance.",
    content: "# Building Scalable React Applications...", // Markdown content would go here
    viewCount: 1247,
    likeCount: 89,
  },
  {
    id: "docker-kubernetes-deployment",
    title: "From Docker to Kubernetes: A Complete Deployment Guide",
    publicationDate: "November 28, 2024",
    summary:
      "A comprehensive walkthrough of containerizing applications with Docker and orchestrating them with Kubernetes. Includes practical examples and production-ready configurations.",
    content: "# From Docker to Kubernetes...",
    viewCount: 892,
    likeCount: 67,
  },
  {
    id: "aws-serverless-architecture",
    title: "Designing Serverless Architectures on AWS",
    publicationDate: "November 10, 2024",
    summary:
      "Deep dive into serverless computing with AWS Lambda, API Gateway, and DynamoDB. Learn how to build cost-effective, scalable applications without managing servers.",
    content: "# Designing Serverless Architectures...",
    viewCount: 1456,
    likeCount: 112,
  },
  {
    id: "terraform-infrastructure-as-code",
    title: "Infrastructure as Code with Terraform: Best Practices",
    publicationDate: "October 22, 2024",
    summary:
      "Master infrastructure automation using Terraform. From basic configurations to advanced patterns, learn how to manage cloud resources efficiently and safely.",
    content: "# Infrastructure as Code with Terraform...",
    viewCount: 734,
    likeCount: 45,
  },
]

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Recent Posts</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Welcome to my tech journey! Here you'll find insights, tutorials, and experiences from my adventures in
            software development, DevOps, and cloud architecture.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {recentPosts.map((post) => (
            <BlogPostPreview key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
