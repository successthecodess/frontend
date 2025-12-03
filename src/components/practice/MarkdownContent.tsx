'use client';

import { CodeBlock } from './CodeBlock';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  // Parse content and extract code blocks
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
  
  return (
    <div className="prose prose-sm max-w-none">
      {parts.map((part, index) => {
        // Multi-line code block
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const language = lines[0].replace('```', '').trim() || 'java';
          const code = lines.slice(1, -1).join('\n');
          return <CodeBlock key={index} code={code} language={language} />;
        }
        
        // Inline code
        if (part.startsWith('`') && part.endsWith('`')) {
          const code = part.slice(1, -1);
          return (
            <code key={index} className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800">
              {code}
            </code>
          );
        }
        
        // Regular text - preserve line breaks
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </div>
  );
}