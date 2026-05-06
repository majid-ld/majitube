import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Initialize Google Auth using OAuth2
function getAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google OAuth2 credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN). ' +
      'Check your .env.local file.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return oauth2Client;
}

export async function getDriveClient() {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  return drive;
}

/**
 * Upload a file to Google Drive using a resumable upload.
 * This is optimal for large video files.
 */
export async function uploadFileToDrive(params: {
  filePath: string;
  fileName: string;
  mimeType: string;
  folderId: string;
}): Promise<{ fileId: string; webViewLink: string }> {
  const { filePath, fileName, mimeType, folderId } = params;
  const drive = await getDriveClient();

  const fileSize = fs.statSync(filePath).size;
  const fileStream = fs.createReadStream(filePath);

  const response = await drive.files.create(
    {
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType,
      },
      media: {
        mimeType,
        body: fileStream,
      },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    },
    {
      // Use resumable upload for large files
      onUploadProgress: (event) => {
        const progress = Math.round((event.bytesRead / fileSize) * 100);
        console.log(`Drive upload progress: ${progress}%`);
      },
    }
  );

  if (!response.data.id) {
    throw new Error('Drive upload failed: no file ID returned');
  }

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink || '',
  };
}

/**
 * Make a Drive file publicly readable by anyone with the link.
 */
export async function makeFilePublic(fileId: string): Promise<void> {
  const drive = await getDriveClient();

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
    supportsAllDrives: true,
  });

  console.log(`File ${fileId} is now public.`);
}

/**
 * Get direct streaming URLs for a Drive file.
 * - streamUrl: direct download/stream link
 * - embedUrl: embeddable preview link
 */
export function getDriveStreamUrls(fileId: string) {
  return {
    // Direct streaming link — works for public files
    streamUrl: `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
    // Google Drive preview embed
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    // Thumbnail (may require the file to be a Google Doc type; for videos, use a placeholder)
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w640`,
  };
}

/**
 * Delete a file from Google Drive.
 */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const drive = await getDriveClient();
  await drive.files.delete({ fileId, supportsAllDrives: true });
}
