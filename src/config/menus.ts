export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  hasChildren?: boolean;
}

export const MENUS: Record<string, MenuItem[]> = {
  iPod: [
    {id: 'music', label: 'Music', hasChildren: true},
    {id: 'photos', label: 'Photos', hasChildren: true},
    {id: 'videos', label: 'Videos', hasChildren: true},
    {id: 'extras', label: 'Extras', hasChildren: true},
    {id: 'settings', label: 'Settings', hasChildren: true},
    {id: 'shuffle', label: 'Shuffle Songs'},
    {id: 'now_playing', label: 'Now Playing'},
  ],
  Music: [
    {id: 'playlists', label: 'Playlists', hasChildren: true},
    {id: 'artists', label: 'Artists', hasChildren: true},
    {id: 'albums', label: 'Albums', hasChildren: true},
    {id: 'songs', label: 'Songs', hasChildren: true},
    {id: 'genres', label: 'Genres', hasChildren: true},
    {id: 'composers', label: 'Composers', hasChildren: true},
  ],
  Settings: [
    {id: 'sync_folder', label: 'Select Sync Folder'},
  ],
  Photos: [
    {id: 'coming_soon', label: 'Coming Soon'}
  ],
  Videos: [
    {id: 'coming_soon', label: 'Coming Soon'}
  ],
  Extras: [
    {id: 'clock', label: 'Clock'},
    {id: 'games', label: 'Games'},
    {id: 'contacts', label: 'Contacts'}
  ],
  ComingSoon: [
    {id: 'coming_soon', label: 'Coming Soon'}
  ]
};
