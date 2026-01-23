
export const EXPLORE_STORIES_DATA = [
    {
        id: "1",
        username: "Dançando com Julia",
        description: "@Alanzinho no @BosqueBar",
        thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
        // Using a sample video URL that works
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
        id: "2",
        username: "Leve como uma folha",
        description: "@Ivete22 no @ParqueBar",
        thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    },
    {
        id: "3",
        username: "Na rua é mais legal",
        description: "@LuizaLulu na Lapa",
        thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_8c1c5cba.jpg"),
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    },
    {
        id: "4",
        username: "Na roda de samba",
        description: "@ZeZinho no Centro",
        thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
];

export const EXPLORE_EVENTS_DATA = [
    {
        id: "1",
        day: "QUI",
        date: "14/09",
        title: "QUINTANEJA NO PADANO",
        location: "Barra da Tijuca",
        time: "17h00",
        image: require("../../attached_assets/stock_images/ballroom_dancing_cou_a3f721af.jpg"),
        tags: ["Novo", "Sertanejo"],
    },
    {
        id: "2",
        day: "SEX",
        date: "14/09",
        title: "HAPPY HOUR NO CARIOCA DA GEMA",
        location: "Lapa - Centro",
        time: "18h00",
        image: require("../../attached_assets/stock_images/ballroom_dancing_cou_83e25a1a.jpg"),
        tags: ["Samba"],
    },
    {
        id: "3",
        day: "SAB",
        date: "14/09",
        title: "MALHAÇÃO COM DANÇA",
        location: "Leblon",
        time: "15h00",
        image: require("../../attached_assets/stock_images/ballroom_dancing_cou_4ebc2182.jpg"),
        tags: ["Funk"],
    },
    {
        id: "4",
        day: "DOM",
        date: "14/09",
        title: "JANTAR DANÇANTE",
        location: "Jacarepaguá",
        time: "19h00",
        image: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
        tags: ["Novo", "Zouk"],
    },
    {
        id: "5",
        day: "SEG",
        date: "14/09",
        title: "CAFÉ DA MANHÃ COM MÚSICA",
        location: "Tijuca",
        time: "10h00",
        image: require("../../attached_assets/stock_images/ballroom_dancing_cou_7a8e006d.jpg"),
        tags: ["Samba"],
    },
];

export const FILTER_OPTIONS = [
    { id: "filtros", label: "Filtros", count: 4, isPrimary: true },
    { id: "com_homem", label: "Com homem", isPrimary: false },
    { id: "5km", label: "5km", isPrimary: false },
    { id: "forro", label: "Forró", isPrimary: false },
    { id: "salsa", label: "Salsa", isPrimary: false },
    { id: "zouk", label: "Zouk", isPrimary: false },
];
