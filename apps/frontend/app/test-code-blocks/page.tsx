'use client';

import { CodeBlock } from '@/components/code-block';
import { HTMLCodeBlock } from '@/components/HTMLCodeBlock';

export default function TestCodeBlocksPage() {
  const sampleCode = `function helloWorld() {
  console.log('Hello, World!');
  return true;
}

const example = {
  name: 'Test',
  value: 42,
  active: true
};`;

  const samplePythonCode = `def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 Fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`;

  const sampleHTML = `<pre class="language-javascript line-numbers"><code>function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));</code></pre>`;

  const simpleCode = `console.log('Hello World');
const x = 42;
console.log(x);`;

  return (
    <div className="w-full max-w-4xl mx-auto p-0 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Code Blocks Test Page</h1>

      <div className="space-y-6 sm:space-y-8">
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">JavaScript Code Block with Line Numbers</h2>
          <CodeBlock
            code={simpleCode}
            language="javascript"
            title="Simple JavaScript"
            showLineNumbers={true}
          />
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">JavaScript Code Block without Line Numbers</h2>
          <CodeBlock
            code={sampleCode}
            language="javascript"
            title="Hello World Function"
            showLineNumbers={false}
          />
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Python Code Block</h2>
          <CodeBlock
            code={samplePythonCode}
            language="python"
            title="Fibonacci Sequence"
            showLineNumbers={true}
          />
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">HTML Code Block</h2>
          <HTMLCodeBlock htmlContent={sampleHTML} />
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Long Code Block (Mobile Scroll Test)</h2>
          <CodeBlock
            code={`function createUserProfile(userData) {
  // Validate input data
  if (!userData.name || !userData.email) {
    throw new Error('Name and email are required');
  }

  // Create user profile object
  const profile = {
    id: generateUniqueId(),
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    avatar: userData.avatar || getDefaultAvatar(),
    preferences: {
      theme: userData.theme || 'light',
      notifications: userData.notifications !== false,
      language: userData.language || 'en'
    },
    createdAt: new Date().toISOString(),
    lastLogin: null,
    isActive: true
  };

  // Save to database
  return saveUserProfile(profile);
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getDefaultAvatar() {
  return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
}

async function saveUserProfile(profile) {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    });

    if (!response.ok) {
      throw new Error('Failed to save user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}`}
            language="javascript"
            title="User Profile Creation Function"
            showLineNumbers={true}
          />
        </section>

        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Inline Code Example</h2>
          <p className="text-base sm:text-lg leading-relaxed">
            This is a paragraph with <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">inline code</code> styling that demonstrates how code snippets appear within regular text content.
          </p>
        </section>

        <section className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-blue-800 dark:text-blue-200">Mobile Responsiveness Test</h2>
          <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 mb-4">
            Try resizing your browser window or viewing this page on a mobile device to test the responsive behavior of the code blocks.
          </p>
          <ul className="text-sm sm:text-base text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Code blocks should stack vertically on small screens</li>
            <li>• Copy buttons should be easily tappable</li>
            <li>• Code should remain readable with horizontal scrolling</li>
            <li>• Line numbers should adjust appropriately</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
