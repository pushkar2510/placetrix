import React from "react";
import { cn } from "@/lib/utils";

// Inline Markdown Parser
function parseInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className={cn('font-bold', 'text-foreground')}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className={cn('bg-muted/70', 'border', 'border-border/40', 'px-1.5', 'py-0.5', 'rounded-md', 'text-xs', 'font-mono', 'text-zinc-900 dark:text-foreground/90')}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Robust Custom Markdown Renderer with Operator Replacements
export function ProblemDescriptionViewer({ content }: { content: string }) {
  if (!content) return null;

  let formatted = content
    .replace(/<=/g, " ≤ ")
    .replace(/>=/g, " ≥ ")
    .replace(/!=/g, " ≠ ")
    .replace(/->/g, " → ")
    .replace(/==/g, " ＝ ");

  const blocks = formatted.split(/(```[\s\S]*?```)/g);

  return (
    <div className={cn('text-zinc-800 dark:text-foreground/80', 'leading-relaxed', 'text-sm', 'space-y-4', 'font-sans')}>
      {blocks.map((block, idx) => {
        if (block.startsWith("```")) {
          const match = block.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "";
          const codeText = match ? match[2] : block.slice(3, -3);
          return (
            <div
              key={idx}
              className={cn('bg-muted/30', 'border', 'border-border/50', 'rounded-lg', 'overflow-hidden', 'my-3.5', 'font-mono', 'text-xs')}
            >
              {lang && (
                <div className={cn('bg-muted/40', 'px-3', 'py-1.5', 'border-b', 'border-border/40', 'text-[10px]', 'text-zinc-600 dark:text-muted-foreground/80', 'uppercase', 'tracking-widest', 'font-bold')}>
                  {lang}
                </div>
              )}
              <pre className={cn('p-3.5', 'overflow-x-auto', 'text-zinc-900 dark:text-foreground/90', 'whitespace-pre', 'scrollbar-thin')}>
                {codeText.trim()}
              </pre>
            </div>
          );
        }

        const lines = block.split("\n");
        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;

              if (trimmed.startsWith("### ")) {
                return (
                  <h3
                    key={lIdx}
                    className={cn('text-sm', 'font-bold', 'text-foreground', 'uppercase', 'tracking-wider', 'mt-4', 'mb-2')}
                  >
                    {parseInline(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={lIdx}
                    className={cn('text-base', 'font-bold', 'text-foreground', 'uppercase', 'tracking-wider', 'mt-5', 'mb-2', 'border-b', 'border-border/80', 'pb-1')}
                  >
                    {parseInline(trimmed.slice(3))}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h1
                    key={lIdx}
                    className={cn('text-lg', 'font-bold', 'text-foreground', 'uppercase', 'tracking-wider', 'mt-6', 'mb-3', 'border-b', 'border-border/80', 'pb-1')}
                  >
                    {parseInline(trimmed.slice(2))}
                  </h1>
                );
              }

              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <ul
                    key={lIdx}
                    className={cn('list-disc', 'pl-5', 'space-y-1', 'text-zinc-600 dark:text-muted-foreground')}
                  >
                    <li>{parseInline(trimmed.slice(2))}</li>
                  </ul>
                );
              }

              const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
              if (numMatch) {
                return (
                  <ol
                    key={lIdx}
                    className={cn('list-decimal', 'pl-5', 'space-y-1', 'text-zinc-600 dark:text-muted-foreground')}
                  >
                    <li value={parseInt(numMatch[1])}>
                      {parseInline(numMatch[2])}
                    </li>
                  </ol>
                );
              }

              if (trimmed.startsWith("> ")) {
                return (
                  <blockquote
                    key={lIdx}
                    className={cn('border-l-2', 'border-zinc-400 dark:border-zinc-500', 'bg-muted/20', 'px-4', 'py-2.5', 'rounded-r-md', 'text-zinc-650 dark:text-muted-foreground', 'text-sm', 'italic', 'my-3')}
                  >
                    {parseInline(trimmed.slice(2))}
                  </blockquote>
                );
              }

              if (trimmed === "---" || trimmed === "***") {
                return <hr key={lIdx} className={cn('border-border', 'my-4')} />;
              }

              return (
                <p key={lIdx} className={cn('text-zinc-800 dark:text-foreground/80', 'leading-relaxed')}>
                  {parseInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
