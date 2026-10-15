import { RiErrorWarningFill } from "@repo/ui/icon";
import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "../code-block";
import * as Alert from "@repo/ui/alert";
import { cn } from "@repo/ui/utils/cn";
import "./markdown-typing-cursor.css";

const LANGUAGE_REGEX = /language-(\w+)/;
const TRAILING_NEWLINE_REGEX = /\n$/;

interface MarkdownProps {
  children: string;
  className?: string;
  typing?: boolean;
}

const components: Partial<Components> = {
  h1: ({ children, ...props }) => (
    <h1 className="mb-6 text-title-h5" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mb-5 text-title-h6" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mb-4 text-label-md" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 text-paragraph-md first:mt-1" {...props}>
      {children}
    </p>
  ),
  code: ({ className, children, ...props }) => {
    const match = LANGUAGE_REGEX.exec(className || "");
    const codeValue = String(children).replace(TRAILING_NEWLINE_REGEX, "");
    const isCodeBlock = Boolean(className);

    if (isCodeBlock) {
      return (
        <CodeBlock language={match && match[1]} value={codeValue} {...props} />
      );
    }
    // Inline code
    return (
      <code
        className="rounded-md bg-bg-soft-200 px-1 py-0.5 font-mono text-paragraph-sm"
        {...props}
      >
        {codeValue}
      </code>
    );
  },
  ul: ({ children, ...props }) => (
    <ul
      className="mb-4 ml-4 list-outside list-disc space-y-2 text-paragraph-md"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mb-4 ml-4 list-outside list-decimal space-y-2 text-paragraph-md"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-paragraph-md" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  a: ({ children, href, ...props }) => (
    <a
      className="text-primary-base hover:underline"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-4 border-stroke-sub-300 border-l-4 pl-4 text-paragraph-md text-text-sub-600 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-stroke-soft-200">
      <table className="min-w-full divide-y divide-stroke-soft-200" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => <thead {...props}>{children}</thead>,
  tbody: ({ children, ...props }) => (
    <tbody className="divide-y divide-stroke-soft-200 bg-bg-weak-50" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
  th: ({ children, ...props }) => (
    <th
      className="bg-bg-soft-200 px-3 py-2 text-left text-label-xs text-text-sub-600 uppercase first:rounded-tl-lg last:rounded-tr-lg"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="whitespace-nowrap px-3 py-2 text-paragraph-md text-text-strong-950"
      {...props}
    >
      {children}
    </td>
  ),
  hr: ({ ...props }) => (
    <hr className="my-4 border-stroke-soft-200 border-t" {...props} />
  ),
  span: ({ children, datatype, ...props }) => {
    if (datatype === "error") {
      return (
        <Alert.Root className="mt-3" status="error" variant="lighter">
          <Alert.Icon as={RiErrorWarningFill} />
          <span {...props}>{children}</span>
        </Alert.Root>
      );
    }

    return <span {...props}>{children}</span>;
  },
};

const remarkPlugins = [remarkGfm];

const PureMarkdownRenderer = ({
  children,
  className,
  typing = false,
}: MarkdownProps) => {
  return (
    <div className={cn("max-w-none", typing && "md-typing", className)}>
      <ReactMarkdown components={components} remarkPlugins={remarkPlugins}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const MarkdownRenderer = memo(
  PureMarkdownRenderer,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.typing === nextProps.typing,
);
