import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { localeAlternates } from "@/lib/seo/public";
import { LegalPage } from "@/features/legal/components/legal-page";

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return {
    title: `${dict["legal.terms.title"]} | ${dict["app.title"]}`,
    description: dict["legal.terms.intro"],
    alternates: {
      canonical: `/${resolved.locale}/terms`,
      languages: localeAlternates("/terms")
    },
    robots: { index: true, follow: true }
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return (
    <LegalPage
      dict={dict}
      intro={dict["legal.terms.intro"]}
      locale={resolved.locale}
      sections={[
        { heading: dict["legal.terms.s1.title"], body: dict["legal.terms.s1.body"] },
        { heading: dict["legal.terms.s2.title"], body: dict["legal.terms.s2.body"] },
        { heading: dict["legal.terms.s3.title"], body: dict["legal.terms.s3.body"] },
        { heading: dict["legal.developer.title"], body: dict["legal.developer.body"] }
      ]}
      title={dict["legal.terms.title"]}
    />
  );
}
