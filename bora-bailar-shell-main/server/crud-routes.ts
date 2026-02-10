import type { Express, Request, Response } from "express";
import { db } from "./db";
import { venues, partners, events, videos, awardCategories, queroCards, previewCodes, adminUsers } from "@shared/schema";
import { eq, and, gte, lte, or, sql, desc, asc, isNull } from "drizzle-orm";
import crypto from "crypto";

// ===== HELPER: Check admin auth =====
function requireAdmin(req: Request, res: Response): boolean {
    const user = (req as any).adminUser;
    if (!user) {
        res.status(401).json({ error: "Não autenticado" });
        return false;
    }
    return true;
}

export function registerCrudRoutes(app: Express) {

    // ===== VENUES =====

    app.get("/api/admin/venues", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const result = await db.select().from(venues).orderBy(asc(venues.name));
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar venues" });
        }
    });

    app.post("/api/admin/venues", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [venue] = await db.insert(venues).values(req.body).returning();
            res.status(201).json(venue);
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar venue" });
        }
    });

    app.get("/api/admin/venues/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [venue] = await db.select().from(venues).where(eq(venues.id, req.params.id));
            if (!venue) return res.status(404).json({ error: "Venue não encontrado" });
            res.json(venue);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar venue" });
        }
    });

    app.put("/api/admin/venues/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [venue] = await db.update(venues)
                .set({ ...req.body, updatedAt: new Date() })
                .where(eq(venues.id, req.params.id))
                .returning();
            if (!venue) return res.status(404).json({ error: "Venue não encontrado" });
            res.json(venue);
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar venue" });
        }
    });

    app.delete("/api/admin/venues/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            await db.delete(venues).where(eq(venues.id, req.params.id));
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: "Erro ao excluir venue" });
        }
    });

    // ===== PARTNERS =====

    app.get("/api/admin/partners", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const result = await db.select().from(partners).orderBy(asc(partners.name));
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar partners" });
        }
    });

    app.post("/api/admin/partners", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [partner] = await db.insert(partners).values(req.body).returning();
            res.status(201).json(partner);
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar partner" });
        }
    });

    app.get("/api/admin/partners/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [partner] = await db.select().from(partners).where(eq(partners.id, req.params.id));
            if (!partner) return res.status(404).json({ error: "Partner não encontrado" });
            res.json(partner);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar partner" });
        }
    });

    app.put("/api/admin/partners/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [partner] = await db.update(partners)
                .set({ ...req.body, updatedAt: new Date() })
                .where(eq(partners.id, req.params.id))
                .returning();
            if (!partner) return res.status(404).json({ error: "Partner não encontrado" });
            res.json(partner);
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar partner" });
        }
    });

    // ===== EVENTS =====

    app.get("/api/admin/events", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const result = await db.select().from(events).orderBy(desc(events.startsAt));
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar events" });
        }
    });

    app.post("/api/admin/events", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [event] = await db.insert(events).values(req.body).returning();
            res.status(201).json(event);
        } catch (error: any) {
            res.status(500).json({ error: "Erro ao criar event", details: error.message });
        }
    });

    app.get("/api/admin/events/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [event] = await db.select().from(events).where(eq(events.id, req.params.id));
            if (!event) return res.status(404).json({ error: "Event não encontrado" });
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar event" });
        }
    });

    app.put("/api/admin/events/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [event] = await db.update(events)
                .set({ ...req.body, updatedAt: new Date() })
                .where(eq(events.id, req.params.id))
                .returning();
            if (!event) return res.status(404).json({ error: "Event não encontrado" });
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar event" });
        }
    });

    app.delete("/api/admin/events/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            await db.delete(events).where(eq(events.id, req.params.id));
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: "Erro ao excluir event" });
        }
    });

    // Publish / Unpublish / Archive
    app.post("/api/admin/events/:id/publish", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [event] = await db.update(events)
                .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
                .where(eq(events.id, req.params.id))
                .returning();
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: "Erro ao publicar event" });
        }
    });

    app.post("/api/admin/events/:id/unpublish", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [event] = await db.update(events)
                .set({ status: "draft", updatedAt: new Date() })
                .where(eq(events.id, req.params.id))
                .returning();
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: "Erro ao despublicar event" });
        }
    });

    app.post("/api/admin/events/:id/archive", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [event] = await db.update(events)
                .set({ status: "archived", updatedAt: new Date() })
                .where(eq(events.id, req.params.id))
                .returning();
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: "Erro ao arquivar event" });
        }
    });

    // ===== VIDEOS =====

    app.get("/api/admin/videos", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const result = await db.select().from(videos).orderBy(asc(videos.sortOrder), desc(videos.createdAt));
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar videos" });
        }
    });

    app.post("/api/admin/videos", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            // If publishing featured_month, archive others
            if (req.body.type === "featured_month" && req.body.status === "published") {
                await db.update(videos)
                    .set({ status: "archived", updatedAt: new Date() })
                    .where(and(eq(videos.type, "featured_month"), eq(videos.status, "published")));
            }
            const [video] = await db.insert(videos).values(req.body).returning();
            res.status(201).json(video);
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar video" });
        }
    });

    app.get("/api/admin/videos/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [video] = await db.select().from(videos).where(eq(videos.id, req.params.id));
            if (!video) return res.status(404).json({ error: "Video não encontrado" });
            res.json(video);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar video" });
        }
    });

    app.put("/api/admin/videos/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            // If changing to featured_month published, archive others
            if (req.body.type === "featured_month" && req.body.status === "published") {
                await db.update(videos)
                    .set({ status: "archived", updatedAt: new Date() })
                    .where(and(
                        eq(videos.type, "featured_month"),
                        eq(videos.status, "published"),
                        sql`id != ${req.params.id}`
                    ));
            }
            const [video] = await db.update(videos)
                .set({ ...req.body, updatedAt: new Date() })
                .where(eq(videos.id, req.params.id))
                .returning();
            res.json(video);
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar video" });
        }
    });

    app.post("/api/admin/videos/:id/publish", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            // Check if it's featured_month
            const [existing] = await db.select().from(videos).where(eq(videos.id, req.params.id));
            if (existing?.type === "featured_month") {
                await db.update(videos)
                    .set({ status: "archived", updatedAt: new Date() })
                    .where(and(
                        eq(videos.type, "featured_month"),
                        eq(videos.status, "published"),
                        sql`id != ${req.params.id}`
                    ));
            }
            const [video] = await db.update(videos)
                .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
                .where(eq(videos.id, req.params.id))
                .returning();
            res.json(video);
        } catch (error) {
            res.status(500).json({ error: "Erro ao publicar video" });
        }
    });

    app.post("/api/admin/videos/:id/unpublish", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [video] = await db.update(videos)
                .set({ status: "draft", updatedAt: new Date() })
                .where(eq(videos.id, req.params.id))
                .returning();
            res.json(video);
        } catch (error) {
            res.status(500).json({ error: "Erro ao despublicar video" });
        }
    });

    app.post("/api/admin/videos/:id/archive", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [video] = await db.update(videos)
                .set({ status: "archived", updatedAt: new Date() })
                .where(eq(videos.id, req.params.id))
                .returning();
            res.json(video);
        } catch (error) {
            res.status(500).json({ error: "Erro ao arquivar video" });
        }
    });

    // ===== AWARD CATEGORIES =====

    app.get("/api/admin/awards", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const result = await db.select().from(awardCategories).orderBy(asc(awardCategories.sortOrder));
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar awards" });
        }
    });

    app.post("/api/admin/awards", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [award] = await db.insert(awardCategories).values(req.body).returning();
            res.status(201).json(award);
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar award" });
        }
    });

    app.put("/api/admin/awards/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [award] = await db.update(awardCategories)
                .set({ ...req.body, updatedAt: new Date() })
                .where(eq(awardCategories.id, req.params.id))
                .returning();
            res.json(award);
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar award" });
        }
    });

    app.post("/api/admin/awards/:id/toggle-active", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [existing] = await db.select().from(awardCategories).where(eq(awardCategories.id, req.params.id));
            if (!existing) return res.status(404).json({ error: "Award não encontrado" });
            const [award] = await db.update(awardCategories)
                .set({ isActive: !existing.isActive, updatedAt: new Date() })
                .where(eq(awardCategories.id, req.params.id))
                .returning();
            res.json(award);
        } catch (error) {
            res.status(500).json({ error: "Erro ao alternar award" });
        }
    });

    // ===== QUERO CARDS =====

    app.get("/api/admin/quero", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const result = await db.select().from(queroCards).orderBy(asc(queroCards.sortOrder));
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar quero cards" });
        }
    });

    app.post("/api/admin/quero", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [card] = await db.insert(queroCards).values(req.body).returning();
            res.status(201).json(card);
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar quero card" });
        }
    });

    app.put("/api/admin/quero/:id", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [card] = await db.update(queroCards)
                .set({ ...req.body, updatedAt: new Date() })
                .where(eq(queroCards.id, req.params.id))
                .returning();
            res.json(card);
        } catch (error) {
            res.status(500).json({ error: "Erro ao atualizar quero card" });
        }
    });

    app.post("/api/admin/quero/:id/toggle-active", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const [existing] = await db.select().from(queroCards).where(eq(queroCards.id, req.params.id));
            if (!existing) return res.status(404).json({ error: "Quero card não encontrado" });
            const [card] = await db.update(queroCards)
                .set({ isActive: !existing.isActive, updatedAt: new Date() })
                .where(eq(queroCards.id, req.params.id))
                .returning();
            res.json(card);
        } catch (error) {
            res.status(500).json({ error: "Erro ao alternar quero card" });
        }
    });

    // ===== PREVIEW CODES =====

    app.post("/api/admin/preview-codes", async (req, res) => {
        if (!requireAdmin(req, res)) return;
        try {
            const code = crypto.randomBytes(6).toString("hex").toUpperCase();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            const [previewCode] = await db.insert(previewCodes).values({
                code,
                resourceType: req.body.resourceType,
                resourceId: req.body.resourceId,
                adminUserId: (req as any).adminUser.id,
                expiresAt,
            }).returning();
            res.status(201).json({ code: previewCode.code, expiresAt });
        } catch (error) {
            res.status(500).json({ error: "Erro ao criar preview code" });
        }
    });
}
