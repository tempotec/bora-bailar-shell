// Hardcoded data extracted from DiscoverScreen and other places to serve as the "database" logic for content.

export const MOCK_DATA = {
    stories: [
        {
            id: "1",
            title: "Dançando com Julia",
            username: "@Alanzinho",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
        },
        {
            id: "2",
            title: "Leve como uma folha",
            username: "@Ivete22",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
        },
        {
            id: "3",
            title: "Na rua é mais legal",
            username: "@LuizaLulu",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_8c1c5cba.jpg"),
        },
        {
            id: "4",
            title: "Ritmo do coração",
            username: "@MarceloDance",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
        },
        {
            id: "5",
            title: "Noite de salsa",
            username: "@AnaForró",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_24afcbbe.jpg"),
        },
        {
            id: "6",
            title: "Alegria pura",
            username: "@PedroSamba",
            thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_dbae0db5.jpg"),
        },
    ],
    destaqueMes: {
        title: "Destaque do mês",
        thumbnail: require("../../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
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
