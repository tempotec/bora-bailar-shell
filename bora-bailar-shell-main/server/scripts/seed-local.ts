/**
 * Seed local — popula dados mínimos para testar o app localmente
 * Compatível com o schema atual (shared/schema.ts)
 * Uso: npx cross-env NODE_ENV=development tsx server/scripts/seed-local.ts
 */
import "dotenv/config";
import { db } from "../db";
import {
    adminUsers,
    venues,
    events,
    videos,
    awardCategories,
    queroCards,
} from "../../shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("🌱 Iniciando seed local...");

    // ─── Admin User ───────────────────────────────────────────
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db
        .insert(adminUsers)
        .values({
            email: "admin@borabailar.com",
            passwordHash,
            name: "Admin BoraBailar",
            role: "admin",
            isActive: true,
        })
        .onConflictDoNothing();
    console.log("✅ Admin user criado: admin@borabailar.com / admin123");

    // ─── Venues ───────────────────────────────────────────────
    const [v1, v2, v3, v4] = await db
        .insert(venues)
        .values([
            {
                name: "Lapa 40 Graus",
                address: "Rua do Riachuelo, 97 - Lapa",
                neighborhood: "Lapa",
                zone: "Centro",
                city: "Rio de Janeiro",
                latitude: "-22.9144",
                longitude: "-43.1789",
            },
            {
                name: "Casa Rosa",
                address: "Rua Alice, 550 - Laranjeiras",
                neighborhood: "Laranjeiras",
                zone: "Zona Sul",
                city: "Rio de Janeiro",
                latitude: "-22.9369",
                longitude: "-43.1892",
            },
            {
                name: "Rio Scenarium",
                address: "Rua do Lavradio, 20 - Lapa",
                neighborhood: "Lapa",
                zone: "Centro",
                city: "Rio de Janeiro",
                latitude: "-22.9083",
                longitude: "-43.1800",
            },
            {
                name: "Circo Voador",
                address: "Rua dos Arcos - Lapa",
                neighborhood: "Lapa",
                zone: "Centro",
                city: "Rio de Janeiro",
                latitude: "-22.9078",
                longitude: "-43.1784",
            },
        ])
        .returning();
    console.log("✅ Venues criados:", 4);

    // ─── Events ───────────────────────────────────────────────
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    await db.insert(events).values([
        {
            title: "Noite de Salsa & Bachata",
            description: "A melhor noite de dança latina do Rio! DJ internacional, aulas inclusas.",
            category: "dança",
            startsAt: futureDate,
            venueId: v1.id,
            coverImageUrl: null,
            priceCents: 4000,
            priceLabel: "R$ 40",
            sortOrder: 0,
            isFeatured: true,
            status: "published",
            publishedAt: new Date(),
        },
        {
            title: "Forró Pé de Serra",
            description: "Banda ao vivo com forró tradicional e muito arrasta-pé!",
            category: "dança",
            startsAt: futureDate,
            venueId: v2.id,
            coverImageUrl: null,
            priceCents: 3000,
            priceLabel: "R$ 30",
            sortOrder: 1,
            isFeatured: false,
            status: "published",
            publishedAt: new Date(),
        },
        {
            title: "Samba Rock Clássico",
            description: "Os melhores DJs da cena samba rock! Vista-se para impressionar.",
            category: "dança",
            startsAt: futureDate,
            venueId: v3.id,
            coverImageUrl: null,
            priceCents: 2500,
            priceLabel: "R$ 25",
            sortOrder: 2,
            isFeatured: true,
            status: "published",
            publishedAt: new Date(),
        },
        {
            title: "Zouk Night",
            description: "Aula de zouk + festa. Todos os níveis bem-vindos!",
            category: "dança",
            startsAt: futureDate,
            venueId: v4.id,
            coverImageUrl: null,
            priceCents: 3500,
            priceLabel: "R$ 35",
            sortOrder: 3,
            isFeatured: false,
            status: "published",
            publishedAt: new Date(),
        },
    ]);
    console.log("✅ Events criados:", 4);

    // ─── Quero Cards ──────────────────────────────────────────
    await db.insert(queroCards).values([
        {
            title: "BALADAS BADADADAS",
            description: "Quero conhecer lugares animados e bem recomendados para dança e diversão aqui por perto.",
            imageUrl: null,
            sortOrder: 0,
            isActive: true,
        },
        {
            title: "ESCOLAS DE DANÇA",
            description: "Quero me inscrever em escolas recomendadas para desenvolver os meus estilos de dança favoritos.",
            imageUrl: null,
            sortOrder: 1,
            isActive: true,
        },
        {
            title: "GENTE PROFISSA",
            description: "Quero encontrar professores, coreógrafos e profissionais de dança aqui perto.",
            imageUrl: null,
            sortOrder: 2,
            isActive: true,
        },
        {
            title: "ENCONTRE SUA TRIBO",
            description: "Quero encontrar pessoas com os mesmos gostos e curtir junto.",
            imageUrl: null,
            sortOrder: 3,
            isActive: true,
        },
        {
            title: "FULL EXPERIÊNCIA",
            description: "Quero viver experiências completas e inesquecíveis.",
            imageUrl: null,
            sortOrder: 4,
            isActive: true,
        },
    ]);
    console.log("✅ Quero Cards criados:", 5);

    // ─── Award Categories ─────────────────────────────────────
    await db.insert(awardCategories).values([
        { number: 1, title: "Zouk & Samba de Gafieira", categoryLabel: "Categoria 1", highlightWord: "Zouk", sortOrder: 0, isActive: true },
        { number: 2, title: "Pagode & Samba", categoryLabel: "Categoria 2", highlightWord: "Samba", sortOrder: 1, isActive: true },
        { number: 3, title: "Funk & Eletrônico", categoryLabel: "Categoria 3", highlightWord: "Funk", sortOrder: 2, isActive: true },
        { number: 4, title: "Salsa & Merengue", categoryLabel: "Categoria 4", highlightWord: "Salsa", sortOrder: 3, isActive: true },
        { number: 5, title: "Axé & Pagodão Baiano", categoryLabel: "Categoria 5", highlightWord: "Axé", sortOrder: 4, isActive: true },
        { number: 6, title: "Rock and Rolos", categoryLabel: "Categoria 6", highlightWord: "Rock", sortOrder: 5, isActive: true },
        { number: 7, title: "Forró For All", categoryLabel: "Categoria 7", highlightWord: "Forró", sortOrder: 6, isActive: true },
        { number: 8, title: "Zouk, Bolero e Bachata", categoryLabel: "Categoria 8", highlightWord: "Bachata", sortOrder: 7, isActive: true },
        { number: 9, title: "Dança Clássica", categoryLabel: "Categoria 9", highlightWord: "Clássica", sortOrder: 8, isActive: true },
        { number: 10, title: "Dança Contemporânea", categoryLabel: "Categoria 10", highlightWord: "Contemporânea", sortOrder: 9, isActive: true },
    ]);
    console.log("✅ Award Categories criadas:", 10);

    // ─── Videos (Stories) ─────────────────────────────────────
    await db.insert(videos).values([
        {
            title: "Momento dança na Lapa!",
            type: "story",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnailUrl: null,
            username: "@borabailar",
            displayName: "BoraBailar",
            sortOrder: 0,
            status: "published",
            publishedAt: new Date(),
        },
        {
            title: "Salsa incrível no Rio Scenarium",
            type: "story",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnailUrl: null,
            username: "@dancerio",
            displayName: "Dance Rio",
            sortOrder: 1,
            status: "published",
            publishedAt: new Date(),
        },
    ]);
    console.log("✅ Videos (stories) criados:", 2);

    console.log("\n🎉 Seed completo! Acesse o admin em http://localhost:5001/admin");
    console.log("   Login: admin@borabailar.com / admin123");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed falhou:", err);
    process.exit(1);
});
