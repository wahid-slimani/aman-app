type AidPointPageProps = {
  params: { slug: string };
};

export default function AidPointSeoPage({ params }: AidPointPageProps) {
  return <main data-slug={params.slug} id="aid-point-seo-root" />;
}
