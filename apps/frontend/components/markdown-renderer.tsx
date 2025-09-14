'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './code-block';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
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
                <CodeBlock
                  code={actualCode}
                  language={language}
                  showLineNumbers={showLineNumbers}
                  title={title}
                />
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
