import ClientBlogPostPage from "./ClientBlogPostPage"
import { posts } from "@/lib/data"

export default function BlogPostPage({ params }: { params: { id: string } }) {
  return <ClientBlogPostPage params={params} />
}

// Generate static params for known posts (optional, for better performance)
export function generateStaticParams() {
  return posts.map((post) => ({
    id: post.id,
  }))
}
