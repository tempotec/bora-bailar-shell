// Hardcoded data extracted from DiscoverScreen and other places to serve as the "database" logic for content.

export const MOCK_DATA = {
    stories: [
        {
            id: "1",
            title: "Dançando com Julia",
            username: "@Alanzinho",
            thumbnail: require("../../attached_assets/dancando_com_julia_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/dancando_com_julia.mp4"),
        },
        {
            id: "2",
            title: "Leve como uma folha",
            username: "@Ivete22",
            thumbnail: require("../../attached_assets/leve_como_uma_folha_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/leve_como_uma_folha.mp4"),
        },
        {
            id: "3",
            title: "Na rua é mais legal",
            username: "@LuizaLulu",
            thumbnail: require("../../attached_assets/na_rua_e_mais_legal_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/na_rua_e_mais_legal.mp4"),
        },
        {
            id: "4",
            title: "Ritmo do coração",
            username: "@MarceloDance",
            thumbnail: require("../../attached_assets/ritmo_coracao_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/ritmo_coracao.mp4"),
        },
        {
            id: "5",
            title: "Noite de salsa",
            username: "@AnaForró",
            thumbnail: require("../../attached_assets/noite_de_salsa_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/noite_de_salsa.mp4"),
        },
        {
            id: "6",
            title: "Alegria pura",
            username: "@PedroSamba",
            thumbnail: require("../../attached_assets/alegria_pura_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/alegria_pura.mp4"),
        },
        {
            id: "7",
            title: "Caminhando e dançando",
            username: "@CarlaMove",
            thumbnail: require("../../attached_assets/african_american_dancing_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/mixkit-african-american-girl-dancing-while-walking-in-a-park-4886-hd-ready.mp4"),
        },
        {
            id: "8",
            title: "Luzes futuristas",
            username: "@TechDancer",
            thumbnail: require("../../attached_assets/blue_lasers_futuristic_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/mixkit-blue-lasers-illuminate-a-man-wearing-futuristic-glasses-50498-hd-ready.mp4"),
        },
        {
            id: "9",
            title: "Dança colorida",
            username: "@VibesDance",
            thumbnail: require("../../attached_assets/colorful_young_dancer_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/mixkit-colorful-dance-of-a-young-dancer-51277-hd-ready.mp4"),
        },
        {
            id: "10",
            title: "Coreografia noturna",
            username: "@NightMoves",
            thumbnail: require("../../attached_assets/dynamic_choreography_night_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/mixkit-dynamic-choreography-by-a-girl-on-the-street-at-night-51304-hd-ready.mp4"),
        },
        {
            id: "11",
            title: "Fones e passos",
            username: "@MusicFlow",
            thumbnail: require("../../attached_assets/girl_headphones_walk_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/mixkit-girl-dancing-with-her-headphones-while-taking-a-walk-4823-hd-ready.mp4"),
        },
        {
            id: "12",
            title: "Máscara misteriosa",
            username: "@HalloweenVibes",
            thumbnail: require("../../attached_assets/halloween_mask_dancing_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/mixkit-girl-with-hallowween-mask-dancing-close-to-the-lens-42216-hd-ready.mp4"),
        },
        {
            id: "13",
            title: "Silhuetas na fumaça",
            username: "@SmokeShow",
            thumbnail: require("../../attached_assets/silhouettes_smoke_lights_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/mixkit-silhouettes-of-two-dancers-under-smoke-and-colored-lights-33901-hd-ready.mp4"),
        },
        {
            id: "14",
            title: "Nuvem de movimento",
            username: "@CloudDancer",
            thumbnail: require("../../attached_assets/woman_smoke_cloud_thumb.jpg"),
            videoUrl: require("../../attached_assets/videos/mixkit-young-woman-dancing-under-a-cloud-of-smoke-and-a-33899-hd-ready.mp4"),
        },
    ],
    destaqueMes: {
        title: "MOMENTO DANÇA É MOMENTO FELIZ",
        thumbnail: require("../../attached_assets/destaque_do_mes_thumb.jpg"),
        videoUrl: require("../../attached_assets/videos/destaque do mes.mp4"),
    },
    awards: [
        {
            id: "1",
            category: "Categoria 1",
            title: "O que vale é animação",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
        },
        {
            id: "2",
            category: "Categoria 2",
            title: "Baladas badaladas",
            thumbnail: require("../../../attached_assets/stock_images/ballroom_dancing_cou_a3f721af.jpg"),
        },
        {
            id: "3",
            category: "Categoria 3",
            title: "Aiquibão a dança de salão",
            thumbnail: require("../../../attached_assets/stock_images/ballroom_dancing_cou_83e25a1a.jpg"),
        },
        {
            id: "4",
            category: "Categoria 4",
            title: "É samba no pé",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
        },
        {
            id: "5",
            category: "Categoria 5",
            title: "Famosos no BoraBailar",
            highlightWord: "BoraBailar",
            thumbnail: require("../../../attached_assets/stock_images/ballroom_dancing_cou_4ebc2182.jpg"),
        },
        {
            id: "6",
            category: "Categoria 6",
            title: "Forró pé de serra",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_8c1c5cba.jpg"),
        },
        {
            id: "7",
            category: "Categoria 7",
            title: "Zouk love",
            thumbnail: require("../../../attached_assets/stock_images/ballroom_dancing_cou_476ab99c.jpg"),
        },
        {
            id: "8",
            category: "Categoria 8",
            title: "Bachata sensual",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
        },
        {
            id: "9",
            category: "Categoria 9",
            title: "Tango argentino",
            thumbnail: require("../../../attached_assets/stock_images/ballroom_dancing_cou_7a8e006d.jpg"),
        },
        {
            id: "10",
            category: "Categoria 10",
            title: "Danças urbanas",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_24afcbbe.jpg"),
        },
    ],
    recommendations: [
        {
            id: "1",
            title: "Festa de Halloween",
            price: "R$50",
            discount: "40% OFF",
            image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=300&h=200&fit=crop",
        },
        {
            id: "2",
            title: "Festival de dança RJ",
            price: "R$100",
            discount: "20% OFF",
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop",
        },
        {
            id: "3",
            title: "Noite de Salsa",
            price: "R$35",
            discount: "30% OFF",
            image: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=300&h=200&fit=crop",
        },
        {
            id: "4",
            title: "Baile Tropical",
            price: "R$60",
            discount: "25% OFF",
            image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=200&fit=crop",
        },
        {
            id: "5",
            title: "Workshop Forró",
            price: "R$80",
            discount: "15% OFF",
            image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop",
        },
        {
            id: "6",
            title: "Pagode da Cidade",
            price: "R$45",
            discount: "50% OFF",
            image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&h=200&fit=crop",
        },
    ],
    querer: [
        {
            id: "1",
            title: "SAIR PARA\nDANÇAR",
            description: "sair pra dançar e me divertir com alguém que tenha a ver comigo, mas sem compromissos.",
            image: require("../../../attached_assets/quero1.jpg"),
        },
        {
            id: "2",
            title: "SAIR EM\nGRUPO",
            description: "sair em grupo para dançar e conhecer gente educada e simpática que gosta do que eu gosto.",
            image: require("../../../attached_assets/quero2.jpg"),
        },
        {
            id: "3",
            title: "MELHORES\nBALADAS",
            description: "sair em grupo para dançar e conhecer gente educada e simpática que gosta do que eu gosto.",
            image: require("../../../attached_assets/quero3.jpg"),
        },
        {
            id: "4",
            title: "GENTE\nPROFISSA",
            description: "conhecer profissionais que sejam boa companhia e me levem para dançar.",
            image: require("../../../attached_assets/quero4.jpg"),
        },
        {
            id: "5",
            title: "ESCOLAS\nDE DANÇA",
            description: "conhecer profissionais que sejam boa companhia e me levem para dançar.",
            image: require("../../../attached_assets/quero5.jpg"),
        },
        {
            id: "6",
            title: "ESCOLHA\nSUA TRIBO",
            description: "participar de comunidades de gente que ama dançar e se divertir de forma sadia e feliz.",
            image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop",
        },
        {
            id: "7",
            title: "BORABAILAR\nTOP 10",
            description: "poder receber e mandar conteúdo para votar e ser votado no BB TOP 10 AWARD",
            image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop",
        },
        {
            id: "8",
            title: "FULL\nEXPERIENCE",
            description: "participar de eventos integrados de DANÇA, GASTRONOMIA e CONFRATERNIZAÇÃO.",
            image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop",
        },
    ]
};

// Helper functions for video rotation across different sections

/**
 * Get videos for EXPLORAR section (first 4 videos)
 */
export function getExplorarVideos() {
    return MOCK_DATA.stories.slice(0, 4);
}

/**
 * Get videos for specific Quero category with rotation
 * Each category gets a different subset of 5 videos based on hash of category name
 */
export function getQueroVideos(queroTitle?: string) {
    // Use simple hash to deterministically select videos based on title
    // This ensures same Quero always shows same videos, but different Queros show different sets
    const hash = (queroTitle || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const startIndex = hash % 10; // Start from different position based on title

    // Get 5 consecutive videos (with wraparound)
    const videos = [];
    for (let i = 0; i < 5; i++) {
        videos.push(MOCK_DATA.stories[(startIndex + i) % MOCK_DATA.stories.length]);
    }

    return videos;
}
