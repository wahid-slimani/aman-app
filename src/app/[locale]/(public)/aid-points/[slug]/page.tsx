import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicAidPoint } from "@/domain/aid-points/service";
import { getDictionary } from "@/i18n/dictionaries";
import { aidPointJsonLd, localeAlternates } from "@/lib/seo/public";

type AidPointPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

function isIndexableOperationalStatus(status: string) {
  return status === "OPEN";
}

export async function generateMetadata({ params }: AidPointPageProps): Promise<Metadata> {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);
  const point = await getPublicAidPoint(resolved.slug);

  if (!point) {
    return {
      title: dict["seo.aidPoint.missingTitle"],
      description: dict["seo.aidPoint.missingDescription"],
      robots: { index: false, follow: false }
    };
  }

  const translation = point.translations.find((item) => item.locale === resolved.locale) ?? point.translations[0];
  if (!translation) {
    return {
      title: dict["seo.aidPoint.missingTitle"],
      description: dict["seo.aidPoint.missingDescription"],
      robots: { index: false, follow: false }
    };
  }

  const indexable = isIndexableOperationalStatus(point.operationalStatus);
  const title = `${translation.name} | ${dict["app.title"]}`;
  const description = translation.description ?? `${translation.address} - ${translation.wilaya}`;
  const pathname = `/${resolved.locale}/aid-points/${point.publicSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
      languages: localeAlternates(`/aid-points/${point.publicSlug}`)
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: resolved.locale,
      url: pathname
    },
    twitter: {
      card: "summary",
      title,
      description
    },
    robots: {
      index: indexable,
      follow: indexable
    }
  };
}

export default async function AidPointSeoPage({ params }: AidPointPageProps) {
  const resolved = await params;
  const dict = getDictionary(resolved.locale);
  const point = await getPublicAidPoint(resolved.slug);

  if (!point) {
    notFound();
  }

  const translation = point.translations.find((item) => item.locale === resolved.locale) ?? point.translations[0];
  if (!translation) {
    notFound();
  }

  const schema = aidPointJsonLd({
    locale: resolved.locale,
    name: translation.name,
    description: translation.description,
    address: translation.address,
    wilaya: translation.wilaya,
    commune: translation.commune,
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
    phone: point.primaryPhone,
    pagePath: `/${resolved.locale}/aid-points/${point.publicSlug}`
  });

  return (
    <main className="min-h-dvh bg-slate-100 p-4 md:p-6">
      <section className="mx-auto w-full max-w-4xl space-y-4 rounded-2xl bg-white p-5 shadow-sm" id="aid-point-seo-root">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">{translation.name}</h1>
          <p className="mt-1 text-sm text-slate-600">{translation.wilaya} - {translation.commune}</p>
        </header>
        <p className="text-sm text-slate-700">{translation.description ?? translation.address}</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a className="font-semibold text-[#006233] underline" href={`/${resolved.locale}`}>
            {dict["nav.home"]}
          </a>
          <a className="font-semibold text-[#006233] underline" href={`/${resolved.locale}/report-issue`}>
            {dict["nav.reportIssue"]}
          </a>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-900">{dict["public.address"]}</dt>
            <dd className="text-slate-700">{translation.address}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">{dict["public.status"]}</dt>
            <dd className="text-slate-700">{dict[`aidPoint.status.${point.operationalStatus}`] ?? point.operationalStatus}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">{dict["public.phone"]}</dt>
            <dd>
              <a className="text-slate-900 underline" href={`tel:${point.primaryPhone}`}>
                {point.primaryPhone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900">{dict["public.map"]}</dt>
            <dd>
              <a className="text-slate-900 underline" href={point.googleMapsUrl ?? `https://www.google.com/maps?q=${point.latitude},${point.longitude}`} rel="noreferrer" target="_blank">
                {dict["public.openMaps"]}
              </a>
            </dd>
          </div>
          {translation.neededItems ? (
            <div className="sm:col-span-2">
              <dt className="font-medium text-slate-900">{dict["aidPoint.form.neededItems"]}</dt>
              <dd className="whitespace-pre-line text-slate-700">{translation.neededItems}</dd>
            </div>
          ) : null}
        </dl>
      </section>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema)
        }}
        type="application/ld+json"
      />
    </main>
  );
}
