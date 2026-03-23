import type { Express, Request, Response } from "express";
import { db } from "./db";
import { events, videos, awardCategories, queroCards, venues, previewCodes, homeSections, homeSectionItems, pushTokens, notificationLogs } from "@shared/schema";
import { eq, and, gte, lte, or, sql, desc, asc, isNull, inArray } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// ─── Multer Config ────────────────────────────────────────────────────────────
const uploadsDir = path.resolve(process.cwd(), "uploads");
const videosDir = path.join(uploadsDir, "videos");
const thumbsDir = path.join(uploadsDir, "thumbs");
[uploadsDir, videosDir, thumbsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    cb(null, file.fieldname === "thumbnail" ? thumbsDir : videosDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.fieldname === "thumbnail" ? ".jpg" : ".mp4");
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, safeName);
  },
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
});

// ─── Auth Proxy Helper ────────────────────────────────────────────────────────
// Forwards auth requests to the Flask admin, which owns user accounts + JWT.
const ADMIN_BASE = process.env.ADMIN_API_URL || "http://localhost:5000";
console.log(`[Express Shell] ADMIN_API_URL → ${ADMIN_BASE}`);

async function proxyToFlask(
    req: Request,
    res: Response,
    flaskPath: string,
    method: "GET" | "POST" | "PUT" | "PATCH" = "POST"
) {
    try {
        const url = `${ADMIN_BASE}${flaskPath}`;
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Forward Authorization header if present
        const auth = req.headers["authorization"];
        if (auth) headers["Authorization"] = auth as string;

        const fetchOpts: RequestInit = { method, headers };
        if (method !== "GET" && req.body) {
            fetchOpts.body = JSON.stringify(req.body);
        }

        const flaskRes = await fetch(url, fetchOpts);
        const data = await flaskRes.json().catch(() => ({}));

        // Forward the same status code Flask returned
        res.status(flaskRes.status).json(data);
    } catch (err: any) {
        console.error(`[Auth Proxy] Error forwarding to ${flaskPath}:`, err.message);
        res.status(503).json({ error: "Serviço de autenticação indisponível. Tente novamente." });
    }
}

// Helper to resolve item by type and id
async function resolveItem(itemType: string, itemId: string, now: Date) {
    if (itemType === "event") {
        const [result] = await db.select({
            event: events,
            venue: venues,
        })
            .from(events)
            .leftJoin(venues, eq(events.venueId, venues.id))
            .where(and(
                eq(events.id, itemId),
                eq(events.status, "published")
            ));
        return result ? { ...result.event, venue: result.venue } : null;
    }
    if (itemType === "video") {
        const [video] = await db.select().from(videos)
            .where(and(eq(videos.id, itemId), eq(videos.status, "published")));
        return video || null;
    }
    if (itemType === "award") {
        const [award] = await db.select().from(awardCategories)
            .where(and(eq(awardCategories.id, itemId), eq(awardCategories.isActive, true)));
        return award || null;
    }
    if (itemType === "quero") {
        const [quero] = await db.select().from(queroCards)
            .where(and(eq(queroCards.id, itemId), eq(queroCards.isActive, true)));
        return quero || null;
    }
    return null;
}

// Legacy fallback queries (when no home_sections exist)
async function legacyDiscover(now: Date) {
    // Stories: type='story', published, within window
    const stories = await db.select().from(videos)
        .where(and(
            eq(videos.type, "story"),
            eq(videos.status, "published"),
            or(isNull(videos.startsAt), lte(videos.startsAt, now)),
            or(isNull(videos.endsAt), gte(videos.endsAt, now))
        ))
        .orderBy(asc(videos.sortOrder), desc(videos.publishedAt))
        .limit(20);

    // Featured Month: type='featured_month', published, within window, only 1
    const [featured] = await db.select().from(videos)
        .where(and(
            eq(videos.type, "featured_month"),
            eq(videos.status, "published"),
            or(isNull(videos.startsAt), lte(videos.startsAt, now)),
            or(isNull(videos.endsAt), gte(videos.endsAt, now))
        ))
        .orderBy(asc(videos.sortOrder), desc(videos.publishedAt))
        .limit(1);

    // Awards: active, sorted
    const awards = await db.select().from(awardCategories)
        .where(eq(awardCategories.isActive, true))
        .orderBy(asc(awardCategories.sortOrder));

    // Quero: active, within window
    const quero = await db.select().from(queroCards)
        .where(and(
            eq(queroCards.isActive, true),
            or(isNull(queroCards.startsAt), lte(queroCards.startsAt, now)),
            or(isNull(queroCards.endsAt), gte(queroCards.endsAt, now))
        ))
        .orderBy(asc(queroCards.sortOrder));

    // Recommendations: featured events, published, future
    const recommendations = await db.select({
        event: events,
        venue: venues,
    })
        .from(events)
        .leftJoin(venues, eq(events.venueId, venues.id))
        .where(and(
            eq(events.isFeatured, true),
            eq(events.status, "published"),
            gte(events.startsAt, now)
        ))
        .orderBy(asc(events.sortOrder), asc(events.startsAt))
        .limit(10);

    return {
        stories,
        featured: featured || null,
        awards,
        quero,
        recommendations: recommendations.map(r => ({
            ...r.event,
            venue: r.venue,
        })),
    };
}

export function registerPublicRoutes(app: Express) {

    // ===== AUTH — proxy to Flask admin =======================================
    // Flask owns user accounts + JWT tokens. Express just forwards the calls.
    // Routes use /api/auth/* to match the client's BASE_URL (which includes /api).

    // POST /api/auth/login → Flask /api/auth/login
    app.post("/api/auth/login", (req, res) => proxyToFlask(req, res, "/api/auth/login", "POST"));

    // POST /api/auth/register → Flask /api/auth/register
    app.post("/api/auth/register", (req, res) => proxyToFlask(req, res, "/api/auth/register", "POST"));

    // GET /api/auth/me → Flask /api/auth/me (requires Authorization: Bearer token)
    app.get("/api/auth/me", (req, res) => proxyToFlask(req, res, "/api/auth/me", "GET"));

    // PUT /api/auth/me → Flask /api/auth/me (update profile)
    app.put("/api/auth/me", (req, res) => proxyToFlask(req, res, "/api/auth/me", "PUT"));

    // POST /api/auth/change-password → Flask /api/auth/change-password
    app.post("/api/auth/change-password", (req, res) => proxyToFlask(req, res, "/api/auth/change-password", "POST"));

    // ===== /api/discover =====
    // Dynamic: uses home_sections + home_section_items if configured, otherwise fallback

    app.get("/api/discover", async (req, res) => {

        // Tenta primeiro o Flask admin (fonte principal de conteúdo)
        const ADMIN_URL = ADMIN_BASE;
        try {
            const r = await fetch(`${ADMIN_URL}/api/discover`, { signal: AbortSignal.timeout(2000) });
            if (r.ok) {
                const json = await r.json();
                // Flask retorna { success: true, data: {...} } — extrair o payload interno
                const payload = json.data || json;
                return res.json(payload);
            }
        } catch (_) { /* Flask offline — usa banco local */ }

        try {
            const now = new Date();

            // Check if home_sections are configured
            const sections = await db.select().from(homeSections)
                .where(eq(homeSections.isEnabled, true))
                .orderBy(asc(homeSections.sortOrder));

            // Fallback to legacy queries if no sections configured
            if (sections.length === 0) {
                const legacy = await legacyDiscover(now);
                return res.json(legacy);
            }

            // Build dynamic response from sections
            const response: Record<string, any> = {};

            for (const section of sections) {
                // Get items for this section (active, within window)
                const items = await db.select().from(homeSectionItems)
                    .where(and(
                        eq(homeSectionItems.sectionId, section.id),
                        eq(homeSectionItems.isActive, true),
                        or(isNull(homeSectionItems.startsAt), lte(homeSectionItems.startsAt, now)),
                        or(isNull(homeSectionItems.endsAt), gte(homeSectionItems.endsAt, now))
                    ))
                    .orderBy(asc(homeSectionItems.sortOrder));

                // Resolve each item
                const resolvedItems: any[] = [];
                for (const item of items) {
                    const resolved = await resolveItem(item.itemType, item.itemId, now);
                    if (resolved) resolvedItems.push(resolved);
                }

                // Special handling for 'featured' (single item)
                if (section.key === "featured") {
                    response[section.key] = resolvedItems[0] || null;
                } else {
                    response[section.key] = resolvedItems;
                }
            }

            // Ensure all expected keys exist (for app compatibility)
            if (!("stories" in response)) response.stories = [];
            if (!("featured" in response)) response.featured = null;
            if (!("awards" in response)) response.awards = [];
            if (!("quero" in response)) response.quero = [];
            if (!("recommendations" in response)) response.recommendations = [];

            res.json(response);
        } catch (error) {
            console.error("Error in /api/discover:", error);
            res.status(500).json({ error: "Erro ao buscar discover" });
        }
    });


    // ===== /api/events =====
    // Query params: zone, neighborhood, from, to

    app.get("/api/events", async (req, res) => {
        try {
            const { zone, neighborhood, from, to } = req.query;
            const now = new Date();

            let query = db.select({
                event: events,
                venue: venues,
            })
                .from(events)
                .leftJoin(venues, eq(events.venueId, venues.id))
                .where(eq(events.status, "published"))
                .$dynamic();

            // Build conditions array
            const conditions = [eq(events.status, "published")];

            if (zone) {
                conditions.push(eq(venues.zone, zone as string));
            }
            if (neighborhood) {
                conditions.push(eq(venues.neighborhood, neighborhood as string));
            }
            if (from) {
                conditions.push(gte(events.startsAt, new Date(from as string)));
            }
            if (to) {
                conditions.push(lte(events.startsAt, new Date(to as string)));
            }

            const result = await db.select({
                event: events,
                venue: venues,
            })
                .from(events)
                .leftJoin(venues, eq(events.venueId, venues.id))
                .where(and(...conditions))
                .orderBy(asc(events.startsAt));

            res.json(result.map(r => ({
                ...r.event,
                venue: r.venue,
            })));
        } catch (error) {
            console.error("Error in /api/events:", error);
            res.status(500).json({ error: "Erro ao buscar events" });
        }
    });

    // ===== /api/events/:id =====

    app.get("/api/events/:id", async (req, res) => {
        try {
            const [result] = await db.select({
                event: events,
                venue: venues,
            })
                .from(events)
                .leftJoin(venues, eq(events.venueId, venues.id))
                .where(and(
                    eq(events.id, req.params.id),
                    eq(events.status, "published")
                ));

            if (!result) {
                return res.status(404).json({ error: "Evento não encontrado" });
            }

            res.json({
                ...result.event,
                venue: result.venue,
            });
        } catch (error) {
            console.error("Error in /api/events/:id:", error);
            res.status(500).json({ error: "Erro ao buscar event" });
        }
    });

    // ===== /api/venues =====

    app.get("/api/venues", async (req, res) => {
        try {
            const { zone, neighborhood } = req.query;
            const conditions = [];

            if (zone) conditions.push(eq(venues.zone, zone as string));
            if (neighborhood) conditions.push(eq(venues.neighborhood, neighborhood as string));

            const result = conditions.length > 0
                ? await db.select().from(venues).where(and(...conditions)).orderBy(asc(venues.name))
                : await db.select().from(venues).orderBy(asc(venues.name));

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar venues" });
        }
    });

    // ===== /api/preview/:code =====
    // Atomic: retrieves data and marks as used

    app.get("/api/preview/:code", async (req, res) => {
        try {
            const now = new Date();

            // Atomic transaction: find valid code and mark as used
            const result = await db.transaction(async (tx) => {
                const [code] = await tx.select().from(previewCodes)
                    .where(and(
                        eq(previewCodes.code, req.params.code),
                        isNull(previewCodes.usedAt),
                        gte(previewCodes.expiresAt, now)
                    ))
                    .limit(1);

                if (!code) return null;

                // Mark as used
                await tx.update(previewCodes)
                    .set({ usedAt: now })
                    .where(eq(previewCodes.id, code.id));

                // Get the resource based on type
                if (code.resourceType === "event" && code.resourceId) {
                    const [event] = await tx.select({
                        event: events,
                        venue: venues,
                    })
                        .from(events)
                        .leftJoin(venues, eq(events.venueId, venues.id))
                        .where(eq(events.id, code.resourceId));

                    return { type: "event", data: event ? { ...event.event, venue: event.venue } : null };
                }

                if (code.resourceType === "discover") {
                    // Return full discover including drafts
                    const stories = await tx.select().from(videos)
                        .where(eq(videos.type, "story"))
                        .orderBy(asc(videos.sortOrder));

                    const awards = await tx.select().from(awardCategories)
                        .orderBy(asc(awardCategories.sortOrder));

                    const quero = await tx.select().from(queroCards)
                        .orderBy(asc(queroCards.sortOrder));

                    return { type: "discover", data: { stories, awards, quero } };
                }

                return { type: code.resourceType, data: null };
            });

            if (!result) {
                return res.status(404).json({ error: "Código inválido ou expirado" });
            }

            res.json(result);
        } catch (error) {
            console.error("Error in /api/preview/:code:", error);
            res.status(500).json({ error: "Erro ao processar preview" });
        }
    });

    // ===== /api/content/quero =====
    // Lido direto do banco PostgreSQL local (gerenciado pelo admin Express)

    app.get("/api/content/quero", async (req, res) => {
        try {
            const now = new Date();
            const cards = await db.select().from(queroCards)
                .where(and(
                    eq(queroCards.isActive, true),
                    or(isNull(queroCards.startsAt), lte(queroCards.startsAt, now)),
                    or(isNull(queroCards.endsAt), gte(queroCards.endsAt, now))
                ))
                .orderBy(asc(queroCards.sortOrder));
            res.json({ quero: cards });
        } catch (error) {
            console.error("Error in /api/content/quero:", error);
            res.status(500).json({ error: "Erro ao buscar quero cards" });
        }
    });

    // ===== /api/content/awards/active =====
    // Lido direto do banco PostgreSQL local

    app.get("/api/content/awards/active", async (req, res) => {
        try {
            const cats = await db.select().from(awardCategories)
                .where(eq(awardCategories.isActive, true))
                .orderBy(asc(awardCategories.sortOrder));
            res.json({
                editions: [{
                    id: 1,
                    year: new Date().getFullYear(),
                    name: "BoraBailar TOP 10",
                    categories: cats.map(c => ({
                        id: c.id,
                        name: c.title,
                        category_label: c.categoryLabel,
                        number: c.number,
                        highlight_word: c.highlightWord,
                        image_url: c.imageUrl,
                    }))
                }]
            });
        } catch (error) {
            console.error("Error in /api/content/awards/active:", error);
            res.status(500).json({ error: "Erro ao buscar awards" });
        }
    });

    // ===== /api/content/tips/weekly-events =====
    // Proxy para o admin Flask /api/weekly-tips, fallback no banco local

    app.get("/api/content/tips/weekly-events", async (req, res) => {
        const ADMIN_URL = ADMIN_BASE;
        try {
            const r = await fetch(`${ADMIN_URL}/api/weekly-tips`);
            if (r.ok) return res.json(await r.json());
        } catch (_) { /* Flask offline — usa fallback */ }

        // Fallback: published events como tips
        try {
            const dayNames = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
            const rows = await db.select({ event: events, venue: venues })
                .from(events)
                .leftJoin(venues, eq(events.venueId, venues.id))
                .where(eq(events.status, "published"))
                .orderBy(asc(events.startsAt))
                .limit(28);
            const tips = rows.map((r, idx) => ({
                id: r.event.id,
                dayOfWeek: idx % 7,
                dayOfWeekName: dayNames[idx % 7],
                title: r.event.title,
                event: {
                    id: r.event.id, title: r.event.title, description: r.event.description,
                    price: r.event.priceLabel || "Grátis", cover_image: r.event.coverImageUrl, venue: r.venue
                },
                isActive: true,
            }));
            res.json({ tips });
        } catch (error) {
            console.error("Error in /api/content/tips/weekly-events:", error);
            res.status(500).json({ error: "Erro ao buscar tips" });
        }
    });

    // ===== /api/content/partner-cards =====
    // Proxy para admin Flask /api/places (parceiros/locais)

    app.get("/api/content/partner-cards", async (req, res) => {
        const ADMIN_URL = ADMIN_BASE;
        try {
            const r = await fetch(`${ADMIN_URL}/api/places`);
            if (r.ok) {
                const data: any = await r.json();
                const cards = (data.places || data || []).map((p: any) => ({
                    id: p.id, title: p.name || p.title, description: p.description,
                    image_url: p.cover_image || p.image_url, cta_label: "Conhecer", cta_url: p.website,
                }));
                return res.json({ partner_cards: cards });
            }
        } catch (_) { /* Flask offline */ }
        res.json({ partner_cards: [] });
    });

    // ===== /api/content/partner-brands =====
    app.get("/api/content/partner-brands", async (_req, res) => {
        res.json({ partner_brands: [] });
    });

    // ===== /api/content/home =====
    // Public: Editable home texts (returns defaults if not configured)

    app.get("/api/content/home", async (req, res) => {
        res.json({
            hero_tagline: "SAIR, DANÇAR E SE DIVERTIR!",
            quero_section_title: "O seu querer faz acontecer",
            momento_title: "Momento dança é momento feliz",
            momento_subtitle: "Para quem curte ver gente feliz em momentos felizes. Compartilhe aqui os seus passos.",
            momento_cta: "Faça aqui o upload do seu momento dança",
            awards_title: "BoraBailar Top Dance Awards",
            awards_subtitle: "Os melhores da dança, eleitos por você",
            dicas_title: "Dicas da semana",
            search_hint: "É só falar que a gente te entende!",
        });
    });

    // ===== /api/videos/feed =====
    app.get("/api/videos/feed", async (req, res) => {
        try {
            const perPage = parseInt(req.query.per_page as string) || 10;
            const page = parseInt(req.query.page as string) || 1;
            const allVideos = await db.select().from(videos)
                .where(eq(videos.status, "published"))
                .orderBy(asc(videos.sortOrder), desc(videos.publishedAt))
                .limit(perPage);
            res.json({
                videos: allVideos.map(v => ({
                    id: v.id, video_url: v.videoUrl, thumbnail_url: v.thumbnailUrl,
                    caption: v.title, user: { id: 0, name: v.displayName || v.username || "BoraBailar" }, status: v.status,
                })),
                page, total: allVideos.length, pages: 1,
            });
        } catch (error) {
            console.error("Error in /api/videos/feed:", error);
            res.status(500).json({ error: "Erro ao buscar videos" });
        }
    });

    // ===== PROXY GENÉRICO para admin Flask =====
    for (const route of ["/api/health", "/api/promotions", "/api/places", "/api/weekly-tips", "/api/weekly-tips/today"]) {
        app.get(route, async (req, res) => {
            const ADMIN_URL = ADMIN_BASE;
            try {
                const qs = new URLSearchParams(req.query as any).toString();
                const r = await fetch(`${ADMIN_URL}${route}${qs ? "?" + qs : ""}`);
                res.status(r.status).json(await r.json());
            } catch (error) {
                res.status(503).json({ error: "Admin indisponível" });
            }
        });
    }

    // ===== PUSH NOTIFICATIONS =====

    // Register push token (called by the mobile app on startup)
    app.post("/api/push-tokens/register", async (req, res) => {
        try {
            const { token, platform, userId } = req.body;

            if (!token) {
                return res.status(400).json({ error: "Token é obrigatório" });
            }

            // Validate Expo push token format
            if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
                return res.status(400).json({ error: "Token inválido. Use Expo Push Token." });
            }

            // Upsert: insert or update if token already exists
            const existing = await db.select().from(pushTokens)
                .where(eq(pushTokens.token, token))
                .limit(1);

            if (existing.length > 0) {
                // Re-activate if it was deactivated
                await db.update(pushTokens)
                    .set({ isActive: true, platform: platform || existing[0].platform, userId: userId || existing[0].userId, updatedAt: new Date() })
                    .where(eq(pushTokens.token, token));
                return res.json({ success: true, message: "Token atualizado" });
            }

            await db.insert(pushTokens).values({
                token,
                platform: platform || null,
                userId: userId || null,
            });

            res.json({ success: true, message: "Token registrado" });
        } catch (error) {
            console.error("Error in /api/push-tokens/register:", error);
            res.status(500).json({ error: "Erro ao registrar token" });
        }
    });

    // Send push notification to all registered devices
    app.post("/api/notifications/send", async (req, res) => {
        try {
            const { title, body, data } = req.body;

            if (!title || !body) {
                return res.status(400).json({ error: "title e body são obrigatórios" });
            }

            // Get all active tokens
            const tokens = await db.select().from(pushTokens)
                .where(eq(pushTokens.isActive, true));

            if (tokens.length === 0) {
                // Log the attempt even with no tokens
                await db.insert(notificationLogs).values({
                    title, body,
                    data: data || {},
                    totalTokens: 0,
                    successCount: 0,
                    failureCount: 0,
                });
                return res.json({
                    success: true,
                    message: "Nenhum dispositivo registrado para receber push",
                    totalTokens: 0,
                    successCount: 0,
                    failureCount: 0,
                });
            }

            // Build Expo push messages
            const messages = tokens.map(t => ({
                to: t.token,
                sound: "default" as const,
                title,
                body,
                data: data || {},
            }));

            // Send via Expo Push API (HTTP, no SDK needed)
            const chunks: typeof messages[] = [];
            const CHUNK_SIZE = 100; // Expo recommends max 100 per request
            for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
                chunks.push(messages.slice(i, i + CHUNK_SIZE));
            }

            let successCount = 0;
            let failureCount = 0;
            const invalidTokens: string[] = [];

            for (const chunk of chunks) {
                try {
                    const response = await fetch("https://exp.host/--/api/v2/push/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(chunk),
                    });
                    const result: any = await response.json();
                    const tickets = result.data || [];

                    for (let i = 0; i < tickets.length; i++) {
                        if (tickets[i].status === "ok") {
                            successCount++;
                        } else {
                            failureCount++;
                            // Mark invalid tokens for cleanup
                            if (tickets[i].details?.error === "DeviceNotRegistered") {
                                invalidTokens.push(chunk[i].to);
                            }
                        }
                    }
                } catch (err) {
                    console.error("Expo push chunk error:", err);
                    failureCount += chunk.length;
                }
            }

            // Deactivate invalid tokens
            if (invalidTokens.length > 0) {
                await db.update(pushTokens)
                    .set({ isActive: false, updatedAt: new Date() })
                    .where(inArray(pushTokens.token, invalidTokens));
            }

            // Log the send
            await db.insert(notificationLogs).values({
                title, body,
                data: data || {},
                totalTokens: tokens.length,
                successCount,
                failureCount,
            });

            res.json({
                success: true,
                message: `Notificação enviada para ${successCount} dispositivo(s)`,
                totalTokens: tokens.length,
                successCount,
                failureCount,
                invalidTokensRemoved: invalidTokens.length,
            });
        } catch (error) {
            console.error("Error in /api/notifications/send:", error);
            res.status(500).json({ error: "Erro ao enviar notificação" });
        }
    });

    // List notification logs (for admin)
    app.get("/api/notifications/logs", async (_req, res) => {
        try {
            const logs = await db.select().from(notificationLogs)
                .orderBy(desc(notificationLogs.sentAt))
                .limit(50);
            res.json({ logs });
        } catch (error) {
            console.error("Error in /api/notifications/logs:", error);
            res.status(500).json({ error: "Erro ao buscar logs" });
        }
    });

    // Get token count (for admin dashboard)
    app.get("/api/push-tokens/count", async (_req, res) => {
        try {
            const [result] = await db.select({ count: sql<number>`count(*)` })
                .from(pushTokens)
                .where(eq(pushTokens.isActive, true));
            res.json({ count: Number(result.count) });
        } catch (error) {
            res.status(500).json({ error: "Erro ao contar tokens" });
        }
    });

    // ─── Video Upload ──────────────────────────────────────────────────────────
    app.post(
        "/api/videos/upload",
        uploadMiddleware.fields([
            { name: "video", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        async (req: Request, res: Response) => {
            try {
                const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
                const videoFile = files?.["video"]?.[0];
                const thumbFile = files?.["thumbnail"]?.[0];

                if (!videoFile) {
                    return res.status(400).json({ error: "Arquivo de vídeo é obrigatório" });
                }

                const videoUrl = `/uploads/videos/${videoFile.filename}`;
                const thumbnailUrl = thumbFile ? `/uploads/thumbs/${thumbFile.filename}` : null;
                const caption = (req.body.caption as string) || "";
                const title = (req.body.title as string) || caption.slice(0, 60) || "Upload";

                const [video] = await db.insert(videos).values({
                    title,
                    videoUrl,
                    thumbnailUrl,
                    description: caption,
                    type: "ugc",
                    status: "published",
                }).returning();

                console.log(`[Upload] Video saved: ${videoUrl} (id: ${video.id})`);

                res.status(201).json({
                    video: {
                        id: video.id,
                        status: video.status,
                        video_url: videoUrl,
                        thumbnail_url: thumbnailUrl,
                        caption,
                    },
                });
            } catch (error) {
                console.error("[Upload] Error:", error);
                res.status(500).json({ error: "Falha no upload" });
            }
        }
    );
}
