import { mockApi } from "./mock/api";

// In the future, we can swap this based on environment
const USE_MOCK = true;

export const api = USE_MOCK ? mockApi : {
    // Real API implementation placeholders would go here
    auth: mockApi.auth,
    events: mockApi.events,
    userActions: mockApi.userActions
};
