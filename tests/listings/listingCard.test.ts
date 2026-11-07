import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Image: 'Image',
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: unknown) => styles },
  Text: 'Text',
  View: 'View',
}));

describe('ListingCard', () => {
  it('representa un alojamiento sin foto con un placeholder accesible', async () => {
    const { ListingCard } = await import('../../components/listings/ListingCard');
    const element = ListingCard({
      listing: {
        id: 'listing-1',
        title: 'Refugio Silente',
        location: 'Mazamitla',
        pricePerNight: 9900,
        capacity: 3,
        coverImageUrl: null,
      },
      onPress: vi.fn(),
    });

    const children = element.props.children as unknown[];
    const imageContainer = children[0] as { props: { children: { props: { accessibilityLabel: string } } } };
    expect(imageContainer.props.children.props.accessibilityLabel).toBe('Este alojamiento no tiene fotos');
    expect(element.props.accessibilityRole).toBe('button');
    expect(createElement).toBeDefined();
  });
});
