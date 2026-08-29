import { getDictionary } from "@/i18n/dictionaries";
import { prisma } from "@/infrastructure/database/prisma";
import { getRequestAuth } from "@/lib/security/request-auth";
import { notFound } from "next/navigation";
import AidPointForm from "@/features/organiser/components/aid-point-form";
import { getRequestLocale } from "@/lib/i18n/request-locale";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrganiserEditAidPointPage({ params }: Props) {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const resolved = await params;
  const auth = await getRequestAuth();

  if (!auth) {
    notFound();
  }

  const organiser = await prisma.organiserProfile.findUnique({ where: { userId: auth.sub }, select: { id: true } });
  if (!organiser) {
    notFound();
  }

  const point = await prisma.aidPoint.findFirst({
    where: { id: resolved.id, organiserId: organiser.id },
    include: { translations: true }
  });

  if (!point) {
    notFound();
  }

  return (
    <section className="p-0">
      <AidPointForm
        dict={dict}
        initialId={point.id}
        initialData={{
          publicSlug: point.publicSlug,
          primaryPhone: point.primaryPhone,
          secondaryPhone: point.secondaryPhone,
          whatsappPhone: point.whatsappPhone,
          googleMapsUrl: point.googleMapsUrl,
          latitude: Number(point.latitude),
          longitude: Number(point.longitude),
          version: point.version,
          translations: point.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            address: t.address,
            wilaya: t.wilaya,
            commune: t.commune,
            description: t.description,
            neededItems: t.neededItems
          }))
        }}
      />
    </section>
  );
}
