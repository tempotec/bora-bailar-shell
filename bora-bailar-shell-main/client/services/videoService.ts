/**
 * Video Service - Pick and upload videos
 */
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { API_CONFIG } from "../config";
import { tokenStore } from "./tokenStore";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export interface VideoUploadResult {
    id: number;
    status: string;
    video_url: string;
    thumbnail_url: string;
    caption?: string;
}

export interface Video {
    id: number;
    user_id: number;
    video_url: string;
    thumbnail_url: string;
    caption: string | null;
    status: "pending" | "approved" | "rejected";
    rejection_reason: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
}

export interface VideoListResponse {
    videos: Video[];
    page: number;
    per_page: number;
    total: number;
    pages: number;
}

/**
 * Request camera/gallery permissions
 */
export async function requestMediaPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
}

/**
 * Pick a video from gallery
 */
export async function pickVideo(): Promise<ImagePicker.ImagePickerAsset | null> {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
        throw new Error("Permissão para acessar galeria negada");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 segundos max
    });

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    return result.assets[0];
}

/**
 * Pick a thumbnail image
 */
export async function pickThumbnail(): Promise<ImagePicker.ImagePickerAsset | null> {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
        throw new Error("Permissão para acessar galeria negada");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [9, 16], // Aspect ratio vertical (stories)
        quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    return result.assets[0];
}

/**
 * Get file size in bytes
 */
export async function getFileSize(uri: string): Promise<number> {
    try {
        // Nova API do Expo SDK 54
        const file = new FileSystem.File(uri);
        return file.size ?? 0;
    } catch {
        // Fallback para API legacy se File não funcionar com URIs de galeria
        const info = await FileSystem.getInfoAsync(uri);
        return (info as any).size || 0;
    }
}

/**
 * Validate video size
 */
export async function validateVideoSize(uri: string): Promise<void> {
    const size = await getFileSize(uri);
    if (size > MAX_VIDEO_SIZE) {
        const sizeMB = Math.round(size / (1024 * 1024));
        throw new Error(`Vídeo muito grande (${sizeMB}MB). Máximo: 50MB`);
    }
}

/**
 * Get file extension from URI
 */
function getExtension(uri: string): string {
    const match = uri.match(/\.(\w+)$/);
    return match ? match[1].toLowerCase() : "mp4";
}

/**
 * Upload video to server
 */
export async function uploadVideo(
    videoUri: string,
    thumbnailUri: string,
    caption?: string,
    extraData?: { title?: string; rating?: number; location?: string }
): Promise<VideoUploadResult> {
    // Validate size
    await validateVideoSize(videoUri);

    // Get token
    const token = await tokenStore.get();
    if (!token) {
        throw new Error("Usuário não autenticado");
    }

    // Build FormData (formato correto para Expo)
    const formData = new FormData();

    formData.append("video", {
        uri: videoUri,
        name: `video.${getExtension(videoUri)}`,
        type: `video/${getExtension(videoUri)}`,
    } as any);

    formData.append("thumbnail", {
        uri: thumbnailUri,
        name: `thumb.${getExtension(thumbnailUri)}`,
        type: `image/${getExtension(thumbnailUri) === "png" ? "png" : "jpeg"}`,
    } as any);

    if (caption) {
        formData.append("caption", caption);
    }

    if (extraData) {
        if (extraData.title) formData.append("title", extraData.title);
        if (extraData.rating) formData.append("rating", extraData.rating.toString());
        if (extraData.location) formData.append("location", extraData.location);
    }

    // Upload
    const url = `${API_CONFIG.BASE_URL}/videos/upload`;

    if (__DEV__) {
        console.log("[VideoService] Uploading to:", url);
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            // NÃO definir Content-Type - o fetch define automaticamente para FormData
        },
        body: formData,
    });

    const text = await response.text();
    let data: any = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { message: text };
    }

    if (!response.ok) {
        const msg = data?.error || data?.message || `Erro ${response.status}`;
        throw new Error(msg);
    }

    return data.video;
}

/**
 * Get my videos
 */
export async function getMyVideos(
    page = 1,
    status?: string
): Promise<VideoListResponse> {
    const token = await tokenStore.get();
    if (!token) {
        throw new Error("Usuário não autenticado");
    }

    let url = `${API_CONFIG.BASE_URL}/videos/me?page=${page}`;
    if (status) {
        url += `&status=${status}`;
    }

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao carregar vídeos");
    }

    return response.json();
}

/**
 * Get public video feed (approved videos)
 */
export async function getVideoFeed(page = 1): Promise<VideoListResponse> {
    const url = `${API_CONFIG.BASE_URL}/videos/feed?page=${page}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Erro ao carregar feed");
    }

    return response.json();
}

export const videoService = {
    requestMediaPermissions,
    pickVideo,
    pickThumbnail,
    getFileSize,
    validateVideoSize,
    uploadVideo,
    getMyVideos,
    getVideoFeed,
};
