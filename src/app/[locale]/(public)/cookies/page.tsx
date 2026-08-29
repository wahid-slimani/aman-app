import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { localeAlternates } from "@/lib/seo/public";
import { LegalPage } from "@/features/legal/components/legal-page";

type CookiesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: CookiesPageProps): Promise<Metadata> {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return {
    title: `${dict["legal.cookies.title"]} | ${dict["app.title"]}`,
    description: dict["legal.cookies.intro"],
    alternates: {
      canonical: `/${resolved.locale}/cookies`,
      languages: localeAlternates("/cookies")
    },
    robots: { index: true, follow: true }
  };
}

export default async function CookiesPage({ params }: CookiesPageProps) {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return (
    <LegalPage
      dict={dict}
      intro={dict["legal.cookies.intro"]}
      locale={resolved.locale}
      sections={[
        { heading: dict["legal.cookies.s1.title"], body: dict["legal.cookies.s1.body"] },
        { heading: dict["legal.cookies.s2.title"], body: dict["legal.cookies.s2.body"] },
        { heading: dict["legal.cookies.s3.title"], body: dict["legal.cookies.s3.body"] },
        { heading: dict["legal.developer.title"], body: dict["legal.developer.body"] }
      ]}
      title={dict["legal.cookies.title"]}
    />
  );
}
