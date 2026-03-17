import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== JSONB CONTRACTS =====

export const highlightItemSchema = z.object({
  icon: z.enum(["map-pin", "music", "ticket", "clock", "users", "star", "info"]),
  text: z.string(),
});

export const ticketItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceCents: z.number().int().min(0),
  currency: z.literal("BRL"),
});

export type HighlightItem = z.infer<typeof highlightItemSchema>;
export type TicketItem = z.infer<typeof ticketItemSchema>;

// ===== CORE TABLES =====

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  avatarInitials: text("avatar_initials"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  neighborhood: text("neighborhood"),
  zone: text("zone"),
  city: text("city").default("Rio de Janeiro"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_venues_zone").on(table.zone),
  index("idx_venues_neighborhood").on(table.neighborhood),
]);

// ===== ADMIN TABLES =====

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  website: text("website"),
  phone: text("phone"),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ===== CONTENT TABLES =====

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  venueId: varchar("venue_id").references(() => venues.id).notNull(),
  coverImageUrl: text("cover_image_url"),
  themeColor: text("theme_color"),
  priceCents: integer("price_cents"),
  priceLabel: text("price_label"),
  discountLabel: text("discount_label"),
  highlights: jsonb("highlights").$type<HighlightItem[]>().default(sql`'[]'::jsonb`),
  tickets: jsonb("tickets").$type<TicketItem[]>().default(sql`'[]'::jsonb`),
  sortOrder: integer("sort_order").default(0),
  isFeatured: boolean("is_featured").default(false),
  attendeesCount: integer("attendees_count").default(0),
  status: text("status").default("draft"),
  partnerId: varchar("partner_id").references(() => partners.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_events_starts").on(table.startsAt),
  index("idx_events_status").on(table.status),
  index("idx_events_venue").on(table.venueId),
  index("idx_events_partner").on(table.partnerId),
  index("idx_events_featured").on(table.isFeatured, table.status, table.startsAt),
]);

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  username: text("username"),
  displayName: text("display_name"),
  verified: boolean("verified").default(false),
  sortOrder: integer("sort_order").default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  viewCount: integer("view_count").default(0),
  status: text("status").default("draft"),
  partnerId: varchar("partner_id").references(() => partners.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_videos_type_status").on(table.type, table.status),
  index("idx_videos_window").on(table.startsAt, table.endsAt),
]);

export const awardCategories = pgTable("award_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  categoryLabel: text("category_label"),
  highlightWord: text("highlight_word"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const queroCards = pgTable("quero_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_quero_window").on(table.isActive, table.startsAt, table.endsAt),
]);

export const tips = pgTable("tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  dayOfWeek: integer("day_of_week"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const previewCodes = pgTable("preview_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 12 }).notNull().unique(),
  resourceType: text("resource_type").notNull(),
  resourceId: varchar("resource_id"),
  adminUserId: varchar("admin_user_id").references(() => adminUsers.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_preview_codes_code").on(table.code),
]);

// ===== RELATIONSHIP TABLES =====

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  eventId: varchar("event_id").references(() => events.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const eventAttendees = pgTable("event_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  eventId: varchar("event_id").references(() => events.id).notNull(),
  status: text("status").default("confirmed"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ===== HOME BUILDER TABLES =====

export const homeSections = pgTable("home_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // 'stories' | 'featured' | 'awards' | 'quero' | 'recommendations'
  title: text("title"),
  isEnabled: boolean("is_enabled").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_home_sections_order").on(table.sortOrder),
]);

export const homeSectionItems = pgTable("home_section_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").references(() => homeSections.id, { onDelete: "cascade" }).notNull(),
  itemType: text("item_type").notNull(), // 'event' | 'video' | 'award' | 'quero'
  itemId: varchar("item_id").notNull(),
  sortOrder: integer("sort_order").default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_section_items_section").on(table.sectionId),
  index("idx_section_items_active").on(table.sectionId, table.isActive),
  index("idx_section_items_window").on(table.startsAt, table.endsAt),
]);

export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default("main"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#6366f1"),
  secondaryColor: text("secondary_color").default("#8b5cf6"),
  backgroundColor: text("background_color").default("#0f0d23"),
  textColor: text("text_color").default("#ffffff"),
  fontFamily: text("font_family").default("Inter"), // 'Inter' | 'Poppins' | 'System'
  borderRadius: integer("border_radius").default(12),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ===== PUSH NOTIFICATIONS =====

export const pushTokens = pgTable("push_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),  // ExponentPushToken[xxx]
  platform: text("platform"),               // 'ios' | 'android'
  userId: varchar("user_id"),               // optional link to user
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_push_tokens_active").on(table.isActive),
]);

export const notificationLogs = pgTable("notification_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: jsonb("data").$type<Record<string, any>>().default(sql`'{}'::jsonb`),
  totalTokens: integer("total_tokens").default(0),
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ===== INSERT SCHEMAS =====

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAwardCategorySchema = createInsertSchema(awardCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQueroCardSchema = createInsertSchema(queroCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertHomeSectionSchema = createInsertSchema(homeSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHomeSectionItemSchema = createInsertSchema(homeSectionItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  updatedAt: true,
});

export const insertPushTokenSchema = createInsertSchema(pushTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationLogSchema = createInsertSchema(notificationLogs).omit({
  id: true,
  createdAt: true,
});

// ===== TYPES =====

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type AwardCategory = typeof awardCategories.$inferSelect;
export type InsertAwardCategory = z.infer<typeof insertAwardCategorySchema>;
export type QueroCard = typeof queroCards.$inferSelect;
export type InsertQueroCard = z.infer<typeof insertQueroCardSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type HomeSection = typeof homeSections.$inferSelect;
export type InsertHomeSection = z.infer<typeof insertHomeSectionSchema>;
export type HomeSectionItem = typeof homeSectionItems.$inferSelect;
export type InsertHomeSectionItem = z.infer<typeof insertHomeSectionItemSchema>;
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
export type PushToken = typeof pushTokens.$inferSelect;
export type InsertPushToken = z.infer<typeof insertPushTokenSchema>;
export type NotificationLog = typeof notificationLogs.$inferSelect;
export type InsertNotificationLog = z.infer<typeof insertNotificationLogSchema>;

