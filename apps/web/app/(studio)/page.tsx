import type { Metadata } from "next";
import { paletteShareMetadata } from "@/lib/og/palette-share-metadata";
import { SITE } from "@/lib/site";
import Studio from "./_components/studio";

interface HomePageProps {
  searchParams: Promise<{ p?: string | string[] }>;
}

export const generateMetadata = async ({
  searchParams,
}: HomePageProps): Promise<Metadata> => {
  const { p } = await searchParams;
  const shared = typeof p === "string" ? paletteShareMetadata(p) : null;
  return {
    title: { absolute: SITE.TITLE },
    ...shared,
    alternates: { canonical: "/" },
  };
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
