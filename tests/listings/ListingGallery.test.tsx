import { describe, expect, it } from 'vitest';

import {
  galleryReducer,
  getGalleryPlaceholder,
  orderGalleryImages,
  type GalleryState,
} from '../../components/listings/galleryModel';

const images = [
  { id: 'two', position: 2, sourceUrl: 'https://example.com/two.jpg', storagePath: null, license: 'Unsplash', attribution: 'Autora' },
  { id: 'one', position: 1, sourceUrl: 'https://example.com/one.jpg', storagePath: null, license: 'Unsplash', attribution: 'Autora' },
];

describe('ListingGallery', () => {
  it('ordena las imágenes por position sin mutar la lista original', () => {
    expect(orderGalleryImages(images).map((image) => image.id)).toEqual(['one', 'two']);
    expect(images.map((image) => image.id)).toEqual(['two', 'one']);
  });

  it('conserva una imagen única y representa una lista vacía', () => {
    expect(orderGalleryImages([images[0]]).map((image) => image.id)).toEqual(['two']);
    expect(orderGalleryImages([])).toEqual([]);
    expect(getGalleryPlaceholder([])).toBe('Este alojamiento no tiene fotos');
  });

  it('devuelve un placeholder accesible para una imagen que falla', () => {
    expect(getGalleryPlaceholder(images)).toBe('No pudimos cargar esta foto');
  });

  it('abre y cierra una imagen a pantalla completa y conserva el error de carga', () => {
    const initial: GalleryState = { activeIndex: null, currentIndex: 0, failedImageIds: new Set() };
    const opened = galleryReducer(initial, { type: 'open', index: 1 });
    expect(opened.activeIndex).toBe(1);

    const failed = galleryReducer(opened, { type: 'loadError', imageId: 'two' });
    expect(failed.failedImageIds.has('two')).toBe(true);
    expect(galleryReducer(failed, { type: 'close' }).activeIndex).toBeNull();
  });
});
