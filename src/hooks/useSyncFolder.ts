import {useState, useEffect, useCallback} from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {MenuItem} from '../config/menus';

const SYNC_FOLDER_KEY = '@ipod_sync_folder_uri';
const IOS_SYNC_DIR = (FileSystem.Paths.document?.uri || '') + 'SyncFolder/';

export interface SyncedFiles {
  audio: MenuItem[];
  video: MenuItem[];
  photo: MenuItem[];
}

export function useSyncFolder() {
  const [folderUri, setFolderUri] = useState<string | null>(null);
  const [syncedFiles, setSyncedFiles] = useState<SyncedFiles>({
    audio: [],
    video: [],
    photo: [],
  });
  const [isScanning, setIsScanning] = useState(false);

  // Load saved URI on mount
  useEffect(() => {
    AsyncStorage.getItem(SYNC_FOLDER_KEY).then(uri => {
      if (uri) {
        setFolderUri(uri);
        scanFolder(uri);
      }
    });
  }, []);

  const scanFolder = useCallback(async (uri: string) => {
    setIsScanning(true);
    try {
      const directory = new FileSystem.Directory(uri);
      
      if (!directory.exists) {
        console.warn('Directory does not exist:', uri);
        setIsScanning(false);
        return;
      }
      
      const items = directory.list();
      
      const audio: MenuItem[] = [];
      const video: MenuItem[] = [];
      const photo: MenuItem[] = [];

      for (const item of items) {
        if (item instanceof FileSystem.Directory) continue;
        
        let filename = item.name;
        
        // Remove SAF specific prefixes if any
        if (filename.includes('%3A')) {
          filename = filename.split('%3A').pop() || filename;
        }
        
        const ext = item.extension ? item.extension.replace('.', '').toLowerCase() : filename.split('.').pop()?.toLowerCase() || '';

        const menuItem: MenuItem = {
          id: item.uri,
          label: filename,
          hasChildren: false,
        };

        if (['mp3', 'm4a', 'wav', 'aac', 'flac'].includes(ext)) {
          audio.push(menuItem);
        } else if (['mp4', 'mov', 'mkv', 'avi'].includes(ext)) {
          video.push(menuItem);
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          photo.push(menuItem);
        }
      }

      setSyncedFiles({audio, video, photo});
    } catch (e) {
      console.warn('Failed to scan folder', e);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const selectFolder = useCallback(async () => {
    try {
      const pickedDir = await FileSystem.Directory.pickDirectoryAsync();
      
      if (pickedDir) {
        if (Platform.OS === 'android') {
          // On Android, SAF persists permission for the picked directory
          await AsyncStorage.setItem(SYNC_FOLDER_KEY, pickedDir.uri);
          setFolderUri(pickedDir.uri);
          scanFolder(pickedDir.uri);
        } else {
          // On iOS, permission is temporary, so we copy files to the app's document directory
          const destDir = new FileSystem.Directory(IOS_SYNC_DIR);
          if (!destDir.exists) {
            destDir.create();
          }

          const items = pickedDir.list();
          for (const item of items) {
            if (item instanceof FileSystem.File) {
              const destFile = new FileSystem.File(destDir, item.name);
              item.copySync(destFile);
            }
          }
          
          await AsyncStorage.setItem(SYNC_FOLDER_KEY, destDir.uri);
          setFolderUri(destDir.uri);
          scanFolder(destDir.uri);
        }
      }
    } catch (e) {
      console.warn('Failed to request directory permissions or pick files', e);
    }
  }, [scanFolder]);

  return {
    folderUri,
    syncedFiles,
    isScanning,
    selectFolder,
    scanFolder: () => {
      if (folderUri) scanFolder(folderUri);
    },
  };
}
