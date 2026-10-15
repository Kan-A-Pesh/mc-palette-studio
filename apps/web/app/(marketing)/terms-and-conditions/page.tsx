import { RiArrowLeftLine } from "@repo/ui/icon";
import Link from "next/link";

import { MarkdownRenderer } from "@/components/util/markdown/markdown-renderer";
import * as Button from "@repo/ui/button";
import { termsAndConditionsContent } from "./content";

// CHATGPT PROMPT TO GENERATE YOUR TERMS AND CONDITIONS — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste below
// 3. Replace the placeholders marked with <...> with your own data
// 4. Copy the markdown-formatted answer directly into the termsAndConditionsContent variable

// HOW TO FIND YOUR PROJECT DESCRIPTION:
// - Search the codebase for README.md files, package.json "description" fields, or marketing copy
// - Look at the landing page (apps/web/app/(marketing)/page.tsx) for product messaging
// - Check any existing documentation in .cursor/rules/ for project context
//
// DESCRIPTION REQUIREMENTS:
// - Length: 1-2 sentences, maximum 30 words
// - Tone: Professional, clear, and factual (avoid marketing buzzwords)
// - Structure: "[Product name] is a [type of product] that [core functionality]"
// - Include: The primary purpose and main feature of the application
// - Exclude: Pricing information, technical stack details, superlatives ("best", "fastest")
// - Example: "A SaaS platform that enables teams to collaborate on documents in real-time"

/*
You are an excellent lawyer specializing in terms and conditions for TypeScript applications.

I need your help to write terms and conditions for my website. Here is some context:
- Website: https://<insert your domain here, e.g., example.com>
- Name: <insert your product name here>
- Description: <insert your product description here — see DESCRIPTION REQUIREMENTS above>
- Company: <insert your company legal name here>
- Services provided: <describe your services, e.g., SaaS application with user accounts and subscriptions>
- User obligations: <list what users must do, e.g., provide accurate information, not misuse the service>
- Payment terms: <describe billing model, e.g., subscription-based billing, one-time purchase, free tier>
- Refund policy: <describe refund terms, e.g., 30-day money-back guarantee, no refunds, pro-rata refunds>
- Intellectual property: <who owns what, e.g., all content and code belong to the company, user-generated content ownership>
- Limitation of liability: <liability caps, e.g., limited to fees paid in last 12 months>
- Termination conditions: <when accounts can be terminated, e.g., for violations, non-payment, at will>
- Governing law: <your legal jurisdiction, e.g., State of California, United States>
- Contact information: <support email address>

Please write terms and conditions that follow these formatting rules:
1. Use ## for main section titles
2. Use ### for subsections
3. Use #### for sub-subsections if needed
4. Use proper markdown formatting:
   - **bold** for emphasis
   - - for bullet points
   - > for important notes/quotes
5. Add the current date in YYYY-MM-DD format
6. Format all headings in Title Case

The terms should be clear, concise, and directly usable as markdown content. Do not add any explanations outside the terms themselves.
*/

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <div className="p-5">
        <Button.Root asChild mode="ghost" variant="neutral">
          <Link href="/">
            <RiArrowLeftLine className="h-5 w-5" />
            Back
          </Link>
        </Button.Root>

        <MarkdownRenderer>{termsAndConditionsContent}</MarkdownRenderer>
      </div>
    </main>
  );
}
