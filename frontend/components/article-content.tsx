/**
 * ArticleContent Component
 * Markdown renderer for article content with custom styling.
 * Uses react-markdown with custom components.
 */

"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="prose prose-slate max-w-none article-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-serif text-4xl text-bark-900 mb-6">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-2xl text-bark-900 mt-8 mb-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-xl text-bark-900 mt-6 mb-3">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-bark-700 leading-relaxed mb-4">{children}</p>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-tea-600 hover:underline">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-tea-500 pl-4 italic text-bark-700 my-6">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-bark-700">{children}</li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-ivory-200 px-2 py-1 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <pre className="bg-ivory-200 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm">
                <code>{children}</code>
              </pre>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-ivory-200 p-4 rounded-lg overflow-x-auto my-4">{children}</pre>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="rounded-lg my-6 w-full" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-ivory-200">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-bark-900">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border-t border-ivory-300">{children}</td>
          ),
          hr: () => <hr className="my-8 border-ivory-300" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
