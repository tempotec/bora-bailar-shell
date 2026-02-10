# BoraBailar - Mobile App

## Overview
BoraBailar is a social mobile application for discovering and attending dance events, parties, and nightlife experiences. Built with React Native and Expo, the app connects party-goers with local events and creates a vibrant community around dance culture.

## Tech Stack
- **Frontend**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7 (Bottom Tabs + Stack)
- **State Management**: TanStack Query
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM

## Project Structure
```
client/
├── App.tsx                    # Main app entry with providers
├── components/                # Reusable UI components
│   ├── Button.tsx            # Gradient primary button
│   ├── Card.tsx              # Animated card component
│   ├── ErrorBoundary.tsx     # App crash handler
│   ├── HeaderTitle.tsx       # Header with app icon
│   ├── KeyboardAwareScrollViewCompat.tsx
│   ├── ThemedText.tsx        # Typography component
│   └── ThemedView.tsx        # Themed container
├── constants/
│   └── theme.ts              # Design tokens (colors, spacing, etc.)
├── hooks/
│   ├── useColorScheme.ts
│   ├── useScreenOptions.ts
│   └── useTheme.ts
├── navigation/
│   ├── DiscoverStackNavigator.tsx
│   ├── MainTabNavigator.tsx   # 4 tabs + FAB
│   ├── MessagesStackNavigator.tsx
│   ├── MyEventsStackNavigator.tsx
│   ├── ProfileStackNavigator.tsx
│   └── RootStackNavigator.tsx
├── screens/
│   ├── DiscoverScreen.tsx     # Home/discover events
│   ├── EventDetailsScreen.tsx # Event details modal
│   ├── MessagesScreen.tsx     # Chat conversations
│   ├── MyEventsScreen.tsx     # User's events
│   ├── ProfileScreen.tsx      # User profile
│   ├── AIChatScreen.tsx       # AI chat with multiple modes
│   ├── CadastreSeScreen.tsx   # Theatrical registration entry
│   ├── FaltaPoucoScreen.tsx   # Event-specific signup modal
│   ├── RegisterStep1Screen.tsx # Registration step 1 (email)
│   ├── RegisterStep2Screen.tsx # Registration step 2 (password)
│   └── ReelsScreen.tsx        # Full-screen video stories
└── lib/
    └── query-client.ts
server/
├── index.ts                   # Express server entry
├── routes.ts                  # API routes
└── storage.ts                 # Data storage
```

## Design System
- **Brand/Primary**: Red (#C41E3A)
- **Secondary**: Hot Pink (#EC4899)
- **Tertiary**: Vibrant Orange (#F97316)
- **Background**: White (#FFFFFF)
- **Wizard Background**: Light Gray (#EDEDED)
- **Brand Font**: Didot/Bodoni (serif)

## Navigation Structure
1. **Descobrir** (Discover) - Browse upcoming events
2. **Eventos** (My Events) - User's saved/attending events
3. **Mensagens** (Messages) - Chat with attendees/organizers
4. **Perfil** (Profile) - User account and settings
5. **FAB** - Floating action button for quick actions

## Running the App
- Dev server starts on port 5000 (Express) and 8081 (Metro)
- Use Expo Go to scan QR code for mobile testing
- Web version available at the deployment URL

## API Endpoints
- `GET /api/events` - List all events (supports ?search= query)
- `GET /api/events/featured` - Featured events
- `GET /api/events/nearby?lat=&lng=&radius=` - Nearby events sorted by distance
- `GET /api/events/:id` - Event details
- `GET /api/venues` - List all venues
- `GET /api/users/:id/favorites` - User's favorite events
- `POST /api/users/:id/favorites` - Add event to favorites
- `DELETE /api/users/:id/favorites/:eventId` - Remove from favorites

## Features
- **Event Discovery**: Browse, search, and filter dance events
- **Favorites System**: Save events to "My Events" with backend persistence
- **Geolocation**: Request location permission to see nearby events sorted by distance
- **Demo User**: Uses "demo-user" ID for favorites functionality
- **Recomendações Especiais**: Horizontal carousel with 6 special offers (admin-managed, currently mocked)
- **BoraBailar Top Dance Awards**: 10 dance award categories with participation button
- **Dicas da Semana**: Weekly tips section with AI-guided event discovery flow
- **AI Chat System**: Context-based chat supporting dance_awards, querer, and dicas_semana modes
- **Authentication Flow**: Theatrical CadastreSeScreen entry point with social login options
- **FaltaPoucoScreen**: Event-specific signup modal for ticket acquisition

## AI Chat Modes
- **dance_awards**: Guides users through dance awards participation → CadastreSeScreen
- **querer**: Handles "QUERO" card interactions → CadastreSeScreen
- **dicas_semana**: Weekly tips flow → EventCard display → FaltaPoucoScreen

## Navigation Flows
1. **Sign Up/Upload**: CadastreSeScreen → RegisterStep1 → RegisterStep2
2. **QUERO cards/Dance Awards**: AIChat → CadastreSeScreen
3. **Dicas da Semana**: AIChat with EventCard → FaltaPoucoScreen

## Recent Changes
- December 2024: Complete home screen redesign with wizard-style search
  - Light/white theme with red branding
  - Logo and BORABAILAR brand name with Didot/Bodoni font
  - Wizard search with 3 fields: Onde, Quando, Com quem
  - Sign up / Log in buttons in header
- December 2024: Added geolocation for nearby events with distance display
- December 2024: Implemented favorites system with PostgreSQL persistence
- December 2024: Added search and venue filtering functionality
- December 2024: Initial MVP implementation with all core screens
- December 2024: Implemented Dicas da Semana flow with AI chat and EventCard
- December 2024: Created FaltaPoucoScreen for event-specific signup
