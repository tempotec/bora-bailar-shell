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
                        title: "VAMBORA DANÇAR",
                        username: "@vambora",
                        thumbnail: require("../attached_assets/noite_de_salsa_thumb.jpg"),
                        videoUrl: require("../attached_assets/videos/mixkit-group-of-friends-partying-happily-4640-hd-ready.mp4"),
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

                // Destaque do mês - removed sensual video
                destaqueMes: null,

                // Awards - mapped from backend data, with mock fallback
                awards: (() => {
                    const mapped = ((data as any).awards || []).map((a: any) => {
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
                    });
                    if (mapped.length > 0) return mapped;
                    // Fallback mock data
                    return [
                        { id: "1", name: "Melhor Dançarino Solo", title: "Melhor Dançarino Solo", description: "", category_label: "Categoria 1", thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"), sort_order: 1 },
                        { id: "2", name: "Melhor Casal de Dança", title: "Melhor Casal de Dança", description: "", category_label: "Categoria 2", thumbnail: require("../../attached_assets/stock_images/ballroom_dancing_cou_a3f721af.jpg"), sort_order: 2 },
                        { id: "3", name: "Melhor Professor de Dança", title: "Melhor Professor de Dança", description: "", category_label: "Categoria 3", thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"), sort_order: 3 },
                        { id: "4", name: "Melhor Escola de Dança", title: "Melhor Escola de Dança", description: "", category_label: "Categoria 4", thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_8c1c5cba.jpg"), sort_order: 4 },
                        { id: "5", name: "Melhor Evento de Dança", title: "Melhor Evento de Dança", description: "", category_label: "Categoria 5", thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"), sort_order: 5 },
                        { id: "6", name: "Melhor Local para Dançar", title: "Melhor Local para Dançar", description: "", category_label: "Categoria 6", thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_24afcbbe.jpg"), sort_order: 6 },
                        { id: "7", name: "Melhor DJ de Dance", title: "Melhor DJ de Dance", description: "", category_label: "Categoria 7", thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_dbae0db5.jpg"), sort_order: 7 },
                    ];
                })(),

                // Recommendations - map from promotions
                recommendations: (data.promotions || []).map((p: any) => ({
                    id: String(p.id),
                    title: p.name || p.title || "Evento",
                    price: p.price ? `R$${p.price}` : "Grátis",
                    discount: p.discountLabel || p.discount_label || "",
                    image: buildImageUrl(p.cover_image_thumb || p.coverImageThumb || p.coverImage || p.cover_image) ||
                        "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=300&h=200&fit=crop",
                })),

                // Querer - map from quero_cards (Flask returns snake_case), with mock fallback
                querer: (() => {
                    const mapped = (data.queroCards || []).map((q: any) => {
                        let title = (q.title || "").toUpperCase().replace(/\n/g, "\n");
                        let description = q.description || "";
                        
                        if (title.includes("BALADAS") || title.includes("MELHORES")) {
                            title = "BALADAS\nBADALADAS";
                            description = "Quero conhecer lugares animados e bem recomendados para dança e diversão aqui por perto.";
                        } else if (title.includes("PROFISSA") || title.includes("GENTE")) {
                            title = "GENTE\nPROFISSA";
                            description = "conhecer profissionais de dança que sejam boa companhia e me levem para dançar.";
                        } else if (title.includes("ESCOLAS") || title.includes("ESCOLA")) {
                            title = "ESCOLAS\nDE DANÇA";
                            description = "Quero me inscrever em escolas recomendadas para desenvolver os meus estilos de dança favoritos.";
                        } else if (title.includes("TRIBO") || title.includes("JANTAR")) {
                            title = "JANTAR\nMUSICAL";
                            description = "Quero sair pra jantar com alguém legal e curtir uma boa música ao vivo.";
                        } else if (title.includes("EXPERIENCE") || title.includes("ESPETÁCULO") || title.includes("ESPETACUL")) {
                            title = "ESPETÁCULOS\nESPETACULARES";
                            description = "Quero conhecer novos shows e artistas que tenham a ver comigo.";
                        }

                        return {
                            id: String(q.id),
                            title,
                            description,
                            image: buildImageUrl(q.image_url || q.imageUrl || q.cover_image) ||
                                "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop",
                            eventsCount: q.events_count || q.eventsCount || 0,
                            events: q.events || [],
                        };
                    });
                    if (mapped.length > 0) return mapped;
                    // Fallback mock data
                    return [
                        { id: "1", title: "SAIR PARA\nDANÇAR", description: "encontrar eventos incríveis para dançar a noite toda.", image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop", eventsCount: 12, events: [] },
                        { id: "2", title: "BALADAS\nBADALADAS", description: "conhecer lugares animados e bem recomendados para dança e diversão aqui por perto.", image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=400&h=300&fit=crop", eventsCount: 8, events: [] },
                        { id: "3", title: "GENTE\nPROFISSA", description: "conhecer profissionais de dança que sejam boa companhia e me levem para dançar.", image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=300&fit=crop", eventsCount: 5, events: [] },
                        { id: "4", title: "ESCOLAS\nDE DANÇA", description: "me inscrever em escolas recomendadas para desenvolver os meus estilos de dança favoritos.", image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=300&fit=crop", eventsCount: 6, events: [] },
                    ];
                })(),

                // Extra data from Admin
                events: (data.recommendations || []).map((e: any) => ({
                    id: String(e.id),
                    title: e.name || e.title || "Evento",
                    startsAt: e.start_date || e.startDate,
                    venueName: e.venue_name || e.venueName,
                    coverImage: buildImageUrl(e.cover_image_thumb || e.cover_image || e.coverImage),
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
