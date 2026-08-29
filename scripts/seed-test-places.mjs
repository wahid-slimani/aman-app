import crypto from "node:crypto";
import { PrismaClient, Prisma } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

const SEED_USERNAMES = ["organiser", "organiser-wahid"];

const DEV_USERS = [
  {
    username: "wahid-slimani",
    password: "12!?waHid21!?",
    role: "SUPER_ADMIN",
    displayName: "Wahid Slimani"
  },
  {
    username: "organiser",
    password: "organiser123",
    role: "ORGANISER",
    displayName: "Default Organiser"
  },
  {
    username: "organiser-wahid",
    password: "12!?orgaNiser21!?",
    role: "ORGANISER",
    displayName: "Wahid Slimani Organiser"
  }
];

const TEST_PLACES = [
  {
    publicSlug: "test-alger-centre-1",
    owner: "organiser",
    publicationStatus: "DRAFT",
    operationalStatus: "NEEDS_VERIFICATION",
    latitude: 36.753768,
    longitude: 3.058756,
    primaryPhone: "+213555100101",
    secondaryPhone: "+213555100102",
    whatsappPhone: "+213555100101",
    googleMapsUrl: "https://maps.google.com/?q=36.753768,3.058756",
    translations: [
      { locale: "ar-DZ", name: "مركز جمع الجزائر", address: "نهج ديدوش مراد", wilaya: "الجزائر", commune: "سيدي امحمد", description: "نقطة اختبار في وسط الجزائر" },
      { locale: "fr-DZ", name: "Centre collecte Alger", address: "Rue Didouche Mourad", wilaya: "Alger", commune: "Sidi Mhamed", description: "Point de test au centre-ville" },
      { locale: "tzm-DZ", name: "Tanqiḍt n leqdic deg Dzayer", address: "Abrid Didouche Mourad", wilaya: "Dzayer", commune: "Sidi Mhamed", description: "Tanqiḍt n ukyes i usekyed" }
    ]
  },
  {
    publicSlug: "test-oran-port-1",
    owner: "organiser-wahid",
    publicationStatus: "PUBLISHED",
    operationalStatus: "OPEN",
    latitude: 35.70811,
    longitude: -0.634841,
    primaryPhone: "+213555200101",
    secondaryPhone: "+213555200102",
    whatsappPhone: "+213555200101",
    googleMapsUrl: "https://maps.google.com/?q=35.70811,-0.634841",
    translations: [
      { locale: "ar-DZ", name: "نقطة وهران الميناء", address: "حي الصديقية", wilaya: "وهران", commune: "وهران", description: "مفتوحة يوميا من 9 الى 18" },
      { locale: "fr-DZ", name: "Point Oran Port", address: "Quartier Es-Seddikia", wilaya: "Oran", commune: "Oran", description: "Ouvert tous les jours de 9h a 18h" },
      { locale: "tzm-DZ", name: "Tanqiḍt n Wahran", address: "Es-Seddikia", wilaya: "Wahran", commune: "Wahran", description: "Yeldi yal ass seg 9 ar 18" }
    ]
  },
  {
    publicSlug: "test-constantine-bridge-1",
    owner: "organiser",
    publicationStatus: "PENDING_REVIEW",
    operationalStatus: "OPEN",
    latitude: 36.365,
    longitude: 6.614722,
    primaryPhone: "+213555300101",
    secondaryPhone: null,
    whatsappPhone: "+213555300101",
    googleMapsUrl: "https://maps.google.com/?q=36.365,6.614722",
    translations: [
      { locale: "ar-DZ", name: "نقطة قسنطينة الجسر", address: "قرب جسر سيدي مسيد", wilaya: "قسنطينة", commune: "قسنطينة", description: "قيد المراجعة" },
      { locale: "fr-DZ", name: "Point Constantine Pont", address: "Pres du pont Sidi M'Cid", wilaya: "Constantine", commune: "Constantine", description: "En attente de revue" },
      { locale: "tzm-DZ", name: "Tanqiḍt n Qsanṭina", address: "Sdat uqerruy Sidi M'Cid", wilaya: "Qsanṭina", commune: "Qsanṭina", description: "Yetturaǧu asenqed" }
    ]
  },
  {
    publicSlug: "test-annaba-nord-1",
    owner: "organiser-wahid",
    publicationStatus: "DRAFT",
    operationalStatus: "FULL",
    latitude: 36.9042,
    longitude: 7.75604,
    primaryPhone: "+213555400101",
    secondaryPhone: "+213555400102",
    whatsappPhone: null,
    googleMapsUrl: "https://maps.google.com/?q=36.9042,7.75604",
    translations: [
      { locale: "ar-DZ", name: "نقطة عنابة الشمالية", address: "طريق الشاطئ", wilaya: "عنابة", commune: "عنابة", description: "القدرة ممتلئة حاليا" },
      { locale: "fr-DZ", name: "Point Annaba Nord", address: "Route de la plage", wilaya: "Annaba", commune: "Annaba", description: "Capacite complete pour le moment" },
      { locale: "tzm-DZ", name: "Tanqiḍt n Annaba n ugafa", address: "Abrid n yilel", wilaya: "Annaba", commune: "Annaba", description: "Yeccur akka tura" }
    ]
  },
  {
    publicSlug: "test-setif-haut-1",
    owner: "organiser",
    publicationStatus: "PUBLISHED",
    operationalStatus: "TEMPORARILY_CLOSED",
    latitude: 36.191113,
    longitude: 5.413733,
    primaryPhone: "+213555500101",
    secondaryPhone: null,
    whatsappPhone: "+213555500101",
    googleMapsUrl: "https://maps.google.com/?q=36.191113,5.413733",
    translations: [
      { locale: "ar-DZ", name: "نقطة سطيف العليا", address: "حي الهضاب", wilaya: "سطيف", commune: "سطيف", description: "مغلقة مؤقتا للصيانة" },
      { locale: "fr-DZ", name: "Point Setif Haut", address: "Quartier El Hidhab", wilaya: "Setif", commune: "Setif", description: "Ferme temporairement pour maintenance" },
      { locale: "tzm-DZ", name: "Tanqiḍt n Sṭif ufella", address: "El Hidhab", wilaya: "Sṭif", commune: "Sṭif", description: "Yemdel i kra n wakud" }
    ]
  },
  {
    publicSlug: "test-tlemcen-west-1",
    owner: "organiser-wahid",
    publicationStatus: "DRAFT",
    operationalStatus: "OPEN",
    latitude: 34.878445,
    longitude: -1.31502,
    primaryPhone: "+213555600101",
    secondaryPhone: "+213555600102",
    whatsappPhone: "+213555600101",
    googleMapsUrl: "https://maps.google.com/?q=34.878445,-1.31502",
    translations: [
      { locale: "ar-DZ", name: "نقطة تلمسان الغربية", address: "وسط المدينة", wilaya: "تلمسان", commune: "تلمسان", description: "نقطة جديدة للاختبار" },
      { locale: "fr-DZ", name: "Point Tlemcen Ouest", address: "Centre ville", wilaya: "Tlemcen", commune: "Tlemcen", description: "Nouveau point de test" },
      { locale: "tzm-DZ", name: "Tanqiḍt n Tlemsan tama tazelmaḍt", address: "Talmast n temdint", wilaya: "Tlemsan", commune: "Tlemsan", description: "Tanqiḍt tamaynut i usekyed" }
    ]
  }
];

function makeAidPointId() {
  return `c${crypto.randomBytes(20).toString("hex")}`;
}

async function hashPassword(password) {
  return hash(password, {
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1
  });
}

async function ensureDevUsers() {
  for (const user of DEV_USERS) {
    const usernameNorm = user.username.trim().toLowerCase();
    const passwordHash = await hashPassword(user.password);

    await prisma.user.upsert({
      where: { usernameNorm },
      create: {
        username: user.username,
        usernameNorm,
        passwordHash,
        role: user.role,
        status: "ACTIVE",
        organiser:
          user.role === "ORGANISER"
            ? {
                create: {
                  displayName: user.displayName
                }
              }
            : undefined
      },
      update: {
        username: user.username,
        passwordHash,
        role: user.role,
        status: "ACTIVE",
        organiser:
          user.role === "ORGANISER"
            ? {
                upsert: {
                  create: {
                    displayName: user.displayName
                  },
                  update: {
                    displayName: user.displayName
                  }
                }
              }
            : undefined
      }
    });
  }
}

async function upsertAidPoint(place, organiserId) {
  const now = new Date();
  const publishedAt = place.publicationStatus === "PUBLISHED" ? now : null;

  const existing = await prisma.aidPoint.findUnique({
    where: { publicSlug: place.publicSlug },
    select: { id: true, version: true }
  });

  const aidPointId = existing?.id ?? makeAidPointId();

  if (existing) {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "AidPoint"
      SET "organiserId" = ${organiserId},
          "publicationStatus" = ${place.publicationStatus}::"PublicationStatus",
          "operationalStatus" = ${place.operationalStatus}::"OperationalStatus",
          latitude = ${place.latitude},
          longitude = ${place.longitude},
          location = ST_SetSRID(ST_MakePoint(${place.longitude}, ${place.latitude}), 4326)::geography,
          "primaryPhone" = ${place.primaryPhone},
          "secondaryPhone" = ${place.secondaryPhone},
          "whatsappPhone" = ${place.whatsappPhone},
          "googleMapsUrl" = ${place.googleMapsUrl},
          "publishedAt" = ${publishedAt},
          "archivedAt" = NULL,
          "updatedAt" = ${now},
          version = ${existing.version + 1}
      WHERE id = ${aidPointId}
    `);
  } else {
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "AidPoint" (
        id, "publicSlug", "organiserId", "publicationStatus", "operationalStatus",
        latitude, longitude, location,
        "primaryPhone", "secondaryPhone", "whatsappPhone", "googleMapsUrl",
        version, "publishedAt", "createdAt", "updatedAt"
      ) VALUES (
        ${aidPointId}, ${place.publicSlug}, ${organiserId}, ${place.publicationStatus}::"PublicationStatus", ${place.operationalStatus}::"OperationalStatus",
        ${place.latitude}, ${place.longitude}, ST_SetSRID(ST_MakePoint(${place.longitude}, ${place.latitude}), 4326)::geography,
        ${place.primaryPhone}, ${place.secondaryPhone}, ${place.whatsappPhone}, ${place.googleMapsUrl},
        1, ${publishedAt}, ${now}, ${now}
      )
    `);
  }

  for (const translation of place.translations) {
    await prisma.aidPointTranslation.upsert({
      where: {
        aidPointId_locale: {
          aidPointId,
          locale: translation.locale
        }
      },
      create: {
        aidPointId,
        locale: translation.locale,
        name: translation.name,
        address: translation.address,
        wilaya: translation.wilaya,
        commune: translation.commune,
        description: translation.description
      },
      update: {
        name: translation.name,
        address: translation.address,
        wilaya: translation.wilaya,
        commune: translation.commune,
        description: translation.description
      }
    });
  }

  return { aidPointId, created: !existing };
}

async function main() {
  await ensureDevUsers();

  const organisers = await prisma.organiserProfile.findMany({
    where: {
      user: {
        usernameNorm: {
          in: SEED_USERNAMES
        }
      }
    },
    select: {
      id: true,
      user: {
        select: {
          usernameNorm: true
        }
      }
    }
  });

  const organiserMap = new Map(organisers.map((item) => [item.user.usernameNorm, item.id]));
  const missingUsers = SEED_USERNAMES.filter((username) => !organiserMap.has(username));

  if (missingUsers.length > 0) {
    throw new Error(`Missing organiser profiles for: ${missingUsers.join(", ")}. Run /api/auth/dev-seed first.`);
  }

  let created = 0;
  let updated = 0;

  for (const place of TEST_PLACES) {
    const organiserId = organiserMap.get(place.owner);
    if (!organiserId) {
      throw new Error(`No organiser id for ${place.owner}`);
    }

    const result = await upsertAidPoint(place, organiserId);
    if (result.created) {
      created += 1;
    } else {
      updated += 1;
    }
  }

  process.stdout.write(`Seed complete. Created: ${created}, Updated: ${updated}, Total: ${TEST_PLACES.length}\n`);
}

main()
  .catch((error) => {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
