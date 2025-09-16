'use client';

import DOMPurify from 'dompurify';
import { HTMLCodeBlock } from './HTMLCodeBlock';

interface HTMLRendererProps {
  html: string;
  className?: string;
}

export default function HTMLRenderer({ html, className = '' }: HTMLRendererProps) {
  // Check if html is valid
  if (!html || typeof html !== 'string') {
    return <div className={className}>No content to display</div>;
  }

  // Check if content contains code blocks
  const hasCodeBlocks = /<pre[^>]*>[\s\S]*?<\/pre>/g.test(html);

  if (hasCodeBlocks) {
    // Split content by code blocks and render them separately
    const parts = html.split(/(<pre[^>]*>[\s\S]*?<\/pre>)/g);

    return (
      <div className={`prose prose-lg max-w-none ${className}`} style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        lineHeight: '1.7',
        color: '#374151'
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
  const sanitizedHTML = DOMPurify.sanitize(html, {
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
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        lineHeight: '1.7',
        color: '#374151'
      }}
    />
  );
}
