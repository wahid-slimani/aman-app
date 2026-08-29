import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { localeAlternates } from "@/lib/seo/public";
import { LegalPage } from "@/features/legal/components/legal-page";

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return {
    title: `${dict["legal.privacy.title"]} | ${dict["app.title"]}`,
    description: dict["legal.privacy.intro"],
    alternates: {
      canonical: `/${resolved.locale}/privacy`,
      languages: localeAlternates("/privacy")
    },
    robots: { index: true, follow: true }
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return (
    <LegalPage
      dict={dict}
      intro={dict["legal.privacy.intro"]}
      locale={resolved.locale}
      sections={[
        { heading: dict["legal.privacy.s1.title"], body: dict["legal.privacy.s1.body"] },
        { heading: dict["legal.privacy.s2.title"], body: dict["legal.privacy.s2.body"] },
        { heading: dict["legal.privacy.s3.title"], body: dict["legal.privacy.s3.body"] },
        { heading: dict["legal.developer.title"], body: dict["legal.developer.body"] }
      ]}
      title={dict["legal.privacy.title"]}
    />
  );
}
