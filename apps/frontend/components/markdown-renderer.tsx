'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './code-block';
import { HTMLCodeBlock } from './HTMLCodeBlock';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Check if content contains HTML tags (from TinyMCE)
  const hasHTMLTags = /<[^>]*>/.test(content);

  if (hasHTMLTags) {
    // For HTML content from TinyMCE, we need to handle it specially
    // Split content by code blocks and render them separately
    const parts = content.split(/(<pre[^>]*>[\s\S]*?<\/pre>)/g);

    return (
      <div className={cn("prose prose-lg max-w-none", className)} style={{
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
            return (
              <div key={index} dangerouslySetInnerHTML={{ __html: part }} />
            );
          }

          return null;
        })}
      </div>
    );
  }

  // For traditional Markdown content, use ReactMarkdown
  return (
    <div className={cn("prose prose-lg max-w-none", className)}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            // Determine if this is inline code (no language class or no language match)
            const isInline = !language || !match;

            // Check for code block metadata (title, line numbers, etc.)
            const codeContent = String(children).replace(/\n$/, '');
            const lines = codeContent.split('\n');

            // Check for title in first line (format: // title: My Title)
            let title = '';
            let actualCode = codeContent;
            let showLineNumbers = false;

            if (lines.length > 0 && !isInline) {
              const firstLine = lines[0];
              const titleMatch = firstLine.match(/^\/\/\s*title:\s*(.+)$/i);
              if (titleMatch) {
                title = titleMatch[1].trim();
                actualCode = lines.slice(1).join('\n');
              }

              // Check for line numbers directive
              if (firstLine.includes('// show-line-numbers') || firstLine.includes('// line-numbers')) {
                showLineNumbers = true;
                actualCode = lines.slice(1).join('\n');
              }
            }

            if (!isInline && language) {
              return (
                <div key={node?.position?.start?.offset || Math.random()} className="my-4">
                  <CodeBlock
                    code={actualCode}
                    language={language}
                    showLineNumbers={showLineNumbers}
                    title={title}
                  />
                </div>
              );
            }

            // Inline code
            return (
              <code
                className={cn(
                  "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Enhanced blockquote styling
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                {children}
              </blockquote>
            );
          },
          // Enhanced table styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse border border-border">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-border px-4 py-2">
                {children}
              </td>
            );
          },
          // Enhanced link styling
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          // Enhanced list styling
          ul({ children }) {
            return (
              <ul className="list-disc list-inside space-y-1 my-4">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside space-y-1 my-4">
                {children}
              </ol>
            );
          },
          // Enhanced heading styling
          h1({ children }) {
            return (
              <h1 className="text-3xl font-bold tracking-tight mt-8 mb-4 first:mt-0">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-2xl font-bold tracking-tight mt-6 mb-3">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-xl font-semibold tracking-tight mt-5 mb-2">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-lg font-semibold tracking-tight mt-4 mb-2">
                {children}
              </h4>
            );
          },
          // Enhanced paragraph styling
          p({ children }) {
            return (
              <p className="leading-7 mb-4 last:mb-0">
                {children}
              </p>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
