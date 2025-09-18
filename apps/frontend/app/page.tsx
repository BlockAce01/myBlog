"use client";

import { Layout } from "../components/layout";
import { useState, useEffect } from "react";
import { PostCard } from "../components/PostCard";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input"; // Import Input component
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton component
import type { BlogPost } from "../lib/types";
import { getPosts, searchPosts } from "../lib/data"; // Import searchPosts
import { useDebounce } from "../hooks/use-debounce"; // Assuming useDebounce hook exists or will be created

export default function HomePage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResultsCount, setSearchResultsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      let fetchedPosts: BlogPost[] = [];
      if (debouncedSearchQuery) {
        fetchedPosts = await searchPosts(debouncedSearchQuery, selectedTag ? [selectedTag] : undefined);
      } else {
        fetchedPosts = await getPosts(selectedTag ? [selectedTag] : undefined);
      }
      setPosts(fetchedPosts);
      setSearchResultsCount(fetchedPosts.length);
      setLoading(false);
    };
    fetchPosts();
  }, [debouncedSearchQuery, selectedTag]);

  // Extract unique tags from all posts (from the currently displayed posts)
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 px-0 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <Input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md w-full"
          />
          {debouncedSearchQuery && !loading && searchResultsCount !== null && (
            <p className="text-muted-foreground text-sm">
              {searchResultsCount === 0
                ? "No results found."
                : `${searchResultsCount} result${searchResultsCount === 1 ? "" : "s"}`}
            </p>
          )}
        </div>

        {/* Tag Filter Section */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8">
          <Badge
            variant={selectedTag === null ? "default" : "outline"}
            onClick={() => setSelectedTag(null)}
            className="cursor-pointer text-xs sm:text-sm"
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              onClick={() => setSelectedTag(tag)}
              className="cursor-pointer text-xs sm:text-sm"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {posts.length === 0 && (debouncedSearchQuery || selectedTag) ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No posts found matching your criteria.
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
