"use client";

import { Layout } from "@/components/layout";
import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/lib/types";
import { getPosts } from "@/lib/data";

export default function HomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // Extract unique tags from all posts
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  // Filter posts based on the selected tag
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-sans text-foreground mb-4">
            Recent Posts
          </h1>
          <p className="text-muted-foreground font-serif text-lg max-w-2xl mx-auto">
            Exploring modern web development, best practices, and the latest
            technologies in the ever-evolving world of software engineering.
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

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
