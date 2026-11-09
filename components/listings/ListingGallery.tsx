import { useMemo, useReducer } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Colors from '../../constants/Colors';
import type { ListingImage } from '../../lib/listings/getListingDetail';
import { galleryReducer, getGalleryPlaceholder, orderGalleryImages, type GalleryState } from './galleryModel';

type ListingGalleryProps = {
  images: ListingImage[];
};

const initialState: GalleryState = { activeIndex: null, currentIndex: 0, failedImageIds: new Set() };

export function ListingGallery({ images }: ListingGalleryProps) {
  const orderedImages = useMemo(() => orderGalleryImages(images), [images]);
  const [state, dispatch] = useReducer(galleryReducer, initialState);
  const { width } = useWindowDimensions();

  if (orderedImages.length === 0) {
    return (
      <View accessibilityLabel={getGalleryPlaceholder(orderedImages)} style={styles.empty}>
        <Text style={styles.placeholderText}>{getGalleryPlaceholder(orderedImages)}</Text>
      </View>
    );
  }

  const renderImage = ({ item, index }: { item: ListingImage; index: number }) => {
    const failed = state.failedImageIds.has(item.id) || !item.sourceUrl;
    return (
      <Pressable
        accessibilityLabel={failed ? `Foto no disponible ${index + 1} de ${orderedImages.length}` : `Abrir foto ${index + 1} de ${orderedImages.length}`}
        accessibilityRole="button"
        onPress={() => dispatch({ type: 'open', index })}
        style={[styles.slide, { width }]}
      >
        {failed ? (
          <View accessibilityLabel={getGalleryPlaceholder(orderedImages)} style={styles.failedImage}>
            <Text style={styles.placeholderText}>{getGalleryPlaceholder(orderedImages)}</Text>
          </View>
        ) : (
          <Image
            accessibilityLabel={`Foto ${index + 1} de ${orderedImages.length}`}
            onError={() => dispatch({ type: 'loadError', imageId: item.id })}
            source={{ uri: item.sourceUrl as string }}
            style={styles.image}
          />
        )}
      </Pressable>
    );
  };

  const activeImage = state.activeIndex === null ? null : orderedImages[state.activeIndex];
  const activeFailed = activeImage ? state.failedImageIds.has(activeImage.id) || !activeImage.sourceUrl : false;

  return (
    <View accessibilityLabel={`Galería de ${orderedImages.length} fotos`} style={styles.container}>
      <FlatList
        data={orderedImages}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        horizontal
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => dispatch({ type: 'change', index: Math.round(event.nativeEvent.contentOffset.x / width) })}
        pagingEnabled
        renderItem={renderImage}
        showsHorizontalScrollIndicator={false}
      />
      <View accessibilityLabel={`Foto ${state.currentIndex + 1} de ${orderedImages.length}`} style={styles.counter}>
        <Text style={styles.counterText}>{state.currentIndex + 1} / {orderedImages.length}</Text>
      </View>

      <Modal animationType="fade" onRequestClose={() => dispatch({ type: 'close' })} transparent visible={state.activeIndex !== null}>
        <View style={styles.modalBackdrop}>
          <Pressable accessibilityLabel="Cerrar foto" accessibilityRole="button" onPress={() => dispatch({ type: 'close' })} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          {activeImage && (activeFailed ? (
            <View accessibilityLabel={getGalleryPlaceholder(orderedImages)} style={styles.fullscreenPlaceholder}>
              <Text style={styles.placeholderText}>{getGalleryPlaceholder(orderedImages)}</Text>
            </View>
          ) : (
            <Image accessibilityLabel={`Foto ampliada ${state.currentIndex + 1} de ${orderedImages.length}`} source={{ uri: activeImage.sourceUrl as string }} style={styles.fullscreenImage} />
          ))}
          <Text style={styles.modalCounter}>{state.currentIndex + 1} / {orderedImages.length}</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.light.soft, height: 260, position: 'relative' },
  slide: { height: 260 },
  image: { height: '100%', width: '100%' },
  empty: { alignItems: 'center', backgroundColor: Colors.light.soft, borderRadius: 22, height: 260, justifyContent: 'center', padding: 24 },
  failedImage: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  placeholderText: { color: Colors.light.muted, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  counter: { backgroundColor: 'rgba(24, 35, 34, 0.78)', borderRadius: 14, bottom: 14, paddingHorizontal: 11, paddingVertical: 6, position: 'absolute', right: 14 },
  counterText: { color: Colors.light.surface, fontSize: 12, fontWeight: '800' },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.94)', flex: 1, justifyContent: 'center' },
  fullscreenImage: { height: '75%', width: '100%' },
  fullscreenPlaceholder: { alignItems: 'center', height: 220, justifyContent: 'center', padding: 24, width: '100%' },
  closeButton: { alignItems: 'center', height: 48, justifyContent: 'center', position: 'absolute', right: 16, top: 48, width: 48, zIndex: 1 },
  closeText: { color: Colors.light.surface, fontSize: 38, fontWeight: '300' },
  modalCounter: { bottom: 48, color: Colors.light.surface, fontSize: 14, fontWeight: '800', position: 'absolute' },
});
