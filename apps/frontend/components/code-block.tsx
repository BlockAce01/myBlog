'use client';

import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
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
import { Button } from '@/components/ui/button';
import { Copy, Check, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  title?: string;
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

export function CodeBlock({
  code,
  language = 'javascript',
  className = '',
  showLineNumbers = false,
  title
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState(code);

  useEffect(() => {
    // Highlight code using Prism
    try {
      const highlighted = Prism.highlight(
        code,
        Prism.languages[language] || Prism.languages.javascript,
        language
      );
      setHighlightedCode(highlighted);
    } catch (error) {
      // Fallback to plain text if highlighting fails
      setHighlightedCode(code);
    }
  }, [code, language]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
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
    <div className={cn("relative group my-4 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Code2 className="h-4 w-4 text-gray-500" />
          {title && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {displayLanguage}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="relative">
        <pre className={cn(
          "bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed",
          showLineNumbers && "counter-reset: line-number"
        )}>
          <code
            className={cn(`language-${language}`, showLineNumbers && "block")}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>

        {/* Copy Success Indicator */}
        {copied && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg">
            Copied!
          </div>
        )}
      </div>
    </div>
  );
}
