import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EXAMPLE_LISTINGS,
  EXAMPLE_PROFILES,
  SEED_COUNTS,
} from '../../scripts/seed-data';

const root = resolve(__dirname, '../..');
const seedSql = readFileSync(resolve(root, 'supabase/seed.sql'), 'utf8');
const imageRegistry = readFileSync(resolve(root, 'assets/images/README.md'), 'utf8');
const seedScript = readFileSync(resolve(root, 'scripts/seed-example-data.ts'), 'utf8');

describe('datos de ejemplo', () => {
  it('define los perfiles y alojamientos reproducibles esperados', () => {
    expect(EXAMPLE_PROFILES).toHaveLength(SEED_COUNTS.profiles);
    expect(EXAMPLE_LISTINGS).toHaveLength(SEED_COUNTS.listings);
    expect(new Set(EXAMPLE_LISTINGS.map(({ id }) => id)).size).toBe(EXAMPLE_LISTINGS.length);
    expect(EXAMPLE_LISTINGS.every(({ pricePerNight }) => Number.isInteger(pricePerNight))).toBe(true);
    expect(EXAMPLE_LISTINGS.filter(({ images }) => images.length > 1)).toHaveLength(1);
    expect(EXAMPLE_LISTINGS.filter(({ images }) => images.length === 0)).toHaveLength(2);
    expect(EXAMPLE_LISTINGS.filter(({ availability }) => availability.length === 0)).toHaveLength(1);
    expect(EXAMPLE_LISTINGS.flatMap(({ availability }) => availability)).toHaveLength(
      SEED_COUNTS.availability,
    );
    for (const day of EXAMPLE_LISTINGS.flatMap(({ availability }) => availability)) {
      expect(seedSql).toContain(day.id);
    }
    expect(seedSql).not.toMatch(/insert\s+into\s+public\.reservations/i);
  });

  it('mantiene URLs, licencias y atribuciones documentadas', () => {
    const images = EXAMPLE_LISTINGS.flatMap(({ images }) => images);

    expect(images).toHaveLength(SEED_COUNTS.images);
    for (const image of images) {
      expect(image.sourceUrl).toMatch(/^https:\/\/(images\.unsplash\.com|images\.pexels\.com)\//);
      expect(image.license.trim()).not.toBe('');
      expect(image.attribution.trim()).not.toBe('');
      expect(imageRegistry).toContain(image.sourceUrl);
      expect(imageRegistry).toContain(image.attribution);
      expect(seedSql).toContain(image.sourceUrl);
      expect(seedSql).toContain(image.attribution);
    }

    expect(seedSql).toContain('source_url');
    expect(seedSql).toContain('license');
    expect(seedSql).toContain('attribution');
  });

  it('incluye los UUIDs del fixture en el seed SQL y no marcas de terceros', () => {
    for (const profile of EXAMPLE_PROFILES) expect(seedSql).toContain(profile.id);
    for (const listing of EXAMPLE_LISTINGS) expect(seedSql).toContain(listing.id);
    expect(seedSql.toLowerCase()).not.toMatch(/airbnb|booking\.com|vrbo/);
    expect(imageRegistry.toLowerCase()).not.toMatch(/airbnb|booking\.com|vrbo/);
  });

  it('carga la nube con la clave pública y credenciales tomadas del entorno', () => {
    expect(seedScript).toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(seedScript).toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY');
    expect(seedScript).toContain('DEMO_EMAIL');
    expect(seedScript).toContain('DEMO_PASSWORD');
    expect(seedScript).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(seedScript).not.toContain('STRIPE_SECRET_KEY');
    expect(seedScript).not.toMatch(/demo@[^'"\s]+/i);
  });
});
