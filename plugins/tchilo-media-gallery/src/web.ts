import { WebPlugin } from '@capacitor/core';
import type {
  TchiloMediaGalleryPlugin,
  PermissionStatus,
  GetRecentOptions,
  GetAlbumMediaOptions,
  GalleryItem,
  GalleryAlbum,
} from './definitions';

export class TchiloMediaGalleryWeb extends WebPlugin implements TchiloMediaGalleryPlugin {
  async checkPermissions(): Promise<PermissionStatus> {
    return { photos: 'prompt' };
  }

  async requestPermissions(): Promise<PermissionStatus> {
    return { photos: 'prompt' };
  }

  async getRecentMedia(_options?: GetRecentOptions): Promise<{ items: GalleryItem[]; limited?: boolean }> {
    return { items: [] };
  }

  async getAlbums(): Promise<{ albums: GalleryAlbum[] }> {
    return { albums: [] };
  }

  async getAlbumMedia(_options: GetAlbumMediaOptions): Promise<{ items: GalleryItem[] }> {
    return { items: [] };
  }
}
