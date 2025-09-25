# Image Optimization Architecture

This document explains the image optimization system implemented to resolve LCP (Largest Contentful Paint) warnings in the blog application.

## Overview

The system addresses recurring LCP warnings by implementing a comprehensive image optimization architecture that automatically applies Next.js Image optimization with priority loading for above-the-fold images.

## Components

### 1. OptimizedImage Component

**File**: `OptimizedImage.tsx`

A wrapper component around Next.js Image that provides:

- Automatic priority detection for above-the-fold images
- Error handling with fallback UI
- Consistent optimization settings
- Responsive image sizing

**Key Features**:

- Detects `cover-photo` or `above-fold` classes for automatic priority
- Configurable quality (default: 75)
- Responsive sizes for different screen sizes
- Error boundary with user-friendly fallback

### 2. BlogImageRenderer Component

**File**: `BlogImageRenderer.tsx`

Handles rendering of HTML content containing images by:

- Parsing HTML to extract image information
- Replacing `<img>` tags with `OptimizedImage` components
- Maintaining original HTML structure
- Preserving image attributes (alt, class, width, height)

**Use Case**: Blog post content with embedded images

### 3. Updated HTMLRenderer Component

**File**: `HTMLRenderer.tsx`

Enhanced to automatically detect and optimize images:

- Checks for images in HTML content
- Routes image-containing content to `BlogImageRenderer`
- Maintains backward compatibility for non-image content
- Preserves existing code block handling

## Usage

### For Cover Photos (PostCard)

```tsx
import { OptimizedImage } from "./OptimizedImage";

// Automatically gets priority due to 'cover-photo' class
<OptimizedImage
  src={post.coverPhotoUrl!}
  alt=""
  fill
  className="absolute inset-0 w-full h-full object-cover rounded-lg cover-photo"
  onError={() => setImageError(true)}
/>;
```

### For Blog Content Images

Images in blog posts are automatically optimized when rendered through `HTMLRenderer`:

```tsx
import HTMLRenderer from "./HTMLRenderer";

// Images in HTML content are automatically optimized
<HTMLRenderer html={blogPostContent} className="blog-content" />;
```

### Manual Usage

```tsx
import { OptimizedImage } from "./OptimizedImage";

// Explicit priority control
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={true} // Force priority
  className="above-fold" // Alternative priority trigger
/>;
```

## Priority Detection Logic

Images receive priority loading when:

1. `priority={true}` is explicitly set
2. CSS class contains `cover-photo`
3. CSS class contains `above-fold`

## Configuration

### Default Settings

- **Quality**: 75 (configurable)
- **Sizes**: `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`
- **Priority**: Auto-detected based on class names

### Customization

```tsx
<OptimizedImage
  src="/image.jpg"
  alt="Alt text"
  quality={90} // Higher quality
  sizes="(max-width: 640px) 100vw, 50vw" // Custom sizes
  priority={true} // Force priority
/>
```

## Benefits

1. **Performance**: Eliminates LCP warnings by prioritizing above-the-fold images
2. **SEO**: Better Core Web Vitals scores
3. **User Experience**: Faster loading of critical images
4. **Maintainability**: Centralized image optimization logic
5. **Flexibility**: Automatic detection with manual override options

## Migration Guide

### Existing Components

Replace direct Next.js Image imports:

```tsx
// Before
import Image from 'next/image';
<Image src={src} alt={alt} ... />

// After
import { OptimizedImage } from './OptimizedImage';
<OptimizedImage src={src} alt={alt} ... />
```

### HTML Content

No changes required - HTMLRenderer automatically handles optimization for content with images.

## Troubleshooting

### LCP Warnings Persist

1. Verify images have appropriate class names (`cover-photo`, `above-fold`)
2. Check that images are actually above the fold
3. Ensure OptimizedImage component is being used

### Image Loading Issues

1. Check image URLs are valid
2. Verify Next.js configuration for image domains
3. Check browser console for errors

### Performance Issues

1. Adjust quality settings if needed
2. Review sizes attribute for appropriate responsive breakpoints
3. Consider lazy loading for below-the-fold images

## Future Enhancements

- [ ] Automatic above-the-fold detection using Intersection Observer
- [ ] Image format optimization (WebP, AVIF)
- [ ] Lazy loading configuration
- [ ] Image CDN integration
- [ ] Analytics for image performance metrics
