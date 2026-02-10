import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { adminUsers, partners, users, events, venues, videos, tips, awardCategories } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "borabailar-admin-secret-key-change-in-production";
const COOKIE_NAME = "bb_admin_token";

// Extended Request type with user info
interface AuthRequest extends Request {
    adminUser?: {
        id: string;
        email: string;
        name: string;
        role: "super_admin" | "admin" | "partner";
        partnerId?: string;
        partnerType?: string;
    };
}

// Middleware: Require admin authentication
export function requireAdminAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({ error: "Não autenticado" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            email: string;
            name: string;
            role: string;
            partnerId?: string;
            partnerType?: string;
        };

        req.adminUser = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role as "super_admin" | "admin" | "partner",
            partnerId: decoded.partnerId,
            partnerType: decoded.partnerType,
        };

        next();
    } catch {
        return res.status(401).json({ error: "Token inválido" });
    }
}

// Middleware: Require specific roles
export function requireRole(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.adminUser) {
            return res.status(401).json({ error: "Não autenticado" });
        }

        if (!roles.includes(req.adminUser.role)) {
            return res.status(403).json({ error: "Sem permissão" });
        }

        next();
    };
}

export function registerAdminRoutes(app: Express) {
    // ===== AUTH ROUTES =====

    // POST /api/admin/login
    app.post("/api/admin/login", async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email e senha são obrigatórios" });
            }

            // Try admin_users first
            const [adminUser] = await db
                .select()
                .from(adminUsers)
                .where(and(eq(adminUsers.email, email), eq(adminUsers.isActive, true)))
                .limit(1);

            if (adminUser) {
                const validPassword = await bcrypt.compare(password, adminUser.passwordHash);
                if (!validPassword) {
                    return res.status(401).json({ error: "Credenciais inválidas" });
                }

                const token = jwt.sign(
                    {
                        id: adminUser.id,
                        email: adminUser.email,
                        name: adminUser.name,
                        role: adminUser.role,
                    },
                    JWT_SECRET,
                    { expiresIn: "7d" }
                );

                res.cookie(COOKIE_NAME, token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });

                return res.json({
                    user: {
                        id: adminUser.id,
                        email: adminUser.email,
                        name: adminUser.name,
                        role: adminUser.role,
                    },
                });
            }

            // Try partners
            const [partner] = await db
                .select()
                .from(partners)
                .where(and(eq(partners.email, email), eq(partners.isActive, true)))
                .limit(1);

            if (partner) {
                const validPassword = await bcrypt.compare(password, partner.passwordHash);
                if (!validPassword) {
                    return res.status(401).json({ error: "Credenciais inválidas" });
                }

                const token = jwt.sign(
                    {
                        id: partner.id,
                        email: partner.email,
                        name: partner.name,
                        role: "partner",
                        partnerId: partner.id,
                        partnerType: partner.type,
                    },
                    JWT_SECRET,
                    { expiresIn: "7d" }
                );

                res.cookie(COOKIE_NAME, token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });

                return res.json({
                    user: {
                        id: partner.id,
                        email: partner.email,
                        name: partner.name,
                        role: "partner",
                        partnerId: partner.id,
                        partnerType: partner.type,
                    },
                });
            }

            return res.status(401).json({ error: "Credenciais inválidas" });
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ error: "Erro interno" });
        }
    });

    // GET /api/admin/me
    app.get("/api/admin/me", requireAdminAuth, (req: AuthRequest, res: Response) => {
        if (!req.adminUser) {
            return res.status(401).json({ error: "Não autenticado" });
        }
        return res.json({ user: req.adminUser });
    });

    // POST /api/admin/logout
    app.post("/api/admin/logout", (_req: Request, res: Response) => {
        res.clearCookie(COOKIE_NAME);
        return res.json({ success: true });
    });

    // ===== STATS ROUTE =====

    // GET /api/admin/stats
    app.get("/api/admin/stats", requireAdminAuth, async (_req: AuthRequest, res: Response) => {
        try {
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            const todayStr = today.toISOString().split("T")[0];
            const nextWeekStr = nextWeek.toISOString().split("T")[0];

            const [
                [{ count: totalEvents }],
                [{ count: upcomingEvents }],
                [{ count: totalVenues }],
                [{ count: totalPartners }],
                [{ count: totalVideos }],
                [{ count: totalUsers }],
            ] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(events),
                db.select({ count: sql<number>`count(*)` }).from(events).where(and(gte(events.date, todayStr), sql`${events.date} <= ${nextWeekStr}`)),
                db.select({ count: sql<number>`count(*)` }).from(venues),
                db.select({ count: sql<number>`count(*)` }).from(partners),
                db.select({ count: sql<number>`count(*)` }).from(videos),
                db.select({ count: sql<number>`count(*)` }).from(users),
            ]);

            return res.json({
                totalEvents: Number(totalEvents),
                upcomingEvents: Number(upcomingEvents),
                totalVenues: Number(totalVenues),
                totalPartners: Number(totalPartners),
                totalVideos: Number(totalVideos),
                totalUsers: Number(totalUsers),
            });
        } catch (error) {
            console.error("Stats error:", error);
            return res.status(500).json({ error: "Erro ao buscar estatísticas" });
        }
    });

    // ===== SEED ADMIN (Development only) =====
    app.post("/api/admin/seed", async (_req: Request, res: Response) => {
        if (process.env.NODE_ENV === "production") {
            return res.status(403).json({ error: "Não permitido em produção" });
        }

        try {
            const hashedPassword = await bcrypt.hash("admin123", 10);

            // Check if admin already exists
            const existing = await db.select().from(adminUsers).where(eq(adminUsers.email, "admin@borabailar.com")).limit(1);

            if (existing.length === 0) {
                await db.insert(adminUsers).values({
                    email: "admin@borabailar.com",
                    passwordHash: hashedPassword,
                    name: "Admin BoraBailar",
                    role: "super_admin",
                });
            }

            return res.json({ success: true, message: "Admin criado: admin@borabailar.com / admin123" });
        } catch (error) {
            console.error("Seed error:", error);
            return res.status(500).json({ error: "Erro ao criar admin" });
        }
    });
}
