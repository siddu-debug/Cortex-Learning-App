'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownRenderer({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load KaTeX CSS
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link');
      link.id = 'katex-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(link);
    }

    // Function to render math elements
    const runKatex = () => {
      // @ts-ignore
      if (window.renderMathInElement && containerRef.current) {
        // @ts-ignore
        window.renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      }
    };

    // Load KaTeX JS
    const loadKatex = async () => {
      if (typeof window === 'undefined') return;

      // Check if already loaded
      // @ts-ignore
      if (window.katex && window.renderMathInElement) {
        runKatex();
        return;
      }

      // Load main script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      script.async = true;
      script.onload = () => {
        // Load auto-render script
        const autoRenderScript = document.createElement('script');
        autoRenderScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js';
        autoRenderScript.async = true;
        autoRenderScript.onload = runKatex;
        document.body.appendChild(autoRenderScript);
      };
      document.body.appendChild(script);
    };

    loadKatex();
  }, [content]);

  return (
    <div className="prose-cortex" ref={containerRef}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
