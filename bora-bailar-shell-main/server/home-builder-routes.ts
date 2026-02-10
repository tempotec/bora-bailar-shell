import { Express, Request, Response } from "express";
import { db } from "./db";
import { homeSections, homeSectionItems, appSettings, events, videos, awardCategories, queroCards } from "@shared/schema";
import { eq, and, asc, lte, gte, or, isNull } from "drizzle-orm";

// Middleware to check admin auth (reuse from crud-routes)
function requireAdmin(req: Request, res: Response, next: () => void) {
    const session = req as any;
    if (!session.session?.adminUser) {
        return res.status(401).json({ error: "Não autorizado" });
    }
    next();
}

export function registerHomeBuilderRoutes(app: Express) {
    // ===============================
    // HOME SECTIONS CRUD
    // ===============================

    // List all sections ordered by sortOrder
    app.get("/api/admin/home/sections", requireAdmin, async (req, res) => {
        try {
            const sections = await db.select().from(homeSections).orderBy(asc(homeSections.sortOrder));
            res.json(sections);
        } catch (error) {
            console.error("Error fetching sections:", error);
            res.status(500).json({ error: "Erro ao buscar seções" });
        }
    });

    // Create new section
    app.post("/api/admin/home/sections", requireAdmin, async (req, res) => {
        try {
            const { key, title, isEnabled, sortOrder } = req.body;
            const [section] = await db.insert(homeSections).values({
                key,
                title,
                isEnabled: isEnabled ?? true,
                sortOrder: sortOrder ?? 0,
            }).returning();
            res.status(201).json(section);
        } catch (error: any) {
            if (error.code === "23505") {
                return res.status(400).json({ error: "Essa seção já existe" });
            }
            console.error("Error creating section:", error);
            res.status(500).json({ error: "Erro ao criar seção" });
        }
    });

    // Update section
    app.put("/api/admin/home/sections/:id", requireAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const { key, title, isEnabled, sortOrder } = req.body;
            const [section] = await db.update(homeSections)
                .set({ key, title, isEnabled, sortOrder, updatedAt: new Date() })
                .where(eq(homeSections.id, id))
                .returning();
            if (!section) return res.status(404).json({ error: "Seção não encontrada" });
            res.json(section);
        } catch (error) {
            console.error("Error updating section:", error);
            res.status(500).json({ error: "Erro ao atualizar seção" });
        }
    });

    // Delete section
    app.delete("/api/admin/home/sections/:id", requireAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            await db.delete(homeSections).where(eq(homeSections.id, id));
            res.json({ success: true });
        } catch (error) {
            console.error("Error deleting section:", error);
            res.status(500).json({ error: "Erro ao excluir seção" });
        }
    });

    // Reorder sections (batch update)
    app.post("/api/admin/home/sections/reorder", requireAdmin, async (req, res) => {
        try {
            const { items } = req.body; // [{ id, sortOrder }]
            for (const item of items) {
                await db.update(homeSections)
                    .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
                    .where(eq(homeSections.id, item.id));
            }
            res.json({ success: true });
        } catch (error) {
            console.error("Error reordering sections:", error);
            res.status(500).json({ error: "Erro ao reordenar seções" });
        }
    });

    // ===============================
    // HOME SECTION ITEMS CRUD
    // ===============================

    // List items in a section
    app.get("/api/admin/home/sections/:sectionId/items", requireAdmin, async (req, res) => {
        try {
            const { sectionId } = req.params;
            const items = await db.select()
                .from(homeSectionItems)
                .where(eq(homeSectionItems.sectionId, sectionId))
                .orderBy(asc(homeSectionItems.sortOrder));
            res.json(items);
        } catch (error) {
            console.error("Error fetching section items:", error);
            res.status(500).json({ error: "Erro ao buscar itens" });
        }
    });

    // Add item to section
    app.post("/api/admin/home/sections/:sectionId/items", requireAdmin, async (req, res) => {
        try {
            const { sectionId } = req.params;
            const { itemType, itemId, sortOrder, startsAt, endsAt, isActive } = req.body;

            // Check for duplicate
            const existing = await db.select().from(homeSectionItems)
                .where(and(
                    eq(homeSectionItems.sectionId, sectionId),
                    eq(homeSectionItems.itemType, itemType),
                    eq(homeSectionItems.itemId, itemId)
                ));
            if (existing.length > 0) {
                return res.status(400).json({ error: "Este item já está nesta seção" });
            }

            const [item] = await db.insert(homeSectionItems).values({
                sectionId,
                itemType,
                itemId,
                sortOrder: sortOrder ?? 0,
                startsAt: startsAt ? new Date(startsAt) : null,
                endsAt: endsAt ? new Date(endsAt) : null,
                isActive: isActive ?? true,
            }).returning();
            res.status(201).json(item);
        } catch (error) {
            console.error("Error adding section item:", error);
            res.status(500).json({ error: "Erro ao adicionar item" });
        }
    });

    // Update section item
    app.put("/api/admin/home/sections/:sectionId/items/:itemId", requireAdmin, async (req, res) => {
        try {
            const { itemId } = req.params;
            const { sortOrder, startsAt, endsAt, isActive } = req.body;
            const [item] = await db.update(homeSectionItems)
                .set({
                    sortOrder,
                    startsAt: startsAt ? new Date(startsAt) : null,
                    endsAt: endsAt ? new Date(endsAt) : null,
                    isActive,
                    updatedAt: new Date(),
                })
                .where(eq(homeSectionItems.id, itemId))
                .returning();
            if (!item) return res.status(404).json({ error: "Item não encontrado" });
            res.json(item);
        } catch (error) {
            console.error("Error updating section item:", error);
            res.status(500).json({ error: "Erro ao atualizar item" });
        }
    });

    // Delete section item
    app.delete("/api/admin/home/sections/:sectionId/items/:itemId", requireAdmin, async (req, res) => {
        try {
            const { itemId } = req.params;
            await db.delete(homeSectionItems).where(eq(homeSectionItems.id, itemId));
            res.json({ success: true });
        } catch (error) {
            console.error("Error deleting section item:", error);
            res.status(500).json({ error: "Erro ao excluir item" });
        }
    });

    // Reorder items in a section
    app.post("/api/admin/home/sections/:sectionId/items/reorder", requireAdmin, async (req, res) => {
        try {
            const { items } = req.body; // [{ id, sortOrder }]
            for (const item of items) {
                await db.update(homeSectionItems)
                    .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
                    .where(eq(homeSectionItems.id, item.id));
            }
            res.json({ success: true });
        } catch (error) {
            console.error("Error reordering items:", error);
            res.status(500).json({ error: "Erro ao reordenar itens" });
        }
    });

    // ===============================
    // APP SETTINGS (BRANDING)
    // ===============================

    // Get app settings
    app.get("/api/admin/app-settings", requireAdmin, async (req, res) => {
        try {
            const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, "main"));
            if (!settings) {
                // Return defaults
                res.json({
                    id: "main",
                    logoUrl: null,
                    primaryColor: "#6366f1",
                    secondaryColor: "#8b5cf6",
                    backgroundColor: "#0f0d23",
                    textColor: "#ffffff",
                    fontFamily: "Inter",
                    borderRadius: 12,
                });
            } else {
                res.json(settings);
            }
        } catch (error) {
            console.error("Error fetching app settings:", error);
            res.status(500).json({ error: "Erro ao buscar configurações" });
        }
    });

    // Update app settings (upsert)
    app.put("/api/admin/app-settings", requireAdmin, async (req, res) => {
        try {
            const { logoUrl, primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, borderRadius } = req.body;

            // Upsert: check if exists, then insert or update
            const [existing] = await db.select().from(appSettings).where(eq(appSettings.id, "main"));

            if (existing) {
                const [updated] = await db.update(appSettings)
                    .set({
                        logoUrl,
                        primaryColor,
                        secondaryColor,
                        backgroundColor,
                        textColor,
                        fontFamily,
                        borderRadius,
                        updatedAt: new Date(),
                    })
                    .where(eq(appSettings.id, "main"))
                    .returning();
                res.json(updated);
            } else {
                const [created] = await db.insert(appSettings).values({
                    id: "main",
                    logoUrl,
                    primaryColor,
                    secondaryColor,
                    backgroundColor,
                    textColor,
                    fontFamily,
                    borderRadius,
                }).returning();
                res.json(created);
            }
        } catch (error) {
            console.error("Error updating app settings:", error);
            res.status(500).json({ error: "Erro ao atualizar configurações" });
        }
    });

    // ===============================
    // PUBLIC API: /api/app-config
    // ===============================

    app.get("/api/app-config", async (req, res) => {
        try {
            const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, "main"));
            res.json(settings || {
                logoUrl: null,
                primaryColor: "#6366f1",
                secondaryColor: "#8b5cf6",
                backgroundColor: "#0f0d23",
                textColor: "#ffffff",
                fontFamily: "Inter",
                borderRadius: 12,
            });
        } catch (error) {
            console.error("Error fetching app config:", error);
            res.status(500).json({ error: "Erro ao buscar configurações" });
        }
    });

    // ===============================
    // SEARCH ITEMS (for adding to sections)
    // ===============================

    app.get("/api/admin/home/search-items", requireAdmin, async (req, res) => {
        try {
            const { type, q, status } = req.query;

            let results: any[] = [];

            if (type === "event" || !type) {
                let eventsList = await db.select({
                    id: events.id,
                    title: events.title,
                    status: events.status,
                    coverImageUrl: events.coverImageUrl,
                }).from(events);
                if (status) eventsList = eventsList.filter(e => e.status === status);
                if (q) eventsList = eventsList.filter(e => e.title.toLowerCase().includes((q as string).toLowerCase()));
                results = results.concat(eventsList.map(e => ({ ...e, itemType: "event" })));
            }

            if (type === "video" || !type) {
                let videosList = await db.select({
                    id: videos.id,
                    title: videos.title,
                    type: videos.type,
                    status: videos.status,
                    thumbnailUrl: videos.thumbnailUrl,
                }).from(videos);
                if (status) videosList = videosList.filter(v => v.status === status);
                if (q) videosList = videosList.filter(v => v.title.toLowerCase().includes((q as string).toLowerCase()));
                results = results.concat(videosList.map(v => ({ ...v, itemType: "video" })));
            }

            if (type === "award" || !type) {
                let awardsList = await db.select({
                    id: awardCategories.id,
                    title: awardCategories.title,
                    number: awardCategories.number,
                    isActive: awardCategories.isActive,
                    imageUrl: awardCategories.imageUrl,
                }).from(awardCategories);
                if (q) awardsList = awardsList.filter(a => a.title.toLowerCase().includes((q as string).toLowerCase()));
                results = results.concat(awardsList.map(a => ({ ...a, itemType: "award" })));
            }

            if (type === "quero" || !type) {
                let queroList = await db.select({
                    id: queroCards.id,
                    title: queroCards.title,
                    isActive: queroCards.isActive,
                    imageUrl: queroCards.imageUrl,
                }).from(queroCards);
                if (q) queroList = queroList.filter(qc => qc.title.toLowerCase().includes((q as string).toLowerCase()));
                results = results.concat(queroList.map(qc => ({ ...qc, itemType: "quero" })));
            }

            res.json(results);
        } catch (error) {
            console.error("Error searching items:", error);
            res.status(500).json({ error: "Erro ao buscar itens" });
        }
    });

    // ===============================
    // SEED DEFAULT SECTIONS
    // ===============================

    app.post("/api/admin/home/seed", requireAdmin, async (req, res) => {
        try {
            const defaultSections = [
                { key: "stories", title: "Stories", sortOrder: 0 },
                { key: "featured", title: "Destaque do Mês", sortOrder: 1 },
                { key: "awards", title: "Top Dance Awards", sortOrder: 2 },
                { key: "quero", title: "O que você quer?", sortOrder: 3 },
                { key: "recommendations", title: "Recomendações", sortOrder: 4 },
            ];

            for (const section of defaultSections) {
                try {
                    await db.insert(homeSections).values(section);
                } catch (e: any) {
                    // Ignore duplicates
                    if (e.code !== "23505") throw e;
                }
            }

            const sections = await db.select().from(homeSections).orderBy(asc(homeSections.sortOrder));
            res.json(sections);
        } catch (error) {
            console.error("Error seeding sections:", error);
            res.status(500).json({ error: "Erro ao criar seções padrão" });
        }
    });
}
