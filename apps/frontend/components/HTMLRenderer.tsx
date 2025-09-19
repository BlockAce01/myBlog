'use client';

import DOMPurify from 'dompurify';
import { HTMLCodeBlock } from './HTMLCodeBlock';
import { BlogImageRenderer } from './BlogImageRenderer';

interface HTMLRendererProps {
  html: string;
  className?: string;
}

export default function HTMLRenderer({ html, className = '' }: HTMLRendererProps) {
  // Check if html is valid
  if (!html || typeof html !== 'string') {
    return <div className={className}>No content to display</div>;
  }

  // Process HTML to identify cover photo (first image)
  const processedHtml = html.replace(/<img([^>]*)>/, (match, attrs) => {
    // Check if this is the first image and doesn't already have cover-photo class
    if (!attrs.includes('cover-photo')) {
      return `<img${attrs} class="cover-photo">`;
    }
    return match;
  });

  // Check if content contains images or code blocks
  const hasImages = /<img[^>]*>/g.test(processedHtml);
  const hasCodeBlocks = /<pre[^>]*>[\s\S]*?<\/pre>/g.test(processedHtml);

  // If content has images, use BlogImageRenderer for optimization
  if (hasImages) {
    return (
      <div
        className={`prose prose-lg max-w-none ${className} w-full overflow-hidden`}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          lineHeight: '1.7',
          color: '#374151',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <BlogImageRenderer
          html={processedHtml}
          className=""
        />
      </div>
    );
  }

  if (hasCodeBlocks) {
    // Split content by code blocks and render them separately
    const parts = processedHtml.split(/(<pre[^>]*>[\s\S]*?<\/pre>)/g);

    return (
      <div className={`prose prose-lg max-w-none ${className} w-full overflow-hidden`} style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        lineHeight: '1.7',
        color: '#374151',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {parts.map((part, index) => {
          // Check if this part is a code block
          const codeBlockMatch = part.match(/^<pre[^>]*>([\s\S]*?)<\/pre>$/);
          if (codeBlockMatch) {
            return <HTMLCodeBlock key={index} htmlContent={part} />;
          }

          // Regular HTML content
          if (part.trim()) {
            // Sanitize regular HTML content
            const sanitizedHTML = DOMPurify.sanitize(part, {
              ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'li', 'blockquote', 'code', 'a', 'img', 'div', 'span'
              ],
              ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style']
            });

            return (
              <div key={index} dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
            );
          }

          return null;
        })}
      </div>
    );
  }

  // Sanitize HTML content for security
  const sanitizedHTML = DOMPurify.sanitize(processedHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style']
  });

  // If sanitization removed all content, show error
  if (!sanitizedHTML.trim()) {
    return <div className={className}>Content could not be safely rendered</div>;
  }

  return (
    <div
      className={`prose prose-lg max-w-none ${className} w-full overflow-hidden`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        lineHeight: '1.7',
        color: '#374151',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    />
  );
}
