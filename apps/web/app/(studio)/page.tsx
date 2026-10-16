import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import Studio from "./_components/studio";

export const metadata: Metadata = {
  title: { absolute: SITE.TITLE },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.NAME,
    url: SITE.URL,
    description: SITE.DESCRIPTION,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Static object built above: no user input reaches this script.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">{SITE.TITLE}</h1>
      <Studio />
    </>
  );
}
