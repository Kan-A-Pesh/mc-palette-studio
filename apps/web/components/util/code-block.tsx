"use client";

import { RiCheckFill, RiFileCopyLine } from "@repo/ui/icon";
import isEqual from "fast-deep-equal";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { type FC, memo, Suspense, useCallback, useMemo, useState } from "react";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import * as Button from "@repo/ui/button";
import * as Tooltip from "@repo/ui/tooltip";
import { cn } from "@repo/ui/utils/cn";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  { ssr: false },
);

interface CodeBlockProps {
  language?: string | null;
  value: string;
  className?: string;
}

const CodeBlockComponent: FC<CodeBlockProps> = ({
  language,
  value,
  className,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Silently handle copy error
    }
  }, [value]);

  const displayLanguage = language
    ? language.charAt(0).toUpperCase() + language.slice(1)
    : "Code";

  const syntaxTheme = useMemo(() => {
    const baseSyntaxTheme = resolvedTheme === "dark" ? oneDark : oneLight;
    return {
      ...baseSyntaxTheme,
      'pre[class*="language-"]': {
        ...baseSyntaxTheme['pre[class*="language-"]'],
        background: "transparent",
      },
    };
  }, [resolvedTheme]);

  return (
    <div
      className={cn(
        "relative mb-4 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 pt-10 font-mono text-paragraph-sm text-text-strong-950",
        className,
      )}
    >
      <span className="absolute top-2 left-2 select-none rounded bg-bg-soft-200 px-2 py-0.5 font-sans text-label-xs text-text-sub-600">
        {displayLanguage}
      </span>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button.Root
            className="absolute top-1.5 right-2 z-10 font-sans"
            mode="ghost"
            onClick={handleCopy}
            size="xxsmall"
            variant="neutral"
          >
            {isCopied ? (
              <Button.Icon as={RiCheckFill} className="text-success-base" />
            ) : (
              <Button.Icon as={RiFileCopyLine} />
            )}
            <span className="ml-1.5">{isCopied ? "Copied" : "Copy"}</span>
          </Button.Root>
        </Tooltip.Trigger>
        <Tooltip.Content side="left">
          <p className="font-sans">Copy to clipboard</p>
        </Tooltip.Content>
      </Tooltip.Root>
      <Suspense
        fallback={
          <pre
            className="m-0 whitespace-pre-wrap p-4 font-mono text-paragraph-sm"
            style={{ backgroundColor: "transparent" }}
          >
            {value.trimEnd()}
          </pre>
        }
      >
        <SyntaxHighlighter
          codeTagProps={{
            style: {
              fontFamily: "inherit",
              fontSize: "inherit",
            },
          }}
          customStyle={{
            margin: 0,
            padding: "1rem",
            backgroundColor: "transparent",
            borderRadius: "0.5rem",
            overflowX: "auto",
            fontFamily: "inherit",
            fontSize: "inherit",
          }}
          language={language ?? "text"}
          showLineNumbers={false}
          style={syntaxTheme}
          wrapLines={false}
          wrapLongLines={false}
        >
          {value.trimEnd()}
        </SyntaxHighlighter>
      </Suspense>
    </div>
  );
};

export const CodeBlock = memo(CodeBlockComponent, (prevProps, nextProps) => {
  return isEqual(prevProps, nextProps);
});
CodeBlock.displayName = "CodeBlock";
