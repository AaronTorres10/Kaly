import { describe, expect, it } from 'vitest';

import { buildListingMapHtml, getListingMapState } from '../../components/listings/listingMapModel';

describe('ListingMap', () => {
  it('acepta coordenadas válidas y genera una región con marcador', () => {
    expect(getListingMapState(19.4326, -99.1332)).toBe('ready');

    const html = buildListingMapHtml({ latitude: 19.4326, longitude: -99.1332, label: 'Casa Centro' });
    expect(html).toContain('19.4326');
    expect(html).toContain('-99.1332');
    expect(html).toContain('Casa Centro');
    expect(html).toContain('openstreetmap.org');
  });

  it('usa fallback cuando falta una coordenada o está fuera de rango', () => {
    expect(getListingMapState(null, -99.1332)).toBe('unavailable');
    expect(getListingMapState(19.4326, null)).toBe('unavailable');
    expect(getListingMapState(91, -99.1332)).toBe('unavailable');
    expect(getListingMapState(19.4326, -181)).toBe('unavailable');
  });

  it('escapa la etiqueta antes de insertarla en el documento del mapa', () => {
    const html = buildListingMapHtml({ latitude: 19, longitude: -99, label: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
