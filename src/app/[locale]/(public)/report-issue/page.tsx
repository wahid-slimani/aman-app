import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { localeAlternates } from "@/lib/seo/public";
import ReportIssueForm from "@/features/public/components/report-issue-form";

type ReportIssuePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ReportIssuePageProps): Promise<Metadata> {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return {
    title: `${dict["reportIssue.title"]} | ${dict["app.title"]}`,
    description: dict["reportIssue.subtitle"],
    alternates: {
      canonical: `/${resolved.locale}/report-issue`,
      languages: localeAlternates("/report-issue")
    },
    robots: { index: true, follow: true }
  };
}

export default async function ReportIssuePage({ params }: ReportIssuePageProps) {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);

  return (
    <main className="min-h-dvh bg-[#f7f9f7] px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm md:p-7">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-[#006233]">{dict["reportIssue.title"]}</h1>
          <p className="mt-1 text-sm text-slate-600">{dict["reportIssue.subtitle"]}</p>
        </header>

        <ReportIssueForm dict={dict} locale={resolved.locale} />

        <div className="mt-5 border-t border-[#dfe7df] pt-4 text-sm">
          <Link className="font-semibold text-[#006233] underline" href={`/${resolved.locale}`}>
            {dict["nav.home"]}
          </Link>
        </div>
      </section>
    </main>
  );
}
