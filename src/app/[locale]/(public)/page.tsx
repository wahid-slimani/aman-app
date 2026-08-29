import { PublicMapShell } from "@/features/map/components/public-map-shell";
import { getDictionary } from "@/i18n/dictionaries";

type PublicMapPageProps = {
  params: {
    locale: string;
  };
};

export default function PublicMapPage({ params }: PublicMapPageProps) {
  const dict = getDictionary(params.locale);

  return <PublicMapShell dict={dict} locale={params.locale} />;
}
