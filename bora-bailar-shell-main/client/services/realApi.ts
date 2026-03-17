/**
 * Real API client for BoraBailar Admin backend
 * Handles fetch, error handling, and snake_case → camelCase mapping
 */
import { API_CONFIG } from "../config";

// ========== Types ==========

export interface DiscoverResponse {
    stories: Story[];
    featured: Video | null;
    queroCards: QueroCard[];
    weeklyTip: WeeklyTip | null;
    weeklyTips: WeeklyTip[];
    promotions: Promotion[];
    recommendations: Event[];
    awards: AwardCategory[];
}

export interface Story {
    id: string;
    title: string;
    username: string;
    thumbnailUrl: string;
    videoUrl: string;
}

export interface Video {
    id: string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
}

export interface QueroCard {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    eventsCount: number;
    events: Event[];
}

export interface WeeklyTip {
    id: string;
    dayOfWeek: number;
    title: string;
    events: Event[];
}

export interface Promotion {
    id: string;
    title: string;
    discount: string;
    price: string;
    imageUrl: string;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    startsAt: string;
    endsAt?: string;
    coverImageUrl?: string;
    price?: string;
    venue?: Venue;
}

export interface Venue {
    id: string;
    name: string;
    address?: string;
    zone?: string;
    neighborhood?: string;
}

export interface AwardCategory {
    id: string;
    category: string;
    title: string;
    thumbnailUrl: string;
    highlightWord?: string;
}

// ========== Snake → Camel Mappers ==========

function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapKeys(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(mapKeys);
    }
    if (obj !== null && typeof obj === "object") {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = toCamelCase(key);
            acc[camelKey] = mapKeys(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
}

// ========== Image URL Helper ==========

export function buildImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl = API_CONFIG.BASE_URL.replace("/api", "");
    return `${baseUrl}${path}`;
}

// ========== Fetch Wrapper ==========

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
        if (__DEV__) {
            console.log(`[API] ${options?.method || "GET"} ${url}`);
        }

        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
        }

        const payload = await response.json();
        if (payload && payload.success === true && payload.data) {
            return mapKeys(payload.data) as T;
        }
        return mapKeys(payload) as T;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("Timeout: servidor não respondeu");
        }
        throw error;
    }
}

// ========== API Methods ==========

export const realApi = {
    // Health check
    health: () => fetchJson<{ status: string }>("/health"),

    // Home content texts (editable by admin)
    // Uses raw fetch to preserve snake_case keys (admin panel uses snake_case identifiers)
    homeContent: {
        get: async (): Promise<Record<string, string>> => {
            try {
                const url = `${API_CONFIG.BASE_URL}/content/home`;
                if (__DEV__) console.log("[API] GET", url);
                const response = await fetch(url, {
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                if (__DEV__) console.log("[API] Home texts:", JSON.stringify(data));
                return data || {};
            } catch (error) {
                console.warn("[realApi] Failed to fetch home content:", error);
                return {};
            }
        },
    },

    // Discover (home aggregator)
    discover: async (): Promise<DiscoverResponse> => {
        const data = await fetchJson<any>("/discover");

        // Fetch weekly tips from the new dedicated endpoint
        let weeklyTipsData: any[] = [];
        try {
            const tipsResponse = await fetchJson<any>("/weekly-tips");
            if (__DEV__) {
                console.log("[realApi] Weekly tips response:", JSON.stringify(tipsResponse, null, 2));
            }
            weeklyTipsData = (tipsResponse.tips || []).map((t: any) => {
                const event = t.event || {};
                return {
                    id: t.id || event.id,
                    dayOfWeek: t.dayOfWeek ?? t.day_of_week,
                    dayOfWeekName: t.dayOfWeekName || t.day_of_week_name,
                    // Try multiple possible field names for title
                    title: event.title || event.name || event.titulo || t.title || "Dica especial",
                    content: event.description || event.descricao || "",
                    // Priority: thumbnail > cover_image_thumb > coverImage for faster loading
                    thumbnailUrl: event.cover_image_thumb || event.thumbnailUrl || event.thumbnail_url || event.thumbnail,
                    imageUrl: event.cover_image || event.coverImage || event.image_url || event.imageUrl,
                    event: event,
                    isActive: t.isActive ?? t.is_active ?? true,
                };
            });
            if (__DEV__) {
                console.log("[realApi] Mapped weekly tips:", weeklyTipsData.length, "items");
            }
        } catch (e) {
            console.warn("[realApi] Failed to fetch weekly tips:", e);
        }

        // Ensure all fields exist (even if empty)
        // Flask returns snake_case keys, map them to camelCase
        return {
            stories: data.stories || [],
            featured: data.featured || null,
            queroCards: data.queroCards || data.quero_cards || data.quero || [],
            weeklyTip: data.weeklyTip || data.weekly_tip || data.todayTip || data.today_tip || null,
            weeklyTips: weeklyTipsData.length > 0 ? weeklyTipsData : (data.weeklyTips || data.weekly_tips || []),
            promotions: data.promotions || [],
            recommendations: data.recommendations || [],
            awards: data.awards || [],
        };
    },

    // Events
    events: {
        list: (filters?: {
            zone?: string;
            from?: string;
            to?: string;
            city?: string;
            state?: string;
            dance_style?: number;
            place_id?: number;
            page?: number;
            per_page?: number;
            is_recommendation?: boolean;
        }) => {
            const params = new URLSearchParams();
            if (filters?.zone) params.append("zone", filters.zone);
            if (filters?.from) params.append("from", filters.from);
            if (filters?.to) params.append("to", filters.to);
            if (filters?.city) params.append("city", filters.city);
            if (filters?.state) params.append("state", filters.state);
            if (filters?.dance_style) params.append("dance_style", String(filters.dance_style));
            if (filters?.place_id) params.append("place_id", String(filters.place_id));
            if (filters?.page) params.append("page", String(filters.page));
            if (filters?.per_page) params.append("per_page", String(filters.per_page));
            if (filters?.is_recommendation) params.append("is_recommendation", "true");
            const query = params.toString() ? `?${params}` : "";
            return fetchJson<Event[]>(`/events${query}`);
        },
        getById: (id: string) => fetchJson<Event>(`/events/${id}`),
    },

    // Venues
    venues: {
        list: () => fetchJson<Venue[]>("/venues"),
        getById: (id: string) => fetchJson<Venue>(`/venues/${id}`),
    },

    // Partner Cards
    partnerCards: {
        list: async (): Promise<PartnerCard[]> => {
            try {
                const response = await fetchJson<any>("/places");
                const cards = response.partner_cards || response.partnerCards || response || [];

                // Filter active cards and sort by order
                const filteredCards = (cards as any[])
                    .filter((card: any) => card.is_active !== false && card.isActive !== false)
                    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

                // Map to component-friendly format
                return filteredCards.map((card: any) => ({
                    id: card.id,
                    categoryKey: card.category_key || card.categoryKey || '',
                    categoryLabel: card.category_label || card.categoryLabel || '',
                    order: card.order ?? 0,
                    icon: {
                        type: card.icon?.type || 'emoji',
                        value: card.icon?.value || '🎯',
                    },
                    title: card.title || '',
                    shortDescription: card.short_description || card.shortDescription || '',
                    mainText: card.main_text || card.mainText || '',
                    finalCall: card.final_call || card.finalCall || '',
                    buttonText: card.button_text || card.buttonText || 'Quero ser parceiro',
                    buttonLink: card.button_link || card.buttonLink || '',
                    isActive: true,
                }));
            } catch (error) {
                console.warn("[realApi] Failed to fetch partner cards:", error);
                return [];
            }
        },
    },

    // Partner Brands (logos)
    partnerBrands: {
        list: async (): Promise<PartnerBrand[]> => {
            try {
                const data = await fetchJson<any>("/content/partner-brands");
                const brands = data.partner_brands || data.partnerBrands || data || [];

                return (brands as any[])
                    .filter((b: any) => b.is_active !== false)
                    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                    .map((b: any) => ({
                        id: b.id,
                        name: b.name || '',
                        logoUrl: buildImageUrl(b.logo_url || b.logoUrl) || '',
                        link: b.link || null,
                        order: b.order ?? 0,
                    }));
            } catch (error) {
                console.warn("[realApi] Failed to fetch partner brands:", error);
                return [];
            }
        },
    },

    // Quero Cards — GET /quero-cards (Flask)
    queroCards: {
        list: async (): Promise<any[]> => {
            try {
                const data = await fetchJson<any>("/quero-cards");
                const cards = data.quero || data.queroCards || data || [];
                return (cards as any[])
                    .filter((c: any) => c.is_active !== false && c.isActive !== false)
                    .sort((a: any, b: any) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0))
                    .map((c: any) => ({
                        id: c.id,
                        title: c.title || '',
                        description: c.description || '',
                        imageUrl: buildImageUrl(c.image_url || c.imageUrl) || '',
                        sortOrder: c.sort_order ?? c.sortOrder ?? 0,
                        isActive: true,
                    }));
            } catch (error) {
                console.warn("[realApi] Failed to fetch quero cards:", error);
                return [];
            }
        },
    },

    // Videos — GET /videos/feed
    videos: {
        feed: async (page = 1, perPage = 10): Promise<FeedResponse> => {
            try {
                const data = await fetchJson<any>(`/videos/feed?page=${page}&per_page=${perPage}`);
                return {
                    videos: (data.videos || []).map((v: any) => ({
                        id: v.id,
                        videoUrl: v.videoUrl || v.video_url || '',
                        thumbnailUrl: v.thumbnailUrl || v.thumbnail_url || '',
                        caption: v.caption || '',
                        user: v.user || { id: 0, name: '' },
                        status: v.status || 'approved',
                    })),
                    page: data.page || 1,
                    total: data.total || 0,
                    pages: data.pages || 1,
                };
            } catch (error) {
                console.warn("[realApi] Failed to fetch video feed:", error);
                return { videos: [], page: 1, total: 0, pages: 1 };
            }
        },
    },

    // Awards — GET /awards (Flask)
    awards: {
        active: async (): Promise<AwardEdition[]> => {
            try {
                const data = await fetchJson<any>("/awards");
                const editions = data.editions || [];
                return (editions as any[]).map((ed: any) => ({
                    id: ed.id,
                    year: ed.year,
                    name: ed.name || '',
                    categories: (ed.categories || []).map((cat: any) => ({
                        id: cat.id,
                        name: cat.name || '',
                        imageUrl: buildImageUrl(cat.image_url || cat.imageUrl) || '',
                        winners: cat.winners || [],
                    })),
                }));
            } catch (error) {
                console.warn("[realApi] Failed to fetch awards:", error);
                return [];
            }
        },
    },

    // Tips — GET /weekly-tips (Flask)
    tips: {
        weekly: async (): Promise<any[]> => {
            try {
                const data = await fetchJson<any>("/weekly-tips");
                return (data.tips || []).map((t: any) => {
                    const event = t.event || {};
                    return {
                        id: t.id || event.id,
                        dayOfWeek: t.dayOfWeek ?? t.day_of_week,
                        dayOfWeekName: t.dayOfWeekName || t.day_of_week_name,
                        title: event.title || event.name || t.title || "Dica especial",
                        content: event.description || "",
                        thumbnailUrl: buildImageUrl(event.thumbnailUrl || event.thumbnail_url || event.thumbnail) || '',
                        imageUrl: buildImageUrl(event.coverImage || event.cover_image || event.image_url || event.coverImageUrl) || '',
                        event: event,
                        isActive: t.isActive ?? t.is_active ?? true,
                    };
                });
            } catch (error) {
                console.warn("[realApi] Failed to fetch weekly tips:", error);
                return [];
            }
        },
        today: async (): Promise<any> => {
            try {
                return await fetchJson<any>("/weekly-tips/today");
            } catch (error) {
                console.warn("[realApi] Failed to fetch today tip:", error);
                return null;
            }
        },
    },
};

// ========== Interfaces ==========

// Partner Card interface
export interface PartnerCard {
    id: number;
    categoryKey: string;
    categoryLabel: string;
    order: number;
    icon: {
        type: 'emoji' | 'url';
        value: string;
    };
    title: string;
    shortDescription: string;
    mainText: string;
    finalCall: string;
    buttonText: string;
    buttonLink: string;
    isActive: boolean;
}

// Partner Brand interface
export interface PartnerBrand {
    id: number;
    name: string;
    logoUrl: string;
    link: string | null;
    order: number;
}

// Feed Video interface
export interface FeedVideo {
    id: number;
    videoUrl: string;
    thumbnailUrl: string;
    caption: string;
    user: { id: number; name: string };
    status: string;
}

export interface FeedResponse {
    videos: FeedVideo[];
    page: number;
    total: number;
    pages: number;
}

// Award Edition interface
export interface AwardEdition {
    id: number;
    year: number;
    name: string;
    categories: AwardCategoryDetail[];
}

export interface AwardCategoryDetail {
    id: number;
    name: string;
    imageUrl: string;
    winners: any[];
}
