import type { Express } from "express";
import { db } from "./db";
import { events, videos, awardCategories, queroCards, venues, previewCodes, homeSections, homeSectionItems } from "@shared/schema";
import { eq, and, gte, lte, or, sql, desc, asc, isNull, inArray } from "drizzle-orm";

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

    // ===== /api/discover =====
    // Dynamic: uses home_sections + home_section_items if configured, otherwise fallback

    app.get("/api/discover", async (req, res) => {
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
}
