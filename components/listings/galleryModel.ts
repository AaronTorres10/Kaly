import type { ListingImage } from '../../lib/listings/getListingDetail';

export type GalleryState = {
  activeIndex: number | null;
  currentIndex: number;
  failedImageIds: Set<string>;
};

export type GalleryAction =
  | { type: 'change'; index: number }
  | { type: 'open'; index: number }
  | { type: 'close' }
  | { type: 'loadError'; imageId: string };

export function orderGalleryImages(images: ListingImage[]): ListingImage[] {
  return [...images].sort((first, second) => first.position - second.position);
}

export function getGalleryPlaceholder(images: ListingImage[]): string {
  return images.length === 0 ? 'Este alojamiento no tiene fotos' : 'No pudimos cargar esta foto';
}

export function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case 'change':
      return { ...state, currentIndex: action.index };
    case 'open':
      return { ...state, activeIndex: action.index, currentIndex: action.index };
    case 'close':
      return { ...state, activeIndex: null };
    case 'loadError':
      return { ...state, failedImageIds: new Set(state.failedImageIds).add(action.imageId) };
  }
}
