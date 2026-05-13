import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, appendFileSync, existsSync, mkdirSync, unlinkSync, statSync } from 'fs';
import path from 'path';
import { uploadFileToDrive, makeFilePublic, getDriveStreamUrls } from '@/lib/drive';
import db, { videosDb, subscriptionsDb, notificationsDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/session';

const TEMP_DIR = path.join(process.cwd(), 'tmp_uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

// Ensure temp directory exists
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const chunk = formData.get('chunk') as Blob | null;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string, 10);
    const totalChunks = parseInt(formData.get('totalChunks') as string, 10);
    const uploadId = formData.get('uploadId') as string;
    const fileName = formData.get('fileName') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = (formData.get('category') as string) || 'Uncategorized';
    const customThumbnailUrl = formData.get('thumbnailUrl') as string;
    const visibility = (formData.get('visibility') as string) || 'public';
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'publisher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validation
    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId || !fileName || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!folderId) {
      return NextResponse.json(
        { error: 'GOOGLE_DRIVE_FOLDER_ID environment variable is not set' },
        { status: 500 }
      );
    }

    const tempFilePath = path.join(TEMP_DIR, `${uploadId}.tmp`);

    // Check cumulative size to prevent oversized uploads
    if (existsSync(tempFilePath)) {
      const currentSize = statSync(tempFilePath).size;
      if (currentSize > MAX_FILE_SIZE) {
        unlinkSync(tempFilePath);
        return NextResponse.json({ error: 'File too large (max 5GB)' }, { status: 413 });
      }
    }

    // Write / append chunk to temp file
    const buffer = Buffer.from(await chunk.arrayBuffer());
    if (chunkIndex === 0) {
      writeFileSync(tempFilePath, buffer);
    } else {
      appendFileSync(tempFilePath, buffer);
    }

    // If this is not the last chunk, acknowledge and wait for more
    if (chunkIndex < totalChunks - 1) {
      return NextResponse.json({
        success: true,
        message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
      });
    }

    // --- All chunks received — Upload to Google Drive ---
    const mimeType = 'video/mp4';
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    let driveFileId: string;
    try {
      const uploadResult = await uploadFileToDrive({
        filePath: tempFilePath,
        fileName: sanitizedFileName,
        mimeType,
        folderId,
      });
      driveFileId = uploadResult.fileId;
    } catch (uploadError: any) {
      // Clean up temp file on error
      if (existsSync(tempFilePath)) unlinkSync(tempFilePath);
      console.error('Drive upload error details:', {
        message: uploadError.message,
        stack: uploadError.stack,
        response: uploadError.response?.data
      });
      return NextResponse.json(
        { error: `Failed to upload to Google Drive: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Make file public
    try {
      await makeFilePublic(driveFileId);
    } catch (permError: any) {
      console.error('Failed to set public permissions:', permError.message);
      // Non-fatal — the file was uploaded, just not public yet
    }

    // Get streaming URLs
    const urls = getDriveStreamUrls(driveFileId);

    // Save metadata to SQLite
    const videoId = uuidv4();
    const finalThumbnailUrl = customThumbnailUrl || urls.thumbnailUrl;
    
    const fileSize = existsSync(tempFilePath) ? statSync(tempFilePath).size : 0;

    // Clean up temp file
    if (existsSync(tempFilePath)) unlinkSync(tempFilePath);
    
    const isReel = formData.get('isReel') === 'true' ? 1 : 0;
    
    videosDb.insert.run(
      videoId,
      driveFileId,
      title,
      description || '',
      finalThumbnailUrl,
      fileSize,
      category,
      session.id,
      isReel ? 'public' : visibility,
      isReel
    );

    // Notify subscribers
    const subscribers = subscriptionsDb.countSubscribers.get(session.id);
    if (subscribers && subscribers.count > 0) {
      const subs = db.prepare(`SELECT subscriber_id FROM subscriptions WHERE publisher_id = ?`).all(session.id) as {subscriber_id: string}[];
      for (const sub of subs) {
        notificationsDb.create.run(
          uuidv4(),
          sub.subscriber_id,
          `${session.username || 'A publisher'} uploaded a new video: ${title}`,
          `/video/${videoId}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      video: {
        id: videoId,
        driveId: driveFileId,
        title,
        description,
        thumbnailUrl: finalThumbnailUrl,
        streamUrl: urls.streamUrl,
        embedUrl: urls.embedUrl,
      },
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: `Internal server error during upload: ${error.message}` },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Increased to 5 minutes for large video uploads
