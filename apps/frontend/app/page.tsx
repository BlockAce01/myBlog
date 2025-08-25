"use client"

import { Layout } from "@/components/layout"
import { useState } from "react"
import { PostCard } from "@/components/PostCard"
import { Badge } from "@/components/ui/badge" // Import Badge component
import type { BlogPost } from "@/lib/types"

// Mock data - in a real app, this would come from an API
const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with Next.js 14 and App Router",
    summary:
      "Explore the latest features in Next.js 14 and learn how to leverage the App Router for better performance and developer experience.",
    content: "# Getting Started with Next.js 14\n\nNext.js 14 introduces several exciting features...",
    publicationDate: "2024-01-15",
    viewCount: 1250,
    likeCount: 89,
    tags: ["Next.js", "App Router", "React", "Web Development"],
  },
  {
    id: "2",
    title: "Building Scalable React Applications with TypeScript",
    summary:
      "Learn best practices for structuring large React applications using TypeScript, including patterns for state management and component architecture.",
    content: "# Building Scalable React Applications\n\nWhen building large React applications...",
    publicationDate: "2024-01-10",
    viewCount: 980,
    likeCount: 67,
    tags: ["React", "TypeScript", "State Management", "Component Architecture"],
  },
  {
    id: "3",
    title: "Modern CSS Techniques: Grid, Flexbox, and Container Queries",
    summary:
      "Dive deep into modern CSS layout techniques and learn how to create responsive designs that work across all devices.",
    content: "# Modern CSS Techniques\n\nCSS has evolved significantly...",
    publicationDate: "2024-01-05",
    viewCount: 756,
    likeCount: 45,
    tags: ["CSS", "Grid", "Flexbox", "Responsive Design"],
  },
]

export default function HomePage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Extract unique tags from all posts
  const allTags = Array.from(new Set(mockPosts.flatMap((post) => post.tags)))

  // Filter posts based on the selected tag
  const filteredPosts = selectedTag
    ? mockPosts.filter((post) => post.tags.includes(selectedTag))
    : mockPosts

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-sans text-foreground mb-4">Recent Posts</h1>
          <p className="text-muted-foreground font-serif text-lg max-w-2xl mx-auto">
            Exploring modern web development, best practices, and the latest technologies in the ever-evolving world of
            software engineering.
          </p>
        </div>

        {/* Tag Filter Section */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Badge
            variant={selectedTag === null ? "default" : "outline"}
            onClick={() => setSelectedTag(null)}
            className="cursor-pointer"
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              onClick={() => setSelectedTag(tag)}
              className="cursor-pointer"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
