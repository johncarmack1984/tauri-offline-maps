import {
  BaseDirectory,
  exists,
  mkdir,
} from 'npm:@tauri-apps/plugin-fs@^2.0.0'
import { download } from 'npm:@tauri-apps/plugin-upload'
import { fetch } from 'npm:@tauri-apps/plugin-http@^2.0.0'
import { convertFileSrc } from 'npm:@tauri-apps/api/core'
import { appDataDir, join } from 'npm:@tauri-apps/api/path'

export async function getFileLoc() {
  return await appDataDir()
}

export async function downloadAndSavePMTiles(url: string, filename: string) {
  try {
    const baseDir = BaseDirectory.AppData;
    const appDataDirPath = await getFileLoc();
    
    const exist = await exists(appDataDirPath);
    if (!exist) {
      await mkdir(appDataDirPath, { recursive: true });
    }
  
    if (await exists(filename, { baseDir })) {
      console.log(`File ${filename} already exists, returning path`)
      const assetPath = await join(appDataDirPath, filename)
      return convertFileSrc(assetPath)
    }

    // Fetch the file
    console.log(`Downloading PMTiles from ${url}...`)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const assetPath = await join(appDataDirPath, filename)

    await download(
      url,
      assetPath,
      ({ progress, total }) =>
        console.log(`Downloaded ${progress} of ${total} bytes`),
    ).catch((e) => {
      console.error(e);
    });

    console.log(`Successfully saved ${filename}`)

    return convertFileSrc(assetPath)
  } catch (error) {
    console.error('Error downloading or saving PMTiles:', error)
    throw error
  }
}
