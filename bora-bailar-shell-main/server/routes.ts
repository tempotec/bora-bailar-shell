import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertEventSchema, insertVenueSchema, insertUserSchema } from "@shared/schema";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

// OpenAI integration for audio transcription (lazy initialization)
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/events", async (req, res) => {
    try {
      const { search } = req.query;
      let eventsList;

      if (search && typeof search === "string") {
        eventsList = await storage.searchEvents(search);
      } else {
        eventsList = await storage.getEvents();
      }

      res.json(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/featured", async (req, res) => {
    try {
      const featured = await storage.getFeaturedEvents();
      res.json(featured);
    } catch (error) {
      console.error("Error fetching featured events:", error);
      res.status(500).json({ error: "Failed to fetch featured events" });
    }
  });

  app.get("/api/events/search", async (req, res) => {
    try {
      const { city, date, query } = req.query;
      const filters: { city?: string; date?: string; query?: string } = {};

      if (city && typeof city === "string") {
        filters.city = city;
      }
      if (date && typeof date === "string") {
        filters.date = date;
      }
      if (query && typeof query === "string") {
        filters.query = query;
      }

      const eventsList = await storage.advancedSearchEvents(filters);
      res.json(eventsList);
    } catch (error) {
      console.error("Error searching events:", error);
      res.status(500).json({ error: "Failed to search events" });
    }
  });

  app.get("/api/events/nearby", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng) {
        return res.status(400).json({ error: "lat and lng are required" });
      }
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = radius ? parseFloat(radius as string) : 10;

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const nearbyEvents = await storage.getNearbyEvents(latitude, longitude, radiusKm);
      res.json(nearbyEvents);
    } catch (error) {
      console.error("Error fetching nearby events:", error);
      res.status(500).json({ error: "Failed to fetch nearby events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const parsed = insertEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const event = await storage.createEvent(parsed.data);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.get("/api/venues", async (req, res) => {
    try {
      const venuesList = await storage.getVenues();
      res.json(venuesList);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ error: "Failed to fetch venues" });
    }
  });

  app.get("/api/venues/:id", async (req, res) => {
    try {
      const venue = await storage.getVenue(req.params.id);
      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ error: "Failed to fetch venue" });
    }
  });

  app.post("/api/venues", async (req, res) => {
    try {
      const parsed = insertVenueSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const venue = await storage.createVenue(parsed.data);
      res.status(201).json(venue);
    } catch (error) {
      console.error("Error creating venue:", error);
      res.status(500).json({ error: "Failed to create venue" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const user = await storage.createUser(parsed.data);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users/:id/favorites", async (req, res) => {
    try {
      const favoriteEvents = await storage.getFavoriteEvents(req.params.id);
      res.json(favoriteEvents);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/users/:id/favorites", async (req, res) => {
    try {
      const { eventId } = req.body;
      if (!eventId) {
        return res.status(400).json({ error: "eventId is required" });
      }
      const favorite = await storage.addFavorite({
        userId: req.params.id,
        eventId,
      });
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/users/:id/favorites/:eventId", async (req, res) => {
    try {
      await storage.removeFavorite(req.params.id, req.params.eventId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/users/:id/favorites/:eventId/check", async (req, res) => {
    try {
      const isFav = await storage.isFavorite(req.params.id, req.params.eventId);
      res.json({ isFavorite: isFav });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ error: "Failed to check favorite" });
    }
  });

  app.post("/api/transcribe", async (req, res) => {
    let tempFilePath: string | null = null;

    try {
      const { audio, filename } = req.body;

      if (!audio || !filename) {
        return res.status(400).json({ error: "audio and filename are required" });
      }

      if (typeof audio !== "string" || typeof filename !== "string") {
        return res.status(400).json({ error: "Invalid request format" });
      }

      const MAX_AUDIO_SIZE = 10 * 1024 * 1024;
      const audioBuffer = Buffer.from(audio, "base64");

      if (audioBuffer.length > MAX_AUDIO_SIZE) {
        return res.status(400).json({ error: "Audio file too large (max 10MB)" });
      }

      if (audioBuffer.length < 1000) {
        return res.status(400).json({ error: "Audio file too small or empty" });
      }

      const openai = getOpenAIClient();
      if (!openai) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      tempFilePath = path.join(os.tmpdir(), `recording_${Date.now()}_${Math.random().toString(36).slice(2)}.m4a`);
      fs.writeFileSync(tempFilePath, audioBuffer);

      const audioFile = fs.createReadStream(tempFilePath);

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "pt",
      });

      res.json({
        text: transcription.text,
      });
    } catch (error: any) {
      console.error("Transcription error:", error);
      res.status(500).json({ error: "Failed to transcribe audio" });
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          console.error("Failed to delete temp file:", e);
        }
      }
    }
  });

  // Novo endpoint para eventos filtrados
  app.post("/api/events/filter", async (req, res) => {
    try {
      const { categoria, zona, bairro, tipoAcompanhamento } = req.body;

      const filters: {
        categoria?: string;
        zona?: string;
        bairro?: string;
        tipoAcompanhamento?: string;
      } = {};

      if (categoria) filters.categoria = categoria;
      if (zona) filters.zona = zona;
      if (bairro) filters.bairro = bairro;
      if (tipoAcompanhamento) filters.tipoAcompanhamento = tipoAcompanhamento;

      const filteredEvents = storage.filterEvents(filters as any);
      res.json(filteredEvents);
    } catch (error) {
      console.error("Error filtering events:", error);
      res.status(500).json({ error: "Failed to filter events" });
    }
  });

  app.get("/api/users/:id/events", async (req, res) => {
    try {
      const userEvents = await storage.getUserEvents(req.params.id);
      res.json(userEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ error: "Failed to fetch user events" });
    }
  });

  app.post("/api/users/:id/events/:eventId/attend", async (req, res) => {
    try {
      await storage.attendEvent(req.params.id, req.params.eventId);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error attending event:", error);
      res.status(500).json({ error: "Failed to attend event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
