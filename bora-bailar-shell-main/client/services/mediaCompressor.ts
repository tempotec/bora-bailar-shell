/**
 * Media Compressor - Pre-compression utility for uploads
 * Compresses images and validates videos before sending to server.
 *
 * Images: Uses expo-image-manipulator → resize + JPEG 70%
 * Videos: Validates size (max 20MB), relies on ImagePicker quality setting
 */
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

// ─── Config ──────────────────────────────────────────────

const IMAGE_DEFAULTS = {
    maxWidth: 1200,
    quality: 0.7, // JPEG compression (0-1)
};

const THUMBNAIL_DEFAULTS = {
    maxWidth: 720,
    quality: 0.7,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB after compression
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

// ─── Types ───────────────────────────────────────────────

export interface CompressedMedia {
    uri: string;
    width: number;
    height: number;
    sizeBytes: number;
    sizeMB: string; // human-readable
}

// ─── Image Compression ──────────────────────────────────

/**
 * Compress an image before upload.
 * - Resizes to maxWidth (default 1200px), maintaining aspect ratio
 * - Compresses to JPEG quality 70%
 * - Typical result: 15MB photo → 200-800KB
 *
 * @param uri - Local file URI of the image
 * @param maxWidth - Maximum width in pixels (default 1200)
 * @param quality - JPEG quality 0-1 (default 0.7)
 * @returns Compressed image info with new URI
 */
export async function compressImage(
    uri: string,
    maxWidth: number = IMAGE_DEFAULTS.maxWidth,
    quality: number = IMAGE_DEFAULTS.quality,
): Promise<CompressedMedia> {
    if (__DEV__) {
        console.log(`[MediaCompressor] Compressing image: maxWidth=${maxWidth}, quality=${quality}`);
    }

    const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        {
            compress: quality,
            format: ImageManipulator.SaveFormat.JPEG,
        },
    );

    // Get file size
    const sizeBytes = await getFileSize(result.uri);

    if (__DEV__) {
        const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
        console.log(
            `[MediaCompressor] Image compressed: ${result.width}x${result.height} → ${sizeMB}MB`,
        );
    }

    return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        sizeBytes,
        sizeMB: (sizeBytes / (1024 * 1024)).toFixed(2),
    };
}

/**
 * Compress a thumbnail image (smaller than full image).
 * - Resizes to 720px width
 * - JPEG quality 70%
 */
export async function compressThumbnail(uri: string): Promise<CompressedMedia> {
    return compressImage(uri, THUMBNAIL_DEFAULTS.maxWidth, THUMBNAIL_DEFAULTS.quality);
}

// ─── Video Validation ───────────────────────────────────

/**
 * Validate video size before upload.
 * Videos are compressed server-side via ffmpeg, but we enforce
 * a 20MB limit to keep upload times reasonable on mobile networks.
 *
 * @param uri - Local file URI of the video
 * @throws Error if video exceeds MAX_VIDEO_SIZE
 */
export async function validateVideo(uri: string): Promise<{
    uri: string;
    sizeBytes: number;
    sizeMB: string;
}> {
    const sizeBytes = await getFileSize(uri);
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

    if (sizeBytes > MAX_VIDEO_SIZE) {
        const maxMB = MAX_VIDEO_SIZE / (1024 * 1024);
        throw new Error(
            `Vídeo muito grande (${sizeMB}MB). Máximo: ${maxMB}MB. ` +
            `Tente gravar em resolução menor ou um vídeo mais curto.`,
        );
    }

    if (__DEV__) {
        console.log(`[MediaCompressor] Video validated: ${sizeMB}MB`);
    }

    return { uri, sizeBytes, sizeMB };
}

// ─── Helpers ─────────────────────────────────────────────

async function getFileSize(uri: string): Promise<number> {
    try {
        const file = new FileSystem.File(uri);
        return file.size ?? 0;
    } catch {
        // Fallback for legacy API
        const info = await FileSystem.getInfoAsync(uri);
        return (info as any).size || 0;
    }
}

export const mediaCompressor = {
    compressImage,
    compressThumbnail,
    validateVideo,
    MAX_IMAGE_SIZE,
    MAX_VIDEO_SIZE,
};
