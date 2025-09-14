import Link from "next/link"
import { useState } from "react"
import type { BlogPost } from "@/lib/types"
import { Eye, Heart } from "lucide-react"

interface PostCardProps {
  post: BlogPost
}

export function PostCard({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false);

  const formattedDate = new Date(post.publicationDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Use slug for URL if available, otherwise fallback to ID
  const postUrl = post.slug ? `/post/${post.slug}` : `/post/${post.id}`;

  const hasCoverPhoto = post.coverPhotoUrl && post.coverPhotoUrl !== "https://via.placeholder.com/800x400?text=No+Image" && !imageError;

  return (
    <article className="group rounded-lg border border-borde overflow-hidden hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/40 transition-all duration-300 hover:scale-[1.02] min-h-[300px] relative bg-card dark:bg-card">
      {/* Background Image */}
      {hasCoverPhoto && (
        <img
          src={post.coverPhotoUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
          onError={() => setImageError(true)}
        />
      )}

      {/* Gradient Overlay - optimized for both light and dark modes */}
      {hasCoverPhoto && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/60 to-transparent dark:from-black/90 dark:via-black/60 dark:to-transparent" />
      )}

      {/* Content */}
      <div className={`relative p-6 h-full flex flex-col ${hasCoverPhoto ? 'text-foreground' : 'bg-card/50 dark:bg-card/80 text-foreground'}`}>
        {/* Content covering entire card */}
        <div className="flex-1 flex flex-col justify-end">
          {/* Custom gradient fade from bottom to top */}
          <div className="absolute inset-0 post-card-gradient group-hover:post-card-gradient-hover" />

          {/* Content above the backgrounds */}
          <div className="relative z-10">
            <Link href={postUrl} className="block">
              <h2 className={`text-xl font-bold font-sans mb-2 transition-colors ${
                hasCoverPhoto
                  ? 'text-foreground hover:text-accent dark:text-foreground dark:hover:text-accent'
                  : 'text-foreground hover:text-accent dark:text-foreground dark:hover:text-accent'
              }`}>
                {post.title}
              </h2>
            </Link>

            <p className={`text-sm mb-3 ${
              hasCoverPhoto
                ? 'text-muted-foreground dark:text-muted-foreground/80'
                : 'text-muted-foreground dark:text-muted-foreground/80'
            }`}>
              {formattedDate}
            </p>

            <p className={`text-sm leading-relaxed mb-3 line-clamp-2 ${
              hasCoverPhoto
                ? 'text-foreground/90 dark:text-foreground/85 font-serif'
                : 'text-foreground/90 dark:text-foreground/85 font-serif'
            }`}>
              {post.summary}
            </p>

            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 text-sm ${
                hasCoverPhoto
                  ? 'text-muted-foreground dark:text-muted-foreground/70'
                  : 'text-muted-foreground dark:text-muted-foreground/70'
              }`}>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likeCount}</span>
                </div>
              </div>

              <Link
                href={postUrl}
                className={`font-medium text-sm transition-colors ${
                  hasCoverPhoto
                    ? 'text-accent hover:text-accent/80 dark:text-accent dark:hover:text-accent/80'
                    : 'text-accent hover:text-accent/80 dark:text-accent dark:hover:text-accent/80'
                }`}
              >
                Read More →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
