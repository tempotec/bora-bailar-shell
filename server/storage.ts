import { eq, ilike, or, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  events,
  venues,
  favorites,
  eventAttendees,
  type User,
  type InsertUser,
  type Event,
  type InsertEvent,
  type Venue,
  type InsertVenue,
  type Favorite,
  type InsertFavorite,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  getFeaturedEvents(): Promise<Event[]>;
  searchEvents(query: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  getVenues(): Promise<Venue[]>;
  getVenue(id: string): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  
  getFavorites(userId: string): Promise<Favorite[]>;
  getFavoriteEvents(userId: string): Promise<Event[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, eventId: string): Promise<void>;
  isFavorite(userId: string, eventId: string): Promise<boolean>;
  
  getUserEvents(userId: string): Promise<Event[]>;
  attendEvent(userId: string, eventId: string): Promise<void>;
  getNearbyEvents(lat: number, lng: number, radiusKm: number): Promise<(Event & { distance: number })[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

  async getFeaturedEvents(): Promise<Event[]> {
    return db.select().from(events).where(eq(events.isFeatured, true));
  }

  async searchEvents(query: string): Promise<Event[]> {
    return db.select().from(events).where(
      or(
        ilike(events.title, `%${query}%`),
        ilike(events.venueName, `%${query}%`),
        ilike(events.description, `%${query}%`)
      )
    );
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async getVenues(): Promise<Venue[]> {
    return db.select().from(venues).orderBy(desc(venues.eventsCount));
  }

  async getVenue(id: string): Promise<Venue | undefined> {
    const result = await db.select().from(venues).where(eq(venues.id, id));
    return result[0];
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const result = await db.insert(venues).values(venue).returning();
    return result[0];
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async getFavoriteEvents(userId: string): Promise<Event[]> {
    const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, userId));
    const eventIds = userFavorites.map(f => f.eventId);
    if (eventIds.length === 0) return [];
    
    const result: Event[] = [];
    for (const eventId of eventIds) {
      const event = await this.getEvent(eventId);
      if (event) result.push(event);
    }
    return result;
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values(favorite).returning();
    return result[0];
  }

  async removeFavorite(userId: string, eventId: string): Promise<void> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.eventId, eventId))
    );
  }

  async isFavorite(userId: string, eventId: string): Promise<boolean> {
    const result = await db.select().from(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.eventId, eventId))
    );
    return result.length > 0;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    const attendances = await db.select().from(eventAttendees).where(eq(eventAttendees.userId, userId));
    const eventIds = attendances.map(a => a.eventId);
    if (eventIds.length === 0) return [];
    
    const result: Event[] = [];
    for (const eventId of eventIds) {
      const event = await this.getEvent(eventId);
      if (event) result.push(event);
    }
    return result;
  }

  async attendEvent(userId: string, eventId: string): Promise<void> {
    await db.insert(eventAttendees).values({ userId, eventId, status: "confirmed" });
  }

  async getNearbyEvents(lat: number, lng: number, radiusKm: number): Promise<(Event & { distance: number })[]> {
    const allEvents = await this.getEvents();
    
    const eventsWithDistance = allEvents
      .filter(event => event.latitude && event.longitude)
      .map(event => {
        const eventLat = parseFloat(event.latitude as string);
        const eventLng = parseFloat(event.longitude as string);
        const distance = this.calculateDistance(lat, lng, eventLat, eventLng);
        return { ...event, distance };
      })
      .filter(event => event.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
    
    return eventsWithDistance;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const storage = new DatabaseStorage();
