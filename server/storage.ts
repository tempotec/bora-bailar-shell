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

// Tipos para eventos filtrados
export type EventCategory = "dançar" | "grupo" | "amigos";
export type EventZone = "Zona Sul" | "Sudoeste" | "Centro";
export type EventCompanion = "sozinho" | "casal" | "amigos" | "grupo";

export interface FilteredEvent {
  id: string;
  title: string;
  categoria: EventCategory;
  zona: EventZone;
  bairro: string;
  data: string;
  hora: string;
  tipoAcompanhamento: EventCompanion;
  image: string;
  description: string;
  isFiltered: true;
  price?: string;
}

// 15 eventos filtrados específicos por categoria
export const FILTERED_EVENTS: FilteredEvent[] = [
  // SAIR PARA DANÇAR (5 eventos)
  {
    id: "filtered_dancar_1",
    title: "AULA DE SALSA NO LEBLON",
    categoria: "dançar",
    zona: "Zona Sul",
    bairro: "Leblon",
    data: "2026-01-30",
    hora: "19:00",
    tipoAcompanhamento: "sozinho",
    image: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=300&h=200&fit=crop",
    description: "Aula de salsa para iniciantes e intermediários. Venha dançar!",
    price: "R$40",
    isFiltered: true
  },
  {
    id: "filtered_dancar_2",
    title: "FORRÓ PÉ DE SERRA NA LAPA",
    categoria: "dançar",
    zona: "Centro",
    bairro: "Lapa",
    data: "2026-01-31",
    hora: "20:00",
    tipoAcompanhamento: "casal",
    image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=300&h=200&fit=crop",
    description: "Tradicional forró na Lapa com os melhores músicos da cidade.",
    price: "R$25",
    isFiltered: true
  },
  {
    id: "filtered_dancar_3",
    title: "BAILE DE SAMBA NA TIJUCA",
    categoria: "dançar",
    zona: "Centro",
    bairro: "Tijuca",
    data: "2026-02-01",
    hora: "18:00",
    tipoAcompanhamento: "amigos",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop",
    description: "Roda de samba autêntico com sambistas renomados.",
    price: "R$15",
    isFiltered: true
  },
  {
    id: "filtered_dancar_4",
    title: "ZOUK NA BARRA DA TIJUCA",
    categoria: "dançar",
    zona: "Sudoeste",
    bairro: "Barra da Tijuca",
    data: "2026-02-02",
    hora: "21:00",
    tipoAcompanhamento: "sozinho",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=200&fit=crop",
    description: "Noite de zouk com DJs e pista iluminada.",
    price: "R$50",
    isFiltered: true
  },
  {
    id: "filtered_dancar_5",
    title: "TANGO EM COPACABANA",
    categoria: "dançar",
    zona: "Zona Sul",
    bairro: "Copacabana",
    data: "2026-02-03",
    hora: "19:30",
    tipoAcompanhamento: "casal",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop",
    description: "Milonga tradicional argentina à beira-mar.",
    price: "R$35",
    isFiltered: true
  },

  // SAIR EM GRUPO (5 eventos)
  {
    id: "filtered_grupo_1",
    title: "HAPPY HOUR GRUPO NA LAPA",
    categoria: "grupo",
    zona: "Centro",
    bairro: "Lapa",
    data: "2026-01-30",
    hora: "18:00",
    tipoAcompanhamento: "grupo",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&h=200&fit=crop",
    description: "Encontro de grupos para dançar e socializar. Ambiente descontraído!",
    price: "R$30",
    isFiltered: true
  },
  {
    id: "filtered_grupo_2",
    title: "FESTA GRUPO NO LEBLON",
    categoria: "grupo",
    zona: "Zona Sul",
    bairro: "Leblon",
    data: "2026-01-31",
    hora: "22:00",
    tipoAcompanhamento: "grupo",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=300&h=200&fit=crop",
    description: "Balada para grupos. Conheça pessoas legais que gostam de dançar!",
    price: "R$60",
    isFiltered: true
  },
  {
    id: "filtered_grupo_3",
    title: "ENCONTRO DANÇANTE EM GRUPO - BARRA",
    categoria: "grupo",
    zona: "Sudoeste",
    bairro: "Barra da Tijuca",
    data: "2026-02-01",
    hora: "20:00",
    tipoAcompanhamento: "grupo",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=300&h=200&fit=crop",
    description: "Evento social para grupos dançarem diversos ritmos.",
    price: "R$45",
    isFiltered: true
  },
  {
    id: "filtered_grupo_4",
    title: "SARAU EM GRUPO - RIO COMPRIDO",
    categoria: "grupo",
    zona: "Centro",
    bairro: "Rio Comprido",
    data: "2026-02-02",
    hora: "17:00",
    tipoAcompanhamento: "grupo",
    image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&h=200&fit=crop",
    description: "Sarau cultural com música ao vivo e dança em grupo.",
    price: "R$20",
    isFiltered: true
  },
  {
    id: "filtered_grupo_5",
    title: "BAILE GRUPO EM IPANEMA",
    categoria: "grupo",
    zona: "Zona Sul",
    bairro: "Ipanema",
    data: "2026-02-03",
    hora: "21:00",
    tipoAcompanhamento: "grupo",
    image: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=300&h=200&fit=crop",
    description: "Baile especial para grupos com música variada.",
    price: "R$55",
    isFiltered: true
  },

  // SAIR COM AMIGOS (5 eventos)
  {
    id: "filtered_amigos_1",
    title: "BAR COM MÚSICA E AMIGOS - GÁVEA",
    categoria: "amigos",
    zona: "Zona Sul",
    bairro: "Gávea",
    data: "2026-01-30",
    hora: "18:30",
    tipoAcompanhamento: "amigos",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=200&fit=crop",
    description: "Bar descontraído com música ao vivo. Perfeito para ir com amigos!",
    price: "R$35",
    isFiltered: true
  },
  {
    id: "filtered_amigos_2",
    title: "HAPPY HOUR AMIGOS - JACAREPAGUÁ",
    categoria: "amigos",
    zona: "Sudoeste",
    bairro: "Jacarepaguá",
    data: "2026-01-31",
    hora: "17:00",
    tipoAcompanhamento: "amigos",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&h=200&fit=crop",
    description: "Happy hour com promoções e música boa para curtir com os amigos.",
    price: "R$25",
    isFiltered: true
  },
  {
    id: "filtered_amigos_3",
    title: "BOTECO COM SAMBA E AMIGOS - ESTÁCIO",
    categoria: "amigos",
    zona: "Centro",
    bairro: "Estácio",
    data: "2026-02-01",
    hora: "19:00",
    tipoAcompanhamento: "amigos",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop",
    description: "Boteco tradicional com roda de samba. Venha com seus amigos!",
    price: "R$20",
    isFiltered: true
  },
  {
    id: "filtered_amigos_4",
    title: "FESTA AMIGOS NO RECREIO",
    categoria: "amigos",
    zona: "Sudoeste",
    bairro: "Recreio",
    data: "2026-02-02",
    hora: "20:00",
    tipoAcompanhamento: "amigos",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=300&h=200&fit=crop",
    description: "Festa despojada à beira-mar. Traga seus amigos!",
    price: "R$40",
    isFiltered: true
  },
  {
    id: "filtered_amigos_5",
    title: "ENCONTRO MUSICAL AMIGOS - BOTAFOGO",
    categoria: "amigos",
    zona: "Zona Sul",
    bairro: "Botafogo",
    data: "2026-02-03",
    hora: "19:00",
    tipoAcompanhamento: "amigos",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop",
    description: "Casa de shows com bandas autorais. Ideal para ir com amigos.",
    price: "R$50",
    isFiltered: true
  }
];

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  getFeaturedEvents(): Promise<Event[]>;
  searchEvents(query: string): Promise<Event[]>;
  advancedSearchEvents(filters: { city?: string; date?: string; query?: string }): Promise<Event[]>;
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

  // Método para filtrar eventos específicos
  filterEvents(filters: {
    categoria?: EventCategory;
    zona?: EventZone;
    bairro?: string;
    tipoAcompanhamento?: EventCompanion;
  }): FilteredEvent[];
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

  async advancedSearchEvents(filters: {
    city?: string;
    date?: string;
    query?: string;
  }): Promise<Event[]> {
    const conditions: any[] = [];

    if (filters.city) {
      conditions.push(
        or(
          ilike(events.city, `%${filters.city}%`),
          ilike(events.address, `%${filters.city}%`),
          ilike(events.venueName, `%${filters.city}%`)
        )
      );
    }

    if (filters.date) {
      conditions.push(eq(events.date, filters.date));
    }

    if (filters.query) {
      conditions.push(
        or(
          ilike(events.title, `%${filters.query}%`),
          ilike(events.description, `%${filters.query}%`),
          ilike(events.venueName, `%${filters.query}%`)
        )
      );
    }

    if (conditions.length === 0) {
      return this.getEvents();
    }

    return db.select().from(events).where(and(...conditions)).orderBy(desc(events.createdAt));
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

  filterEvents(filters: {
    categoria?: EventCategory;
    zona?: EventZone;
    bairro?: string;
    tipoAcompanhamento?: EventCompanion;
  }): FilteredEvent[] {
    let results = [...FILTERED_EVENTS];

    // Filtrar por categoria
    if (filters.categoria) {
      results = results.filter(event => event.categoria === filters.categoria);
    }

    // Filtrar por zona
    if (filters.zona) {
      results = results.filter(event => event.zona === filters.zona);
    }

    // Filtrar por bairro
    if (filters.bairro) {
      results = results.filter(event =>
        event.bairro.toLowerCase() === (filters.bairro?.toLowerCase() || "")
      );
    }

    // Filtrar por tipo de acompanhamento
    if (filters.tipoAcompanhamento) {
      results = results.filter(event =>
        event.tipoAcompanhamento === filters.tipoAcompanhamento
      );
    }

    return results;
  }
}

export const storage = new DatabaseStorage();
