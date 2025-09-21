"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onError?: () => void;
  style?: React.CSSProperties;
  title?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  quality = 75,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onError,
  style,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);

  // Determine if image should have priority based on position or explicit prop
  const shouldPrioritize =
    priority ||
    className.includes("cover-photo") ||
    className.includes("above-fold");

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 ${className}`}
        style={style}
      >
        <span className="text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={shouldPrioritize}
      quality={quality}
      sizes={sizes}
      onError={handleError}
      style={style}
    />
  );
}
