import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertEventSchema, insertVenueSchema, insertUserSchema } from "@shared/schema";

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
