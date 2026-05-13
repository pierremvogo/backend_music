import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const tags = [
    'Afrobeat',
    'Rap',
    'Hip-Hop',
    'Gospel',
    'Jazz',
    'Makossa',
    'R&B',
    'Pop',
    'Reggae',
    'Dancehall',
  ];

  const moods = [
    'Happy',
    'Sad',
    'Chill',
    'Energetic',
    'Romantic',
    'Motivated',
    'Calm',
    'Melancholic',
  ];

  await Promise.all(
    tags.map((tagName) =>
      prisma.tag.upsert({
        where: { slug: slugify(tagName) },
        update: { name: tagName },
        create: {
          name: tagName,
          slug: slugify(tagName),
        },
      }),
    ),
  );

  await Promise.all(
    moods.map((moodName) =>
      prisma.mood.upsert({
        where: { slug: slugify(moodName) },
        update: { name: moodName },
        create: { name: moodName, slug: slugify(moodName) },
      }),
    ),
  );

  console.log('Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
