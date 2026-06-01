import React, { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { CodeBlock } from '../../lib/blocks';

/**
 * Source-code block with a copy button and lazily-loaded Prism syntax highlighting.
 * The highlighter (heavy) is dynamically imported so it stays out of the main bundle;
 * a styled <pre> renders immediately as a fallback while it loads.
 */
export default function CodeView({ block }: { block: CodeBlock }) {
  const [Highlighter, setHighlighter] = useState<React.ComponentType<any> | null>(null);
  const [theme, setTheme] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // @ts-ignore - prism-async subpath ships no type declarations
        const mod = await import('react-syntax-highlighter/dist/esm/prism-async');
        // @ts-ignore - the prism styles subpath ships no type declarations
        const styles = await import('react-syntax-highlighter/dist/esm/styles/prism');
        if (!active) return;
        setHighlighter(() => (mod as any).default);
        setTheme(() => (styles as any).oneDark);
      } catch {
        /* keep the <pre> fallback */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-stroke bg-[#0d0d0d]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stroke bg-surface/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <span className="text-xs font-mono text-muted truncate">
            {block.filename || block.language || 'code'}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-text-primary transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-1 py-0.5"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {Highlighter && theme ? (
        <Highlighter
          language={block.language || 'text'}
          style={theme}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
            fontSize: '0.85rem',
            lineHeight: 1.6,
          }}
          wrapLongLines
        >
          {block.code}
        </Highlighter>
      ) : (
        <pre className="p-5 overflow-x-auto text-[0.85rem] leading-relaxed font-mono text-text-primary/90">
          <code>{block.code}</code>
        </pre>
      )}
    </div>
  );
}
