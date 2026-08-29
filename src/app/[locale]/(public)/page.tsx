import { PublicMapShell } from "@/features/map/components/public-map-shell";
import { getDictionary } from "@/i18n/dictionaries";
import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo/public";

type PublicMapPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PublicMapPageProps): Promise<Metadata> {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return {
    title: dict["seo.public.title"],
    description: dict["seo.public.description"],
    alternates: {
      canonical: `/${resolved.locale}`,
      languages: localeAlternates("")
    },
    openGraph: {
      title: dict["seo.public.title"],
      description: dict["seo.public.description"],
      type: "website",
      locale: resolved.locale
    },
    twitter: {
      card: "summary_large_image",
      title: dict["seo.public.title"],
      description: dict["seo.public.description"]
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function PublicMapPage({ params }: PublicMapPageProps) {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return <PublicMapShell dict={dict} locale={resolved.locale} />;
}
