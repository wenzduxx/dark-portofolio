import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Element renderers map markdown to the site's design tokens. Font-size and base
// colour are inherited from the wrapper's `className`, so the same component works
// for body paragraphs, callouts and captions just by changing the wrapper class.
const components: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  p: ({ children }) => <p className="mb-5 last:mb-0 leading-relaxed">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
  code: ({ children }) => (
    <code className="px-1.5 py-0.5 rounded-md bg-surface border border-stroke text-accent font-mono text-[0.85em]">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent/40 pl-5 italic text-muted my-5">{children}</blockquote>
  ),
  h2: ({ children }) => <h2 className="font-display italic text-3xl text-text-primary mt-8 mb-4">{children}</h2>,
  h3: ({ children }) => <h3 className="font-display italic text-2xl text-text-primary mt-6 mb-3">{children}</h3>,
  hr: () => <hr className="border-stroke my-8" />,
};

/**
 * Renders a markdown string styled to the portfolio's dark aesthetic.
 * The wrapper `className` controls size/colour; inline marks (links, code, emphasis)
 * carry their own token styling.
 */
export default function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
