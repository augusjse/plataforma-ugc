const DRIVE_FILE_ID_PATTERNS = [
  /\/file\/d\/([a-zA-Z0-9_-]+)/,
  /[?&]id=([a-zA-Z0-9_-]+)/,
];

export function getGoogleDriveFileId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname !== "drive.google.com" && hostname !== "docs.google.com") return null;
  } catch {
    return null;
  }

  for (const pattern of DRIVE_FILE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * Returns the Google Drive preview URL for share, view and download links.
 * Non-Drive URLs are returned unchanged so existing direct video URLs still work.
 */
export function getDriveEmbedUrl(videoUrl: string): string {
  const fileId = getGoogleDriveFileId(videoUrl);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : videoUrl;
}

/** Returns Drive's small preview image when the source URL points to a Drive file. */
export function getDriveThumbnailUrl(videoUrl: string): string | null {
  const fileId = getGoogleDriveFileId(videoUrl);
  return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w96-h96` : null;
}
