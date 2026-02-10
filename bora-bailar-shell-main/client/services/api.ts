/**
 * API exports - consuming real Admin API
 */
import { mockApi } from "./mock/api";
import { realApi } from "./realApi";
import { API_CONFIG } from "../config";

// Set to false to use real API
const USE_MOCK = false;

// Helper to build full URL for images
function buildImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    // If already absolute URL, return as-is
    if (path.startsWith("http")) return path;
    // Build absolute URL from relative path
    const baseUrl = API_CONFIG.BASE_URL.replace("/api", "");
    return `${baseUrl}${path}`;
}

// Export the appropriate API - maintaining backward compatibility
export const api = USE_MOCK ? {
    // Mock API structure (legacy)
    auth: mockApi.auth,
    events: mockApi.events,
    userActions: mockApi.userActions,
} : {
    // Real API structure - wrapping to match mock interface
    auth: {
        signUp: async (data: any) => { throw new Error("Not implemented yet"); },
        signIn: async (email: string) => { throw new Error("Not implemented yet"); },
        checkSession: async (token: string) => { throw new Error("Not implemented yet"); },
        signOut: async (token: string) => { },
    },
    events: {
        // This matches what DiscoverScreen expects: api.events.getDiscoverData()
        getDiscoverData: async () => {
            const data = await realApi.discover();

            // Debug logging
            if (__DEV__) {
                console.log("[API] Raw discover data keys:", Object.keys(data));
                console.log("[API] queroCards count:", data.queroCards?.length || 0);
                console.log("[API] queroCards sample:", JSON.stringify(data.queroCards?.[0], null, 2));
            }

            // Map Admin API response to mock format for backward compatibility
            return {
                // Stories - fallback to local videos when API doesn't have stories
                stories: [
                    {
                        id: "1",
                        title: "DANÇANDO COM JÚLIA",
                        username: "@julia_danca",
                        thumbnail: require("../attached_assets/dancando_com_julia_thumb.jpg"),
                        videoUrl: require("../attached_assets/videos/dancando_com_julia.mp4"),
                    },
                    {
                        id: "2",
                        title: "NOITE DE SALSA",
                        username: "@salsa_rio",
                        thumbnail: require("../attached_assets/noite_de_salsa_thumb.jpg"),
                        videoUrl: require("../attached_assets/videos/noite_de_salsa.mp4"),
                    },
                    {
                        id: "3",
                        title: "RITMO DO CORAÇÃO",
                        username: "@ritmo_love",
                        thumbnail: require("../attached_assets/ritmo_coracao_thumb.jpg"),
                        videoUrl: require("../attached_assets/videos/ritmo_coracao.mp4"),
                    },
                    {
                        id: "4",
                        title: "LEVE COMO UMA FOLHA",
                        username: "@leve_dance",
                        thumbnail: require("../attached_assets/leve_como_uma_folha_thumb.jpg"),
                        videoUrl: require("../attached_assets/videos/leve_como_uma_folha.mp4"),
                    },
                    {
                        id: "5",
                        title: "ALEGRIA PURA",
                        username: "@alegria_pura",
                        thumbnail: require("../attached_assets/alegria_pura_thumb.jpg"),
                        videoUrl: require("../attached_assets/videos/alegria_pura.mp4"),
                    },
                ],

                // Destaque do mês - fallback to local video
                destaqueMes: {
                    title: "MOMENTO DANÇA É MOMENTO FELIZ",
                    thumbnail: require("../attached_assets/destaque_do_mes_thumb.jpg"),
                    videoUrl: require("../attached_assets/videos/destaque do mes.mp4"),
                },

                // Awards - mapped from backend data
                awards: ((data as any).awards || []).map((a: any) => {
                    const img = a.image_url ?? a.imageUrl ?? a.thumbnailUrl ?? null;
                    const absImg = img ? buildImageUrl(img) : null;

                    return {
                        id: String(a.id),
                        name: a.name ?? a.title,
                        title: a.name ?? a.title,
                        description: a.description ?? "",
                        category_label: a.category_label ?? a.categoryLabel ?? a.category ?? "",
                        image_url: absImg ?? undefined,
                        thumbnail: absImg ? { uri: absImg } : a.thumbnail,
                        sort_order: a.sort_order ?? a.sortOrder ?? 0,
                    };
                }),

                // Recommendations - map from promotions
                recommendations: (data.promotions || []).map((p: any) => ({
                    id: String(p.id),
                    title: p.name || p.title || "Evento",
                    price: p.price ? `R$${p.price}` : "Grátis",
                    discount: p.discountLabel || p.discount_label || "",
                    image: buildImageUrl(p.coverImage || p.cover_image) ||
                        "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=300&h=200&fit=crop",
                })),

                // Querer - map from quero_cards
                querer: (data.queroCards || []).map((q: any) => ({
                    id: String(q.id),
                    title: (q.title || "").toUpperCase().replace(/\n/g, "\n"),
                    description: q.description || "",
                    image: buildImageUrl(q.imageUrl) ||
                        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop",
                    eventsCount: q.eventsCount || 0,
                    events: q.events || [],
                })),

                // Extra data from Admin
                events: (data.recommendations || []).map((e: any) => ({
                    id: String(e.id),
                    title: e.name || e.title || "Evento",
                    startsAt: e.startDate || e.start_date,
                    venueName: e.venueName || e.venue_name,
                    coverImage: buildImageUrl(e.coverImage || e.cover_image),
                })),

                featuredEvents: data.featured || [],
                todayTip: (data as any).weeklyTip || (data as any).weekly_tip || null,
                weeklyTip: (data as any).weeklyTip || (data as any).weekly_tip || null,
                weeklyTips: (data as any).weeklyTips || (data as any).weekly_tips || [],
            };
        },
        getById: realApi.events.getById,
    },
    userActions: {
        toggleFavorite: async (userId: string, eventId: string) => ({ isFavorite: true }),
        attendEvent: async (userId: string, eventId: string) => ({ isAttending: true }),
        getFavorites: async (userId: string) => [],
        getAttending: async (userId: string) => [],
    },
    // Also expose convenient real API methods
    discover: realApi.discover,
    venues: realApi.venues,
    health: realApi.health,
};

// Re-export types for convenience
export type {
    DiscoverResponse,
    Event,
    Venue,
    QueroCard,
    Story,
    WeeklyTip,
    Promotion,
    AwardCategory,
} from "./realApi";
