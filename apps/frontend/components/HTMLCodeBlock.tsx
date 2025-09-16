'use client';

import { useState, useEffect, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
// Load common languages statically
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-matlab';
import 'prismjs/components/prism-latex';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-nginx';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-mongodb';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HTMLCodeBlockProps {
  htmlContent: string;
  className?: string;
}

const languageNames: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  cpp: 'C++',
  css: 'CSS',
  json: 'JSON',
  markdown: 'Markdown',
  bash: 'Bash',
  sql: 'SQL',
  yaml: 'YAML',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  dart: 'Dart',
  r: 'R',
  matlab: 'MATLAB',
  latex: 'LaTeX',
  docker: 'Docker',
  nginx: 'Nginx',
  graphql: 'GraphQL',
  mongodb: 'MongoDB',
};

export function HTMLCodeBlock({ htmlContent, className = '' }: HTMLCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [highlightedCode, setHighlightedCode] = useState('');

  // Parse HTML content and highlight code after component mounts
  useEffect(() => {
    // Parse HTML content from TinyMCE
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Extract code content and language
    const preElement = doc.querySelector('pre');
    const codeElement = doc.querySelector('code');

    if (preElement || codeElement) {
      let lang = 'javascript';
      let titleText = '';
      let lineNumbers = false;

      // Get language from class (e.g., "language-javascript")
      const langClass = preElement?.className || codeElement?.className || '';
      const langMatch = langClass.match(/language-(\w+)/);
      if (langMatch) {
        lang = langMatch[1];
      }

      // Check for line numbers class
      if (langClass.includes('line-numbers')) {
        lineNumbers = true;
      }

      // Get code content
      const content = (codeElement?.textContent || preElement?.textContent || '').trim();

      // Check for title in first line
      const lines = content.split('\n');
      if (lines.length > 0) {
        const firstLine = lines[0];
        const titleMatch = firstLine.match(/^\/\/\s*title:\s*(.+)$/i);
        if (titleMatch) {
          titleText = titleMatch[1].trim();
          // Remove title line from code
          const actualCode = lines.slice(1).join('\n');
          setCodeContent(actualCode);
        } else {
          setCodeContent(content);
        }
      } else {
        setCodeContent(content);
      }

      setLanguage(lang);
      setTitle(titleText);
      setShowLineNumbers(lineNumbers);

      // Highlight code
      try {
        const highlighted = Prism.highlight(
          content,
          Prism.languages[lang] || Prism.languages.javascript,
          lang
        );

        if (lineNumbers) {
          // Add line numbers to the highlighted code
          const lines = highlighted.split('\n');
          const numberedLines = lines.map((line, index) => {
            const lineNumber = index + 1;
            return `<span class="line-number">${lineNumber}</span>${line}`;
          }).join('\n');
          setHighlightedCode(numberedLines);
        } else {
          setHighlightedCode(highlighted);
        }
      } catch (error) {
        // Fallback to plain text if highlighting fails
        setHighlightedCode(content);
      }
    } else {
      // Fallback: show the raw HTML content
      setHighlightedCode(htmlContent);
    }
  }, [htmlContent]);

  const copyToClipboard = async () => {
    try {
      // Extract plain text from HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const codeElement = doc.querySelector('code') || doc.querySelector('pre');
      const codeText = (codeElement?.textContent || '').trim();

      if (!codeText) {
        // Fallback: try to extract from the highlighted code
        const fallbackText = highlightedCode.replace(/<[^>]*>/g, '').trim();
        await navigator.clipboard.writeText(fallbackText || htmlContent);
      } else {
        await navigator.clipboard.writeText(codeText);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const codeElement = doc.querySelector('code') || doc.querySelector('pre');
      const codeText = (codeElement?.textContent || '').trim();

      textArea.value = codeText || highlightedCode.replace(/<[^>]*>/g, '').trim() || htmlContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayLanguage = languageNames[language] || language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <div className={cn("code-block-container relative group my-4 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
      {/* Header */}
      <div className="code-block-header">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Code2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
            {title && (
              <span className="code-block-title truncate">{title}</span>
            )}
            <span className="code-block-language flex-shrink-0">
              {displayLanguage}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className={cn(
              "code-block-copy-button h-8 w-8 p-0 transition-all duration-200 flex-shrink-0",
              copied
                ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        <pre className={cn(
          "bg-gray-900 text-gray-100 overflow-x-auto text-sm leading-relaxed",
          showLineNumbers ? "pl-12" : "p-4"
        )}>
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode || 'No content to display' }}
            suppressHydrationWarning
          />
        </pre>

        {/* Copy Success Indicator */}
        {copied && (
          <div className="copy-success">
            Copied!
          </div>
        )}
      </div>
    </div>
  );
}
