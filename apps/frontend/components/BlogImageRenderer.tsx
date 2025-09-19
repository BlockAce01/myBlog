'use client';

import { OptimizedImage } from './OptimizedImage';

interface BlogImageRendererProps {
  html: string;
  className?: string;
}

export function BlogImageRenderer({ html, className = '' }: BlogImageRendererProps) {
  // Parse HTML and extract image information
  const processHTML = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const images = doc.querySelectorAll('img');

    // Convert NodeList to array for processing
    const imageElements = Array.from(images);

    if (imageElements.length === 0) {
      return { hasImages: false, processedHtml: htmlContent };
    }

    // Process each image
    imageElements.forEach((img, index) => {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const className = img.getAttribute('class') || '';
      const width = img.getAttribute('width');
      const height = img.getAttribute('height');

      // Create a placeholder that will be replaced with React component
      const placeholderId = `__blog_image_${index}__`;
      img.setAttribute('data-placeholder-id', placeholderId);
      img.setAttribute('data-src', src);
      img.setAttribute('data-alt', alt);
      img.setAttribute('data-class', className);
      if (width) img.setAttribute('data-width', width);
      if (height) img.setAttribute('data-height', height);
    });

    return {
      hasImages: true,
      processedHtml: doc.body.innerHTML,
      imageData: imageElements.map((img, index) => ({
        id: `__blog_image_${index}__`,
        src: img.getAttribute('data-src') || '',
        alt: img.getAttribute('data-alt') || '',
        className: img.getAttribute('data-class') || '',
        width: img.getAttribute('data-width'),
        height: img.getAttribute('data-height')
      }))
    };
  };

  const { hasImages, processedHtml, imageData } = processHTML(html);

  if (!hasImages) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Split HTML by image placeholders and render with React components
  const parts = processedHtml.split(/(__blog_image_\d+__)/g);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        const imageMatch = part.match(/__blog_image_(\d+)__/);
        if (imageMatch) {
          const imageIndex = parseInt(imageMatch[1]);
          const imageInfo = imageData?.[imageIndex];

          if (imageInfo) {
            return (
              <OptimizedImage
                key={`image-${imageIndex}`}
                src={imageInfo.src}
                alt={imageInfo.alt}
                className={imageInfo.className}
                width={imageInfo.width ? parseInt(imageInfo.width) : undefined}
                height={imageInfo.height ? parseInt(imageInfo.height) : undefined}
              />
            );
          }
        }

        // Regular HTML content
        if (part.trim()) {
          return (
            <div
              key={`html-${index}`}
              dangerouslySetInnerHTML={{ __html: part }}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
