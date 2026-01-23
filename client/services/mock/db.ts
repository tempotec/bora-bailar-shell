import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: any; // Require path or URL
    preferences: {
        styles: string[]; // e.g., ["Forró", "Samba"]
        radius: number; // in km
    };
    createdAt: string;
}

export interface MockDBSchema {
    users: User[];
    sessions: Record<string, string>; // token -> userId
    favorites: Record<string, string[]>; // userId -> eventIds[]
    attending: Record<string, string[]>; // userId -> eventIds[]
}

const DB_KEY = "BORABAILAR_MOCK_DB_V1";

// Initial State
const INITIAL_DB: MockDBSchema = {
    users: [],
    sessions: {},
    favorites: {},
    attending: {},
};

// Singleton In-Memory Cache (sync)
let dbCache: MockDBSchema | null = null;

// Helper: Load DB from storage into cache
export const loadDB = async (): Promise<MockDBSchema> => {
    if (dbCache) return dbCache;

    try {
        const json = await AsyncStorage.getItem(DB_KEY);
        if (json) {
            dbCache = JSON.parse(json);
        } else {
            dbCache = { ...INITIAL_DB };
        }
    } catch (error) {
        console.error("Failed to load mock DB:", error);
        dbCache = { ...INITIAL_DB };
    }
    return dbCache!;
};

// Helper: Save cache to storage
export const saveDB = async (): Promise<void> => {
    if (!dbCache) return;
    try {
        await AsyncStorage.setItem(DB_KEY, JSON.stringify(dbCache));
    } catch (error) {
        console.error("Failed to save mock DB:", error);
    }
};

// --- DB Operations ---

export const db = {
    getUsers: () => dbCache?.users || [],

    findUserByEmail: (email: string) => {
        return dbCache?.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },

    findUserById: (id: string) => {
        return dbCache?.users.find((u) => u.id === id);
    },

    createUser: async (user: User) => {
        await loadDB();
        if (!dbCache) return;

        dbCache.users.push(user);
        // Initialize relations
        dbCache.favorites[user.id] = [];
        dbCache.attending[user.id] = [];

        await saveDB();
        return user;
    },

    createSession: async (userId: string) => {
        await loadDB();
        if (!dbCache) return null;

        const token = "mock-token-" + Math.random().toString(36).substr(2) + "-" + Date.now();
        dbCache.sessions[token] = userId;
        await saveDB();
        return token;
    },

    getSession: async (token: string) => {
        await loadDB();
        return dbCache?.sessions[token];
    },

    removeSession: async (token: string) => {
        await loadDB();
        if (dbCache?.sessions[token]) {
            delete dbCache.sessions[token];
            await saveDB();
        }
    },

    // Favorites
    getFavorites: (userId: string) => dbCache?.favorites[userId] || [],

    toggleFavorite: async (userId: string, eventId: string) => {
        await loadDB();
        if (!dbCache) return false;

        const list = dbCache.favorites[userId] || [];
        const index = list.indexOf(eventId);
        let isFavorited = false;

        if (index >= 0) {
            list.splice(index, 1);
            isFavorited = false;
        } else {
            list.push(eventId);
            isFavorited = true;
        }

        dbCache.favorites[userId] = list;
        await saveDB();
        return isFavorited;
    },

    // Attending
    getAttending: (userId: string) => dbCache?.attending[userId] || [],

    setAttending: async (userId: string, eventId: string) => {
        await loadDB();
        if (!dbCache) return;

        const list = dbCache.attending[userId] || [];
        if (!list.includes(eventId)) {
            list.push(eventId);
            dbCache.attending[userId] = list;
            await saveDB();
        }
    },
};
