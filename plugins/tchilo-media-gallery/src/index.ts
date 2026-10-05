import { registerPlugin } from '@capacitor/core';
import type { TchiloMediaGalleryPlugin } from './definitions';

const TchiloMediaGallery = registerPlugin<TchiloMediaGalleryPlugin>('TchiloMediaGallery', {
  web: () => import('./web').then((m) => new m.TchiloMediaGalleryWeb()),
});

export * from './definitions';
export { TchiloMediaGallery };
