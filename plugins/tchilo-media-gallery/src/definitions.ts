export type MediaKind = 'image' | 'video' | 'all';

export interface GalleryItem {
  id: string;
  uri: string;
  thumbUri?: string;
  mediaType: 'image' | 'video';
  duration?: number;
  width?: number;
  height?: number;
  creationTime?: number;
  albumId?: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  count: number;
  coverUri?: string;
}

export interface PermissionStatus {
  photos: 'granted' | 'denied' | 'limited' | 'prompt';
}

export interface GetRecentOptions {
  limit?: number;
  offset?: number;
  mediaType?: MediaKind;
}

export interface GetAlbumMediaOptions {
  albumId: string;
  limit?: number;
  offset?: number;
  mediaType?: MediaKind;
}

export interface TchiloMediaGalleryPlugin {
  checkPermissions(): Promise<PermissionStatus>;
  requestPermissions(): Promise<PermissionStatus>;
  getRecentMedia(options?: GetRecentOptions): Promise<{ items: GalleryItem[]; limited?: boolean }>;
  getAlbums(): Promise<{ albums: GalleryAlbum[] }>;
  getAlbumMedia(options: GetAlbumMediaOptions): Promise<{ items: GalleryItem[] }>;
}
