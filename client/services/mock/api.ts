import { db, User } from "./db";
import { MOCK_DATA } from "./data";

// Helper: Simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withNetwork<T>(fn: () => Promise<T>, errorRate = 0): Promise<T> {
    // Random latency between 300ms and 800ms
    await delay(300 + Math.random() * 500);

    if (Math.random() < errorRate) {
        throw new Error("Simulated Network Error");
    }

    return fn();
}

// --- Auth Service ---
const auth = {
    signUp: async (data: { name: string; email: string; preferences?: any }) => {
        return withNetwork(async () => {
            // Check if email exists
            if (db.findUserByEmail(data.email)) {
                throw new Error("Email já cadastrado.");
            }

            // DETERMINISTIC IDENTITY GENERATION
            // Use email as seed to pick consistent preferences if not provided
            const user: User = await db.createUser({
                id: "user_" + Date.now(),
                name: data.name,
                email: data.email,
                createdAt: new Date().toISOString(),
                preferences: data.preferences || {
                    styles: ["Forró", "Samba"], // Simplified logic for now
                    radius: 10,
                },
            });

            // Create session
            const token = await db.createSession(user.id);
            return { user, token };
        });
    },

    signIn: async (email: string) => {
        return withNetwork(async () => {
            const user = db.findUserByEmail(email);
            if (!user) {
                throw new Error("Usuário não encontrado.");
            }
            const token = await db.createSession(user.id);
            return { user, token };
        });
    },

    checkSession: async (token: string) => {
        return withNetwork(async () => {
            const userId = await db.getSession(token);
            if (!userId) throw new Error("Sessão inválida");

            const user = db.findUserById(userId);
            if (!user) throw new Error("Usuário não encontrado");

            return user;
        });
    },

    signOut: async (token: string) => {
        await db.removeSession(token);
    },
};

// --- Events Service ---
const events = {
    // Returns the static "feed" data (Guest or Home)
    getDiscoverData: async () => {
        return withNetwork(async () => {
            return MOCK_DATA;
        });
    },

    getById: async (id: string) => {
        return withNetwork(async () => {
            // Mock lookup
            return MOCK_DATA.recommendations.find(e => e.id === id) || null;
        });
    },
};

// --- User Actions Service ---
const userActions = {
    toggleFavorite: async (userId: string, eventId: string) => {
        return withNetwork(async () => {
            return db.toggleFavorite(userId, eventId);
        });
    },

    attendEvent: async (userId: string, eventId: string) => {
        return withNetwork(async () => {
            return db.setAttending(userId, eventId);
        });
    },

    getFavorites: async (userId: string) => {
        return withNetwork(async () => {
            // Map IDs to mock objects
            const ids = db.getFavorites(userId);
            // In a real app we'd query by IDs. Here we scan our mock arrays.
            // For simplicity, we just look in recommendations + awards for now
            // A smarter implementation would have a unified 'events' table.
            const allEvents = [
                ...MOCK_DATA.recommendations,
                ...MOCK_DATA.awards,
                // add others if they have compatible shape
            ];

            return allEvents.filter(e => ids.includes(e.id));
        });
    },

    getAttending: async (userId: string) => {
        return withNetwork(async () => {
            const ids = db.getAttending(userId);
            const allEvents = [
                ...MOCK_DATA.recommendations,
                ...MOCK_DATA.awards,
            ];
            return allEvents.filter(e => ids.includes(e.id));
        });
    }
};

export const mockApi = {
    auth,
    events,
    userActions,
};
