import { getDictionary } from "@/i18n/dictionaries";
import AidPointForm from "@/features/organiser/components/aid-point-form";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export default async function OrganiserCreateAidPointPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return (
    <section className="p-0">
      <AidPointForm dict={dict} />
    </section>
  );
}
