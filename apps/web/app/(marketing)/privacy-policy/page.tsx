import { RiArrowLeftLine } from "@repo/ui/icon";
import Link from "next/link";

import { MarkdownRenderer } from "@/components/util/markdown/markdown-renderer";
import * as Button from "@repo/ui/button";
import { privacyPolicyContent } from "./content";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste below
// 3. Replace the data with your own (if needed)
// 4. Copy the markdown-formatted answer directly into the privacyPolicyContent variable

/*
You are an excellent lawyer specializing in privacy policies for TypeScript applications.

I need your help to write a privacy policy for my website. Here is some context:
- Website: https://${PROJECT.DOMAIN}
- Name: ${PROJECT.NAME}
- Description: ${PROJECT.DESCRIPTION}
- Company: ${PROJECT.COMPANY}
- User data collected: name, email and payment information
- Non-personal data collection: web cookies, TypeScript error logs
- Purpose of Data Collection: Order processing, error tracking
- Data sharing: we do not share the data with any third parties except for essential service providers
- Children's Privacy: we do not collect any data from children
- Updates to the Privacy Policy: users will be updated by email
- Contact information: ${PROJECT.HELP_EMAIL}

Please write a privacy policy that follows these formatting rules:
1. Use ### for main section titles
2. Use #### for subsections
3. Use ##### for sub-subsections if needed
4. Use proper markdown formatting:
   - **bold** for emphasis
   - - for bullet points
   - > for important notes/quotes
   - ``` for code examples if needed
5. Add the current date in YYYY-MM-DD format
6. Format all headings in Title Case

The policy should be clear, concise, and directly usable as markdown content. Do not add any explanations outside the policy itself.
*/

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl">
      <div className="p-5">
        <Button.Root asChild mode="ghost" variant="neutral">
          <Link href="/">
            <RiArrowLeftLine className="h-5 w-5" />
            Back
          </Link>
        </Button.Root>

        <MarkdownRenderer>{privacyPolicyContent}</MarkdownRenderer>
      </div>
    </main>
  );
}
